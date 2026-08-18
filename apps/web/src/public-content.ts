import { getPackShowcase as getCorePackShowcase, parsePackIdentity, productCatalog, publicCatalog, searchPackCatalog } from "@possible/packs";
import type { PackCatalogSearchResult, PublicCatalogEntry, ResolvedProduct } from "@possible/packs";
import cliPackage from "../../cli/package.json" with { type: "json" };

export const possibleVersion = cliPackage.version;
export const installCommand = `npx @fraylabs/possible@${possibleVersion} init`;
export const githubUrl = "https://github.com/fraylabs/possible";

export const publishedPacks = publicCatalog;
export const routablePacks = publicCatalog;
export const publishedProducts = productCatalog;

export type PublishedPackSearchResult = PackCatalogSearchResult<PublicCatalogEntry>;

export function packPublisher(entry: PublicCatalogEntry) {
  return parsePackIdentity(entry.id).owner;
}

export function searchPublishedPacks(query: string): PublishedPackSearchResult[] {
  return searchPackCatalog({
    query,
    minimumMatchingTerms: 2,
    minimumScoreRatio: 0.5,
  }, publishedPacks);
}

export function packRouteId(entry: PublicCatalogEntry) {
  return entry.origin.kind === "bundled" ? entry.slug : entry.id;
}

export function packHref(entry: PublicCatalogEntry) {
  return `/packs/${packRouteId(entry)}`;
}

export function productHref(product: ResolvedProduct) {
  return `/products/${product.id}`;
}

export function getPublishedProduct(id: string) {
  return publishedProducts.find((product) => product.id === id);
}

export function getProductOutcomes(id: string) {
  return publishedPacks.filter((entry) => entry.products.some((product) => product.id === id));
}

export function getPackShowcase(entry: PublicCatalogEntry) {
  return getCorePackShowcase(entry.id);
}

export function getPublishedPack(idOrSlug: string) {
  const exact = publishedPacks.find(({ id }) => id === idOrSlug);
  if (exact) return exact;
  const matches = publishedPacks.filter(({ slug }) => slug === idOrSlug);
  return matches.length === 1 ? matches[0] : undefined;
}

export function getRoutablePack(idOrSlug: string) {
  const exact = routablePacks.find(({ id }) => id === idOrSlug);
  if (exact) return exact;
  const matches = routablePacks.filter(({ slug }) => slug === idOrSlug);
  return matches.length === 1 ? matches[0] : undefined;
}
