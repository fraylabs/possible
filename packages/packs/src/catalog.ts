import { publicOutcomePacks } from "./manifest.js";
import type { OutcomePack } from "./types.js";

/** Presentation metadata for the public catalog; it is not part of a pack contract. */
export interface PublicCatalogEntry {
  pack: OutcomePack;
  catalogNumber: number;
}

export const publicCatalog: PublicCatalogEntry[] = publicOutcomePacks.map((pack, index) => ({
  pack,
  catalogNumber: index + 1,
}));

const catalogNumberBySlug = new Map(publicCatalog.map(({ pack, catalogNumber }) => [pack.slug, catalogNumber]));

if (catalogNumberBySlug.size !== publicCatalog.length) throw new Error("Public catalog slugs must be unique");

export function getCatalogNumber(slug: string): number {
  const catalogNumber = catalogNumberBySlug.get(slug);
  if (catalogNumber === undefined) throw new Error(`Public catalog has no number for ${slug}`);
  return catalogNumber;
}
