import type {
  CompiledPack,
  CriticalProofEvaluation,
  CriticalProofObligation,
  CriticalProofResult,
  OutcomeCheckpoint,
  OutcomeJourneyHistory,
  OutcomePack,
  OutcomeRecord,
  Workstream,
} from "./types.js";

const safeRelativePath = (value: string) => !/^(?:\/|[A-Za-z]:)|(?:^|\/)\.\.(?:\/|$)|[*?]/.test(value);

function requireSafeRelativePath(value: string, label: string): void {
  if (!value || !safeRelativePath(value)) throw new Error(`${label} must be a safe repository-relative path`);
}

function requireEvidencePaths(paths: string[], label: string): void {
  for (const path of paths) requireSafeRelativePath(path, label);
}

function validateConditionalProofModules(
  pack: OutcomePack,
  label: string,
  modules: Array<{ id: string; activationWhen: string; requiredProofIds: string[] }>,
): void {
  if (!pack.criticalProofs?.length) throw new Error(`${pack.slug} ${label} requires critical proofs`);
  const moduleIds = new Set<string>();
  const proofById = new Map(pack.criticalProofs.map((proof) => [proof.id, proof]));
  for (const module of modules) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(module.id)) throw new Error(`${pack.slug}/${module.id} module id must be a safe identifier`);
    if (moduleIds.has(module.id)) throw new Error(`${pack.slug} contains duplicate ${label} module ${module.id}`);
    moduleIds.add(module.id);
    if (!module.activationWhen.trim()) throw new Error(`${pack.slug}/${module.id} module activationWhen must be non-empty`);
    if (module.requiredProofIds.length === 0) throw new Error(`${pack.slug}/${module.id} module requires critical proofs`);
    for (const proofId of module.requiredProofIds) {
      const proof = proofById.get(proofId);
      if (!proof) throw new Error(`${pack.slug}/${module.id} references missing critical proof ${proofId}`);
      if (proof.moduleId !== module.id) {
        throw new Error(`${pack.slug}/${module.id} critical proof ${proofId} must declare the same moduleId`);
      }
    }
  }
  for (const proof of pack.criticalProofs) {
    if (!proof.moduleId) continue;
    const module = modules.find(({ id }) => id === proof.moduleId);
    if (!module) throw new Error(`${pack.slug}/${proof.id} references missing ${label} module ${proof.moduleId}`);
    if (!module.requiredProofIds.includes(proof.id)) {
      throw new Error(`${pack.slug}/${module.id} must list conditional critical proof ${proof.id}`);
    }
  }
}

export function evaluateCriticalProofResults(
  obligations: CriticalProofObligation[],
  results: CriticalProofResult[],
  activeModuleIds: string[] = [],
): CriticalProofEvaluation {
  const obligationIds = new Set(obligations.map(({ id }) => id));
  if (obligationIds.size !== obligations.length) throw new Error("Critical proof obligations require unique ids");
  const knownModuleIds = new Set(obligations.flatMap(({ moduleId }) => moduleId ? [moduleId] : []));
  const activeModules = new Set(activeModuleIds);
  if (activeModules.size !== activeModuleIds.length) throw new Error("Active critical proof modules require unique ids");
  for (const moduleId of activeModules) {
    if (!knownModuleIds.has(moduleId)) throw new Error(`Unknown active critical proof module ${moduleId}`);
  }
  const resultsById = new Map<string, CriticalProofResult>();
  for (const result of results) {
    if (!obligationIds.has(result.obligationId)) {
      throw new Error(`Unknown critical proof obligation ${result.obligationId}`);
    }
    if (resultsById.has(result.obligationId)) {
      throw new Error(`Duplicate critical proof result ${result.obligationId}`);
    }
    if (!["passed", "failed", "skipped", "unproven"].includes(result.status)) {
      throw new Error(`Critical proof ${result.obligationId} has an invalid status`);
    }
    requireEvidencePaths(result.evidence, `Critical proof ${result.obligationId} evidence`);
    if (result.status === "passed" && result.evidence.length === 0) {
      throw new Error(`Critical proof ${result.obligationId} cannot pass without direct evidence`);
    }
    resultsById.set(result.obligationId, result);
  }
  const requiredObligations = obligations.filter(({ moduleId }) => moduleId === undefined || activeModules.has(moduleId));
  if (requiredObligations.some(({ id }) => resultsById.get(id)?.status === "failed")) return "failed";
  if (requiredObligations.some(({ id }) => resultsById.get(id)?.status !== "passed")) return "unproven";
  return "passed";
}

export function compileWorkstreamWaves(pack: OutcomePack): Workstream[][] {
  const byId = new Map(pack.workstreams.map((stream) => [stream.id, stream]));
  if (byId.size !== pack.workstreams.length) throw new Error(`${pack.slug} contains duplicate workstream ids`);
  for (const stream of pack.workstreams) {
    if (stream.activation !== undefined && !stream.activation.trim()) {
      throw new Error(`${pack.slug}/${stream.id} activation must be non-empty`);
    }
    for (const dependency of stream.dependsOn ?? []) {
      if (!byId.has(dependency)) throw new Error(`${pack.slug}/${stream.id} depends on missing workstream ${dependency}`);
      if (dependency === stream.id) throw new Error(`${pack.slug}/${stream.id} cannot depend on itself`);
    }
  }

  const remaining = new Set(byId.keys());
  const complete = new Set<string>();
  const waves: Workstream[][] = [];
  while (remaining.size > 0) {
    const wave = [...remaining]
      .map((id) => byId.get(id)!)
      .filter((stream) => (stream.dependsOn ?? []).every((dependency) => complete.has(dependency)));
    if (wave.length === 0) throw new Error(`${pack.slug} contains a workstream dependency cycle`);
    waves.push(wave);
    for (const stream of wave) {
      remaining.delete(stream.id);
      complete.add(stream.id);
    }
  }
  return waves;
}

