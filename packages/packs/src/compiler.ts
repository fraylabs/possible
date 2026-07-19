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

  const operateLoop = pack.lane === "operate" ? `

OPERATING LOOP
1. Establish once: record the loop's inputs, cadence, ownership, thresholds, commands, external-action gates, and next review date.
2. Run now: execute the first dated cycle against available evidence and write a collision-free UTC receipt such as operations/receipts/YYYY-MM-DDTHHMMSSZ.md.
3. Repeat safely: every later cycle must read the prior receipt, record evidence and deltas, carry unresolved work forward, and set the next review date.
4. Never manufacture activity to make the cycle look complete; empty queues, unavailable signals, and skipped checks remain explicit.` : "";
  const approvedReleaseAdapter = pack.skills.some((skill) => skill.id === "deploy-to-vercel")
    ? " Only after that approval, invoke $deploy-to-vercel as the captain; do not give it to a preflight workstream or invoke it before this step."
    : "";
  const releaseGate = pack.lane === "release" ? `

RELEASE GATE
1. Establish that a working candidate already exists and identify it by an immutable commit, version, or artifact. Do not silently rebuild the underlying product to make the release appear ready.
2. Workstreams prepare evidence in parallel; the captain sequences any release action only after integrating their preflight, verification, and rollback findings.
3. Record a go or no-go decision. Before any external deploy, tag, publish, push, provider mutation, or production change, request explicit approval for the exact candidate, target, method, and known risks.
4. Execute only the approved action, then run fresh verification against the named result.${approvedReleaseAdapter} If approval, provider support, evidence, or rollback readiness is missing, finish with an honest no-go receipt.` : "";
  const integrationTarget = pack.lane === "operate"
    ? "integrate the durable workflow under operations/ and use outcome-room/ only as its linked review surface"
    : "integrate them into outcome-room/";

  const action = pack.lane === "operate" ? "Establish and run the first cycle of" : pack.lane === "release" ? "Prepare and verify" : "Build";

  return `${action} the ${pack.name} outcome for the product described below.

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
4. Continue as captain while the workstreams run: protect the shared facts, resolve interface decisions, and prepare the integration shell. Wait for all workstreams, review their receipts, then ${integrationTarget} without erasing unrelated user work.
5. After integration, create a fresh verification subagent. It must invoke ${pack.reviewSkills.map((skill) => `$${skill}`).join(", ")}, inspect the actual integrated outcome, check every promised artifact, and return evidence—not implementation work.
6. Fix material integration failures, rerun the relevant checks, and finish with a concise outcome receipt: created artifacts, verifier commands, passed/failed/skipped checks, known limitations, and every unproven claim.

GUARDRAILS
${pack.guardrails.map((guardrail) => `- ${guardrail}`).join("\n")}

VERIFICATION CONTRACT
${pack.verification.map((item) => `- ${item}`).join("\n")}
${releaseGate}${operateLoop}

Do not ask me to choose implementation details that can be safely inferred from the brief and repository. Ask only when a missing decision would materially change the product or authorize an external action.`;
}

export function compilePack(pack: OutcomePack): CompiledPack {
  return {
    pack,
    installCommands: compileInstallCommands(pack),
    runPrompt: compileRunPrompt(pack),
  };
}
