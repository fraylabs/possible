import type { CompiledPack, OutcomePack } from "./types.js";

export function compileInstallCommands(pack: OutcomePack): string[] {
  const groups = new Map<string, string[]>();
  for (const source of pack.skills) {
    const installSource = source.installSource ?? source.repository;
    const skills = groups.get(installSource) ?? [];
    skills.push(source.skill);
    groups.set(installSource, skills);
  }
  return [...groups].map(([repository, skills]) =>
    `npx skills@1.5.19 add ${repository} ${skills.map((skill) => `--skill ${skill}`).join(" ")} --agent codex`,
  );
}

export function compileRunPrompt(pack: OutcomePack): string {
  const artifactRoot = pack.artifactRoot ?? (pack.lane === "operate" ? "operations" : "outcome-room");
  const workstreams = pack.workstreams.map((stream) => [
    `- ${stream.name} (${stream.id})`,
    `  Invoke: ${stream.skills.map((skill) => `$${skill}`).join(", ")}`,
    `  Own: ${stream.owns.join(", ")}`,
    `  Brief: ${stream.brief}`,
  ].join("\n")).join("\n");

  const operateLoop = pack.lane === "operate" ? `

OPERATING LOOP
1. Establish once: record the loop's inputs, cadence, ownership, thresholds, commands, external-action gates, and next review date.
2. Run now: execute the first dated cycle against available evidence and write a collision-free UTC receipt such as ${artifactRoot}/receipts/YYYY-MM-DDTHHMMSSZ.md.
3. Repeat safely: every later cycle must read the prior receipt, record evidence and deltas, carry unresolved work forward, and set the next review date.
4. Never manufacture activity to make the cycle look complete; empty queues, unavailable signals, and skipped checks remain explicit.

SCHEDULE GATE
1. A request to schedule operations selects this recurring outcome, but pack confirmation authorizes only the local workflow and manual first cycle. Do not create, update, or enable a scheduled task yet.
2. After the manual cycle passes, draft a durable standalone task whose prompt invokes $possible resume, reads the confirmed Possible state and latest receipt, runs exactly one cycle, carries unresolved work forward, reports findings, and stops at every external-action gate.
3. Default a Git project to an isolated worktree and report-only behavior. Show the exact task name, cadence, timezone, project, standalone-or-chat destination, local-or-worktree mode, prompt, permissions, expected receipt, and stop conditions.
4. Request direct approval for that exact schedule. Only then use an available scheduled-task capability and record its returned identifier and enabled state in .possible/schedule.json. If scheduling is unavailable on the current surface, return a tested scheduling-ready prompt and an honest no-go receipt instead of claiming the task exists.
5. Scheduled tasks never gain unattended authority for deployments, restarts, production configuration, DNS, paging, communication, spending, publishing, issue-tracker writes, secrets, or customer data.` : "";
  const approvedReleaseAdapter = pack.skills.some((skill) => skill.id === "deploy-to-vercel")
    ? pack.plugins?.some((plugin) => plugin.id === "sites")
      ? " Only after that approval, the captain invokes the selected deployment adapter: $sites-hosting for OpenAI Sites or $deploy-to-vercel for Vercel. Do not give either adapter to a preflight workstream or invoke it before this step."
      : " Only after that approval, invoke $deploy-to-vercel as the captain; do not give it to a preflight workstream or invoke it before this step."
    : "";
  const releaseGate = pack.lane === "release" ? `

RELEASE GATE
1. Establish that a working candidate already exists and identify it by an immutable commit, version, or artifact. Do not silently rebuild the underlying product to make the release appear ready.
2. Workstreams prepare evidence in parallel; the captain sequences any release action only after integrating their preflight, verification, and rollback findings.
3. Record a go or no-go decision. Before any external deploy, tag, publish, push, provider mutation, or production change, request explicit approval for the exact candidate, target, method, and known risks.
4. Execute only the approved action, then run fresh verification against the named result.${approvedReleaseAdapter} If approval, provider support, evidence, or rollback readiness is missing, finish with an honest no-go receipt.` : "";
  const integrationTarget = pack.lane === "operate"
    ? `integrate the durable workflow under ${artifactRoot}/ and use outcome-room/ only as its linked review surface`
    : "integrate them into outcome-room/";

  const action = pack.lane === "operate" ? "Establish and run the first cycle of" : pack.lane === "release" ? "Prepare and verify" : "Build";
  const pluginCheck = pack.plugins?.length
    ? ` Also detect these optional agent plugins: ${pack.plugins.map((plugin) => `${plugin.invocation} (${plugin.skills.map((skill) => `$${skill}`).join(", ")})`).join(", ")}. Do not install or imitate an unavailable plugin; record its absence and use the documented fallback.`
    : "";
  const sitesPath = pack.plugins?.some((plugin) => plugin.id === "sites") ? `

OPENAI SITES MVP PATH
1. If .openai/hosting.json exists, use @sites. Otherwise, when no hosting project is already selected and @sites is available, prefer it for the MVP deployment path so the user does not need a separate Vercel registration.
2. Invoke $sites-building to prepare and validate the exact site. Keep $sites-hosting with the captain; do not delegate hosting mutations to a workstream.
3. Treat every Sites deployment URL as production. Before creating or linking provider state, pushing source, saving a version, deploying, changing access, adding a domain, or changing environment variables, request explicit approval for that exact external action. Possible's approval gate still applies to an owner-only deployment.
4. After approval, deploy only the validated saved version, inspect deployment status, verify the named URL and access mode, and record the project, commit, version, deployment, and rollback version in the receipt.
5. If @sites is unavailable, do not imitate it. Use another reviewed adapter only when it is installed, compatible, and authorized; otherwise finish with a deployment-ready no-go receipt.` : "";

  return `${action} the ${pack.name} outcome for the product described below.

PRODUCT BRIEF
[Replace this line with the product, audience, constraints, and any existing repository or assets.]

OUTCOME
${pack.promise}
Deliver: ${pack.outputs.join(", ")}.

CAPTAIN WORKFLOW
1. Inspect the workspace and this brief. Do not start production until you write a shared outcome-brief.md containing only confirmed facts, audience, promise, constraints, interfaces, and acceptance checks.
2. Confirm these installed skills are visible: ${pack.skills.map((source) => `$${source.skill}`).join(", ")}. If any are missing, stop and identify them; do not silently imitate them.${pluginCheck}
3. Create one subagent for each independent workstream below. Give every subagent outcome-brief.md, explicit ownership, its named skills, and its own completion verifier. Do not create one subagent per skill.
${workstreams}
4. Continue as captain while the workstreams run: protect the shared facts, resolve interface decisions, and prepare the integration shell. Wait for all workstreams, review their receipts, then ${integrationTarget} without erasing unrelated user work.
5. After integration, create a fresh verification subagent. It must invoke ${pack.reviewSkills.map((skill) => `$${skill}`).join(", ")}, inspect the actual integrated outcome, check every promised artifact, and return evidence—not implementation work.
6. Fix material integration failures, rerun the relevant checks, and finish with a concise outcome receipt: created artifacts, verifier commands, passed/failed/skipped checks, known limitations, and every unproven claim.

GUARDRAILS
${pack.guardrails.map((guardrail) => `- ${guardrail}`).join("\n")}

VERIFICATION CONTRACT
${pack.verification.map((item) => `- ${item}`).join("\n")}
${releaseGate}${sitesPath}${operateLoop}

Do not ask me to choose implementation details that can be safely inferred from the brief and repository. Ask only when a missing decision would materially change the product or authorize an external action.`;
}

export function compilePack(pack: OutcomePack): CompiledPack {
  return {
    pack,
    installCommands: compileInstallCommands(pack),
    runPrompt: compileRunPrompt(pack),
  };
}
