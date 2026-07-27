import { developerProjectLaunchPack } from "./developer-project-launch.js";
import { firstCustomerSprintPack } from "./first-customer-sprint.js";
import { functionalHardwarePrototypePack } from "./functional-hardware-prototype.js";
import { hardwareLaunchPack } from "./hardware-launch.js";
import { kickstarterFulfillmentPack } from "./kickstarter-fulfillment.js";
import { kickstarterFundingPack } from "./kickstarter-funding.js";
import { launchContentCampaignPack } from "./launch-content-campaign.js";
import { manufacturingReadinessPack } from "./manufacturing-readiness.js";
import { marketingOperationsPack } from "./marketing-operations.js";
import { mechanicalCadReviewPack } from "./mechanical-cad-review.js";
import { openSourceReleasePack } from "./open-source-release.js";
import { playableWebGamePack } from "./playable-web-game.js";
import { productionWebReleasePack } from "./production-web-release.js";
import { robotPrototypePack } from "./robot-prototype.js";
import { softwareOpportunityDiscoveryPack } from "./software-opportunity-discovery.js";
import { studyReadinessPack } from "./study-readiness.js";
import { webAppOperationsPack } from "./web-app-operations.js";
import { webPresentationPack } from "./web-presentation.js";
import { workingWebAppPack } from "./working-web-app.js";
import { workingHardwarePrototypePack } from "./working-hardware-prototype.js";
import type { PackStatus } from "./types.js";

export { developerProjectLaunchPack, firstCustomerSprintPack, functionalHardwarePrototypePack, hardwareLaunchPack, kickstarterFulfillmentPack, kickstarterFundingPack, launchContentCampaignPack, manufacturingReadinessPack, marketingOperationsPack, mechanicalCadReviewPack, openSourceReleasePack, playableWebGamePack, productionWebReleasePack, robotPrototypePack, softwareOpportunityDiscoveryPack, studyReadinessPack, webAppOperationsPack, webPresentationPack, workingHardwarePrototypePack, workingWebAppPack };
export { compileInstallCommands, compilePack, compileRunPrompt, compileWorkstreamWaves, evaluateCriticalProofResults, recordOutcomeJourney, validateOutcomeCheckpoint, validateOutcomeRecord } from "./compiler.js";
export type { ArchivedPackMetadata, CandidateOutcomeRecommendation, CompiledPack, CriticalProofEvaluation, CriticalProofObligation, CriticalProofResult, DecisionRationaleContract, EvidenceBackedFact, FirstCustomerSprintContract, FunctionalHardwareModule, FunctionalHardwareModuleId, FunctionalHardwarePrototypeContract, HardwarePrototypeContract, ManufacturingReadinessContract, MechanicalCadReviewContract, OpportunityDiscoveryContract, OutcomeApprovalRecord, OutcomeArtifactRecord, OutcomeCheckpoint, OutcomeDecisionRecord, OutcomeExternalActionRecord, OutcomeJourneyHistory, OutcomePack, OutcomePrerequisite, OutcomeProofRecord, OutcomeProofStatus, OutcomeRecord, OutcomeRepairRecord, PackLane, PackStatus, PluginCapability, RemixContract, ScheduleContract, SkillSource, StudyReadinessContract, Workstream } from "./types.js";

export const stablePackSlugs = [
  "robot-prototype",
  "playable-web-game",
  "web-presentation",
  "software-opportunity-discovery",
  "first-customer-sprint",
  "launch-content-campaign",
  "developer-project-launch",
] as const;

export const outcomePacks = [
  hardwareLaunchPack,
  openSourceReleasePack,
  playableWebGamePack,
  webAppOperationsPack,
  workingWebAppPack,
  productionWebReleasePack,
  marketingOperationsPack,
  kickstarterFundingPack,
  kickstarterFulfillmentPack,
  robotPrototypePack,
  webPresentationPack,
  developerProjectLaunchPack,
  softwareOpportunityDiscoveryPack,
  firstCustomerSprintPack,
  workingHardwarePrototypePack,
  launchContentCampaignPack,
  manufacturingReadinessPack,
  studyReadinessPack,
  mechanicalCadReviewPack,
  functionalHardwarePrototypePack,
] as const;

const stablePackSlugSet = new Set<string>(stablePackSlugs);

export const archivedOutcomePacks = outcomePacks.filter((pack) => pack.archived !== undefined);
export const activeOutcomePacks = outcomePacks.filter((pack) => pack.archived === undefined);
export const stableOutcomePacks = activeOutcomePacks.filter((pack) => stablePackSlugSet.has(pack.slug));
export const experimentalOutcomePacks = activeOutcomePacks.filter((pack) => !stablePackSlugSet.has(pack.slug));

export function getPackStatus(slug: string): PackStatus | undefined {
  const pack = outcomePacks.find((candidate) => candidate.slug === slug);
  if (!pack) return undefined;
  if (pack.archived) return "archived";
  return stablePackSlugSet.has(slug) ? "stable" : "experimental";
}

export function getPack(slug: string) {
  return outcomePacks.find((pack) => pack.slug === slug);
}

export function getActivePack(slug: string) {
  return activeOutcomePacks.find((pack) => pack.slug === slug);
}
