import { rawOutcomes } from "./generated-outcomes.js";
import outcomeSchema from "./outcome.schema.json" with { type: "json" };
import { validateProductId } from "./products.js";
import type { Outcome, OutcomeFile, OutcomeModel, OutcomePreview, SkillReference } from "./types.js";

export interface BundledOutcome {
  slug: string;
  outcome: Outcome;
}

const SAFE_SLUG = /^[a-z0-9][a-z0-9-]*$/;
const EXACT_REVISION = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;
const GITHUB_REPOSITORY = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const SKILL_DIRECTORY = /^(?:\.|[a-z0-9._-]+(?:\/[a-z0-9._-]+)*)$/;
const OUTCOME_KEYS = new Set([...Object.keys(outcomeSchema.properties), "title", "summary", "aboutMarkdown", "executionPrompt", "originalPrompt"]);

const asRecord = (value: unknown, context: string): Record<string, unknown> => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${context} must be a JSON object`);
  return value as Record<string, unknown>;
};

const requiredString = (value: unknown, context: string): string => {
  if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${context} must be a non-empty string`);
  return value;
};

const validateHttpsUrl = (value: unknown, context: string): string => {
  const url = requiredString(value, context);
  let parsed: URL;
  try { parsed = new URL(url); } catch { throw new Error(`${context} must be an HTTPS URL`); }
  if (parsed.protocol !== "https:") throw new Error(`${context} must be an HTTPS URL`);
  return url;
};

const validateTimestamp = (value: unknown, context: string): void => {
  if (value === null) return;
  const timestamp = requiredString(value, context);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/.test(timestamp) || Number.isNaN(Date.parse(timestamp))) {
    throw new Error(`${context} must be null or an ISO 8601 timestamp with a timezone`);
  }
};

const validateModels = (value: unknown, context: string): OutcomeModel[] => {
  if (!Array.isArray(value) || value.length === 0) throw new Error(`${context} must be a non-empty array`);
  return value.map((item, index) => {
    const model = asRecord(item, `${context}[${index}]`);
    const allowed = new Set(["provider", "model", "agent", "role"]);
    for (const key of Object.keys(model)) if (!allowed.has(key)) throw new Error(`${context}[${index}].${key} is unsupported`);
    requiredString(model.provider, `${context}[${index}].provider`);
    requiredString(model.model, `${context}[${index}].model`);
    if (model.agent !== undefined) requiredString(model.agent, `${context}[${index}].agent`);
    if (!new Set(["authorship", "execution", "review"]).has(String(model.role))) throw new Error(`${context}[${index}].role is unsupported`);
    return item as OutcomeModel;
  });
};

const validateRequirements = (value: unknown, context: string): string[] => {
  if (!Array.isArray(value)) throw new Error(`${context} must be an array`);
  const requirements = value.map((item, index) => requiredString(item, `${context}[${index}]`));
  if (new Set(requirements).size !== requirements.length) throw new Error(`${context} contains duplicates`);
  return requirements;
};

const validateSkills = (value: unknown, context: string): SkillReference[] | undefined => {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length === 0) throw new Error(`${context} must be omitted or a non-empty array`);
  const identities = new Set<string>();
  return value.map((item, index) => {
    const skill = asRecord(item, `${context}[${index}]`);
    const allowed = new Set(["repository", "lastReviewedCommit", "directory"]);
    for (const key of Object.keys(skill)) if (!allowed.has(key)) throw new Error(`${context}[${index}].${key} is unsupported`);
    const repository = requiredString(skill.repository, `${context}[${index}].repository`);
    const lastReviewedCommit = requiredString(skill.lastReviewedCommit, `${context}[${index}].lastReviewedCommit`);
    const directory = requiredString(skill.directory, `${context}[${index}].directory`);
    if (!GITHUB_REPOSITORY.test(repository)) throw new Error(`${context}[${index}].repository must be a GitHub owner/repository`);
    if (!EXACT_REVISION.test(lastReviewedCommit)) throw new Error(`${context}[${index}].lastReviewedCommit must be an exact commit`);
    const segments = directory.split("/");
    if (!SKILL_DIRECTORY.test(directory) || (directory !== "." && segments.some((segment) => segment === "." || segment === ".."))) {
      throw new Error(`${context}[${index}].directory must be a safe repository-relative directory`);
    }
    const identity = `${repository}@${lastReviewedCommit}:${directory}`;
    if (identities.has(identity)) throw new Error(`${context} contains duplicate Skill ${identity}`);
    identities.add(identity);
    return { repository, lastReviewedCommit, directory };
  });
};

const FILE_TYPES = new Set(["image", "video", "audio", "cad", "document", "data", "source", "archive", "other"]);

