import { assertVisibleText } from "./text-safety.mjs";
import { readFile, readdir } from "node:fs/promises";
import { basename, join, relative, resolve } from "node:path";
import { verifyCaptureReview } from "./capture-integrity.mjs";
import { readCaptureFiles, fileInventory, validateCaptureFileInventory } from "./capture-files.mjs";
import { canonicalJson } from "./capture-integrity.mjs";

const SAFE_SLUG = /^[a-z0-9][a-z0-9-]*$/;
const EXACT_REVISION = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;
const PRODUCT_ID = /^[a-z0-9][a-z0-9-]*\/[a-z0-9][a-z0-9-]*$/;
const GITHUB_REPOSITORY = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const SAFE_REPOSITORY_PATH = /^(?:\.|[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*)$/;
const MODEL_ROLES = new Set(["authorship", "execution", "review"]);
const FILE_TYPES = new Set(["image", "video", "audio", "cad", "document", "data", "source", "archive", "other"]);
const BASE_MANIFEST_KEYS = ["schemaVersion", "slug", "files", "authoredAt", "author", "models", "requirements", "inputs", "artifacts", "preview", "recipe"];
const LEGACY_MANIFEST_KEYS = new Set([...BASE_MANIFEST_KEYS, "products", "skills"]);
const MANIFEST_KEYS = new Set([...BASE_MANIFEST_KEYS, "primary", "secondary"]);

const asObject = (value, context) => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${context} must be a JSON object`);
  return value;
};

const string = (value, context) => {
  if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${context} must be a non-empty string`);
  return value;
};

const exactKeys = (value, allowed, context) => {
  for (const key of Object.keys(value)) if (!allowed.has(key)) throw new Error(`${context}.${key} is unsupported`);
};

const httpsUrl = (value, context) => {
  const candidate = string(value, context);
  let parsed;
  try { parsed = new URL(candidate); } catch { throw new Error(`${context} must be an HTTPS URL`); }
  if (parsed.protocol !== "https:") throw new Error(`${context} must be an HTTPS URL`);
  return candidate;
};

const safeRelativePath = (value, context) => {
  const candidate = string(value, context);
  if (candidate.includes("\\") || candidate.startsWith("/") || candidate.split("/").some((part) => part === "" || part === "." || part === "..")) {
    throw new Error(`${context} must be a safe repository-relative path`);
  }
  return candidate;
};

const validateFiles = (value, context) => {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.length === 0) throw new Error(`${context} must be omitted or a non-empty array`);
  const seen = new Set();
  value.forEach((entry, index) => {
    const file = asObject(entry, `${context}[${index}]`);
    exactKeys(file, new Set(["type", "src", "label", "format"]), `${context}[${index}]`);
    if (!FILE_TYPES.has(file.type)) throw new Error(`${context}[${index}].type is unsupported`);
    const source = file.src?.startsWith("https://") ? httpsUrl(file.src, `${context}[${index}].src`) : safeRelativePath(file.src, `${context}[${index}].src`);
    string(file.label, `${context}[${index}].label`);
    if (file.format !== undefined) string(file.format, `${context}[${index}].format`);
    if (seen.has(source)) throw new Error(`${context} contains duplicate source ${source}`);
    seen.add(source);
  });
};

const validateSkillReference = (value, context, includeKind = false) => {
  const skill = asObject(value, context);
  exactKeys(skill, new Set(includeKind ? ["kind", "repository", "lastReviewedCommit", "directory"] : ["repository", "lastReviewedCommit", "directory"]), context);
  if (includeKind && skill.kind !== "skill") throw new Error(`${context}.kind must be skill`);
  if (!GITHUB_REPOSITORY.test(string(skill.repository, `${context}.repository`))) throw new Error(`${context}.repository is invalid`);
  if (!EXACT_REVISION.test(string(skill.lastReviewedCommit, `${context}.lastReviewedCommit`))) throw new Error(`${context}.lastReviewedCommit must be an exact commit`);
  const directory = string(skill.directory, `${context}.directory`);
  if (!SAFE_REPOSITORY_PATH.test(directory) || (directory !== "." && directory.split("/").some((part) => part === "." || part === ".."))) throw new Error(`${context}.directory is invalid`);
  return skill;
};

const validateAttribution = (value, context) => {
  const attribution = asObject(value, context);
  if (attribution.kind === "product") {
    exactKeys(attribution, new Set(["kind", "id"]), context);
    if (!PRODUCT_ID.test(string(attribution.id, `${context}.id`))) throw new Error(`${context}.id is invalid`);
    return attribution;
  }
  if (attribution.kind === "skill") return validateSkillReference(attribution, context, true);
  throw new Error(`${context}.kind must be product or skill`);
};

