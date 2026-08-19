import { rawOutcomes } from "./generated-outcomes.js";
import outcomeSchema from "./outcome.schema.json" with { type: "json" };
import { validateProductId } from "./products.js";
import type { Outcome, OutcomePreview, SkillReference } from "./types.js";

export interface BundledOutcome {
  slug: string;
  outcome: Outcome;
}

const SAFE_SLUG = /^[a-z0-9][a-z0-9-]*$/;
const EXACT_REVISION = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;
const GITHUB_REPOSITORY = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const SKILL_DIRECTORY = /^(?:\.|[a-z0-9._-]+(?:\/[a-z0-9._-]+)*)$/;
const OUTCOME_KEYS = new Set(Object.keys(outcomeSchema.properties));

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
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`${context} must be an HTTPS URL`);
  }
  if (parsed.protocol !== "https:") throw new Error(`${context} must be an HTTPS URL`);
  return url;
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

/** Validate one exact prompt and its directory metadata without rewriting the prompt. */
export function validateOutcome(input: unknown, context = "outcome"): Outcome {
  const outcome = asRecord(input, context);
  for (const key of Object.keys(outcome)) if (!OUTCOME_KEYS.has(key)) throw new Error(`${context}.${key} is not part of the Outcome contract`);
  if (outcome.schemaVersion !== 1) throw new Error(`${context}.schemaVersion must be 1`);
  requiredString(outcome.title, `${context}.title`);
  requiredString(outcome.summary, `${context}.summary`);
  const prompt = requiredString(outcome.prompt, `${context}.prompt`);
  if (prompt !== prompt.trim()) throw new Error(`${context}.prompt must not contain leading or trailing whitespace`);

  const author = asRecord(outcome.author, `${context}.author`);
  for (const key of Object.keys(author)) if (key !== "name" && key !== "url") throw new Error(`${context}.author.${key} is unsupported`);
  requiredString(author.name, `${context}.author.name`);
  validateHttpsUrl(author.url, `${context}.author.url`);
  validateSkills(outcome.skills, `${context}.skills`);

  if (outcome.products !== undefined) {
    if (!Array.isArray(outcome.products) || outcome.products.length === 0) throw new Error(`${context}.products must be omitted or a non-empty array`);
    const products = outcome.products.map((product, index) => validateProductId(product, `${context}.products[${index}]`));
    if (new Set(products).size !== products.length) throw new Error(`${context}.products contains duplicates`);
  }
  validatePreview(outcome.preview, `${context}.preview`);
  return input as Outcome;
}

export const bundledOutcomes: BundledOutcome[] = rawOutcomes.map((entry, index) => {
  if (!SAFE_SLUG.test(entry.slug)) throw new Error(`outcomes[${index}].slug must be lowercase and hyphenated`);
  return { slug: entry.slug, outcome: validateOutcome(entry.outcome, `outcomes[${index}].outcome`) };
});

if (new Set(bundledOutcomes.map(({ slug }) => slug)).size !== bundledOutcomes.length) throw new Error("Outcome slugs must be unique");
