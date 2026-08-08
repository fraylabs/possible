import { getCatalogEntry, publicCatalog } from "./catalog.js";
import { publicOutcomePacks } from "./manifest.js";
import type { PackStatus } from "./types.js";

export { compileInstallCommands, compilePack, compileRunPrompt, compileWorkstreamWaves, evaluateExpectationResults, recordOutcomeJourney, validateExpectationContract, validateOutcomeCheckpoint, validateOutcomeRecord } from "./compiler.js";
export { getCatalogEntry, getCatalogNumber, publicCatalog } from "./catalog.js";
export { publicOutcomePacks, validatePackManifest } from "./manifest.js";
export { buildPackCatalog, defaultPackTrust, formatPackIdentity, parsePackIdentity, validateAcceptedPackSnapshot, validateBundledPackSourceRecord, validateFederatedPackSource, validateFederatedRegistryEntry, validatePackTrustForManifest, validatePackTrustRecord } from "./registry.js";
export type { AcceptedPackEvidence, AcceptedPackSnapshot, BuildPackCatalogInput, BundledPackSourceRecord, CatalogPackOrigin, FederatedPackRegistryEntry, FederatedPackSource, PackCatalogEntry, PackIdentity, PackSourceRecord, PackTrustRecord, Sha256Digest } from "./registry.js";
export type { ArchivedPackMetadata, CandidateOutcomeRecommendation, CompiledPack, EvidenceBackedFact, ExpectationEvaluation, ExpectationLevel, ExpectationResult, ExpectationResultStatus, ExpectationSource, OutcomeApprovalRecord, OutcomeArtifactRecord, OutcomeCheckpoint, OutcomeDecisionRecord, OutcomeExpectation, OutcomeExpectationContract, OutcomeExternalActionRecord, OutcomeJourneyHistory, OutcomePack, OutcomeRecord, OutcomeRepairRecord, PackExpectation, PackLane, PackLifecycle, PackStatus, PackTrustStatus, PackVisibility, SkillSource, Workstream } from "./types.js";

export const catalogOutcomePacks = publicCatalog.map(({ pack }) => pack);
export const archivedOutcomePacks = publicCatalog.filter(({ trust }) => trust.status === "archived").map(({ pack }) => pack);
export const activeOutcomePacks = publicCatalog.filter(({ trust }) => trust.status !== "archived").map(({ pack }) => pack);
export const listedOutcomePacks = publicCatalog.filter(({ trust }) => trust.status === "listed").map(({ pack }) => pack);
export const experimentalOutcomePacks = publicCatalog.filter(({ trust }) => trust.status === "experimental").map(({ pack }) => pack);
export const verifiedOutcomePacks = publicCatalog.filter(({ trust }) => trust.status === "verified").map(({ pack }) => pack);

export function getPackStatus(idOrSlug: string): PackStatus | undefined {
  return getCatalogEntry(idOrSlug)?.trust.status;
}

export function getPack(idOrSlug: string) {
  return getCatalogEntry(idOrSlug)?.pack;
}

export function getActivePack(idOrSlug: string) {
  const entry = getCatalogEntry(idOrSlug);
  return entry?.trust.status === "archived" ? undefined : entry?.pack;
}
