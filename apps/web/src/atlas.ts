import type { WikiCorpus, WikiPage } from "@possible/knowledge";
import { buildForceLayout } from "./force-layout";
import { pageSectionBySlug } from "./generated-sections";

export interface AtlasBranch {
  section: string;
  page: WikiPage;
  pageCount: number;
}

export interface AtlasGraphNode {
  page: WikiPage;
  section: string;
  role: "field" | "page";
  x: number;
  y: number;
  degree: number;
}

export interface AtlasGraphEdge {
  source: string;
  target: string;
}

export interface AtlasGraphModel {
  nodes: AtlasGraphNode[];
  edges: AtlasGraphEdge[];
}

const sectionColors: Readonly<Record<string, string>> = Object.freeze({
  manufacturing: "#f0a35e",
  web: "#82a8ff",
});

const fallbackColors = ["#8ed2bd", "#c79cf2", "#ef7d93", "#e0ce72", "#73c9e6"] as const;

const hashSection = (section: string): number => {
  let hash = 0;
  for (let index = 0; index < section.length; index += 1) {
    hash = Math.imul(31, hash) + section.charCodeAt(index);
  }
  return Math.abs(hash);
};

export function colorForSection(section: string | undefined): string {
  if (!section) return "#aeb7cb";
  const knownColor = sectionColors[section];
  if (knownColor) return knownColor;
  return fallbackColors[hashSection(section) % fallbackColors.length] ?? "#aeb7cb";
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

  return roots.map((page) => {
    const section = sectionForSlug(page.slug)!;
    return {
      section,
      page,
      pageCount: pageCountBySection.get(section) ?? 1,
    };
  });
}

export function buildAtlasGraph(corpus: WikiCorpus): AtlasGraphModel {
  const pages = corpus.pages
    .flatMap((page) => {
      const section = sectionForSlug(page.slug);
      return section ? [{ page, section }] : [];
    })
    .sort((left, right) =>
      left.section.localeCompare(right.section)
      || left.page.title.localeCompare(right.page.title)
      || left.page.slug.localeCompare(right.page.slug));
  const pageBySlug = new Map(pages.map(({ page }) => [page.slug, page]));
  const sectionBySlug = new Map(pages.map(({ page, section }) => [page.slug, section]));
  const edgeKeys = new Set<string>();
  const edges: AtlasGraphEdge[] = [];
  const addEdge = (source: string, target: string) => {
    if (source === target || !pageBySlug.has(source) || !pageBySlug.has(target)) return;
    const key = `${source}:${target}`;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    edges.push({ source, target });
  };

  pages.forEach(({ page }) => {
    if (page.parent) addEdge(page.parent, page.slug);
    page.links.forEach((targetSlug) => {
      addEdge(page.slug, targetSlug);
    });
  });

  const degreeBySlug = new Map<string, number>();
  edges.forEach((edge) => {
    degreeBySlug.set(edge.source, (degreeBySlug.get(edge.source) ?? 0) + 1);
    degreeBySlug.set(edge.target, (degreeBySlug.get(edge.target) ?? 0) + 1);
  });

  const positions = buildForceLayout(
    pages.map(({ page, section }) => ({
      id: page.slug,
      group: section,
      anchor: page.slug === section,
    })),
    edges,
  );

  return {
    nodes: pages.map(({ page, section }) => {
      const position = positions.get(page.slug) ?? { x: 50, y: 50 };
      return {
        page,
        section: sectionBySlug.get(page.slug) ?? section,
        role: page.slug === section ? "field" : "page",
        x: position.x,
        y: position.y,
        degree: degreeBySlug.get(page.slug) ?? 0,
      };
    }),
    edges,
  };
}
