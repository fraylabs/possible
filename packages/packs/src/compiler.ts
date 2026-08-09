import type { CompiledPack, OutcomePack, SkillReference } from "./types.js";

export function skillNameFromReference(skill: SkillReference): string {
  if (skill.directory === ".") return skill.repository.split("/").at(-1) ?? skill.repository;
  return skill.directory.split("/").at(-1) ?? skill.directory;
}

export function skillSourceUrl(skill: SkillReference): string {
  const root = `https://github.com/${skill.repository}/tree/${skill.lastReviewedCommit}`;
  return skill.directory === "." ? root : `${root}/${skill.directory}`;
}

export function skillInstallSource(skill: SkillReference): string {
  return skill.directory === "." ? skill.repository : `${skill.repository}/${skill.directory}`;
}

export function skillPageUrl(skill: SkillReference): string {
  return `https://skills.sh/${skill.repository}/${skillNameFromReference(skill)}`;
}

export function compileInstallCommands(pack: OutcomePack): string[] {
  return (pack.skills ?? []).map((skill) => `npx skills@1.5.22 add ${skillInstallSource(skill)} --agent codex`);
}

export function compileRunPrompt(pack: OutcomePack): string {
  const skills = pack.skills ?? [];
  const skillsSection = skills.length > 0
    ? `\n\nSKILLS\n${skills.map((skill) => `- $${skillNameFromReference(skill)}`).join("\n")}`
    : "";
  return `${pack.prompt.trim()}${skillsSection}

EXPECTATIONS
${pack.expectations.map((expectation) => `- [ ] ${expectation}`).join("\n")}

Before finishing, check each expectation using the cheapest reliable method available. Repair material failures. Do not create extra verification artifacts unless an expectation, the risk, or the user explicitly requires them. Report anything unmet or unverified instead of claiming the outcome is complete.`;
}

export function compilePack(pack: OutcomePack): CompiledPack {
  return { pack, installCommands: compileInstallCommands(pack), runPrompt: compileRunPrompt(pack) };
}
