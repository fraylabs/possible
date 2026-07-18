import { wikiCorpusData } from "./generated-data.js";
import type {
  Guide,
  GuideLibrary,
  GuideSearchOptions,
  GuideSearchResult,
} from "./types.js";

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
  "build",
  "can",
  "create",
  "do",
  "for",
  "help",
  "how",
  "i",
  "is",
  "it",
  "looking",
  "make",
  "me",
  "my",
  "need",
  "of",
  "please",
  "the",
  "to",
  "trying",
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

const cloneLibrary = (library: GuideLibrary): GuideLibrary =>
  JSON.parse(JSON.stringify(library)) as GuideLibrary;

const searchFields = (guide: Guide): Array<readonly [string, number]> => [
  [guide.title, 16],
  [guide.slug, 12],
  [(guide.aliases ?? []).join(" "), 14],
  [guide.tags.join(" "), 10],
  [guide.summary, 8],
  [guide.body, 2],
  [guide.sources.map((source) => source.title).join(" "), 1],
];

export async function loadGuides(): Promise<GuideLibrary> {
  return cloneLibrary(wikiCorpusData);
}

export function getGuide(library: GuideLibrary, slug: string): Guide | undefined {
  return library.pages.find((guide) => guide.slug === slug);
}

export function searchGuides(
  library: GuideLibrary,
  query: string,
  options: GuideSearchOptions = {},
): GuideSearchResult[] {
  const terms = termsFor(query);
  if (terms.length === 0) return [];

  const phrase = terms.join(" ");
  const requestedTags = new Set((options.tags ?? []).map(normalize).filter(Boolean));
  const limit = Math.max(0, Math.min(options.limit ?? 20, 100));

  return library.pages
    .filter((guide) => {
      if (requestedTags.size === 0) return true;
      const guideTags = new Set(guide.tags.map(normalize));
      return [...requestedTags].every((tag) => guideTags.has(tag));
    })
    .map((page): GuideSearchResult => {
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

export function getGuideBacklinks(library: GuideLibrary, slug: string): Guide[] {
  return library.pages.filter((guide) => guide.links.includes(slug));
}

export function getRelatedGuides(library: GuideLibrary, slug: string): Guide[] {
  const guide = getGuide(library, slug);
  if (!guide) return [];
  const relatedSlugs = new Set([
    ...guide.links,
    ...getGuideBacklinks(library, slug).map((backlink) => backlink.slug),
  ]);
  relatedSlugs.delete(slug);
  return library.pages.filter((candidate) => relatedSlugs.has(candidate.slug));
}

// Compatibility functions for the existing website, MCP server, and public data paths.
export const loadWiki = loadGuides;
export const getPage = getGuide;
export const searchPages = searchGuides;
export const getBacklinks = getGuideBacklinks;
export const getRelatedPages = getRelatedGuides;
