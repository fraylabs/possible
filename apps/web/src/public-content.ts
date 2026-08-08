import { activeOutcomePacks, archivedOutcomePacks, catalogOutcomePacks, publicCatalog } from "@possible/packs";
import type { OutcomePack, PackCatalogEntry } from "@possible/packs";

export const installCommand = "npx @fraylabs/possible@0.1.11 init";
export const githubUrl = "https://github.com/fraylabs/possible";

export const featuredPackSlugs = [
  "playable-web-game",
  "web-presentation",
  "software-opportunity-discovery",
] as const;

export const featuredPacks = featuredPackSlugs.map((slug) => {
  const pack = catalogOutcomePacks.find((candidate) => candidate.slug === slug);
  if (!pack) throw new Error(`Missing featured Outcome Pack: ${slug}`);
  return pack;
});

export const publishedPacks = activeOutcomePacks;
export const archivedPublishedPacks = archivedOutcomePacks;
export const routablePacks = catalogOutcomePacks;

export function getPackCatalogEntry(pack: OutcomePack): PackCatalogEntry & { catalogNumber: number } {
  const entry = publicCatalog.find((candidate) => candidate.pack === pack);
  if (!entry) throw new Error(`Missing catalog entry for ${pack.slug}`);
  return entry;
}

export function packRouteId(pack: OutcomePack) {
  const entry = getPackCatalogEntry(pack);
  return entry.origin.kind === "bundled" ? pack.slug : entry.id;
}

export function packHref(pack: OutcomePack) {
  return `/packs/${packRouteId(pack)}`;
}

export function getFeaturedPack(slug: string) {
  return featuredPacks.find((pack) => pack.slug === slug);
}

export function getPublishedPack(idOrSlug: string) {
  const exact = publicCatalog.find(({ id, pack }) => id === idOrSlug && publishedPacks.includes(pack));
  if (exact) return exact.pack;
  const matches = publishedPacks.filter((pack) => pack.slug === idOrSlug);
  return matches.length === 1 ? matches[0] : undefined;
}

export function getRoutablePack(idOrSlug: string) {
  const exact = publicCatalog.find(({ id }) => id === idOrSlug);
  if (exact) return exact.pack;
  const matches = routablePacks.filter((pack) => pack.slug === idOrSlug);
  return matches.length === 1 ? matches[0] : undefined;
}
