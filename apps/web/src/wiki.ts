import { getBacklinks, getPage, getRelatedPages, type WikiCorpus, type WikiPage } from "@possible/knowledge";
import { sectionForSlug } from "./atlas";

export type GraphRelation = "selected" | "outgoing" | "incoming" | "mutual";

export interface RelatedGraphNode {
  page: WikiPage;
  relation: GraphRelation;
  x: number;
  y: number;
}

export interface RelatedGraphEdge {
  source: string;
  target: string;
  relation: Exclude<GraphRelation, "selected">;
}

export interface RelatedGraphModel {
  selected?: WikiPage;
  nodes: RelatedGraphNode[];
  edges: RelatedGraphEdge[];
  outgoingPages: WikiPage[];
  backlinkPages: WikiPage[];
  relatedPages: WikiPage[];
  hiddenCount: number;
}

const MAX_GRAPH_PAGES = 6;

const byTitle = (left: WikiPage, right: WikiPage): number =>
  left.title.localeCompare(right.title) || left.slug.localeCompare(right.slug);

const uniquePages = (pages: WikiPage[]): WikiPage[] => {
  const seen = new Set<string>();
  return pages.filter((page) => {
    if (seen.has(page.slug)) return false;
    seen.add(page.slug);
    return true;
  });
};

const relatedPriority = (relation: GraphRelation): number => {
  if (relation === "mutual") return 0;
  if (relation === "outgoing") return 1;
  if (relation === "incoming") return 2;
  return 3;
};

const safeDecode = (value: string): string | undefined => {
  try {
    return decodeURIComponent(value);
  } catch {
    return undefined;
  }
};

export function wikiPath(slug: string): string {
  return `/wiki/${encodeURIComponent(slug)}`;
}

export function routeSlug(pathname: string): string | undefined {
  if (!pathname.startsWith("/wiki/")) return undefined;
  const value = pathname.slice("/wiki/".length).replace(/\/+$/, "");
  if (!value) return undefined;
  return safeDecode(value);
}

export function hrefToSlug(href: string): string | undefined {
  if (!href.startsWith("/wiki/")) return undefined;
  return routeSlug(href);
}

export function formatReviewedAt(reviewedAt: string): string {
  const parsed = new Date(`${reviewedAt}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return reviewedAt;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(parsed);
}

export function buildRelatedGraph(corpus: WikiCorpus, slug: string): RelatedGraphModel {
  const selected = getPage(corpus, slug);
  if (!selected) {
    return {
      nodes: [],
      edges: [],
      outgoingPages: [],
      backlinkPages: [],
      relatedPages: [],
      hiddenCount: 0,
    };
  }

  const selectedSection = sectionForSlug(selected.slug);
  const isInSelectedSection = (page: WikiPage): boolean =>
    !selectedSection || sectionForSlug(page.slug) === selectedSection;

  const outgoingPages = uniquePages(
    selected.links
      .map((linkSlug) => getPage(corpus, linkSlug))
      .filter((page): page is WikiPage => page !== undefined && isInSelectedSection(page)),
  ).sort(byTitle);
  const backlinkPages = uniquePages(getBacklinks(corpus, slug).filter(isInSelectedSection)).sort(byTitle);
  const relatedPages = uniquePages(getRelatedPages(corpus, slug).filter(isInSelectedSection)).sort(byTitle);

  const outgoingSlugs = new Set(outgoingPages.map((page) => page.slug));
  const backlinkSlugs = new Set(backlinkPages.map((page) => page.slug));
  const prioritizedPages = [...relatedPages].sort((left, right) => {
    const leftRelation = outgoingSlugs.has(left.slug) && backlinkSlugs.has(left.slug)
      ? "mutual"
      : outgoingSlugs.has(left.slug)
        ? "outgoing"
        : "incoming";
    const rightRelation = outgoingSlugs.has(right.slug) && backlinkSlugs.has(right.slug)
      ? "mutual"
      : outgoingSlugs.has(right.slug)
        ? "outgoing"
        : "incoming";

    return relatedPriority(leftRelation) - relatedPriority(rightRelation) || byTitle(left, right);
  });

  const visiblePages = prioritizedPages.slice(0, MAX_GRAPH_PAGES);
  const hiddenCount = Math.max(0, relatedPages.length - visiblePages.length);

  const nodes: RelatedGraphNode[] = [{
    page: selected,
    relation: "selected",
    x: 50,
    y: 50,
  }];

  if (visiblePages.length === 1) {
    const onlyPage = visiblePages[0]!;
    nodes.push({
      page: onlyPage,
      relation: outgoingSlugs.has(onlyPage.slug) && backlinkSlugs.has(onlyPage.slug)
        ? "mutual"
        : outgoingSlugs.has(onlyPage.slug)
          ? "outgoing"
          : "incoming",
      x: 78,
      y: 50,
    });
  } else {
    visiblePages.forEach((page, index) => {
      const angle = ((-90 + (index * 360) / visiblePages.length) * Math.PI) / 180;
      nodes.push({
        page,
        relation: outgoingSlugs.has(page.slug) && backlinkSlugs.has(page.slug)
          ? "mutual"
          : outgoingSlugs.has(page.slug)
            ? "outgoing"
            : "incoming",
        x: 50 + Math.cos(angle) * 35,
        y: 50 + Math.sin(angle) * 35,
      });
    });
  }

  const edges: RelatedGraphEdge[] = [];
  visiblePages.forEach((page) => {
    const isOutgoing = outgoingSlugs.has(page.slug);
    const isIncoming = backlinkSlugs.has(page.slug);

    if (isOutgoing && isIncoming) {
      edges.push({
        source: selected.slug,
        target: page.slug,
        relation: "mutual" as const,
      });
      return;
    }

    if (isOutgoing) {
      edges.push({
        source: selected.slug,
        target: page.slug,
        relation: "outgoing" as const,
      });
      return;
    }

    edges.push({
      source: page.slug,
      target: selected.slug,
      relation: "incoming" as const,
    });
  });

  return {
    selected,
    nodes,
    edges,
    outgoingPages,
    backlinkPages,
    relatedPages,
    hiddenCount,
  };
}
