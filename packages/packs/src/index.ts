import { billionDollarSaasPack } from "./billion-dollar-saas.js";
import { hardwareLaunchPack } from "./hardware-launch.js";
import { kickstarterFulfillmentPack } from "./kickstarter-fulfillment.js";
import { kickstarterFundingPack } from "./kickstarter-funding.js";
import { marketingOperationsPack } from "./marketing-operations.js";
import { openSourceReleasePack } from "./open-source-release.js";
import { playableWebGamePack } from "./playable-web-game.js";
import { productionWebReleasePack } from "./production-web-release.js";
import { softwareLaunchPack } from "./software-launch.js";
import { webAppOperationsPack } from "./web-app-operations.js";
import { workingWebAppPack } from "./working-web-app.js";

export { billionDollarSaasPack, hardwareLaunchPack, kickstarterFulfillmentPack, kickstarterFundingPack, marketingOperationsPack, openSourceReleasePack, playableWebGamePack, productionWebReleasePack, softwareLaunchPack, webAppOperationsPack, workingWebAppPack };
export { compileInstallCommands, compilePack, compileRunPrompt } from "./compiler.js";
export type { CompiledPack, OutcomePack, PackLane, PluginCapability, ScheduleContract, SkillSource, Workstream } from "./types.js";

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
] as const;

export function getPack(slug: string) {
  return outcomePacks.find((pack) => pack.slug === slug);
}
