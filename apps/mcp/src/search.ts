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
  { key: "useWhen", label: "useWhen", weight: 2 },
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
  matchingTerms: string[];
  matchReasons: string[];
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

const tokenize = (value: string): string[] => {
  const normalized = value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
  return [...new Set((normalized.match(/[a-z0-9]+/g) ?? [])
    .filter((term) => term.length >= 3 && !STOP_WORDS.has(term)))];
};

const matches = (queryTerms: string[], value: string): string[] => {
  const valueTerms = new Set(tokenize(value));
  return queryTerms.filter((term) => valueTerms.has(term));
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
 * Deterministic lexical discovery only. The score orders text-overlap candidates;
 * it is not a semantic ranking, recommendation, or claim that a pack is suitable.
 */
export function searchPublicPacks(
  input: PackSearchInput,
  dependencies: SearchDependencies,
): PackSearchCandidate[] {
  const queryTerms = tokenize([
    input.outcome,
    input.currentReality ?? "",
    input.constraints ?? "",
  ].join(" "));

  return dependencies.catalog
    .filter(({ pack, trust }) => pack.visibility === "public" && pack.lifecycle !== "archived" && trust.status !== "archived")
    .map((entry): PackSearchCandidate | undefined => {
      const { pack } = entry;
      const fieldMatches = SEARCH_FIELDS.map((field) => ({
        ...field,
        terms: matches(queryTerms, searchableFieldText(entry, field.key)),
      })).filter(({ terms }) => terms.length > 0);
      if (fieldMatches.length === 0) return undefined;

      const matchingTerms = [...new Set(fieldMatches.flatMap(({ terms }) => terms))].sort();
      const conflictingNotForSignals = pack.notFor
        .map((statement) => ({ statement, matchingTerms: matches(queryTerms, statement) }))
        .filter(({ matchingTerms: conflictTerms }) => conflictTerms.length > 0);

      const metadata = normalizeCatalogMetadata(entry);
      return {
        id: entry.id,
        slug: pack.slug,
        name: pack.name,
        promise: pack.promise,
        status: entry.trust.status,
        reviewedAt: pack.reviewedAt ?? null,
        matchScore: fieldMatches.reduce((score, field) => score + field.weight * field.terms.length, 0),
        matchingTerms,
        matchReasons: fieldMatches.map(({ label, terms }) => `${label} matched: ${terms.join(", ")}`),
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
      || left.id.localeCompare(right.id))
    .slice(0, 10);
}