const validateFiles = (value: unknown, context: string): OutcomeFile[] | undefined => {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length === 0) throw new Error(`${context} must be omitted or a non-empty array`);
  const sources = new Set<string>();
  return value.map((item, index) => {
    const file = asRecord(item, `${context}[${index}]`);
    const allowed = new Set(["type", "src", "label", "format"]);
    for (const key of Object.keys(file)) if (!allowed.has(key)) throw new Error(`${context}[${index}].${key} is unsupported`);
    const type = requiredString(file.type, `${context}[${index}].type`);
    const src = requiredString(file.src, `${context}[${index}].src`);
    const label = requiredString(file.label, `${context}[${index}].label`);
    if (!FILE_TYPES.has(type)) throw new Error(`${context}[${index}].type is unsupported`);
    const format = file.format === undefined ? undefined : requiredString(file.format, `${context}[${index}].format`);
    if (sources.has(src)) throw new Error(`${context} contains duplicate source ${src}`);
    sources.add(src);
    return { type, src, label, ...(format ? { format } : {}) } as OutcomeFile;
  });
};

const validatePreview = (value: unknown, context: string): OutcomePreview | undefined => {
  if (value === undefined) return undefined;
  const preview = asRecord(value, context);
  const allowed = new Set(["description", "images", "video", "audio", "cad"]);
  for (const key of Object.keys(preview)) if (!allowed.has(key)) throw new Error(`${context}.${key} is unsupported`);
  if (preview.description !== undefined) requiredString(preview.description, `${context}.description`);
  if (preview.images !== undefined && (!Array.isArray(preview.images) || preview.images.length > 5)) throw new Error(`${context}.images must contain at most five images`);
  if (preview.images === undefined && preview.video === undefined && preview.audio === undefined && preview.cad === undefined && preview.description === undefined) {
    throw new Error(`${context} must contain description or media`);
  }
  return value as OutcomePreview;
};

/** Validate one generated Outcome projection without rewriting its authored files. */
export function validateOutcome(input: unknown, context = "outcome"): Outcome {
  const outcome = asRecord(input, context);
  for (const key of Object.keys(outcome)) if (!OUTCOME_KEYS.has(key)) throw new Error(`${context}.${key} is not part of the Outcome contract`);
  if (outcome.schemaVersion !== 3) throw new Error(`${context}.schemaVersion must be 3`);
  const slug = requiredString(outcome.slug, `${context}.slug`);
  if (!SAFE_SLUG.test(slug)) throw new Error(`${context}.slug must be lowercase and hyphenated`);
  const files = asRecord(outcome.files, `${context}.files`);
  if (files.about !== "outcome.md" || files.prompt !== "prompt.md" || Object.keys(files).length !== 2) throw new Error(`${context}.files must reference outcome.md and prompt.md`);
  validateTimestamp(outcome.authoredAt, `${context}.authoredAt`);
  validateModels(outcome.models, `${context}.models`);
  validateRequirements(outcome.requirements, `${context}.requirements`);
  requiredString(outcome.title, `${context}.title`);
  requiredString(outcome.summary, `${context}.summary`);
  const aboutMarkdown = requiredString(outcome.aboutMarkdown, `${context}.aboutMarkdown`);
  const executionPrompt = requiredString(outcome.executionPrompt, `${context}.executionPrompt`);
  if (aboutMarkdown !== aboutMarkdown.trim()) throw new Error(`${context}.aboutMarkdown must not contain leading or trailing whitespace`);
  if (executionPrompt !== executionPrompt.trim()) throw new Error(`${context}.executionPrompt must not contain leading or trailing whitespace`);
  if (outcome.originalPrompt !== undefined) requiredString(outcome.originalPrompt, `${context}.originalPrompt`);

  const author = asRecord(outcome.author, `${context}.author`);
  for (const key of Object.keys(author)) if (key !== "name" && key !== "url") throw new Error(`${context}.author.${key} is unsupported`);
  requiredString(author.name, `${context}.author.name`);
  validateHttpsUrl(author.url, `${context}.author.url`);
  validateSkills(outcome.skills, `${context}.skills`);
  validateFiles(outcome.inputs, `${context}.inputs`);
  validateFiles(outcome.artifacts, `${context}.artifacts`);
  if (outcome.products !== undefined) {
    if (!Array.isArray(outcome.products) || outcome.products.length === 0) throw new Error(`${context}.products must be omitted or a non-empty array`);
    const products = outcome.products.map((product, index) => validateProductId(product, `${context}.products[${index}]`));
    if (new Set(products).size !== products.length) throw new Error(`${context}.products contains duplicates`);
  }
  validatePreview(outcome.preview, `${context}.preview`);
  return input as Outcome;
}

export const bundledOutcomes: BundledOutcome[] = rawOutcomes.map((entry, index) => {
  const outcome = validateOutcome(entry.outcome, `outcomes[${index}].outcome`);
  if (entry.slug !== outcome.slug) throw new Error(`outcomes[${index}] folder slug must match outcome.slug`);
  return { slug: entry.slug, outcome };
});

if (new Set(bundledOutcomes.map(({ slug }) => slug)).size !== bundledOutcomes.length) throw new Error("Outcome slugs must be unique");
