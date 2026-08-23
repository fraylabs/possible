import { readFile, readdir } from "node:fs/promises";
import { basename, join, relative, resolve } from "node:path";

const SAFE_SLUG = /^[a-z0-9][a-z0-9-]*$/;
const EXACT_REVISION = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;
const PRODUCT_ID = /^[a-z0-9][a-z0-9-]*\/[a-z0-9][a-z0-9-]*$/;
const GITHUB_REPOSITORY = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const SAFE_REPOSITORY_PATH = /^(?:\.|[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*)$/;
const MODEL_ROLES = new Set(["authorship", "execution", "review"]);
const FILE_TYPES = new Set(["image", "video", "audio", "cad", "document", "data", "source", "archive", "other"]);
const MANIFEST_KEYS = new Set(["schemaVersion", "slug", "files", "authoredAt", "author", "models", "requirements", "products", "skills", "inputs", "artifacts", "preview"]);

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

export function validateOutcomeManifest(value, context = "outcome.json") {
  const manifest = asObject(value, context);
  exactKeys(manifest, MANIFEST_KEYS, context);
  if (manifest.schemaVersion !== 3) throw new Error(`${context}.schemaVersion must be 3`);
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

  if (manifest.products !== undefined) {
    if (!Array.isArray(manifest.products) || manifest.products.length === 0) throw new Error(`${context}.products must be omitted or a non-empty array`);
    for (const [index, product] of manifest.products.entries()) if (!PRODUCT_ID.test(string(product, `${context}.products[${index}]`))) throw new Error(`${context}.products[${index}] is invalid`);
    if (new Set(manifest.products).size !== manifest.products.length) throw new Error(`${context}.products contains duplicates`);
  }

  if (manifest.skills !== undefined) {
    if (!Array.isArray(manifest.skills) || manifest.skills.length === 0) throw new Error(`${context}.skills must be omitted or a non-empty array`);
    for (const [index, entry] of manifest.skills.entries()) {
      const skill = asObject(entry, `${context}.skills[${index}]`);
      exactKeys(skill, new Set(["repository", "lastReviewedCommit", "directory"]), `${context}.skills[${index}]`);
      if (!GITHUB_REPOSITORY.test(string(skill.repository, `${context}.skills[${index}].repository`))) throw new Error(`${context}.skills[${index}].repository is invalid`);
      if (!EXACT_REVISION.test(string(skill.lastReviewedCommit, `${context}.skills[${index}].lastReviewedCommit`))) throw new Error(`${context}.skills[${index}].lastReviewedCommit must be an exact commit`);
      const directory = string(skill.directory, `${context}.skills[${index}].directory`);
      if (!SAFE_REPOSITORY_PATH.test(directory) || (directory !== "." && directory.split("/").some((part) => part === "." || part === ".."))) throw new Error(`${context}.skills[${index}].directory is invalid`);
    }
  }

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
  const executionPrompt = string(promptText, `${manifest.slug}/prompt.md`).trim();
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