export const attributionKey = (attribution) => attribution.kind === "product"
  ? `product:${attribution.id}`
  : `skill:${attribution.repository}/${attribution.directory}`;

export function normalizeOutcomeAttributions(manifest) {
  if (manifest.schemaVersion === 4) {
    const secondary = manifest.secondary ?? [];
    const all = [manifest.primary, ...secondary];
    return {
      primary: manifest.primary,
      secondary,
      products: all.filter((item) => item.kind === "product").map((item) => item.id),
      skills: all.filter((item) => item.kind === "skill").map(({ kind: _kind, ...skill }) => skill),
    };
  }
  const legacy = [
    ...(manifest.products ?? []).map((id) => ({ kind: "product", id })),
    ...(manifest.skills ?? []).map((skill) => ({ kind: "skill", ...skill })),
  ];
  return {
    primary: legacy[0] ?? null,
    secondary: legacy.slice(1),
    products: manifest.products ?? [],
    skills: manifest.skills ?? [],
  };
}

// `possible create` scaffolds recipe steps with this scaffold-only marker; they
// must be filled in (or the optional recipe removed) before the Outcome validates.
export const RECIPE_PLACEHOLDER_PREFIX = "[Fill in]";
const isRecipePlaceholder = (value) => typeof value === "string" && value.trim().startsWith(RECIPE_PLACEHOLDER_PREFIX);

export function validateOutcomeRecipe(value, context = "recipe") {
  const recipe = asObject(value, context);
  exactKeys(recipe, new Set(["agent", "skills", "references", "tools", "steps", "provenance", "notes"]), context);
  if (Object.keys(recipe).length === 0) throw new Error(`${context} must have at least one disclosed ingredient`);
  if (recipe.provenance !== undefined) {
    const provenance = asObject(recipe.provenance, `${context}.provenance`);
    exactKeys(provenance, new Set(["method", "source", "reviewedAt", "reviewDigest", "files"]), `${context}.provenance`);
    if (!["recorded", "reconstructed"].includes(provenance.method)) throw new Error(`${context}.provenance.method is unsupported`);
    if (provenance.method === "recorded") {
      if (!["claude-code", "turnless", "codex"].includes(provenance.source)) throw new Error(`${context}.provenance.source is required for recorded recipes`);
      if (typeof provenance.reviewDigest !== "string" || !/^[a-f0-9]{64}$/.test(provenance.reviewDigest)) throw new Error(`${context}.provenance requires a privacy review digest`);
      if (typeof provenance.reviewedAt !== "string" || !/^\d{4}-\d{2}-\d{2}T.*Z$/.test(provenance.reviewedAt) || !Number.isFinite(Date.parse(provenance.reviewedAt))) throw new Error(`${context}.provenance requires a privacy review timestamp`);
      if (provenance.files !== undefined) validateCaptureFileInventory(provenance.files);
    } else if (Object.keys(provenance).some(key => key !== "method")) throw new Error(`${context}.provenance reconstructed recipes only record method`);
  }
  if (recipe.notes !== undefined) {
    if (!Array.isArray(recipe.notes) || !recipe.notes.length) throw new Error(`${context}.notes must be omitted or non-empty`);
    recipe.notes.forEach((note, index) => string(note, `${context}.notes[${index}]`));
  }
  if (recipe.agent !== undefined) {
    const agent = asObject(recipe.agent, `${context}.agent`);
    exactKeys(agent, new Set(["name", "version", "url"]), `${context}.agent`);
    string(agent.name, `${context}.agent.name`);
    if (agent.version !== undefined) string(agent.version, `${context}.agent.version`);
    if (agent.url !== undefined) httpsUrl(agent.url, `${context}.agent.url`);
  }
  for (const key of ["skills", "references", "tools", "steps"]) {
    if (recipe[key] === undefined) continue;
    const entries = recipe[key];
    if (!Array.isArray(entries) || entries.length === 0) throw new Error(`${context}.${key} must be omitted or a non-empty array`);
    entries.forEach((entry, index) => {
      const path = `${context}.${key}[${index}]`;
      const item = asObject(entry, path);
      if (key === "skills") { validateSkillReference(item, path); return; }
      if (key === "references") {
        exactKeys(item, new Set(["kind", "label", "url", "purpose"]), path);
        if (!["repository", "document", "image", "web", "example"].includes(item.kind)) throw new Error(`${path}.kind is unsupported`);
        string(item.label, `${path}.label`);
        httpsUrl(item.url, `${path}.url`);
        if (item.purpose !== undefined) string(item.purpose, `${path}.purpose`);
      } else if (key === "tools") {
        exactKeys(item, new Set(["name", "purpose", "url"]), path);
        string(item.name, `${path}.name`);
        string(item.purpose, `${path}.purpose`);
        if (item.url !== undefined) httpsUrl(item.url, `${path}.url`);
      } else {
        exactKeys(item, new Set(["title", "instructions", "prompt"]), path);
        string(item.title, `${path}.title`);
        string(item.instructions, `${path}.instructions`);
        if (item.prompt !== undefined) string(item.prompt, `${path}.prompt`);
        if ([item.title, item.instructions, item.prompt].some(isRecipePlaceholder)) throw new Error(`${path} is incomplete: replace the placeholder step with what was actually done, or remove the optional recipe`);
      }
    });
    if (key === "skills") {
      const identities = entries.map(skill => `${skill.repository}/${skill.directory}@${skill.lastReviewedCommit}`);
      if (new Set(identities).size !== identities.length) throw new Error(`${context}.skills contains duplicates`);
    }
  }
  return recipe;
}

