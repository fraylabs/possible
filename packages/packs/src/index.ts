import { crowdfundingCampaignReadinessPack } from "./crowdfunding-campaign-readiness.js";
import { crowdfundingFundingRunPack } from "./crowdfunding-funding-run.js";
import { crowdfundingFulfillmentOperationsPack } from "./crowdfunding-fulfillment-operations.js";
import { developerAdoptionReadinessPack } from "./developer-adoption-readiness.js";
import { developerProductReadinessPack } from "./developer-product-readiness.js";
import { developerProjectLaunchPack } from "./developer-project-launch.js";
import { firstCustomerSprintPack } from "./first-customer-sprint.js";
import { functionalHardwarePrototypePack } from "./functional-hardware-prototype.js";
import { hardwareLaunchPack } from "./hardware-launch.js";
import { kickstarterFulfillmentPack } from "./kickstarter-fulfillment.js";
import { kickstarterFundingPack } from "./kickstarter-funding.js";
import { launchContentCampaignPack } from "./launch-content-campaign.js";
import { launchContentPackagePack } from "./launch-content-package.js";
import { manufacturingReadinessPack } from "./manufacturing-readiness.js";
import { marketingOperationsPack } from "./marketing-operations.js";
import { mechanicalCadReviewPack } from "./mechanical-cad-review.js";
import { openSourceReleasePack } from "./open-source-release.js";
import { playableWebGamePack } from "./playable-web-game.js";
import { productionReadinessDecisionPack } from "./production-readiness-decision.js";
import { productionWebReleasePack } from "./production-web-release.js";
import { researchProtocolReadinessPack } from "./research-protocol-readiness.js";
import { robotDigitalPrototypePack } from "./robot-digital-prototype.js";
import { robotPrototypePack } from "./robot-prototype.js";
import { softwareOpportunityDiscoveryPack } from "./software-opportunity-discovery.js";
import { studyReadinessPack } from "./study-readiness.js";
import { webAppOperationsPack } from "./web-app-operations.js";
import { webPresentationPack } from "./web-presentation.js";
import { workingWebAppPack } from "./working-web-app.js";
import { workingHardwarePrototypePack } from "./working-hardware-prototype.js";
import type { PackStatus } from "./types.js";

export { crowdfundingCampaignReadinessPack, crowdfundingFundingRunPack, crowdfundingFulfillmentOperationsPack, developerAdoptionReadinessPack, developerProductReadinessPack, developerProjectLaunchPack, firstCustomerSprintPack, functionalHardwarePrototypePack, hardwareLaunchPack, kickstarterFulfillmentPack, kickstarterFundingPack, launchContentCampaignPack, launchContentPackagePack, manufacturingReadinessPack, marketingOperationsPack, mechanicalCadReviewPack, openSourceReleasePack, playableWebGamePack, productionReadinessDecisionPack, productionWebReleasePack, researchProtocolReadinessPack, robotDigitalPrototypePack, robotPrototypePack, softwareOpportunityDiscoveryPack, studyReadinessPack, webAppOperationsPack, webPresentationPack, workingHardwarePrototypePack, workingWebAppPack };
export { compileInstallCommands, compilePack, compileRunPrompt, compileWorkstreamWaves, evaluateExpectationResults, recordOutcomeJourney, validateExpectationContract, validateOutcomeCheckpoint, validateOutcomeRecord } from "./compiler.js";
export type { ArchivedPackMetadata, CandidateOutcomeRecommendation, CompiledPack, CrowdfundingCampaignReadinessContract, DecisionRationaleContract, EvidenceBackedFact, ExpectationEvaluation, ExpectationLevel, ExpectationResult, ExpectationResultStatus, ExpectationSource, FirstCustomerSprintContract, FunctionalHardwareModule, FunctionalHardwareModuleId, FunctionalHardwarePrototypeContract, HardwarePrototypeContract, LaunchContentModule, LaunchContentModuleId, LaunchContentPackageContract, ManufacturingReadinessContract, MechanicalCadReviewContract, ModularOutcomeContract, ModularOutcomeModule, OpportunityDiscoveryContract, OutcomeApprovalRecord, OutcomeArtifactRecord, OutcomeCheckpoint, OutcomeDecisionRecord, OutcomeExpectation, OutcomeExpectationContract, OutcomeExternalActionRecord, OutcomeJourneyHistory, OutcomePack, OutcomePrerequisite, OutcomeRecord, OutcomeRepairRecord, PackExpectation, PackLane, PackStatus, PluginCapability, RemixContract, ScheduleContract, SkillSource, StudyReadinessContract, Workstream } from "./types.js";

export const stablePackSlugs = [
  "playable-web-game",
  "web-presentation",
  "software-opportunity-discovery",
  "first-customer-sprint",
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
  launchContentPackagePack,
  crowdfundingCampaignReadinessPack,
  developerAdoptionReadinessPack,
  robotDigitalPrototypePack,
  productionReadinessDecisionPack,
  researchProtocolReadinessPack,
  crowdfundingFundingRunPack,
  crowdfundingFulfillmentOperationsPack,
  developerProductReadinessPack,
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
