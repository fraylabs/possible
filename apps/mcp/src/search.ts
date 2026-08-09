import type { PackTrustStatus } from "@possible/packs";
import {
  type CatalogEvidenceMetadata,
  type CatalogSourceMetadata,
  type CatalogTrustMetadata,
  type McpCatalogEntry,
  normalizeCatalogMetadata,
} from "./catalog.js";

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
  { key: "useWhen", label: "useWhen", weight: 3 },
  { key: "expectations", label: "expectations", weight: 1 },
] as const;

export interface PackSearchInput {
  outcome: string;
  currentReality?: string;
  constraints?: string;
}

export interface PackSearchCandidate {
  id: string;
  slug: string;
  name: string;
  promise: string;
  status: PackTrustStatus;
  reviewedAt: string | null;
  matchScore: number;
  lexicalMatch: boolean;
  matchingTerms: string[];
  matchReasons: string[];
  notFor: string[];
  conflictingNotForSignals: Array<{
    statement: string;
    matchingTerms: string[];
  }>;
  expectations: Array<{
    id: string;
    statement: string;
    level: "required" | "preferred";
  }>;
  source: CatalogSourceMetadata;
  trust: CatalogTrustMetadata;
  evidence: CatalogEvidenceMetadata;
  agentJudgmentRequired: true;
}

interface SearchDependencies {
  catalog: readonly McpCatalogEntry[];
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

const tokenize = (value: string): string[] => {
  const normalized = value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
  return [...new Set((normalized.match(/[a-z0-9]+/g) ?? [])
    .filter((term) => term.length >= 3 && !STOP_WORDS.has(term))
    .map(stem))];
};

const matches = (queryTerms: string[], value: string): string[] => {
  const valueTerms = new Set(tokenize(value));
  return queryTerms.filter((term) => valueTerms.has(term));
};

const hasSharedBigram = (left: string[], right: string[]): boolean => {
  const rightPairs = new Set(right.slice(0, -1).map((term, index) => `${term}\u0000${right[index + 1]}`));
  return left.slice(0, -1).some((term, index) => rightPairs.has(`${term}\u0000${left[index + 1]}`));
};

const searchableFieldText = (entry: McpCatalogEntry, field: typeof SEARCH_FIELDS[number]["key"]): string => {
  const { pack } = entry;
  switch (field) {
    case "name": return pack.name;
    case "promise": return pack.promise;
    case "summary": return pack.summary;
    case "useWhen": return pack.useWhen.join(" ");
    case "expectations": return (pack.expectations ?? []).map(({ statement }) => statement).join(" ");
  }
};

/**
 * Return every active public pack with deterministic lexical hints. The score only
 * orders text overlap; it is not a semantic ranking, recommendation, or fit claim.
 */
export function searchPublicPacks(
  input: PackSearchInput,
  dependencies: SearchDependencies,
): PackSearchCandidate[] {
  const activeCatalog = dependencies.catalog
    .filter(({ pack, trust }) => pack.visibility === "public" && pack.lifecycle !== "archived" && trust.status !== "archived");
  const queryTerms = tokenize([
    input.outcome,
    input.currentReality ?? "",
    input.constraints ?? "",
  ].join(" "));
  const documents = activeCatalog.map((entry) => new Set(tokenize([
    ...SEARCH_FIELDS.map((field) => searchableFieldText(entry, field.key)),
    ...entry.pack.notFor,
  ].join(" "))));
  const documentFrequency = new Map<string, number>();
  for (const document of documents) for (const term of document) documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
  const importance = (term: string): number => 1 + Math.log((activeCatalog.length + 1) / ((documentFrequency.get(term) ?? 0) + 1));

  const redirectBoosts = new Map<string, number>();
  for (const entry of activeCatalog) {
    for (const statement of entry.pack.notFor) {
      const statementTerms = tokenize(statement);
      const statementMatches = matches(queryTerms, statement);
      for (const target of activeCatalog) {
        if (target.id === entry.id || !statement.toLowerCase().includes(target.pack.name.toLowerCase())) continue;
        const targetNameMatches = matches(queryTerms, target.pack.name);
        if (targetNameMatches.length >= 2 || (statementMatches.length >= 2 && hasSharedBigram(queryTerms, statementTerms))) {
          const boost = [...new Set([...statementMatches, ...targetNameMatches])].reduce((score, term) => score + importance(term), 0) * 4;
          redirectBoosts.set(target.id, (redirectBoosts.get(target.id) ?? 0) + boost);
        }
      }
    }
  }

  return activeCatalog
    .map((entry): PackSearchCandidate | undefined => {
      const { pack } = entry;
      const positiveTerms = new Set(tokenize(SEARCH_FIELDS.map((field) => searchableFieldText(entry, field.key)).join(" ")));
      const fieldMatches = SEARCH_FIELDS.map((field) => ({
        ...field,
        terms: matches(queryTerms, searchableFieldText(entry, field.key)),
      })).filter(({ terms }) => terms.length > 0);
      const redirectBoost = redirectBoosts.get(entry.id) ?? 0;

      const matchingTerms = [...new Set(fieldMatches.flatMap(({ terms }) => terms))].sort();
      const conflictingNotForSignals = pack.notFor
        .map((statement) => {
          const statementTerms = tokenize(statement);
          const matchingTerms = matches(queryTerms, statement);
          const exclusiveTerms = matchingTerms.filter((term) => !positiveTerms.has(term));
          const confident = matchingTerms.length >= 3
            && exclusiveTerms.length >= 2
            && hasSharedBigram(queryTerms, statementTerms);
          return { statement, matchingTerms, confident };
        })
        .filter(({ confident }) => confident)
        .map(({ statement, matchingTerms }) => ({ statement, matchingTerms }));

      const metadata = normalizeCatalogMetadata(entry);
      const lexicalScore = fieldMatches.reduce((score, field) => score + field.weight * field.terms.reduce((termScore, term) => termScore + importance(term), 0), 0);
      return {
        id: entry.id,
        slug: pack.slug,
        name: pack.name,
        promise: pack.promise,
        status: entry.trust.status,
        reviewedAt: pack.reviewedAt ?? null,
        matchScore: Number((lexicalScore + redirectBoost).toFixed(3)),
        lexicalMatch: fieldMatches.length > 0 || redirectBoost > 0,
        matchingTerms,
        matchReasons: fieldMatches.map(({ label, terms }) => `${label} matched: ${terms.join(", ")}`),
        notFor: [...pack.notFor],
        conflictingNotForSignals,
        expectations: (pack.expectations ?? []).map((expectation) => ({
          id: expectation.id,
          statement: expectation.statement,
          level: expectation.level ?? "required",
        })),
        source: metadata.source,
        trust: metadata.trust,
        evidence: metadata.evidence,
        agentJudgmentRequired: true,
      };
    })
    .filter((candidate): candidate is PackSearchCandidate => candidate !== undefined)
    .sort((left, right) =>
      right.matchScore - left.matchScore
      || left.conflictingNotForSignals.length - right.conflictingNotForSignals.length
      || left.slug.localeCompare(right.slug)
      || left.id.localeCompare(right.id));
}