export function compileInstallCommands(pack: OutcomePack): string[] {
  const groups = new Map<string, string[]>();
  for (const source of pack.skills) {
    const installSource = source.installSource ?? `${source.repository}@${source.reviewedRevision}`;
    if (!installSource.endsWith(`@${source.reviewedRevision}`)) {
      throw new Error(`${source.id} must install the exact reviewed revision ${source.reviewedRevision}`);
    }
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
  const waves = compileWorkstreamWaves(pack);
  const workstreams = pack.workstreams.map((stream) => [
    `- ${stream.name} (${stream.id})`,
    `  Invoke: ${stream.skills.map((skill) => `$${skill}`).join(", ")}`,
    `  Own: ${stream.owns.join(", ")}`,
    `  Depends on: ${stream.dependsOn?.join(", ") || "none"}`,
    `  Activation: ${stream.activation ?? "always"}`,
    `  Brief: ${stream.brief}`,
  ].join("\n")).join("\n");
  const workstreamSequence = waves.map((wave, index) => `- Wave ${index + 1}: ${wave.map((stream) => stream.id).join(", ")}`).join("\n");

  const operateLoop = pack.lane === "operate" ? `

OPERATING LOOP
1. Establish once: record the loop's inputs, cadence, ownership, thresholds, commands, external-action gates, and next review date.
2. Run now: execute the first dated cycle against available evidence and write a collision-free UTC completion report such as ${artifactRoot}/receipts/YYYY-MM-DDTHHMMSSZ.md.
3. Repeat safely: every later cycle must read the prior completion report, record evidence and deltas, carry unresolved work forward, and set the next review date.
4. Never manufacture activity to make the cycle look complete; empty queues, unavailable signals, and skipped checks remain explicit.

SCHEDULE GATE
1. A request to schedule operations selects this recurring outcome, but pack confirmation authorizes only the local workflow and manual first cycle. Do not create, update, or enable a scheduled task yet.
2. After the manual cycle passes, draft a durable standalone task whose prompt invokes $possible resume, reads the confirmed Possible state and latest completion report, runs exactly one cycle, carries unresolved work forward, reports findings, and stops at every external-action gate.
3. Default a Git project to an isolated worktree and report-only behavior. Show the exact task name, cadence, timezone, project, standalone-or-chat destination, local-or-worktree mode, prompt, permissions, expected completion report, and stop conditions.
4. Request direct approval for that exact schedule. Only then use an available scheduled-task capability and record its returned identifier and enabled state in .possible/schedule.json. If scheduling is unavailable on the current surface, return a tested scheduling-ready prompt and a completion report with a no-go status instead of claiming the task exists.
5. Scheduled tasks never gain unattended authority for deployments, restarts, production configuration, DNS, paging, communication, spending, publishing, issue-tracker writes, secrets, or customer data.` : "";
  const approvedReleaseAdapter = pack.skills.some((skill) => skill.id === "deploy-to-vercel")
    ? pack.plugins?.some((plugin) => plugin.id === "sites")
      ? " Only after that approval, the lead agent invokes the selected deployment adapter: $sites-hosting for OpenAI Sites or $deploy-to-vercel for Vercel. Do not give either adapter to a preflight workstream or invoke it before this step."
      : " Only after that approval, invoke $deploy-to-vercel as the lead agent; do not give it to a preflight workstream or invoke it before this step."
    : "";
  const releaseGate = pack.lane === "release" ? `

RELEASE GATE
1. Establish that a working candidate already exists and identify it by an immutable commit, version, or artifact. Do not silently rebuild the underlying product to make the release appear ready.
2. Workstreams prepare evidence in parallel; the lead agent sequences any release action only after integrating their preflight, verification, and rollback findings.
3. Record a go or no-go decision. Before any external deploy, tag, publish, push, provider mutation, or production change, request explicit approval for the exact candidate, target, method, and known risks.
4. Execute only the approved action, then run fresh verification against the named result.${approvedReleaseAdapter} If approval, provider support, evidence, or rollback readiness is missing, finish with a completion report that clearly records the no-go status.` : "";
  const launchGate = pack.lane === "launch" && !pack.crowdfundingCampaignReadiness ? `

LAUNCH GATE
1. Pack confirmation authorizes local preparation only. Treat deployment, publishing, pushing, tagging, release creation, DNS or domain changes, analytics, outreach, data collection, spending, and provider mutations as separate external actions.
2. After integrating and verifying the local candidate, record a go or no-go decision. Before any external action, request explicit approval naming the exact candidate and immutable source, account or target, method, risks, and rollback.
3. Execute only the approved action and verify the named public result with fresh evidence. Missing approval, provider access, immutable identifiers, public evidence, or rollback readiness must finish as prepared or no-go—never launched.` : "";
  const integrationTarget = pack.lane === "operate"
    ? `integrate the durable workflow under ${artifactRoot}/ and use outcome-room/ only as its linked review surface`
    : "integrate them into outcome-room/";
  const prerequisites = pack.prerequisites?.length ? `

OUTCOME PREREQUISITES
${pack.prerequisites.map((requirement) => `- ${requirement.id}: ${requirement.description} Evidence required: ${requirement.requiredEvidence.join(", ")}.`).join("\n")}

Verify these prerequisites against the current repository before starting. If material evidence is missing, stop this outcome and explain the gap. Do not silently compile or execute another Outcome Pack to fill it; any alternative outcome is only a recommendation requiring fresh approval.` : "";
  const opportunityDiscovery = pack.opportunityDiscovery ? (() => {
    const contract = pack.opportunityDiscovery;
    if (contract.candidateRange[0] !== 3 || contract.candidateRange[1] !== 5) {
      throw new Error(`${pack.slug} opportunity discovery must compare three to five candidates`);
    }
    if (contract.decisions.join(",") !== "select,broaden,stop") {
      throw new Error(`${pack.slug} opportunity discovery decisions must be select, broaden, stop`);
    }
    requireSafeRelativePath(contract.opportunityBriefPath, `${pack.slug} opportunity discovery opportunityBriefPath`);
    requireSafeRelativePath(contract.decisionReceiptPath, `${pack.slug} opportunity discovery decisionReceiptPath`);
    return `

OPPORTUNITY DISCOVERY GATE
1. Infer the operator baseline from demonstrated repository assets and confirmed context. When personal evidence is absent, use a disclosed conservative baseline—solo technical builder, Codex available, no privileged data, no established audience, and no assumed budget—instead of blocking or inventing advantages.
2. For each candidate, infer the capabilities, access, capital, operating burden, and distribution advantage it requires. Record what agents can cover, what the operator demonstrates, and the remaining execution gap.
3. Compare exactly three to five traceable opportunities using the same disclosed rubric. Public complaints establish occurrence, not prevalence or demand; competitor prices establish category anchors, not willingness to pay.
4. Write ${contract.opportunityBriefPath} for one selected provisional opportunity, or explain why the search must broaden or stop. Include the intended user, painful job, alternatives, offer hypothesis, delivery options, first boundary, value exchange, business-model hypothesis, distribution path, operator-gap plan, assumptions, non-goals, and the smallest credible first-customer approach.
5. Write ${contract.decisionReceiptPath} with exactly one discovery decision: select, broaden, or stop. A selected opportunity is ready for a first-customer attempt; it is not evidence of demand, permission to build, or approval for external actions.`;
  })() : "";

  const firstCustomerSprint = pack.firstCustomerSprint ? (() => {
    const contract = pack.firstCustomerSprint;
    const evidenceLadder = "reply,conversation,qualified problem,demo requested,pilot agreed,payment attempted,payment received,repeat use";
    if (contract.evidenceLadder.join(",") !== evidenceLadder) {
      throw new Error(`${pack.slug} first customer evidence ladder is invalid`);
    }
    if (contract.decisions.join(",") !== "continue,revise,stop") {
      throw new Error(`${pack.slug} first customer decisions must be continue, revise, stop`);
    }
    if (!pack.workstreams.some((stream) => stream.activation)) {
      throw new Error(`${pack.slug} first customer sprint requires at least one conditional workstream`);
    }
    requireSafeRelativePath(contract.statePath, `${pack.slug} first customer sprint statePath`);
    requireSafeRelativePath(contract.cycleRoot, `${pack.slug} first customer sprint cycleRoot`);
    requireSafeRelativePath(contract.decisionReceiptPath, `${pack.slug} first customer sprint decisionReceiptPath`);
    if (contract.resumeCommand !== "$possible resume") throw new Error(`${pack.slug} first customer sprint resumeCommand must be $possible resume`);
    if (contract.waitingStates.join(",") !== "awaiting-approval,awaiting-participants,awaiting-observation") {
      throw new Error(`${pack.slug} first customer sprint waiting states are invalid`);
    }
    return `

FIRST CUSTOMER SPRINT
1. Try to sell one specific outcome to one reachable customer segment. Use this evidence ladder from weakest to strongest: ${contract.evidenceLadder.join(" → ")}. Pursue the strongest ethical evidence presently available; never upgrade a lower rung into a higher one.
2. Define the segment, painful job, current alternative, offer, price or commitment ask, credible delivery boundary, reachable channel, funnel threshold, timebox, and stop condition before preparing sales activity. Verify that real prospects and the approved channel are actually accessible; synthetic personas and fixtures may test mechanics but never count as customers or commercial evidence.
3. Build only the local assets needed for the next sale: a concise offer, proof or demo, objection answers, call guide, and delivery plan. Do not build the full product merely to avoid asking for commitment. Let customer evidence determine whether the next outcome should be a prototype, integration, service, app, launch, revision, or stop.
4. Before outreach, recruitment, interviews, calls, surveys, fake doors, deployments, analytics collection, authenticated data access, purchases, advertising, payment collection, or scheduled follow-up, show the exact target, channel, message or task, data boundary, cadence, duration, budget, stop conditions, and expected evidence. Request approval for that exact external action.
5. Preserve durable state in ${contract.statePath} and one immutable dated record per cycle under ${contract.cycleRoot}. Record the prospect denominator, qualifications, replies, refusals, conversations, objections, commitments, payments, repeat use, exclusions, timing, limitations, and next permitted action.
6. Scheduling is coordination, not commercial evidence. Create or enable a reminder only after approval for the exact schedule. Its standalone prompt must invoke ${contract.resumeCommand}, read ${contract.statePath}, perform one bounded follow-up cycle, preserve refusals and missing responses, stop at every new external-action boundary, and write the next dated cycle record. If scheduling is unavailable, provide the same tested resume prompt and next review date without claiming a task exists.
7. When evidence is not yet due, stop cleanly in exactly one waiting state: ${contract.waitingStates.join(", ")}. Do not fill waiting time with speculative implementation, contact more people than approved, or convert silence into rejection.
8. Every resume must re-check consent, authorization, elapsed time, denominators, drop-off, selection bias, message or offer drift, and whether the threshold or stop condition is reached. Never overwrite prior observations.
9. Write ${contract.decisionReceiptPath} with exactly one decision: continue, revise, or stop. State the highest evidence rung reached, money requested and collected, what customers actually did, the next product or sales boundary, unresolved risks, and what would reverse the decision. This receipt records commercial proof; it does not claim product-market fit or authorize another Outcome Pack.`;
  })() : "";

  const conditionalModuleContracts = [
    pack.functionalHardwarePrototype ? { label: "functional hardware", modules: pack.functionalHardwarePrototype.modules } : undefined,
    pack.launchContentPackage ? { label: "launch content", modules: pack.launchContentPackage.modules } : undefined,
    pack.modularOutcome ? { label: pack.modularOutcome.gateName.toLowerCase(), modules: pack.modularOutcome.modules } : undefined,
  ].filter((value): value is NonNullable<typeof value> => Boolean(value));
  if (conditionalModuleContracts.length > 1) throw new Error(`${pack.slug} cannot define multiple conditional module contracts`);
  const conditionalModuleContract = conditionalModuleContracts[0];

  const criticalProofs = pack.criticalProofs?.length ? (() => {
    const ids = new Set<string>();
    for (const proof of pack.criticalProofs ?? []) {
      if (!/^[a-z0-9][a-z0-9-]*$/.test(proof.id)) {
        throw new Error(`${pack.slug} critical proof id ${proof.id} must be a safe identifier`);
      }
      if (ids.has(proof.id)) throw new Error(`${pack.slug} contains duplicate critical proof id ${proof.id}`);
      ids.add(proof.id);
      if (!proof.claim.trim()) throw new Error(`${pack.slug}/${proof.id} critical proof claim must be non-empty`);
      if (proof.moduleId !== undefined && !conditionalModuleContract) {
        throw new Error(`${pack.slug}/${proof.id} conditional critical proofs require a conditional module contract`);
      }
      if (proof.moduleId !== undefined && !/^[a-z0-9][a-z0-9-]*$/.test(proof.moduleId)) {
        throw new Error(`${pack.slug}/${proof.id} critical proof moduleId must be a safe identifier`);
      }
      if (proof.failureModes.length === 0 || proof.failureModes.some((item) => !item.trim())) {
        throw new Error(`${pack.slug}/${proof.id} requires named failure modes`);
      }
      if (proof.requiredEvidence.length === 0 || proof.requiredEvidence.some((item) => !item.trim())) {
        throw new Error(`${pack.slug}/${proof.id} requires direct evidence types`);
      }
    }
    return `

CRITICAL PROOF CONTRACT
These claims decide completion. Record each id in the outcome record's proofs as obligationId, use the exact claim, and preserve direct evidence.
${(pack.criticalProofs ?? []).map((proof) => [
  `- ${proof.id}: ${proof.claim}`,
  proof.moduleId ? `  Applies when module: ${proof.moduleId}` : "  Applies: always",
  `  Challenge: ${proof.failureModes.join(", ")}`,
  `  Evidence: ${proof.requiredEvidence.join(", ")}`,
].join("\n")).join("\n")}

${conditionalModuleContract
  ? "A passed outcome requires every always-applicable proof and every proof for an active module to pass. Record the active module ids in the outcome record as activeModules. One failed applicable proof makes the outcome failed or repair-required; one skipped, missing, or unproven applicable proof prevents a passing status. An inactive module adds no implementation or proof work beyond recording why it is inactive."
  : "A passed outcome requires every critical proof to pass. One failed proof makes the outcome failed or repair-required; one skipped, missing, or unproven proof prevents a passing status."}
File existence and hashes are supporting evidence only; they cannot by themselves prove a critical claim. The reviewer must try to falsify each claim rather than restate the implementation.`;
  })() : "";

  const functionalHardwarePrototype = pack.functionalHardwarePrototype ? (() => {
    const contract = pack.functionalHardwarePrototype;
    if (contract.decisions.join(",") !== "working,repair-required,no-go") {
      throw new Error(`${pack.slug} functional hardware decisions must be working, repair-required, no-go`);
    }
    for (const [label, value] of [
      ["contractPath", contract.contractPath],
      ["moduleDecisionPath", contract.moduleDecisionPath],
      ["buildRoot", contract.buildRoot],
      ["measurementPath", contract.measurementPath],
      ["safetyRevisionPath", contract.safetyRevisionPath],
      ["decisionReceiptPath", contract.decisionReceiptPath],
    ] as const) requireSafeRelativePath(value, `${pack.slug} functional hardware ${label}`);
    const workstreamIds = new Set(pack.workstreams.map(({ id }) => id));
    if (workstreamIds.size > 3) throw new Error(`${pack.slug} functional hardware prototype must use no more than three core workstreams`);
    validateConditionalProofModules(pack, "functional hardware", contract.modules);
    for (const module of contract.modules) {
      if (module.earlyHardStops.length === 0 || module.earlyHardStops.some((item) => !item.trim())) {
        throw new Error(`${pack.slug}/${module.id} module requires early hard stops`);
      }
      if (module.revisionChecks.length === 0 || module.revisionChecks.some((item) => !item.trim())) {
        throw new Error(`${pack.slug}/${module.id} module requires revision checks`);
      }
    }
    return `

FUNCTIONAL HARDWARE PROTOTYPE GATE
1. Keep ${contract.contractPath} short: name one primary physical function, the authentic integrated artifact, operating boundary, inputs and outputs, measurable passing threshold, intentionally failing condition, available tools and parts, external-action gates, and claims that completion will not establish. Do not add positioning, copywriting, launch assets, style directions, customer research, or production planning.
2. Write ${contract.moduleDecisionPath} before implementation. Infer every module from the actual architecture and intended exposure; do not ask the user to choose engineering categories. Record each module as active or inactive with direct design evidence. Activate only what is present—not what might appear in a future version—and record active ids in the outcome record as activeModules.
3. Build the simplest credible integrated artifact under ${contract.buildRoot}. Use only the mechanics, electronics, firmware, controls, fixtures, and instrumentation required by the contract and active modules. A passive artifact activates no electronics work. Prefer a current-limited bench supply before adding a battery when stored energy is not part of the function.
4. Purchasing, external fabrication or assembly, energized work, battery charging, actuator connection, mains or high-energy work, and human or animal exposure each require separate approval for the exact revision, procedure, operator, environment, limits, stop conditions, and cost. Apply each active module's early hard stops before its hazardous action; missing authority, parts, tools, or qualified supervision produces no-go rather than simulated proof.
5. Preserve instruments, fixtures, calibration or reference checks, raw samples, units, uncertainty, environment, revisions, failures, and thresholds in ${contract.measurementPath}. Test the authentic integrated artifact under nominal, boundary, and intentionally failing conditions. Measure only what decides the primary function and active-module proofs.
6. After the first coherent artifact exists, perform a concrete safety and misuse revision at ${contract.safetyRevisionPath}. Apply only the active modules' revision checks, repair material findings, and rerun affected functional and failure tests. Safety is a design revision around real geometry and behavior, not a universal pre-design dossier; early hard stops still precede hazardous exposure.
7. Write ${contract.decisionReceiptPath} with exactly one status: working, repair-required, or no-go. Working means only that the named immutable artifact passed its primary-function contract and all applicable critical proofs. It never means safe for sale, suitable for unsupervised use, clinically effective, certified, manufacturable, demanded, or production-ready.

CONDITIONAL MODULES
${contract.modules.map((module) => [
  `- ${module.id}`,
  `  Activate when: ${module.activationWhen}`,
  `  Early hard stops: ${module.earlyHardStops.join("; ")}`,
  `  Revision checks: ${module.revisionChecks.join("; ")}`,
  `  Required proofs: ${module.requiredProofIds.join(", ")}`,
].join("\n")).join("\n")}`;
  })() : "";

  const modularOutcome = pack.modularOutcome ? (() => {
    const contract = pack.modularOutcome;
    if (!contract.gateName.trim() || !contract.action.trim() || !contract.completionBoundary.trim()) {
      throw new Error(`${pack.slug} modular outcome requires a gate name, action, and completion boundary`);
    }
    for (const [label, value] of [
      ["contractPath", contract.contractPath],
      ["moduleDecisionPath", contract.moduleDecisionPath],
      ["artifactRoot", contract.artifactRoot],
      ["decisionReceiptPath", contract.decisionReceiptPath],
    ] as const) requireSafeRelativePath(value, `${pack.slug} modular outcome ${label}`);
    if (pack.workstreams.length > 3) throw new Error(`${pack.slug} modular outcome must use no more than three core workstreams`);
    if (pack.remix) throw new Error(`${pack.slug} modular outcome cannot require Remix`);
    if (!Number.isInteger(contract.minimumActiveModules) || contract.minimumActiveModules < 0 || contract.minimumActiveModules > contract.modules.length) {
      throw new Error(`${pack.slug} modular outcome minimumActiveModules is invalid`);
    }
    if (contract.steps.length === 0 || contract.steps.some((step) => !step.trim())) {
      throw new Error(`${pack.slug} modular outcome requires executable steps`);
    }
    if (contract.decisions.length < 2 || contract.decisions.some((decision) => !decision.trim())) {
      throw new Error(`${pack.slug} modular outcome requires at least two decisions`);
    }
    validateConditionalProofModules(pack, contract.gateName.toLowerCase(), contract.modules);
    for (const module of contract.modules) {
      if (module.work.length === 0 || module.checks.length === 0 || [...module.work, ...module.checks].some((item) => !item.trim())) {
        throw new Error(`${pack.slug}/${module.id} modular outcome module requires work and checks`);
      }
    }
    return `

${contract.gateName.toUpperCase()} GATE
1. Write the bounded contract at ${contract.contractPath}. Then write ${contract.moduleDecisionPath}, marking every module active or inactive from direct evidence. Activate at least ${contract.minimumActiveModules}; inactive modules create no implementation or proof work.
${contract.steps.map((step, index) => `${index + 2}. ${step}`).join("\n")}
${contract.modules.map((module) => `
MODULE ${module.id}
Activate when: ${module.activationWhen}
Work: ${module.work.join("; ")}
Checks: ${module.checks.join("; ")}
Required proofs: ${module.requiredProofIds.join(", ")}`).join("\n")}

Keep artifacts under ${contract.artifactRoot}. Write ${contract.decisionReceiptPath} with exactly one decision: ${contract.decisions.join(", ")}. Completion boundary: ${contract.completionBoundary}`;
  })() : "";

  const launchContentPackage = pack.launchContentPackage ? (() => {
    const contract = pack.launchContentPackage;
    if (contract.minimumActiveModules !== 1) throw new Error(`${pack.slug} launch content package requires at least one active module`);
    if (contract.decisions.join(",") !== "ready,repair-required,no-go") {
      throw new Error(`${pack.slug} launch content decisions must be ready, repair-required, no-go`);
    }
    for (const [label, value] of [
      ["briefPath", contract.briefPath],
      ["moduleDecisionPath", contract.moduleDecisionPath],
      ["assetRoot", contract.assetRoot],
      ["manifestPath", contract.manifestPath],
      ["decisionReceiptPath", contract.decisionReceiptPath],
    ] as const) requireSafeRelativePath(value, `${pack.slug} launch content ${label}`);
    if (pack.workstreams.length > 3) throw new Error(`${pack.slug} launch content package must use no more than three core workstreams`);
    if (pack.remix) throw new Error(`${pack.slug} launch content package must not require three creative directions`);
    validateConditionalProofModules(pack, "launch content", contract.modules);
    for (const module of contract.modules) {
      if (module.deliverables.length === 0 || module.deliverables.some((item) => !item.trim())) {
        throw new Error(`${pack.slug}/${module.id} module requires deliverables`);
      }
      if (module.productionChecks.length === 0 || module.productionChecks.some((item) => !item.trim())) {
        throw new Error(`${pack.slug}/${module.id} module requires production checks`);
      }
    }
    return `

LAUNCH CONTENT PACKAGE GATE
1. Keep ${contract.briefPath} to the verified source truth, audience, offer or announcement, call to action, available source media, requested channels and deliverables, voice references, accessibility needs, rights, external-action gates, and prohibited claims. Do not reopen product strategy, manufacture a founder story, or create a campaign calendar.
2. Write ${contract.moduleDecisionPath} before production. Infer modules from the deliverables the user actually requested; do not make the user choose internal production categories. Activate at least one module, record every active and inactive reason, and record active ids in the outcome record as activeModules. Do not activate a format merely because a platform could accept it.
3. Establish one coherent visual and verbal treatment directly from the brief. Do not require three directions, a Remix exercise, or platform variants that do not serve an active deliverable.
4. Produce only active-module assets under ${contract.assetRoot}. Every active module must finish at least one authentic final export plus its editable source when applicable. A brief, script, storyboard, shot list, prompt, mockup, or placeholder is not a final export.
5. Write ${contract.manifestPath}. For every asset record the active module, channel and format, dimensions or duration, source truth, claims, caption or copy, accessibility text, authentic versus generated material, provider and model when generated, inputs, edits, rights and consent, approval state, and SHA-256.
6. Inspect the actual final exports at delivery dimensions and duration. Apply only active modules' production checks, repair material findings, and rerun affected checks. Inactive modules create no production, placeholder, or simulated-proof work.
7. Write ${contract.decisionReceiptPath} with exactly one status: ready, repair-required, or no-go. Ready means the named package is locally post-ready for the selected channels and claims. It never means published, scheduled, distributed, endorsed, effective, engaging, viral, compliant in every market, or commercially successful.

CONDITIONAL CONTENT MODULES
${contract.modules.map((module) => [
  `- ${module.id}`,
  `  Activate when: ${module.activationWhen}`,
  `  Deliverables: ${module.deliverables.join("; ")}`,
  `  Production checks: ${module.productionChecks.join("; ")}`,
  `  Required proofs: ${module.requiredProofIds.join(", ")}`,
].join("\n")).join("\n")}`;
  })() : "";

  const crowdfundingCampaignReadiness = pack.crowdfundingCampaignReadiness ? (() => {
    const contract = pack.crowdfundingCampaignReadiness;
    if (contract.decisions.join(",") !== "ready-for-platform-review,repair-required,no-go") {
      throw new Error(`${pack.slug} crowdfunding readiness decisions must be ready-for-platform-review, repair-required, no-go`);
    }
    for (const [label, value] of [
      ["baselinePath", contract.baselinePath],
      ["economicsPath", contract.economicsPath],
      ["campaignPackagePath", contract.campaignPackagePath],
      ["decisionReceiptPath", contract.decisionReceiptPath],
    ] as const) requireSafeRelativePath(value, `${pack.slug} crowdfunding readiness ${label}`);
    if (!pack.prerequisites?.length) throw new Error(`${pack.slug} crowdfunding readiness requires evidence prerequisites`);
    if (!pack.criticalProofs?.length) throw new Error(`${pack.slug} crowdfunding readiness requires critical proofs`);
    if (pack.workstreams.length > 3) throw new Error(`${pack.slug} crowdfunding readiness must use no more than three core workstreams`);
    if (pack.remix) throw new Error(`${pack.slug} crowdfunding readiness must not require creative directions`);
    if (pack.schedule) throw new Error(`${pack.slug} crowdfunding readiness must not define live campaign operations`);
    return `

CROWDFUNDING CAMPAIGN READINESS GATE
1. Freeze the physical product, prototype, production commitment, target markets, claims, and content revisions in ${contract.baselinePath}. Verify the prerequisite evidence directly. Missing measured-product, manufacturing, content, or applicable study evidence stops this outcome; do not recreate another Outcome Pack inside this one.
2. Lock one campaign scope: platform target, campaign owner, audience, currency, funding mechanism, funding window assumptions, offer, reward architecture, quantities, shipping regions, taxes and duties to review, cancellation and refund boundary, call to action, and claims that readiness will not establish.
3. Write ${contract.economicsPath}. Recompute the fixed funding goal, reward margins, minimum viable quantity, platform and payment fees, taxes to review, packaging, freight, fulfillment, contingency, failed-payment exposure, refunds, working-capital timing, and expected versus stressed volume cases from cited evidence. Unknown costs remain blockers or explicit repair items.
4. Write ${contract.campaignPackagePath} as structured platform-entry material: campaign story, reward table, timeline, risks, FAQ, creator and product evidence, fulfillment disclosures, and a mapping to existing verified content assets. Do not build a website, film, campaign calendar, audience system, ad plan, analytics loop, or inactive content variants.
5. Adversarially challenge prototype truth, manufacturing feasibility, reward quantities, economics, shipping, timeline, claims, asset completeness, and worst credible overfunding. Repair material inconsistencies and rerun affected checks against the immutable package.
6. This outcome ends before platform entry or publication. Do not create or change an account, submit platform fields, publish a preview, launch a campaign, contact an audience, post, email, buy ads, accept pledges, access backer data, or claim funding. Crowdfunding Funding Run is a separate Outcome Pack requiring this passing receipt and fresh approval.
7. Write ${contract.decisionReceiptPath} with exactly one status: ready-for-platform-review, repair-required, or no-go. Ready-for-platform-review means only that the named local package is coherent enough for its owner and qualified advisers to review before platform entry. It never means accepted by a platform, published, funded, demanded, profitable, safe, certified, manufacturable at every volume, deliverable on time, or authorized for live campaign action.`;
  })() : "";

  const mechanicalCadReview = pack.mechanicalCadReview ? (() => {
    const contract = pack.mechanicalCadReview;
    if (contract.decisions.join(",") !== "review-ready,repair-required,no-go") {
      throw new Error(`${pack.slug} mechanical CAD decisions must be review-ready, repair-required, no-go`);
    }
    requireSafeRelativePath(contract.requirementsPath, `${pack.slug} mechanical CAD requirementsPath`);
    requireSafeRelativePath(contract.interfaceProofPath, `${pack.slug} mechanical CAD interfaceProofPath`);
    requireSafeRelativePath(contract.vendorPackagePath, `${pack.slug} mechanical CAD vendorPackagePath`);
    requireSafeRelativePath(contract.fitCouponPath, `${pack.slug} mechanical CAD fitCouponPath`);
    requireSafeRelativePath(contract.decisionReceiptPath, `${pack.slug} mechanical CAD decisionReceiptPath`);
    if (!pack.criticalProofs?.length) throw new Error(`${pack.slug} mechanical CAD review requires critical proofs`);
    return `

MECHANICAL CAD REVIEW GATE
1. Keep ${contract.requirementsPath} to one concise design contract: intended object and user, operating environment, dimensions and fit, materials and fabrication process, cost and machine envelope, assembly and intentional disassembly, loads and misuse, simplicity constraints, and claims that remain physically unproven.
2. Prefer the fewest parts and interfaces that satisfy the contract. Do not create variants, marketing assets, product narratives, electronics, or extra documentation unless they are necessary to resolve a named requirement.
3. Write ${contract.interfaceProofPath} from the actual assembly. For every manufactured part, state how all six movement directions are restrained, what intentional release action exists, and what feature carries lift, spread, slide, rack, flex, and pull-out loads as applicable. Include section/detail views of every non-obvious joint.
4. Run adversarial assembly review before export: prove a feasible assembly order, feasible intentional disassembly, no trapped impossible step, no reliance on unexplained friction or gravity, and no single latch presented as restraining motion it does not geometrically block.
5. Put editable CAD, print or fabrication files, quantities, orientations, maximum part envelope, material and solid-volume estimates, tolerance assumptions, and vendor questions in ${contract.vendorPackagePath}. Create a representative fit coupon at ${contract.fitCouponPath} for every tolerance-critical interface.
6. A digital review can return review-ready only when every critical proof passes. Review-ready means ready for a fabricator to quote and critique; it never means print-ready, physically fitted, load-tested, durable, animal-safe, certified, or production-ready. Without a successful physical coupon or prototype, physical fit and performance remain explicitly unproven.
7. Write ${contract.decisionReceiptPath} with exactly one status: review-ready, repair-required, or no-go. Include the immutable CAD revision, critical proof results, failed alternatives, print envelope, mass and cost assumptions, physical tests performed or not performed, limitations, and fresh review.`;
  })() : "";

  const decisionRationale = pack.decisionRationale ? (() => {
    const contract = pack.decisionRationale;
    const requiredFields = "question,options,evidence,selection,rationale,tradeoffs,uncertainty,reversal evidence,public explanation";
    if (contract.requiredFields.join(",") !== requiredFields) {
      throw new Error(`${pack.slug} decision record fields are invalid`);
    }
    requireSafeRelativePath(contract.rootPath, `${pack.slug} decision record rootPath`);
    requireSafeRelativePath(contract.publicNarrativePath, `${pack.slug} decision record publicNarrativePath`);
    return `

PRODUCT DECISION RECORD
1. Before presenting a material product choice as intentional, write one evidence-backed record under ${contract.rootPath}. Every record must contain: ${contract.requiredFields.join(", ")}.
2. Compare credible alternatives using the constraints that actually matter. For physical products include function, human contact, safety, cleaning, durability, sourcing, fabrication, repair, cost, environmental burden, and sensory character where applicable. For digital products include user behavior, accessibility, privacy, reliability, maintenance, compatibility, and operating cost where applicable.
3. Explain why the selected option won, what it makes worse, what remains unknown, and what new evidence would reverse it. A preference, trend, generated rationale, or retrospective story is not product evidence.
4. Write ${contract.publicNarrativePath} from the verified decision records. Use plain language suitable for customers, preserve uncertainty, and link every public explanation to its source record. Never invent a sophisticated reason after the decision was made or turn a research hypothesis into a product claim.
5. When evidence is insufficient, record the decision as provisional or unresolved. Do not hide an arbitrary choice behind confident copy.`;
  })() : "";

  const hardwarePrototype = pack.hardwarePrototype ? (() => {
    const contract = pack.hardwarePrototype;
    const requiredMeasurements = "functional output,control input,power,temperature,noise,duty cycle,failure controls,measurement uncertainty";
    if (contract.measurementClasses.join(",") !== requiredMeasurements) {
      throw new Error(`${pack.slug} hardware prototype measurement classes are invalid`);
    }
    if (contract.decisions.join(",") !== "working,repair-required,no-go") {
      throw new Error(`${pack.slug} hardware prototype decisions must be working, repair-required, no-go`);
    }
    requireSafeRelativePath(contract.specificationPath, `${pack.slug} hardware prototype specificationPath`);
    requireSafeRelativePath(contract.hazardPath, `${pack.slug} hardware prototype hazardPath`);
    requireSafeRelativePath(contract.claimsPath, `${pack.slug} hardware prototype claimsPath`);
    requireSafeRelativePath(contract.measurementPath, `${pack.slug} hardware prototype measurementPath`);
    requireSafeRelativePath(contract.decisionReceiptPath, `${pack.slug} hardware prototype decisionReceiptPath`);
    return `

MEASURED HARDWARE PROTOTYPE GATE
1. Before detailed design, write ${contract.specificationPath}. Lock the intended user, intended use, contact surfaces, operating environment, functional output, controls, power architecture, session or duty cycle, service boundary, and measurable acceptance thresholds. Separate demonstrated facts, engineering assumptions, research hypotheses, product claims, and prohibited claims.
2. Write ${contract.claimsPath}. A study on another modality, frequency, dose, population, or device is background—not evidence that this product provides the same effect. Do not use a disclaimer to preserve an otherwise unsupported express or implied claim.
3. Write ${contract.hazardPath} before fabrication or human use. Cover mechanical, electrical, battery, thermal, acoustic, vibration, pinch, sharp-edge, material, hygiene, misuse, single-fault, emergency-stop, vulnerable-user, and foreseeable-environment hazards as applicable. Health-adjacent products require an independent qualified professional to define preliminary human-use exclusions and test boundaries; an agent cannot supply clinical clearance.
4. Purchasing, fabrication, assembly by an external party, energized bench work, battery charging, connection to physical hardware, and human testing each require separate approval for the exact design revision, procedure, operator, environment, limits, stop conditions, and cost. Missing tools, parts, authority, professional review, or physical evidence must produce an explicit no-go—not simulated proof.
5. Calibrate the measurement path before judging the prototype. Preserve instruments, calibration status, fixture, raw samples, units, uncertainty, settings, software revision, environment, and failures in ${contract.measurementPath}. Measure these classes where applicable: ${contract.measurementClasses.join(", ")}. For vibroacoustic products, frequency, waveform, acceleration at the contact surface, coupling, duration, and position are separate variables.
6. Never call CAD, firmware, a render, an unassembled bill of materials, or a synthetic trace a working physical prototype. Completion requires direct evidence from the integrated artifact under nominal, boundary, and intentionally failing conditions.
7. Write ${contract.decisionReceiptPath} with exactly one status: working, repair-required, or no-go. Name the immutable prototype revision, intended-use boundary, tests run, thresholds, passed and failed measurements, hazards and mitigations, claims allowed and prohibited, human use performed or not performed, external actions, unresolved risks, and independent review. Working means only that the stated prototype contract passed; it does not mean safe for sale, clinically effective, certified, manufacturable, or production-ready.`;
  })() : "";

  const manufacturingReadiness = pack.manufacturingReadiness ? (() => {
    const contract = pack.manufacturingReadiness;
    if (contract.decisions.join(",") !== "ready,repair-required,no-go") {
      throw new Error(`${pack.slug} manufacturing readiness decisions must be ready, repair-required, no-go`);
    }
    requireSafeRelativePath(contract.baselinePath, `${pack.slug} manufacturing readiness baselinePath`);
    requireSafeRelativePath(contract.rfqPath, `${pack.slug} manufacturing readiness rfqPath`);
    requireSafeRelativePath(contract.compliancePath, `${pack.slug} manufacturing readiness compliancePath`);
    requireSafeRelativePath(contract.pilotPath, `${pack.slug} manufacturing readiness pilotPath`);
    requireSafeRelativePath(contract.decisionReceiptPath, `${pack.slug} manufacturing readiness decisionReceiptPath`);
    return `

MANUFACTURING READINESS GATE
1. Freeze one product configuration in ${contract.baselinePath}. Link its prototype revision, intended use, claims boundary, drawings, firmware, bill of materials, measured results, known defects, target markets, volume scenarios, and unresolved assumptions. A later design change invalidates only the affected evidence but must trigger an explicit change review.
2. Create a comparable request-for-quotation package at ${contract.rfqPath}. Separate supplier statements, written quotations, estimates, and agent assumptions. Record minimum order quantities, tooling ownership, non-recurring engineering, unit cost, lead time, payment terms, capacity, substitutions, logistics, taxes and duties to review, and quote validity.
3. Write ${contract.compliancePath} as a market-specific compliance and quality plan. It must identify applicable product classification questions, required qualified advice, laboratory or certification dependencies, material and electrical evidence, reliability tests, golden-sample controls, inspection criteria, traceability, rework, and release authority. A plan is not certification.
4. Supplier contact, file sharing, quotations, samples, purchases, deposits, tooling, fabrication, laboratory work, freight, contracts, and production commitments each require separate approval for the exact counterparty, artifact revision, scope, price, data boundary, and stop condition.
5. Record pilot evidence at ${contract.pilotPath}. Readiness requires authentic evidence from the frozen revision appropriate to the proposed scale: produced quantity, yield, defects, rework, assembly time, inspection results, packaging and transport checks, supplier deviations, and unresolved failures. CAD, synthetic fixtures, unaccepted quotes, or a single hand-built prototype cannot prove repeatable production.
6. Recompute landed unit economics, cash requirement, working-capital timing, capacity, schedule, contingency, warranty and return assumptions, and fulfillment exposure from cited inputs. Test at least the minimum, expected, and overfunded volume scenarios without treating overfunding as free surplus.
7. Write ${contract.decisionReceiptPath} with exactly one status: ready, repair-required, or no-go. Ready means only that the named configuration has enough direct evidence for the stated production commitment and target markets. It does not mean certified, clinically effective, risk-free, profitable, funded, purchased, or approved for an external production order.`;
  })() : "";

  const studyReadiness = pack.studyReadiness ? (() => {
    const contract = pack.studyReadiness;
    if (contract.decisions.join(",") !== "ready-for-qualified-review,repair-required,no-go") {
      throw new Error(`${pack.slug} study readiness decisions must be ready-for-qualified-review, repair-required, no-go`);
    }
    requireSafeRelativePath(contract.researchQuestionPath, `${pack.slug} study readiness researchQuestionPath`);
    requireSafeRelativePath(contract.protocolPath, `${pack.slug} study readiness protocolPath`);
    requireSafeRelativePath(contract.ethicsPath, `${pack.slug} study readiness ethicsPath`);
    requireSafeRelativePath(contract.analysisPath, `${pack.slug} study readiness analysisPath`);
    requireSafeRelativePath(contract.decisionReceiptPath, `${pack.slug} study readiness decisionReceiptPath`);
    return `

STUDY READINESS GATE
1. Write ${contract.researchQuestionPath}. Lock the research question, rationale, exact intervention or exposure, comparator, population, outcomes, timing, setting, and device or software revision. Separate prior evidence, mechanistic hypothesis, product facts, proposed measurements, and unsupported clinical or commercial claims.
2. Write ${contract.protocolPath} as a protocol draft for qualified review. Predefine eligibility, recruitment boundary, assignment or allocation where applicable, procedures, dose or exposure, monitoring, stop rules, adverse-event handling, endpoints, schedule, deviations, withdrawals, missing data, and the smallest design capable of answering the question. Do not optimize the protocol to produce a favorable result.
3. Write ${contract.ethicsPath}. Identify the sponsor, accountable investigator, study site or remote boundary, jurisdiction, ethics or IRB pathway, regulatory classification questions, consent and comprehension process, privacy and retention controls, compensation, conflicts, vulnerable-population exclusions, insurance or indemnity questions, and every approval still required. An agent cannot act as investigator, clinician, ethics board, regulator, or legal adviser.
4. Write ${contract.analysisPath} before data collection. Define estimands or decision measures, sample-size rationale, exclusions, multiplicity, transformations, stopping rules, missing-data treatment, subgroup boundaries, reproducible code and environment, data dictionary, provenance, access, audit trail, and publication of negative or inconclusive results.
5. Recruitment, screening, consent, human exposure, health-data access, randomization, data collection, compensation, clinical communication, registration, ethics submission, or public claims each require separate approval plus the qualified human and institutional authority appropriate to the jurisdiction. Missing authority produces no-go, not simulated enrollment or synthetic evidence.
6. Reconcile protocol operations, qualified people, sites, equipment, intervention supply, safety monitoring, data systems, budget, timeline, registration, analysis, publication, and participant follow-up. Preserve missing partners, quotes, approvals, feasibility evidence, and conflicts as blockers.
7. Write ${contract.decisionReceiptPath} with exactly one status: ready-for-qualified-review, repair-required, or no-go. Ready-for-qualified-review means the evidence package is coherent enough to place before qualified investigators, ethics bodies, regulators, statisticians, and legal or privacy advisers. It never means approved, registered, recruited, safe, effective, clinically validated, or authorized to begin.`;
  })() : "";

  const action = pack.modularOutcome?.action ?? (pack.opportunityDiscovery ? "Discover" : pack.firstCustomerSprint ? "Run" : pack.crowdfundingCampaignReadiness ? "Prepare and challenge" : pack.launchContentPackage ? "Create and verify" : pack.functionalHardwarePrototype ? "Build, test, and revise" : pack.hardwarePrototype ? "Build and measure" : pack.mechanicalCadReview ? "Design and challenge" : pack.manufacturingReadiness || pack.studyReadiness ? "Prepare and verify" : pack.lane === "operate" ? "Establish and run the first cycle of" : pack.lane === "release" ? "Prepare and verify" : "Build");
  const pluginCheck = pack.plugins?.length
    ? ` Also detect these optional agent plugins: ${pack.plugins.map((plugin) => `${plugin.invocation} (${plugin.skills.map((skill) => `$${skill}`).join(", ")})`).join(", ")}. Do not install or imitate an unavailable plugin; record its absence and use the documented fallback.`
    : "";
  const sitesPath = pack.plugins?.some((plugin) => plugin.id === "sites") ? `

OPENAI SITES MVP PATH
1. If .openai/hosting.json exists, use @sites. Otherwise, when no hosting project is already selected and @sites is available, prefer it for the MVP deployment path so the user does not need a separate Vercel registration.
2. Invoke $sites-building to prepare and validate the exact site. Keep $sites-hosting with the lead agent; do not delegate hosting mutations to a workstream.
3. Treat every Sites deployment URL as production. Before creating or linking provider state, pushing source, saving a version, deploying, changing access, adding a domain, or changing environment variables, request explicit approval for that exact external action. Possible's approval gate still applies to an owner-only deployment.
4. After approval, deploy only the validated saved version, inspect deployment status, verify the named URL and access mode, and record the project, commit, version, deployment, and rollback version in the completion report.
5. If @sites is unavailable, do not imitate it. Use another reviewed adapter only when it is installed, compatible, and authorized; otherwise finish with a completion report that records deployment as no-go.` : "";
  const remixGate = pack.remix ? (() => {
    const contract = pack.remix;
    const workstream = pack.workstreams.find((stream) => stream.id === contract.workstreamId);
    if (!workstream) throw new Error(`${pack.slug} remix workstream ${contract.workstreamId} does not exist`);
    if (contract.candidateCount !== 3) throw new Error(`${pack.slug} remix must compare exactly three directions`);
    requireSafeRelativePath(contract.previewRoot, `${pack.slug} remix previewRoot`);
    requireSafeRelativePath(contract.decisionPath, `${pack.slug} remix decisionPath`);
    if (contract.kind === "physical-direction") {
      return `

PHYSICAL REMIX GATE
1. Remix changes physical direction, never the Outcome Pack's intended use, functional requirements, safety limits, interfaces, claims boundary, measurement contract, or completion checks. Preserve: ${contract.preserves.join(", ")}.
2. After the ${contract.workstreamId} workstream's dependencies pass, create exactly ${contract.candidateCount} project-specific physical directions under ${contract.previewRoot}. Show the same functional envelope and confirmed components in comparable orthographic, section, contact-surface, control, and service views.
3. Give each direction a plain-language name and intended user effect. Every pair must differ materially in at least three of form, ergonomics, material or craft, component layout, control interaction, assembly, serviceability, portability, or sensory character. Cosmetic recolors fail.
4. Infer from intended use, user, cultural references, existing identity, confirmed components, manufacturing constraints, hazards, and evidence. Do not copy a protected product, flatten a cultural reference into decoration, hide difficult components, or let styling override safety and measurement access.
5. If physical taste is material or the user asked to choose, show the three directions and ask one plain-language question. Otherwise select using intended-use fit, ergonomics, safety, manufacturability, serviceability, distinctiveness, and lower unverified complexity.
6. Record evidence, candidates, preview hashes, provenance, decision mode, selected traits, rejected risks, rationale, and timestamp in ${contract.decisionPath}. Never call an agent selection user-approved.
7. Do not begin dependent mechanical or electronics implementation until the decision exists. A later Remix reruns only the direction and affected physical surfaces after reporting scope; it does not silently change requirements, safety limits, claims, interfaces, measurements, or prior evidence.`;
    }
    return `

REMIX GATE
1. Remix changes creative direction, never the Outcome Pack's promised outputs, facts, safeguards, or completion checks. Preserve: ${contract.preserves.join(", ")}.
2. After the ${contract.workstreamId} workstream's dependencies pass, create exactly ${contract.candidateCount} project-specific directions under ${contract.previewRoot}. Use the same truthful copy, content, and viewport for every preview.
3. Give each direction a plain-language name and intended audience effect. Every pair must differ materially in at least three of typography role, color logic, composition, imagery or shape language, and motion or interaction; palette swaps fail.
4. Infer from the audience, product truth, existing identity, assets, behavior, and constraints. Preserve or deliberately evolve a strong existing identity. Never randomize, copy a named reference, or ask the user to choose design jargon.
5. If the user made taste material or asked to choose, show the three previews and ask one plain-language question. Otherwise select the best-supported direction using audience fit, product truth, accessibility, maintainability, and distinctiveness, with lower complexity as the tie-break.
6. Record the evidence, candidates, preview hashes, provenance, decision mode, selected traits, rationale, and timestamp in ${contract.decisionPath}. Never call an agent selection user-approved.
7. Do not begin dependent implementation until the decision exists. A later remix reruns only the direction and affected presentation surfaces after reporting scope; it does not silently change claims, documentation, product behavior, or prior evidence.`;
  })() : "";

  return `${action} the ${pack.name} outcome for the product described below.

PRODUCT BRIEF
[Replace this line with the product, audience, constraints, and any existing repository or assets.]

OUTCOME
${pack.promise}
Deliver: ${pack.outputs.join(", ")}.

LEAD AGENT WORKFLOW
1. Inspect the workspace and this brief. Do not start production until you write a shared outcome-brief.md containing only confirmed facts, audience, promise, constraints, interfaces, and acceptance checks.
2. Confirm these installed skills are visible: ${pack.skills.map((source) => `$${source.skill}`).join(", ")}. If any are missing, stop and identify them; do not silently imitate them.${pluginCheck}
3. Treat the dependency waves as ownership and ordering, not mandatory agent ceremony. Evaluate Activation rules and use the minimum active workstreams. Do not start a dependent workstream until every named dependency passes. The lead agent may execute small, sequential, or tightly coupled implementation work directly; delegate only genuinely independent work that benefits from parallel ownership. Never create one subagent per skill. Keep the fresh reviewer independent from implementation. Do not execute inactive work merely to fill a checklist.
WORKSTREAM SEQUENCE
${workstreamSequence}
${workstreams}
4. Continue as the lead agent: protect the shared facts, resolve interface decisions, and prepare the integration shell. Review the evidence from every active workstream, then ${integrationTarget} without erasing unrelated user work.
5. After integration, use a fresh reviewer with no implementation ownership. It must invoke ${pack.reviewSkills.map((skill) => `$${skill}`).join(", ")}, inspect the actual integrated outcome, challenge the acceptance claims and failure modes, and return evidence—not implementation work.
6. Fix material integration failures, rerun the relevant checks, and finish with a concise completion report: created artifacts, verifier commands, passed/failed/skipped checks, known limitations, and every unproven claim.

GUARDRAILS
${pack.guardrails.map((guardrail) => `- ${guardrail}`).join("\n")}

VERIFICATION CONTRACT
${pack.verification.map((item) => `- ${item}`).join("\n")}
${prerequisites}${opportunityDiscovery}${firstCustomerSprint}${decisionRationale}${criticalProofs}${mechanicalCadReview}${functionalHardwarePrototype}${launchContentPackage}${crowdfundingCampaignReadiness}${hardwarePrototype}${manufacturingReadiness}${studyReadiness}${modularOutcome}${remixGate}${releaseGate}${launchGate}${sitesPath}${operateLoop}

OUTCOME RECORD
Every run—including a partial, blocked, or no-go result—must write one machine-readable proof index at .possible/runs/<run-id>/outcome-record.json.
Use schemaVersion 1 and record:
- runId, packSlug, status, completedAt, workspaceRevision, and activeModules when the pack has conditional proof modules;
- outcomeBriefPath, packSnapshotPath, skillLockPath, and checkpointPath;
- artifacts with repository-relative path, description, owning workstream id, and SHA-256;
- proofs with the exact claim, passed/failed/skipped/unproven status, and direct evidence paths;
- material decisions with selection, evidence, tradeoffs, uncertainty, and reversal evidence;
- verification findings that caused repairs, with both failure and repair evidence;
- external-action approvals and actions actually taken or not taken;
- limitations; and
- the fresh reviewer's identity, report path, independence from implementation, and passed/partial/failed status.
This record is an index of preserved proof, not the proof itself. Never paste secrets, personal data, unverifiable claims, or fabricated evidence into it. Use empty arrays when a category did not occur; never omit a field. A passing record requires at least one passed proof and may not hide failed, skipped, unproven, unresolved, denied, or not-taken items.

NEW-REALITY CHECKPOINT
Only after this bounded outcome finishes—including a partial or no-go result—write .possible/checkpoints/<run-id>.json with:
- what became true, with direct evidence for every fact;
- remaining unknowns;
- the single riskiest assumption;
- the next decision the user faces; and
- zero or more candidate next outcomes, each with its rationale, the unknowns it addresses, how it directly tests the named riskiest assumption, and a matchingPackSlug only when that pack actually exists in the present catalog.
Use schemaVersion 1, this pack slug, the completed run id and timestamp, the completion receipt path, and a verification status of passed, partial, or failed. Every candidate must state approvalRequired: true. A candidate without a matching pack records a catalog gap; it is not permission to improvise a new pack.
Append only this completed checkpoint to retrospective journey history. Do not add planned, pending, approved, or future stages to that history. Do not install, compile, start, or imply approval for a candidate next outcome. Present the changed reality to the user first; selecting any candidate requires fresh intake, one present-pack recommendation, and separate approval.

Do not ask me to choose implementation details that can be safely inferred from the brief and repository. Ask only when a missing decision would materially change the product or authorize an external action.`;
}

export function validateOutcomeRecord(
  record: OutcomeRecord,
  criticalProofs: CriticalProofObligation[] = [],
): OutcomeRecord {
  if (record.schemaVersion !== 1) throw new Error("Outcome record schemaVersion must be 1");
  if (!/^[a-z0-9][a-z0-9-]*$/.test(record.runId)) throw new Error("Outcome record runId must be a safe identifier");
  if (!/^[a-z0-9][a-z0-9-]*$/.test(record.packSlug)) throw new Error("Outcome record packSlug must be a safe identifier");
  if (!["passed", "partial", "failed"].includes(record.status)) {
    throw new Error("Outcome record status must be passed, partial, or failed");
  }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(record.completedAt) || Number.isNaN(Date.parse(record.completedAt))) {
    throw new Error("Outcome record completedAt must be an ISO timestamp");
  }
  for (const [label, value] of [
    ["outcomeBriefPath", record.outcomeBriefPath],
    ["packSnapshotPath", record.packSnapshotPath],
    ["skillLockPath", record.skillLockPath],
    ["checkpointPath", record.checkpointPath],
    ["verification reportPath", record.verification.reportPath],
  ] as const) {
    requireSafeRelativePath(value, `Outcome record ${label}`);
  }
  if (!record.workspaceRevision.trim()) throw new Error("Outcome record workspaceRevision must be non-empty");
  const artifactPaths = new Set<string>();
  for (const artifact of record.artifacts) {
    requireSafeRelativePath(artifact.path, "Outcome record artifact path");
    if (artifactPaths.has(artifact.path)) throw new Error(`Outcome record artifact ${artifact.path} is duplicated`);
    artifactPaths.add(artifact.path);
    if (!artifact.description.trim() || !artifact.workstreamId.trim()) {
      throw new Error(`Outcome record artifact ${artifact.path} requires a description and workstream id`);
    }
    if (!/^[a-f0-9]{64}$/.test(artifact.sha256)) throw new Error(`Outcome record artifact ${artifact.path} requires a SHA-256`);
  }
  if (record.proofs.length === 0) throw new Error("Outcome record must include at least one proof");
  for (const proof of record.proofs) {
    if (!proof.claim.trim()) throw new Error("Outcome record proof claim must be non-empty");
    if (!["passed", "failed", "skipped", "unproven"].includes(proof.status)) {
      throw new Error(`Outcome record proof ${proof.claim} has an invalid status`);
    }
    requireEvidencePaths(proof.evidence, `Outcome record proof ${proof.claim} evidence`);
    if (proof.status === "passed" && proof.evidence.length === 0) {
      throw new Error(`Outcome record passed proof ${proof.claim} requires direct evidence`);
    }
  }
  for (const decision of record.decisions) {
    if (!decision.question.trim() || !decision.selection.trim()) {
      throw new Error("Outcome record decisions require a question and selection");
    }
    if (decision.evidence.length === 0 || decision.evidence.some((item) => !item.trim())) {
      throw new Error(`Outcome record decision ${decision.question} requires evidence`);
    }
    if (
      decision.tradeoffs.length === 0 ||
      decision.uncertainty.length === 0 ||
      decision.reversalEvidence.length === 0 ||
      [...decision.tradeoffs, ...decision.uncertainty, ...decision.reversalEvidence].some((item) => !item.trim())
    ) {
      throw new Error(`Outcome record decision ${decision.question} requires tradeoffs, uncertainty, and reversal evidence`);
    }
    requireEvidencePaths(decision.evidence, `Outcome record decision ${decision.question} evidence`);
  }
  for (const repair of record.repairs) {
    if (!repair.finding.trim() || !repair.change.trim() || !["repaired", "unresolved"].includes(repair.status)) {
      throw new Error("Outcome record repairs require a finding, change, and valid status");
    }
    if (repair.failureEvidence.length === 0) throw new Error(`Outcome record repair ${repair.finding} requires failure evidence`);
    requireEvidencePaths(repair.failureEvidence, `Outcome record repair ${repair.finding} failure evidence`);
    requireEvidencePaths(repair.repairEvidence, `Outcome record repair ${repair.finding} repair evidence`);
    if (repair.status === "repaired" && repair.repairEvidence.length === 0) {
      throw new Error(`Outcome record repaired finding ${repair.finding} requires repair evidence`);
    }
  }
  for (const approval of record.approvals) {
    if (!approval.action.trim() || !["not-requested", "requested", "approved", "denied"].includes(approval.status)) {
      throw new Error("Outcome record approvals require an action and valid status");
    }
    requireEvidencePaths(approval.evidence, `Outcome record approval ${approval.action} evidence`);
  }
  for (const externalAction of record.externalActions) {
    if (!externalAction.action.trim() || !["taken", "not-taken"].includes(externalAction.status)) {
      throw new Error("Outcome record external actions require an action and valid status");
    }
    requireEvidencePaths(externalAction.evidence, `Outcome record external action ${externalAction.action} evidence`);
    if (externalAction.status === "taken" && externalAction.evidence.length === 0) {
      throw new Error(`Outcome record external action ${externalAction.action} requires direct evidence`);
    }
  }
  if (!record.verification.reviewer.trim() || record.verification.independentFromImplementation !== true) {
    throw new Error("Outcome record verification requires an independent reviewer");
  }
  if (!["passed", "partial", "failed"].includes(record.verification.status)) {
    throw new Error("Outcome record verification status must be passed, partial, or failed");
  }
  if (record.status === "passed") {
    if (record.verification.status !== "passed" || !record.proofs.some((proof) => proof.status === "passed")) {
      throw new Error("A passed outcome record requires passed independent verification and at least one passed proof");
    }
    if (record.repairs.some((repair) => repair.status === "unresolved")) {
      throw new Error("A passed outcome record cannot contain unresolved repairs");
    }
    if (criticalProofs.length > 0) {
      const evaluation = evaluateCriticalProofResults(
        criticalProofs,
        record.proofs
          .filter((proof): proof is typeof proof & { obligationId: string } => Boolean(proof.obligationId))
          .map((proof) => ({
            obligationId: proof.obligationId,
            status: proof.status,
            evidence: proof.evidence,
          })),
        record.activeModules ?? [],
      );
      if (evaluation !== "passed") {
        throw new Error(`A passed outcome record requires every critical proof to pass; current result is ${evaluation}`);
      }
    }
  }
  return record;
}

