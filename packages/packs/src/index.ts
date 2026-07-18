import { hardwareLaunchPack } from "./hardware-launch.js";
import { openSourceReleasePack } from "./open-source-release.js";
import { softwareLaunchPack } from "./software-launch.js";

export { hardwareLaunchPack, openSourceReleasePack, softwareLaunchPack };
export { compileInstallCommands, compilePack, compileRunPrompt } from "./compiler.js";
export type { CompiledPack, OutcomePack, SkillSource, Workstream } from "./types.js";

export const outcomePacks = [
  hardwareLaunchPack,
  softwareLaunchPack,
  openSourceReleasePack,
] as const;

export function getPack(slug: string) {
  return outcomePacks.find((pack) => pack.slug === slug);
}
