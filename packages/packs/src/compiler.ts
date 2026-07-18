import type { CompiledPack, OutcomePack } from "./types.js";

export function compileInstallCommands(pack: OutcomePack): string[] {
  const groups = new Map<string, string[]>();
  for (const source of pack.skills) {
    const skills = groups.get(source.repository) ?? [];
    skills.push(source.skill);
    groups.set(source.repository, skills);
  }
  return [...groups].map(([repository, skills]) =>
    `npx skills@1.5.19 add ${repository} ${skills.map((skill) => `--skill ${skill}`).join(" ")} --agent codex`,
  );
}

export function compileRunPrompt(pack: OutcomePack): string {
  const workstreams = pack.workstreams.map((stream) => [
    `- ${stream.name} (${stream.id})`,
    `  Invoke: ${stream.skills.map((skill) => `$${skill}`).join(", ")}`,
    `  Own: ${stream.owns.join(", ")}`,
    `  Brief: ${stream.brief}`,
  ].join("\n")).join("\n");

  return `Build the ${pack.name} outcome for the product described below.

PRODUCT BRIEF
[Replace this line with the product, audience, constraints, and any existing repository or assets.]

OUTCOME
${pack.promise}
Deliver: ${pack.outputs.join(", ")}.

CAPTAIN WORKFLOW
1. Inspect the workspace and this brief. Do not start production until you write a shared outcome-brief.md containing only confirmed facts, audience, promise, constraints, interfaces, and acceptance checks.
2. Confirm these installed skills are visible: ${pack.skills.map((source) => `$${source.skill}`).join(", ")}. If any are missing, stop and identify them; do not silently imitate them.
3. Create one subagent for each independent workstream below. Give every subagent outcome-brief.md, explicit ownership, its named skills, and its own completion verifier. Do not create one subagent per skill.
${workstreams}
4. Continue as captain while the workstreams run: protect the shared facts, resolve interface decisions, and prepare the integration shell. Wait for all workstreams, review their receipts, then integrate them into outcome-room/ without erasing unrelated user work.
5. After integration, create a fresh verification subagent. It must invoke ${pack.reviewSkills.map((skill) => `$${skill}`).join(", ")}, inspect the actual integrated outcome, check every promised artifact, and return evidence—not implementation work.
6. Fix material integration failures, rerun the relevant checks, and finish with a concise outcome receipt: created artifacts, verifier commands, passed/failed/skipped checks, known limitations, and every unproven claim.

GUARDRAILS
${pack.guardrails.map((guardrail) => `- ${guardrail}`).join("\n")}

VERIFICATION CONTRACT
${pack.verification.map((item) => `- ${item}`).join("\n")}

Do not ask me to choose implementation details that can be safely inferred from the brief and repository. Ask only when a missing decision would materially change the product or authorize an external action.`;
}

export function compilePack(pack: OutcomePack): CompiledPack {
  return {
    pack,
    installCommands: compileInstallCommands(pack),
    runPrompt: compileRunPrompt(pack),
  };
}
