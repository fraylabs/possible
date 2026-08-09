import { parsePackIdentity, type PackCatalogEntry } from "./registry.js";

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "but", "by", "can", "do", "does",
  "for", "from", "had", "has", "have", "how", "i", "if", "in", "into", "is", "it", "its",
  "make", "need", "needs", "of", "on", "or", "our", "should", "so", "that", "the", "their",
  "them", "then", "there", "these", "they", "this", "to", "turn", "use", "using", "want", "we",
  "what", "when", "where", "which", "who", "will", "with", "without", "you", "your",
]);

const SEARCH_FIELDS = [
  { key: "name", label: "name", weight: 5 },
  { key: "promise", label: "promise", weight: 4 },
  { key: "summary", label: "summary", weight: 3 },
  { key: "publisher", label: "publisher", weight: 1 },
] as const;

export interface PackCatalogSearchInput {
  query: string;
  includeUnmatched?: boolean;
  minimumMatchingTerms?: number;
  minimumScoreRatio?: number;
}

export interface PackCatalogSearchResult<TEntry extends PackCatalogEntry = PackCatalogEntry> {
  entry: TEntry;
  publisher: string;
  repository: string;
  summary: string;
  matchScore: number;
  lexicalMatch: boolean;
  matchingTerms: string[];
  matchReasons: string[];
}

const stem = (term: string): string => {
  if (term.length > 5 && term.endsWith("ies")) return `${term.slice(0, -3)}y`;
  if (term.length > 5 && term.endsWith("ing")) {
    const root = term.slice(0, -3);
    return root.length > 3 && root.at(-1) === root.at(-2) && !root.endsWith("ss") ? root.slice(0, -1) : root;
  }
  if (term.length > 4 && term.endsWith("ed")) return term.slice(0, -2);
  if (term.length > 4 && term.endsWith("es") && !term.endsWith("ses")) return term.slice(0, -2);
  if (term.length > 3 && term.endsWith("s") && !term.endsWith("ss")) return term.slice(0, -1);
  return term;
};

export const tokenizePackSearch = (value: string): string[] => {
  const normalized = value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
  return [...new Set((normalized.match(/[a-z0-9]+/g) ?? [])
    .filter((term) => term.length >= 3 && !STOP_WORDS.has(term))
    .map(stem))];
};

export const matchPackSearchTerms = (queryTerms: string[], value: string): string[] => {
  const valueTerms = new Set(tokenizePackSearch(value));
  return queryTerms.filter((term) => valueTerms.has(term));
};

export const hasSharedPackSearchBigram = (left: string[], right: string[]): boolean => {
  const rightPairs = new Set(right.slice(0, -1).map((term, index) => `${term}\u0000${right[index + 1]}`));
  return left.slice(0, -1).some((term, index) => rightPairs.has(`${term}\u0000${left[index + 1]}`));
};

/** The opening paragraph is the pack's concise authored summary; no extra catalog field is required. */
export const getPackSearchSummary = (prompt: string): string => prompt.split(/\n\s*\n/, 1)[0]?.trim() ?? "";

/**
 * Deterministic catalog retrieval shared by the website and MCP. It provides
 * lexical ordering only; the user or agent still judges which outcome fits.
 */
export function searchPackCatalog<TEntry extends PackCatalogEntry>(
  input: PackCatalogSearchInput,
  catalog: readonly TEntry[],
): PackCatalogSearchResult<TEntry>[] {
  const queryTerms = tokenizePackSearch(input.query);
  const candidates = catalog
    .map((entry): PackCatalogSearchResult<TEntry> => {
      const { owner: publisher, repository } = parsePackIdentity(entry.id);
      const summary = getPackSearchSummary(entry.pack.prompt);
      const values = {
        name: entry.pack.name,
        promise: entry.pack.promise,
        summary,
        publisher,
      };
      const fieldMatches = SEARCH_FIELDS.map((field) => ({
        ...field,
        terms: matchPackSearchTerms(queryTerms, values[field.key]),
      })).filter(({ terms }) => terms.length > 0);
      const matchingTerms = [...new Set(fieldMatches.flatMap(({ terms }) => terms))].sort();
      const matchScore = fieldMatches.reduce((score, field) => score + field.weight * field.terms.length, 0);
      return {
        entry,
        publisher,
        repository,
        summary,
        matchScore,
        lexicalMatch: fieldMatches.length > 0,
        matchingTerms,
        matchReasons: fieldMatches.map(({ label, terms }) => `${label} matched: ${terms.join(", ")}`),
      };
    });
  const bestScore = candidates.reduce((best, candidate) => Math.max(best, candidate.matchScore), 0);
  const minimumMatchingTerms = Math.min(input.minimumMatchingTerms ?? 1, queryTerms.length);
  const minimumScore = bestScore * (input.minimumScoreRatio ?? 0);

  return candidates
    .filter(({ lexicalMatch, matchingTerms, matchScore }) =>
      input.includeUnmatched
      || queryTerms.length === 0
      || (lexicalMatch && matchingTerms.length >= minimumMatchingTerms && matchScore >= minimumScore))
    .sort((left, right) =>
      right.matchScore - left.matchScore
      || left.entry.slug.localeCompare(right.entry.slug)
      || left.entry.id.localeCompare(right.entry.id));
}
