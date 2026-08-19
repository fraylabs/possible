import { outcomeCatalog, productCatalog, searchOutcomes } from "@possible/catalog";
import type { OutcomeCatalogEntry, OutcomeSearchResult, ResolvedProduct } from "@possible/catalog";
import cliPackage from "../../cli/package.json" with { type: "json" };

export const possibleVersion = cliPackage.version;
export const installCommand = `npx @fraylabs/possible@${possibleVersion} init`;
export const githubUrl = "https://github.com/fraylabs/possible";

export const publishedOutcomes = outcomeCatalog;
export const publishedProducts = productCatalog;
const publishedProductSlugs = publishedProducts.map((product) => product.id.split("/").at(-1));
if (new Set(publishedProductSlugs).size !== publishedProductSlugs.length) throw new Error("Published Product slugs must be unique");

export type PublishedOutcomeSearchResult = OutcomeSearchResult;

export function searchPublishedOutcomes(query: string): PublishedOutcomeSearchResult[] {
  return searchOutcomes(publishedOutcomes, { query });
}

export function outcomeHref(entry: OutcomeCatalogEntry) {
  return `/outcomes/${entry.slug}`;
}

export function productHref(product: ResolvedProduct) {
  return `/products/${product.id.split("/").at(-1)}`;
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

export function getProductFeature(id: string) {
  const outcomes = getProductOutcomes(id);
  const entry = outcomes.find(({ outcome }) => outcome.preview?.video || outcome.preview?.images?.length || outcome.preview?.cad?.poster) ?? outcomes[0];
  return entry ? { entry, preview: entry.outcome.preview } : undefined;
}
