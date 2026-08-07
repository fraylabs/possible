import { publicOutcomePacks } from "./manifest.js";
import type { PackStatus } from "./types.js";

export { compileInstallCommands, compilePack, compileRunPrompt, compileWorkstreamWaves, evaluateExpectationResults, recordOutcomeJourney, validateExpectationContract, validateOutcomeCheckpoint, validateOutcomeRecord } from "./compiler.js";
export { getCatalogNumber, publicCatalog } from "./catalog.js";
export { publicOutcomePacks, validatePackManifest } from "./manifest.js";
export type { ArchivedPackMetadata, CandidateOutcomeRecommendation, CompiledPack, CrowdfundingCampaignReadinessContract, DecisionRationaleContract, EvidenceBackedFact, ExpectationEvaluation, ExpectationLevel, ExpectationResult, ExpectationResultStatus, ExpectationSource, FirstCustomerSprintContract, FunctionalHardwareModule, FunctionalHardwareModuleId, FunctionalHardwarePrototypeContract, HardwarePrototypeContract, LaunchContentModule, LaunchContentModuleId, LaunchContentPackageContract, ManufacturingReadinessContract, MechanicalCadReviewContract, ModularOutcomeContract, ModularOutcomeModule, OpportunityDiscoveryContract, OutcomeApprovalRecord, OutcomeArtifactRecord, OutcomeCheckpoint, OutcomeDecisionRecord, OutcomeExpectation, OutcomeExpectationContract, OutcomeExternalActionRecord, OutcomeJourneyHistory, OutcomePack, OutcomePrerequisite, OutcomeRecord, OutcomeRepairRecord, PackExpectation, PackLane, PackLifecycle, PackStatus, PackVisibility, PresentationAudioSource, PresentationVideoContract, PresentationVideoRenderer, PluginCapability, RemixContract, ScheduleContract, SkillSource, StudyReadinessContract, Workstream } from "./types.js";

export const stablePackSlugs = [
  "playable-web-game",
  "web-presentation",
  "software-opportunity-discovery",
  "first-customer-sprint",
] as const;

const stablePackSlugSet = new Set<string>(stablePackSlugs);

export const archivedOutcomePacks = publicOutcomePacks.filter((pack) => pack.lifecycle === "archived");
export const activeOutcomePacks = publicOutcomePacks.filter((pack) => pack.lifecycle !== "archived");
export const stableOutcomePacks = activeOutcomePacks.filter((pack) => stablePackSlugSet.has(pack.slug));
export const experimentalOutcomePacks = activeOutcomePacks.filter((pack) => !stablePackSlugSet.has(pack.slug));

export function getPackStatus(slug: string): PackStatus | undefined {
  const pack = publicOutcomePacks.find((candidate) => candidate.slug === slug);
  if (!pack) return undefined;
  if (pack.lifecycle === "archived") return "archived";
  return stablePackSlugSet.has(slug) ? "stable" : "experimental";
}

export function getPack(slug: string) {
  return publicOutcomePacks.find((pack) => pack.slug === slug);
}

export function getActivePack(slug: string) {
  return activeOutcomePacks.find((pack) => pack.slug === slug);
}
