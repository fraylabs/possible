import { outcomeCatalog, productCatalog, searchOutcomes } from "@possible/catalog";
import type { OutcomeCatalogEntry, OutcomeSearchResult, ResolvedProduct, SkillReference } from "@possible/catalog";
import cliPackage from "../../cli/package.json" with { type: "json" };

export const possibleVersion = cliPackage.version;
export const installCommand = `npx @fraylabs/possible@${possibleVersion} init`;
export const githubUrl = "https://github.com/fraylabs/possible";

export const publishedOutcomes = outcomeCatalog;
export const publishedProducts = productCatalog;
const publishedProductSlugs = publishedProducts.map((product) => product.id.split("/").at(-1));
if (new Set(publishedProductSlugs).size !== publishedProductSlugs.length) throw new Error("Published Product slugs must be unique");

export type PublishedOutcomeSearchResult = OutcomeSearchResult;

export interface PublishedSkill extends SkillReference {
  id: string;
  slug: string;
  name: string;
  sourceUrl: string;
}

function skillName(directory: string) {
  return (directory.split("/").at(-1) ?? directory)
    .split("-")
    .map((part) => part ? `${part[0]?.toUpperCase()}${part.slice(1)}` : part)
    .join(" ");
}

function skillSlug(repository: string, directory: string) {
  return `${repository}/${directory}`.replaceAll("/", "--");
}

const skillMap = new Map<string, PublishedSkill>();
for (const entry of publishedOutcomes) {
  for (const skill of entry.outcome.skills ?? []) {
    const id = `${skill.repository}/${skill.directory}`;
    if (skillMap.has(id)) continue;
    skillMap.set(id, {
      ...skill,
      id,
      slug: skillSlug(skill.repository, skill.directory),
      name: skillName(skill.directory),
      sourceUrl: `https://github.com/${skill.repository}/tree/${skill.lastReviewedCommit}/${skill.directory}`,
    });
  }
}

export const publishedSkills = [...skillMap.values()].sort((a, b) => a.name.localeCompare(b.name));

export function searchPublishedOutcomes(query: string): PublishedOutcomeSearchResult[] {
  return searchOutcomes(publishedOutcomes, { query });
}

export function outcomeHref(entry: OutcomeCatalogEntry) {
  return `/outcomes/${entry.slug}`;
}

export function productHref(product: ResolvedProduct) {
  return `/products/${product.id.split("/").at(-1)}`;
}

export function skillHref(skill: PublishedSkill) {
  return `/skills/${skill.slug}`;
}

export function getPublishedOutcome(slug: string) {
  return publishedOutcomes.find((entry) => entry.slug === slug);
}

export function getPublishedProduct(idOrSlug: string) {
  const exact = publishedProducts.find((product) => product.id === idOrSlug);
  if (exact) return exact;
  const matches = publishedProducts.filter((product) => product.id.split("/").at(-1) === idOrSlug);
  return matches.length === 1 ? matches[0] : undefined;
}

export function getProductOutcomes(id: string) {
  return publishedOutcomes.filter((entry) => entry.products.some((product) => product.id === id));
}

export function getPublishedSkill(idOrSlug: string) {
  return publishedSkills.find((skill) => skill.id === idOrSlug || skill.slug === idOrSlug);
}

export function getSkillOutcomes(id: string) {
  return publishedOutcomes.filter((entry) => entry.outcome.skills?.some((skill) => `${skill.repository}/${skill.directory}` === id));
}

export function getProductFeature(id: string) {
  const outcomes = getProductOutcomes(id);
  const entry = outcomes.find(({ outcome }) => outcome.preview?.video || outcome.preview?.images?.length || outcome.preview?.cad?.poster) ?? outcomes[0];
  return entry ? { entry, preview: entry.outcome.preview } : undefined;
}