export function validateOutcomeManifest(value, context = "outcome.json") {
  assertVisibleText(value);
  const manifest = asObject(value, context);
  if (manifest.schemaVersion !== 3 && manifest.schemaVersion !== 4) throw new Error(`${context}.schemaVersion must be 3 or 4`);
  exactKeys(manifest, manifest.schemaVersion === 4 ? MANIFEST_KEYS : LEGACY_MANIFEST_KEYS, context);
  if (!SAFE_SLUG.test(string(manifest.slug, `${context}.slug`))) throw new Error(`${context}.slug must be lowercase and hyphenated`);

  const files = asObject(manifest.files, `${context}.files`);
  exactKeys(files, new Set(["about", "prompt"]), `${context}.files`);
  if (files.about !== "outcome.md" || files.prompt !== "prompt.md") throw new Error(`${context}.files must reference outcome.md and prompt.md`);

  if (manifest.authoredAt !== null) {
    const authoredAt = string(manifest.authoredAt, `${context}.authoredAt`);
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/.test(authoredAt) || Number.isNaN(Date.parse(authoredAt))) {
      throw new Error(`${context}.authoredAt must be null or an ISO 8601 timestamp with a timezone`);
    }
  }

  const author = asObject(manifest.author, `${context}.author`);
  exactKeys(author, new Set(["name", "url"]), `${context}.author`);
  string(author.name, `${context}.author.name`);
  httpsUrl(author.url, `${context}.author.url`);

  if (!Array.isArray(manifest.models) || manifest.models.length === 0) throw new Error(`${context}.models must be a non-empty array`);
  manifest.models.forEach((entry, index) => {
    const model = asObject(entry, `${context}.models[${index}]`);
    exactKeys(model, new Set(["provider", "model", "agent", "role"]), `${context}.models[${index}]`);
    string(model.provider, `${context}.models[${index}].provider`);
    string(model.model, `${context}.models[${index}].model`);
    if (model.agent !== undefined) string(model.agent, `${context}.models[${index}].agent`);
    if (!MODEL_ROLES.has(model.role)) throw new Error(`${context}.models[${index}].role is unsupported`);
  });

  if (!Array.isArray(manifest.requirements)) throw new Error(`${context}.requirements must be an array`);
  const requirements = manifest.requirements.map((entry, index) => string(entry, `${context}.requirements[${index}]`));
  if (new Set(requirements).size !== requirements.length) throw new Error(`${context}.requirements contains duplicates`);

  if (manifest.schemaVersion === 3 && manifest.products !== undefined) {
    if (!Array.isArray(manifest.products) || manifest.products.length === 0) throw new Error(`${context}.products must be omitted or a non-empty array`);
    for (const [index, product] of manifest.products.entries()) if (!PRODUCT_ID.test(string(product, `${context}.products[${index}]`))) throw new Error(`${context}.products[${index}] is invalid`);
    if (new Set(manifest.products).size !== manifest.products.length) throw new Error(`${context}.products contains duplicates`);
  }

  if (manifest.schemaVersion === 3 && manifest.skills !== undefined) {
    if (!Array.isArray(manifest.skills) || manifest.skills.length === 0) throw new Error(`${context}.skills must be omitted or a non-empty array`);
    for (const [index, entry] of manifest.skills.entries()) {
      validateSkillReference(entry, `${context}.skills[${index}]`);
    }
  }

  if (manifest.schemaVersion === 4) {
    const primary = validateAttribution(manifest.primary, `${context}.primary`);
    if (manifest.secondary !== undefined && (!Array.isArray(manifest.secondary) || manifest.secondary.length === 0)) throw new Error(`${context}.secondary must be omitted or a non-empty array`);
    const secondary = (manifest.secondary ?? []).map((entry, index) => validateAttribution(entry, `${context}.secondary[${index}]`));
    const keys = [attributionKey(primary), ...secondary.map(attributionKey)];
    if (new Set(keys).size !== keys.length) throw new Error(`${context} contains duplicate primary or secondary attributions`);
  }

  if (manifest.recipe !== undefined) validateOutcomeRecipe(manifest.recipe, `${context}.recipe`);
  validateFiles(manifest.inputs, `${context}.inputs`);
  validateFiles(manifest.artifacts, `${context}.artifacts`);
  if (manifest.preview !== undefined) asObject(manifest.preview, `${context}.preview`);
  return manifest;
}