export function validateOutcomeCheckpoint(checkpoint: OutcomeCheckpoint): OutcomeCheckpoint {
  if (checkpoint.schemaVersion !== 1) throw new Error("Outcome checkpoint schemaVersion must be 1");
  if (!/^[a-z0-9][a-z0-9-]*$/.test(checkpoint.runId)) throw new Error("Outcome checkpoint runId must be a safe identifier");
  if (!/^[a-z0-9][a-z0-9-]*$/.test(checkpoint.packSlug)) throw new Error("Outcome checkpoint packSlug must be a safe identifier");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(checkpoint.completedAt) || Number.isNaN(Date.parse(checkpoint.completedAt))) {
    throw new Error("Outcome checkpoint completedAt must be an ISO timestamp");
  }
  requireSafeRelativePath(checkpoint.receiptPath, "Outcome checkpoint receiptPath");
  if (!["passed", "partial", "failed"].includes(checkpoint.verificationStatus)) {
    throw new Error("Outcome checkpoint verificationStatus must be passed, partial, or failed");
  }
  if (checkpoint.becameTrue.length === 0) throw new Error("Outcome checkpoint must record what became true");
  for (const fact of checkpoint.becameTrue) {
    if (!fact.statement.trim() || fact.evidence.length === 0 || fact.evidence.some((item) => !item.trim())) {
      throw new Error("Every new-reality fact must have direct evidence");
    }
  }
  if (!checkpoint.riskiestAssumption.trim()) throw new Error("Outcome checkpoint must identify the riskiest assumption");
  if (!checkpoint.nextDecision.trim()) throw new Error("Outcome checkpoint must identify the next decision");
  const remainingUnknowns = new Set(checkpoint.remainingUnknowns);
  if (remainingUnknowns.size !== checkpoint.remainingUnknowns.length || checkpoint.remainingUnknowns.some((item) => !item.trim())) {
    throw new Error("Outcome checkpoint remaining unknowns must be unique and non-empty");
  }
  const candidateKeys = new Set<string>();
  for (const candidate of checkpoint.candidateNextOutcomes) {
    if (!candidate.outcome.trim()) throw new Error("Candidate outcome must name the result to pursue");
    if (candidate.matchingPackSlug !== undefined && !/^[a-z0-9][a-z0-9-]*$/.test(candidate.matchingPackSlug)) {
      throw new Error(`Candidate outcome ${candidate.outcome} matchingPackSlug must be a safe identifier`);
    }
    const candidateKey = `${candidate.outcome}\0${candidate.matchingPackSlug ?? ""}`;
    if (candidateKeys.has(candidateKey)) throw new Error(`Candidate outcome ${candidate.outcome} is duplicated`);
    candidateKeys.add(candidateKey);
    if (!candidate.rationale.trim()) throw new Error(`Candidate outcome ${candidate.outcome} must include a rationale`);
    if (candidate.addressesUnknowns.length === 0 || candidate.addressesUnknowns.some((item) => !item.trim())) {
      throw new Error(`Candidate outcome ${candidate.outcome} must identify the unknowns it addresses`);
    }
    if (candidate.addressesUnknowns.some((item) => !remainingUnknowns.has(item))) {
      throw new Error(`Candidate outcome ${candidate.outcome} must address a recorded remaining unknown`);
    }
    if (candidate.testsAssumption !== checkpoint.riskiestAssumption) {
      throw new Error(`Candidate outcome ${candidate.outcome} must test the recorded riskiest assumption`);
    }
    if (candidate.approvalRequired !== true) throw new Error(`Candidate outcome ${candidate.outcome} requires fresh approval`);
    for (const forbidden of ["approved", "execute", "runPrompt", "installCommands"]) {
      if (forbidden in candidate) throw new Error(`Candidate outcome ${candidate.outcome} cannot contain executable or approval state`);
    }
  }
  return checkpoint;
}

export function recordOutcomeJourney(originalAmbition: string, completedOutcomes: OutcomeCheckpoint[]): OutcomeJourneyHistory {
  if (!originalAmbition.trim()) throw new Error("Outcome journey requires the original ambition");
  if (completedOutcomes.length === 0) throw new Error("Outcome journey requires at least one completed outcome");
  const runIds = new Set<string>();
  for (const checkpoint of completedOutcomes) {
    validateOutcomeCheckpoint(checkpoint);
    if (runIds.has(checkpoint.runId)) throw new Error(`Outcome journey contains duplicate run id ${checkpoint.runId}`);
    runIds.add(checkpoint.runId);
  }
  return { schemaVersion: 1, originalAmbition, completedOutcomes };
}

export function compilePack(pack: OutcomePack): CompiledPack {
  return {
    pack,
    installCommands: compileInstallCommands(pack),
    runPrompt: compileRunPrompt(pack),
  };
}
