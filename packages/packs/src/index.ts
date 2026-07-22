import { billionDollarSaasPack } from "./billion-dollar-saas.js";
import { hardwareLaunchPack } from "./hardware-launch.js";
import { kickstarterFulfillmentPack } from "./kickstarter-fulfillment.js";
import { kickstarterFundingPack } from "./kickstarter-funding.js";
import { marketingOperationsPack } from "./marketing-operations.js";
import { openSourceReleasePack } from "./open-source-release.js";
import { playableWebGamePack } from "./playable-web-game.js";
import { productionWebReleasePack } from "./production-web-release.js";
import { robotPrototypePack } from "./robot-prototype.js";
import { softwareLaunchPack } from "./software-launch.js";
import { webAppOperationsPack } from "./web-app-operations.js";
import { webPresentationPack } from "./web-presentation.js";
import { workingWebAppPack } from "./working-web-app.js";

export { billionDollarSaasPack, hardwareLaunchPack, kickstarterFulfillmentPack, kickstarterFundingPack, marketingOperationsPack, openSourceReleasePack, playableWebGamePack, productionWebReleasePack, robotPrototypePack, softwareLaunchPack, webAppOperationsPack, webPresentationPack, workingWebAppPack };
export { compileInstallCommands, compilePack, compileRunPrompt } from "./compiler.js";
export type { CompiledPack, OutcomePack, PackLane, PluginCapability, ScheduleContract, SkillSource, Workstream } from "./types.js";

export const stablePackSlugs = [
  "hardware-launch",
  "robot-prototype",
  "playable-web-game",
  "web-presentation",
] as const;

export const outcomePacks = [
  hardwareLaunchPack,
  softwareLaunchPack,
  openSourceReleasePack,
  playableWebGamePack,
  webAppOperationsPack,
  workingWebAppPack,
  productionWebReleasePack,
  marketingOperationsPack,
  billionDollarSaasPack,
  kickstarterFundingPack,
  kickstarterFulfillmentPack,
  robotPrototypePack,
  webPresentationPack,
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
