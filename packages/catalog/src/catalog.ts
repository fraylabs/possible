import { bundledOutcomes } from "./outcomes.js";
import { resolveProducts } from "./products.js";
import type { OutcomeCatalogEntry } from "./types.js";

export const outcomeCatalog: OutcomeCatalogEntry[] = bundledOutcomes.map(({ slug, outcome }, index) => ({
  slug,
  outcome,
  products: resolveProducts(outcome.products, `${slug}.products`),
  catalogNumber: index + 1,
  sourceUrl: `https://github.com/fraylabs/possible/tree/main/packages/catalog/src/outcomes/${slug}`,
}));

const outcomeBySlug = new Map(outcomeCatalog.map((entry) => [entry.slug, entry]));

export function getOutcome(slug: string): OutcomeCatalogEntry | undefined {
  return outcomeBySlug.get(slug);
}
