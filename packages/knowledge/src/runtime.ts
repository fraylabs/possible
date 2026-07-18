import { wikiCorpusData } from "./generated-data.js";
import type {
  PageSearchOptions,
  PageSearchResult,
  WikiCorpus,
  WikiPage,
} from "./types.js";

export type SearchRouteStatus = "verified" | "partial" | "no-maintained-route";

export interface SearchAssessment {
  status: SearchRouteStatus;
  reason: string;
  verifiedRoutes: string[];
  partialRoutes: string[];
}

const normalize = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9+#./-]+/g, " ")
    .trim();

const searchStopWords = new Set([
  "a",
  "an",
  "and",
  "can",
  "do",
  "for",
  "how",
  "i",
  "is",
  "it",
  "make",
  "me",
  "my",
  "need",
  "of",
  "please",
  "the",
  "to",
  "want",
  "we",
  "with",
  "would",
  "you",
]);

const termsFor = (value: string): string[] => {
  const terms = [...new Set(
    normalize(value)
      .split(/\s+/)
      .map((term) => term.replace(/^[./-]+|[./-]+$/g, ""))
      .filter(Boolean),
  )];
  const meaningfulTerms = terms.filter((term) => !searchStopWords.has(term));
  return meaningfulTerms.length > 0 ? meaningfulTerms : terms;
};

const compareText = (left: string, right: string): number =>
  left < right ? -1 : left > right ? 1 : 0;

const cloneCorpus = (corpus: WikiCorpus): WikiCorpus =>
  JSON.parse(JSON.stringify(corpus)) as WikiCorpus;

const searchFields = (page: WikiPage): Array<readonly [string, number]> => [
  [page.title, 16],
  [page.slug, 12],
  [(page.aliases ?? []).join(" "), 14],
  [page.tags.join(" "), 10],
  [page.summary, 8],
  [page.body, 2],
  [page.sources.map((source) => source.title).join(" "), 1],
];

export async function loadWiki(): Promise<WikiCorpus> {
  return cloneCorpus(wikiCorpusData);
}

export function getPage(corpus: WikiCorpus, slug: string): WikiPage | undefined {
  return corpus.pages.find((page) => page.slug === slug);
}

export function searchPages(
  corpus: WikiCorpus,
  query: string,
  options: PageSearchOptions = {},
): PageSearchResult[] {
  const terms = termsFor(query);
  if (terms.length === 0) return [];

  const phrase = terms.join(" ");
  const requestedTags = new Set((options.tags ?? []).map(normalize).filter(Boolean));
  const requestedCoverage = new Set((options.coverage ?? []).map(normalize).filter(Boolean));
  const limit = Math.max(0, Math.min(options.limit ?? 20, 100));

  return corpus.pages
    .filter((page) => {
      if (options.kind !== undefined && page.kind !== options.kind) return false;
      if (
        requestedCoverage.size > 0 &&
        ![...requestedCoverage].every((scope) =>
          (page.coverage ?? []).some((value) => normalize(value) === scope),
        )
      ) return false;
      if (requestedTags.size === 0) return true;
      const pageTags = new Set(page.tags.map(normalize));
      return [...requestedTags].every((tag) => pageTags.has(tag));
    })
    .map((page): PageSearchResult => {
      const fields = searchFields(page).map(([value, weight]) => [normalize(value), weight] as const);
      const matchedTerms = terms.filter((term) => fields.some(([value]) => value.includes(term)));
      let score = 0;
      for (const term of matchedTerms) {
        score += fields.reduce(
          (total, [value, weight]) => total + (value.includes(term) ? weight : 0),
          0,
        );
      }
      if (fields.some(([value]) => value.includes(phrase))) score += 20;
      return { page, score, matchedTerms };
    })
    .filter((result) => result.matchedTerms.length === terms.length)
    .sort(
      (left, right) =>
        right.score - left.score ||
        compareText(left.page.title, right.page.title) ||
        compareText(left.page.slug, right.page.slug),
    )
    .slice(0, limit);
}

export function assessSearchResults(results: readonly PageSearchResult[]): SearchAssessment {
  const outcomeResults = results.filter((result) => {
    if (result.page.kind !== "outcome") return false;
    const authoredRoutingText = normalize([
      result.page.title,
      result.page.slug,
      ...(result.page.aliases ?? []),
      ...result.page.tags,
    ].join(" "));
    return result.matchedTerms.every((term) => authoredRoutingText.includes(term));
  });
  const verifiedRoutes = outcomeResults
    .filter((result) => result.page.routeStatus === "verified")
    .map((result) => result.page.slug);
  const partialRoutes = outcomeResults
    .filter((result) => result.page.routeStatus !== "verified")
    .map((result) => result.page.slug);

  if (verifiedRoutes.length > 0) {
    return {
      status: "verified",
      reason: "Possible found an explicitly verified outcome route.",
      verifiedRoutes,
      partialRoutes,
    };
  }

  if (partialRoutes.length > 0) {
    return {
      status: "partial",
      reason: "Possible found an outcome page, but no explicitly verified route.",
      verifiedRoutes,
      partialRoutes,
    };
  }

  return {
    status: "no-maintained-route",
    reason: results.length > 0
      ? "Possible found related knowledge, but no maintained outcome route for this query."
      : "Possible found no maintained pages matching every query term.",
    verifiedRoutes,
    partialRoutes,
  };
}

export function getBacklinks(corpus: WikiCorpus, slug: string): WikiPage[] {
  return corpus.pages.filter((page) => page.links.includes(slug));
}

export function getRelatedPages(corpus: WikiCorpus, slug: string): WikiPage[] {
  const page = getPage(corpus, slug);
  if (!page) return [];
  const relatedSlugs = new Set([
    ...page.links,
    ...getBacklinks(corpus, slug).map((backlink) => backlink.slug),
  ]);
  relatedSlugs.delete(slug);
  return corpus.pages.filter((candidate) => relatedSlugs.has(candidate.slug));
}
