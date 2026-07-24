import type { CompiledPack, OutcomeCheckpoint, OutcomeJourneyHistory, OutcomePack, Workstream } from "./types.js";

const safeRelativePath = (value: string) => !/^(?:\/|[A-Za-z]:)|(?:^|\/)\.\.(?:\/|$)|[*?]/.test(value);

function requireSafeRelativePath(value: string, label: string): void {
  if (!value || !safeRelativePath(value)) throw new Error(`${label} must be a safe repository-relative path`);
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
  const launchGate = pack.lane === "launch" ? `

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

  const action = pack.opportunityDiscovery ? "Discover" : pack.firstCustomerSprint ? "Run" : pack.hardwarePrototype ? "Build and measure" : pack.lane === "operate" ? "Establish and run the first cycle of" : pack.lane === "release" ? "Prepare and verify" : "Build";
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
3. Follow the dependency waves below. Do not create one subagent per skill. At each wave, evaluate any Activation rule against shared evidence, record the result, and create one subagent for each currently unblocked active workstream. Give every subagent outcome-brief.md, explicit ownership, its named skills, and its own completion verifier. Do not start a dependent workstream until every named dependency passes its handoff checks. Do not execute inactive work merely to fill a checklist.
WORKSTREAM SEQUENCE
${workstreamSequence}
${workstreams}
4. Continue as the lead agent while the workstreams run: protect the shared facts, resolve interface decisions, and prepare the integration shell. Wait for all workstreams, review their evidence, then ${integrationTarget} without erasing unrelated user work.
5. After integration, create a fresh verification subagent. It must invoke ${pack.reviewSkills.map((skill) => `$${skill}`).join(", ")}, inspect the actual integrated outcome, check every promised artifact, and return evidence—not implementation work.
6. Fix material integration failures, rerun the relevant checks, and finish with a concise completion report: created artifacts, verifier commands, passed/failed/skipped checks, known limitations, and every unproven claim.

GUARDRAILS
${pack.guardrails.map((guardrail) => `- ${guardrail}`).join("\n")}

VERIFICATION CONTRACT
${pack.verification.map((item) => `- ${item}`).join("\n")}
${prerequisites}${opportunityDiscovery}${firstCustomerSprint}${hardwarePrototype}${remixGate}${releaseGate}${launchGate}${sitesPath}${operateLoop}

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
