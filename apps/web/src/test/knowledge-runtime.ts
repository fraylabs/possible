import type {
  PageSearchOptions,
  PageSearchResult,
  WikiCorpus,
  WikiPage,
} from "@possible/knowledge";
import { testWikiCorpus } from "./knowledge-data";

const normalize = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9+#./-]+/g, " ")
    .trim();

const searchStopWords = new Set([
  "a", "an", "and", "can", "do", "for", "how", "i", "is", "it", "make", "me",
  "my", "need", "of", "please", "the", "to", "want", "we", "with", "would", "you",
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

const cloneCorpus = (corpus: WikiCorpus): WikiCorpus =>
  JSON.parse(JSON.stringify(corpus)) as WikiCorpus;

const searchFields = (page: WikiPage): Array<readonly [string, number]> => [
  [page.title, 16],
  [page.slug, 12],
  [(page.aliases ?? []).join(" "), 14],
  [page.tags.join(" "), 10],
  [page.summary, 8],
  [page.body, 2],
];

export async function loadWiki(): Promise<WikiCorpus> {
  return cloneCorpus(testWikiCorpus);
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
  const limit = Math.max(0, Math.min(options.limit ?? 20, 100));

  return corpus.pages
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
        left.page.title.localeCompare(right.page.title) ||
        left.page.slug.localeCompare(right.page.slug),
    )
    .slice(0, limit);
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
