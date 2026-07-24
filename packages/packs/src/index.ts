import { developerProjectLaunchPack } from "./developer-project-launch.js";
import { firstCustomerSprintPack } from "./first-customer-sprint.js";
import { hardwareLaunchPack } from "./hardware-launch.js";
import { kickstarterFulfillmentPack } from "./kickstarter-fulfillment.js";
import { kickstarterFundingPack } from "./kickstarter-funding.js";
import { launchContentCampaignPack } from "./launch-content-campaign.js";
import { marketingOperationsPack } from "./marketing-operations.js";
import { openSourceReleasePack } from "./open-source-release.js";
import { playableWebGamePack } from "./playable-web-game.js";
import { productionWebReleasePack } from "./production-web-release.js";
import { robotPrototypePack } from "./robot-prototype.js";
import { softwareOpportunityDiscoveryPack } from "./software-opportunity-discovery.js";
import { webAppOperationsPack } from "./web-app-operations.js";
import { webPresentationPack } from "./web-presentation.js";
import { workingWebAppPack } from "./working-web-app.js";
import { workingHardwarePrototypePack } from "./working-hardware-prototype.js";

export { developerProjectLaunchPack, firstCustomerSprintPack, hardwareLaunchPack, kickstarterFulfillmentPack, kickstarterFundingPack, launchContentCampaignPack, marketingOperationsPack, openSourceReleasePack, playableWebGamePack, productionWebReleasePack, robotPrototypePack, softwareOpportunityDiscoveryPack, webAppOperationsPack, webPresentationPack, workingHardwarePrototypePack, workingWebAppPack };
export { compileInstallCommands, compilePack, compileRunPrompt, compileWorkstreamWaves, recordOutcomeJourney, validateOutcomeCheckpoint, validateOutcomeRecord } from "./compiler.js";
export type { CandidateOutcomeRecommendation, CompiledPack, DecisionRationaleContract, EvidenceBackedFact, FirstCustomerSprintContract, HardwarePrototypeContract, OpportunityDiscoveryContract, OutcomeApprovalRecord, OutcomeArtifactRecord, OutcomeCheckpoint, OutcomeDecisionRecord, OutcomeExternalActionRecord, OutcomeJourneyHistory, OutcomePack, OutcomePrerequisite, OutcomeProofRecord, OutcomeProofStatus, OutcomeRecord, OutcomeRepairRecord, PackLane, PluginCapability, RemixContract, ScheduleContract, SkillSource, Workstream } from "./types.js";

export const stablePackSlugs = [
  "hardware-launch",
  "robot-prototype",
  "playable-web-game",
  "web-presentation",
  "software-opportunity-discovery",
  "first-customer-sprint",
  "working-hardware-prototype",
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
] as const;

const stablePackSlugSet = new Set<string>(stablePackSlugs);

export const stableOutcomePacks = outcomePacks.filter((pack) => stablePackSlugSet.has(pack.slug));
export const experimentalOutcomePacks = outcomePacks.filter((pack) => !stablePackSlugSet.has(pack.slug));

export function getPackStatus(slug: string): "stable" | "experimental" | undefined {
  if (!outcomePacks.some((pack) => pack.slug === slug)) return undefined;
  return stablePackSlugSet.has(slug) ? "stable" : "experimental";
}

export function getPack(slug: string) {
  return outcomePacks.find((pack) => pack.slug === slug);
}
