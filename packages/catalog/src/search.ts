import type { OutcomeCatalogEntry } from "./types.js";

const TOKEN = /[a-z0-9]+/g;
const STOP_WORDS = new Set([
  "a", "about", "an", "and", "as", "at", "be", "before", "by", "can", "do", "for", "from", "get", "give", "have", "help", "i", "in", "into", "is", "it", "make", "me", "my", "of", "on", "one", "or", "our", "so", "that", "the", "this", "to", "turn", "use", "want", "we", "where", "with", "without", "you",
]);

export interface OutcomeSearchInput {
  query: string;
}

export interface OutcomeSearchResult {
  entry: OutcomeCatalogEntry;
  score: number;
  matchedTerms: string[];
}

export function tokenizeOutcomeSearch(value: string): string[] {
  return [...new Set((value.toLowerCase().match(TOKEN) ?? []).filter((term) => term.length > 2 && !STOP_WORDS.has(term)))];
}

export function searchOutcomes(catalog: readonly OutcomeCatalogEntry[], input: OutcomeSearchInput): OutcomeSearchResult[] {
  const terms = tokenizeOutcomeSearch(input.query);
  if (terms.length === 0) return catalog.map((entry) => ({ entry, score: 0, matchedTerms: [] }));

  return catalog
    .map((entry) => {
      const title = tokenizeOutcomeSearch(entry.outcome.title);
      const summary = tokenizeOutcomeSearch(entry.outcome.summary);
      const prompt = tokenizeOutcomeSearch(entry.outcome.prompt);
      const productNames = tokenizeOutcomeSearch(entry.products.map(({ name }) => name).join(" "));
      const matchedTerms = terms.filter((term) => title.includes(term) || summary.includes(term) || prompt.includes(term) || productNames.includes(term));
      const score = matchedTerms.reduce((total, term) => total
        + (title.includes(term) ? 8 : 0)
        + (summary.includes(term) ? 4 : 0)
        + (productNames.includes(term) ? 3 : 0)
        + (prompt.includes(term) ? 1 : 0), 0);
      return { entry, score, matchedTerms };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.entry.catalogNumber - right.entry.catalogNumber);
}
