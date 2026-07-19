import { hardwareLaunchPack } from "./hardware-launch.js";
import { openSourceReleasePack } from "./open-source-release.js";
import { playableWebGamePack } from "./playable-web-game.js";
import { softwareLaunchPack } from "./software-launch.js";

export { hardwareLaunchPack, openSourceReleasePack, playableWebGamePack, softwareLaunchPack };
export { compileInstallCommands, compilePack, compileRunPrompt } from "./compiler.js";
export type { CompiledPack, OutcomePack, PackLane, SkillSource, Workstream } from "./types.js";

export const outcomePacks = [
  hardwareLaunchPack,
  softwareLaunchPack,
  openSourceReleasePack,
  playableWebGamePack,
] as const;

export function getPack(slug: string) {
  return outcomePacks.find((pack) => pack.slug === slug);
}