const plainInlineMarkdown = (value) => value
  .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
  .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
  .replace(/[*_~`]/g, "")
  .replace(/\s+/g, " ")
  .trim();

export function parseOutcomeMarkdown(value, context = "outcome.md") {
  assertVisibleText(value);
  const markdown = string(value, context).trim();
  const lines = markdown.split(/\r?\n/);
  const titleLine = lines[0] ?? "";
  if (!titleLine.startsWith("# ") || titleLine.slice(2).trim().length === 0) throw new Error(`${context} must begin with one # title`);
  if (lines.slice(1).some((line) => line.startsWith("# "))) throw new Error(`${context} must contain exactly one # title`);
  let index = 1;
  while (index < lines.length && lines[index]?.trim() === "") index += 1;
  const summaryLines = [];
  while (index < lines.length && lines[index]?.trim() !== "" && !lines[index]?.startsWith("## ")) {
    summaryLines.push(lines[index]);
    index += 1;
  }
  const summaryMarkdown = summaryLines.join("\n").trim();
  if (!summaryMarkdown) throw new Error(`${context} must contain an opening summary after its title`);

  const originalHeading = lines.findIndex((line) => line.trim().toLowerCase() === "## original request");
  let originalPrompt;
  if (originalHeading >= 0) {
    const quoted = [];
    for (const line of lines.slice(originalHeading + 1)) {
      if (line.startsWith("## ")) break;
      if (line.startsWith("> ")) quoted.push(line.slice(2));
      else if (line === ">") quoted.push("");
    }
    const joined = quoted.join("\n").trim();
    if (joined) originalPrompt = joined;
  }
  return {
    title: plainInlineMarkdown(titleLine.slice(2)),
    summary: plainInlineMarkdown(summaryMarkdown),
    summaryMarkdown,
    markdown,
    ...(originalPrompt ? { originalPrompt } : {}),
  };
}

export async function readOutcomeFolder(folder) {
  const [manifestText, aboutText, promptText] = await Promise.all([
    readFile(join(folder, "outcome.json"), "utf8"),
    readFile(join(folder, "outcome.md"), "utf8"),
    readFile(join(folder, "prompt.md"), "utf8"),
  ]);
  const manifest = validateOutcomeManifest(JSON.parse(manifestText), `${relative(process.cwd(), join(folder, "outcome.json")) || "outcome.json"}`);
  if (basename(folder) !== manifest.slug) throw new Error(`${manifest.slug}: folder name must match outcome.json slug`);
  const about = parseOutcomeMarkdown(aboutText, `${manifest.slug}/outcome.md`);
  assertVisibleText(promptText);
  const executionPrompt = string(promptText, `${manifest.slug}/prompt.md`).trim();
  verifyCaptureReview(manifest, aboutText, promptText);
  if (manifest.recipe?.provenance?.files !== undefined && canonicalJson(fileInventory(await readCaptureFiles(folder))) !== canonicalJson(manifest.recipe.provenance.files)) throw new Error("Captured Outcome files changed after privacy review. Review again.");
  return { slug: manifest.slug, folder, manifest, about, executionPrompt };
}

export async function discoverLocalOutcomes(repositoryRoot) {
  const found = [];
  async function walk(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    if (entries.some((entry) => entry.isFile() && entry.name === "outcome.json")) {
      found.push(await readOutcomeFolder(directory));
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.isSymbolicLink() || entry.name === ".git" || entry.name === "node_modules") continue;
      await walk(join(directory, entry.name));
    }
  }
  await walk(resolve(repositoryRoot));
  if (found.length === 0) throw new Error(`No Outcome folders found under ${repositoryRoot}`);
  const identities = new Set();
  for (const outcome of found) {
    if (identities.has(outcome.slug)) throw new Error(`Duplicate Outcome slug: ${outcome.slug}`);
    identities.add(outcome.slug);
  }
  return found.sort((left, right) => left.about.title.localeCompare(right.about.title));
}

export function relativeOutcomePath(repositoryRoot, folder) {
  return relative(resolve(repositoryRoot), resolve(folder)).split("\\").join("/");
}
