import { rawBundledPacks } from "./generated-manifests.js";
import outcomePackSchema from "./outcome-pack.schema.json" with { type: "json" };
import { validateProductId } from "./products.js";
import type { OutcomePack } from "./types.js";

export interface BundledOutcomePack {
  slug: string;
  pack: OutcomePack;
}

const SAFE_SLUG = /^[a-z0-9][a-z0-9-]*$/;
const EXACT_REVISION = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;
const GITHUB_REPOSITORY = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const SKILL_DIRECTORY = /^(?:\.|[a-z0-9._-]+(?:\/[a-z0-9._-]+)*)$/;
const schemaKeys = (value: { properties: object }) => new Set(Object.keys(value.properties));
const PACK_KEYS = schemaKeys(outcomePackSchema);
const SKILL_KEYS = schemaKeys(outcomePackSchema.$defs.skill);

const asRecord = (value: unknown, context: string): Record<string, unknown> => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${context} must be a JSON object`);
  return value as Record<string, unknown>;
};

const requiredStringValue = (value: unknown, context: string): string => {
  if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${context} must be a non-empty string`);
  return value;
};

const requiredString = (record: Record<string, unknown>, key: string, context: string): string => (
  requiredStringValue(record[key], `${context}.${key}`)
);

const stringArray = (record: Record<string, unknown>, key: string, context: string, optional = false): string[] => {
  const value = record[key];
  if (value === undefined && optional) return [];
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${context}.${key} must be a non-empty array of non-empty strings`);
  }
  return value.map((item, index) => requiredStringValue(item, `${context}.${key}[${index}]`));
};

/** Validate one direct prompt plus optional expectations, Skills, Products, and selection boundaries. */
export function validatePackManifest(input: unknown, context = "pack"): OutcomePack {
  const pack = asRecord(input, context);
  for (const key of Object.keys(pack)) if (!PACK_KEYS.has(key)) throw new Error(`${context}.${key} is not part of the Outcome Pack contract`);
  if (pack.schemaVersion !== 1) throw new Error(`${context}.schemaVersion must be 1`);
  for (const key of ["name", "promise", "prompt"]) requiredString(pack, key, context);

  if (pack.skills !== undefined) {
    if (!Array.isArray(pack.skills) || pack.skills.length === 0) throw new Error(`${context}.skills must be omitted or a non-empty array`);
    const skillKeys = new Set<string>();
    for (const [index, value] of pack.skills.entries()) {
      const skill = asRecord(value, `${context}.skills[${index}]`);
      for (const key of Object.keys(skill)) if (!SKILL_KEYS.has(key)) throw new Error(`${context}.skills[${index}].${key} is not a supported Skill field`);
      const repository = requiredString(skill, "repository", `${context}.skills[${index}]`);
      const lastReviewedCommit = requiredString(skill, "lastReviewedCommit", `${context}.skills[${index}]`);
      const directory = requiredString(skill, "directory", `${context}.skills[${index}]`);
      if (!GITHUB_REPOSITORY.test(repository)) throw new Error(`${context}.skills[${index}].repository must be a GitHub owner/repository`);
      if (!EXACT_REVISION.test(lastReviewedCommit)) throw new Error(`${context}.skills[${index}].lastReviewedCommit must be an exact 40- or 64-character lowercase commit hash`);
      const directorySegments = directory.split("/");
      if (!SKILL_DIRECTORY.test(directory) || (directory !== "." && directorySegments.some((segment) => segment === "." || segment === ".."))) {
        throw new Error(`${context}.skills[${index}].directory must be a safe repository-relative directory or . for the repository root`);
      }
      const identity = `${repository}@${lastReviewedCommit}:${directory}`;
      if (skillKeys.has(identity)) throw new Error(`${context}.skills contains duplicate Skill directory ${directory}`);
      skillKeys.add(identity);
    }
  }
  stringArray(pack, "expectations", context, true);
  const products = stringArray(pack, "products", context, true);
  products.forEach((product, index) => validateProductId(product, `${context}.products[${index}]`));
  if (new Set(products).size !== products.length) throw new Error(`${context}.products contains duplicates`);
  stringArray(pack, "notFor", context, true);
  return input as OutcomePack;
}

export const bundledOutcomePacks: BundledOutcomePack[] = rawBundledPacks.map((entry, index) => {
  if (!SAFE_SLUG.test(entry.slug)) throw new Error(`bundledPacks[${index}].slug must be a lowercase hyphenated identifier`);
  return { slug: entry.slug, pack: validatePackManifest(entry.pack, `bundledPacks[${index}].pack`) };
});

if (new Set(bundledOutcomePacks.map(({ slug }) => slug)).size !== bundledOutcomePacks.length) {
  throw new Error("Bundled Outcome Pack slugs must be unique");
}
