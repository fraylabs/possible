import type { WikiCorpus, WikiPage } from "@possible/knowledge";
import { pageSectionBySlug } from "./generated-sections";

export interface AtlasBranch {
  section: string;
  page: WikiPage;
  pageCount: number;
  x: number;
  y: number;
}

export function sectionForSlug(slug: string): string | undefined {
  return pageSectionBySlug[slug];
}

export function buildAtlasBranches(corpus: WikiCorpus): AtlasBranch[] {
  const pageCountBySection = new Map<string, number>();

  corpus.pages.forEach((page) => {
    const section = sectionForSlug(page.slug);
    if (!section) return;
    pageCountBySection.set(section, (pageCountBySection.get(section) ?? 0) + 1);
  });

  const roots = corpus.pages
    .filter((page) => sectionForSlug(page.slug) === page.slug)
    .sort((left, right) => left.title.localeCompare(right.title) || left.slug.localeCompare(right.slug));

  return roots.map((page, index) => {
    const angle = ((index * 360) / roots.length) * Math.PI / 180;
    const section = sectionForSlug(page.slug)!;
    return {
      section,
      page,
      pageCount: pageCountBySection.get(section) ?? 1,
      x: roots.length === 1 ? 76 : 50 + Math.cos(angle) * 33,
      y: roots.length === 1 ? 50 : 50 + Math.sin(angle) * 31,
    };
  });
}
