import {
  getPackSearchSummary,
  hasSharedPackSearchBigram,
  matchPackSearchTerms,
  searchPackCatalog,
  tokenizePackSearch,
  type PackTrustStatus,
} from "@possible/packs";
import {
  type CatalogEvidenceMetadata,
  type CatalogSourceMetadata,
  type CatalogTrustMetadata,
  type McpCatalogEntry,
  normalizeCatalogMetadata,
} from "./catalog.js";

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
  matchScore: number;
  lexicalMatch: boolean;
  matchingTerms: string[];
  matchReasons: string[];
  notFor: string[];
  conflictingNotForSignals: Array<{
    statement: string;
    matchingTerms: string[];
  }>;
  expectations: string[];
  source: CatalogSourceMetadata;
  trust: CatalogTrustMetadata;
  evidence: CatalogEvidenceMetadata;
  agentJudgmentRequired: true;
}

interface SearchDependencies {
  catalog: readonly McpCatalogEntry[];
}

/**
 * Return every active public pack with deterministic lexical hints. The score only
 * orders text overlap; it is not a semantic ranking, recommendation, or fit claim.
 */
export function searchPublicPacks(
  input: PackSearchInput,
  dependencies: SearchDependencies,
): PackSearchCandidate[] {
  const activeCatalog = dependencies.catalog;
  const query = [
    input.outcome,
    input.currentReality ?? "",
    input.constraints ?? "",
  ].join(" ");
  const queryTerms = tokenizePackSearch(query);

  return searchPackCatalog({ query, includeUnmatched: true }, activeCatalog)
    .map(({ entry, matchScore, lexicalMatch, matchingTerms, matchReasons }): PackSearchCandidate => {
      const { pack } = entry;
      const positiveTerms = new Set(tokenizePackSearch([pack.name, pack.promise, getPackSearchSummary(pack.prompt)].join(" ")));
      const conflictingNotForSignals = (pack.notFor ?? [])
        .map((statement) => {
          const statementTerms = tokenizePackSearch(statement);
          const matchingTerms = matchPackSearchTerms(queryTerms, statement);
          const exclusiveTerms = matchingTerms.filter((term) => !positiveTerms.has(term));
          const confident = matchingTerms.length >= 3
            && exclusiveTerms.length >= 2
            && hasSharedPackSearchBigram(queryTerms, statementTerms);
          return { statement, matchingTerms, confident };
        })
        .filter(({ confident }) => confident)
        .map(({ statement, matchingTerms }) => ({ statement, matchingTerms }));

      const metadata = normalizeCatalogMetadata(entry);
      return {
        id: entry.id,
        slug: entry.slug,
        name: pack.name,
        promise: pack.promise,
        status: entry.trust.status,
        matchScore,
        lexicalMatch,
        matchingTerms,
        matchReasons,
        notFor: [...(pack.notFor ?? [])],
        conflictingNotForSignals,
        expectations: [...pack.expectations],
        source: metadata.source,
        trust: metadata.trust,
        evidence: metadata.evidence,
        agentJudgmentRequired: true,
      };
    });
}
