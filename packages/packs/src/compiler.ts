import type {
  CompiledPack,
  ExpectationEvaluation,
  ExpectationResult,
  OutcomeCheckpoint,
  OutcomeExpectationContract,
  OutcomeJourneyHistory,
  OutcomePack,
  PackExpectation,
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

export function evaluateExpectationResults(
  expectations: PackExpectation[],
  results: ExpectationResult[],
): ExpectationEvaluation {
  const expectationIds = new Set(expectations.map(({ id }) => id));
  if (expectationIds.size !== expectations.length) throw new Error("Expectations require unique ids");
  const resultsById = new Map<string, ExpectationResult>();
  for (const result of results) {
    if (!expectationIds.has(result.expectationId)) throw new Error(`Unknown expectation ${result.expectationId}`);
    if (resultsById.has(result.expectationId)) throw new Error(`Duplicate expectation result ${result.expectationId}`);
    if (!["passed", "failed", "skipped", "unproven"].includes(result.status)) {
      throw new Error(`Expectation ${result.expectationId} has an invalid status`);
    }
    requireEvidencePaths(result.evidence, `Expectation ${result.expectationId} evidence`);
    if (result.status === "passed" && result.evidence.length === 0) {
      throw new Error(`Expectation ${result.expectationId} cannot pass without direct evidence`);
    }
    resultsById.set(result.expectationId, result);
  }
  const required = expectations.filter((expectation) => (expectation.level ?? "required") === "required");
  if (required.some(({ id }) => resultsById.get(id)?.status === "failed")) return "failed";
  if (required.some(({ id }) => resultsById.get(id)?.status !== "passed")) return "unproven";
  return "passed";
}

export function validateExpectationContract(contract: OutcomeExpectationContract): OutcomeExpectationContract {
  if (contract.schemaVersion !== 1) throw new Error("Expectation contract schemaVersion must be 1");
  if (!/^[a-z0-9][a-z0-9-]*$/.test(contract.runId)) throw new Error("Expectation contract runId must be a safe identifier");
  if (!/^[a-z0-9][a-z0-9-]*$/.test(contract.packSlug)) throw new Error("Expectation contract packSlug must be a safe identifier");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(contract.frozenAt) || Number.isNaN(Date.parse(contract.frozenAt))) {
    throw new Error("Expectation contract frozenAt must be an ISO timestamp");
  }
  if (contract.expectations.length === 0) throw new Error("Expectation contract must contain at least one expectation");
  const ids = new Set<string>();
  for (const expectation of contract.expectations) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(expectation.id)) throw new Error(`Expectation ${expectation.id} must use a safe identifier`);
    if (ids.has(expectation.id)) throw new Error(`Expectation ${expectation.id} is duplicated`);
    ids.add(expectation.id);
    if (!expectation.statement.trim()) throw new Error(`Expectation ${expectation.id} requires a statement`);
    if (!["pack", "user", "inferred"].includes(expectation.source)) throw new Error(`Expectation ${expectation.id} has an invalid source`);
    if (!["required", "preferred"].includes(expectation.level)) throw new Error(`Expectation ${expectation.id} has an invalid level`);
    if (expectation.activationEvidence.length === 0 || expectation.activationEvidence.some((item) => !item.trim())) {
      throw new Error(`Expectation ${expectation.id} requires activation evidence`);
    }
    requireEvidencePaths(expectation.activationEvidence, `Expectation ${expectation.id} activation evidence`);
    if (expectation.failureModes.length === 0 || expectation.failureModes.some((item) => !item.trim())) {
      throw new Error(`Expectation ${expectation.id} requires failure modes`);
    }
    if (expectation.requiredEvidence.length === 0 || expectation.requiredEvidence.some((item) => !item.trim())) {
      throw new Error(`Expectation ${expectation.id} requires evidence types`);
    }
  }
  if (!contract.expectations.some(({ active, level }) => active && level === "required")) {
    throw new Error("Expectation contract requires at least one active required expectation");
  }
  return contract;
}

export function compileWorkstreamWaves(pack: OutcomePack): Workstream[][] {
  const byId = new Map(pack.workstreams.map((stream) => [stream.id, stream]));
  if (byId.size !== pack.workstreams.length) throw new Error(`${pack.slug} contains duplicate workstream ids`);
  for (const stream of pack.workstreams) {
    if (stream.activation !== undefined && !stream.activation.trim()) throw new Error(`${pack.slug}/${stream.id} activation must be non-empty`);
    for (const dependency of stream.dependsOn ?? []) {
      if (!byId.has(dependency)) throw new Error(`${pack.slug}/${stream.id} depends on missing workstream ${dependency}`);
      if (dependency === stream.id) throw new Error(`${pack.slug}/${stream.id} cannot depend on itself`);
    }
  }
  const remaining = new Set(byId.keys());
  const complete = new Set<string>();
  const waves: Workstream[][] = [];
  while (remaining.size > 0) {
    const wave = [...remaining].map((id) => byId.get(id)!).filter((stream) => (stream.dependsOn ?? []).every((dependency) => complete.has(dependency)));
    if (wave.length === 0) throw new Error(`${pack.slug} contains a workstream dependency cycle`);
    waves.push(wave);
    for (const stream of wave) { remaining.delete(stream.id); complete.add(stream.id); }
  }
  return waves;
}

export function compileInstallCommands(pack: OutcomePack): string[] {
  const groups = new Map<string, { repository: string; skills: string[]; installMode: "selective" | "full-depth" }>();
  for (const source of pack.skills) {
    const installSource = source.installSource ?? `${source.repository}@${source.reviewedRevision}`;
    if (!installSource.endsWith(`@${source.reviewedRevision}`)) throw new Error(`${source.id} must install the exact reviewed revision ${source.reviewedRevision}`);
    const installMode = source.installMode ?? "selective";
    const key = `${installSource}|${installMode}`;
    const group = groups.get(key) ?? { repository: installSource, skills: [], installMode };
    group.skills.push(source.skill);
    groups.set(key, group);
  }
  return [...groups.values()].map(({ repository, skills, installMode }) =>
    installMode === "full-depth"
      ? `npx skills@1.5.19 add ${repository} --full-depth ${skills.map((skill) => `--skill ${skill}`).join(" ")} --agent codex`
      : `npx skills@1.5.19 add ${repository} ${skills.map((skill) => `--skill ${skill}`).join(" ")} --agent codex`,
  );
}

export function compileRunPrompt(pack: OutcomePack): string {
  const waves = compileWorkstreamWaves(pack);
  const workstreams = pack.workstreams.map((stream) => [
    `- ${stream.name} (${stream.id})`,
    `  Skills: ${stream.skills.map((skill) => `$${skill}`).join(", ")}`,
    `  Owns: ${stream.owns.join(", ")}`,
    `  Depends on: ${stream.dependsOn?.join(", ") || "none"}`,
    `  Brief: ${stream.brief}`,
  ].join("\n")).join("\n");
  const workstreamSequence = waves.map((wave, index) => `- Wave ${index + 1}: ${wave.map((stream) => stream.id).join(", ")}`).join("\n");
  const expectations = (pack.expectations ?? []).map((expectation) => [
    `- ${expectation.id}: ${expectation.statement}`,
    `  Failure modes: ${expectation.failureModes.join(", ")}`,
    `  Required evidence: ${expectation.requiredEvidence.join(", ")}`,
    `  Level: ${expectation.level ?? "required"}`,
  ].join("\n")).join("\n");
  return `Complete the ${pack.name} outcome for the product described below.

PRODUCT BRIEF
[Replace this line with the product, audience, constraints, and existing repository or assets.]

OUTCOME
${pack.promise}
${pack.summary}

SKILLS
${pack.skills.map((skill) => `- $${skill.skill}: ${skill.role}`).join("\n")}

WORKSTREAMS
${workstreamSequence}
${workstreams}

LEAD AGENT GUIDANCE
1. Inspect the workspace and preserve confirmed facts, user expectations, constraints, and external-action boundaries.
2. Use the named skills as capabilities, not as permission to invent facts or external authority.
3. Coordinate workstreams by dependency, using only the work that serves this outcome. Work directly when delegation would add ceremony.
4. Integrate one coherent result before judging completion. Review the complete result, not only isolated artifacts.
5. Repair failed required expectations, then run a fresh review independent from implementation.

GUARDRAILS
${pack.guardrails.map((guardrail) => `- ${guardrail}`).join("\n")}

EXPECTATIONS CHECKLIST
${expectations || "- No checklist supplied; derive only explicit user expectations and record the gap."}

VERIFICATION
${pack.verification.map((item) => `- ${item}`).join("\n")}

OUTPUTS
${pack.outputs.map((output) => `- ${output}`).join("\n")}

COMPLETION
Return a concise evidence-backed report with passed, failed, skipped, and unproven checklist items, limitations, repairs, and external actions actually taken or not taken. A failed required expectation prevents a passing outcome. Do not claim publication, audience response, commercial effectiveness, safety, certification, or authority that the evidence does not support.

RUN EVIDENCE
Write \`.possible/runs/<run-id>/outcome-record.json\` as the machine-readable index of the brief, frozen expectation contract, pack and Skill snapshots, artifacts, expectation results, repairs, approvals, limitations, and independent verification. After the run, write \`.possible/checkpoints/<run-id>.json\` with what became true, remaining unknowns, the riskiest assumption, and the next decision. These records index evidence; they do not replace it or authorize another outcome.`;
}

export function validateOutcomeRecord(record: OutcomeRecord, contracts: OutcomeExpectationContract | PackExpectation[] = []): OutcomeRecord {
  const frozenContract = Array.isArray(contracts) ? undefined : validateExpectationContract(contracts);
  const expectationDefinitions: PackExpectation[] = Array.isArray(contracts) ? contracts : frozenContract!.expectations;
  if (record.schemaVersion !== 1) throw new Error("Outcome record schemaVersion must be 1");
  if (!/^[a-z0-9][a-z0-9-]*$/.test(record.runId)) throw new Error("Outcome record runId must be a safe identifier");
  if (!/^[a-z0-9][a-z0-9-]*$/.test(record.packSlug)) throw new Error("Outcome record packSlug must be a safe identifier");
  if (!["passed", "partial", "failed"].includes(record.status)) throw new Error("Outcome record status must be passed, partial, or failed");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(record.completedAt) || Number.isNaN(Date.parse(record.completedAt))) throw new Error("Outcome record completedAt must be an ISO timestamp");
  for (const [label, value] of [["outcomeBriefPath", record.outcomeBriefPath], ["packSnapshotPath", record.packSnapshotPath], ["skillLockPath", record.skillLockPath], ["checkpointPath", record.checkpointPath], ["verification reportPath", record.verification.reportPath]] as const) requireSafeRelativePath(value, `Outcome record ${label}`);
  if (!record.workspaceRevision.trim()) throw new Error("Outcome record workspaceRevision must be non-empty");
  if (record.expectationContractPath !== undefined) requireSafeRelativePath(record.expectationContractPath, "Outcome record expectationContractPath");
  if (frozenContract && (record.runId !== frozenContract.runId || record.packSlug !== frozenContract.packSlug)) throw new Error("Outcome record must match its frozen expectation contract runId and packSlug");
  const knownExpectationIds = new Set(expectationDefinitions.map(({ id }) => id));
  const artifactPaths = new Set<string>();
  for (const artifact of record.artifacts) {
    requireSafeRelativePath(artifact.path, "Outcome record artifact path");
    if (artifactPaths.has(artifact.path)) throw new Error(`Outcome record artifact ${artifact.path} is duplicated`);
    artifactPaths.add(artifact.path);
    if (!artifact.description.trim() || !artifact.workstreamId.trim()) throw new Error(`Outcome record artifact ${artifact.path} requires a description and workstream id`);
    if (expectationDefinitions.length > 0 && (!artifact.expectationIds?.length || artifact.expectationIds.some((id) => !knownExpectationIds.has(id)))) throw new Error(`Outcome record artifact ${artifact.path} must map to known expectation ids`);
    if (!/^[a-f0-9]{64}$/.test(artifact.sha256)) throw new Error(`Outcome record artifact ${artifact.path} requires a SHA-256`);
  }
  const expectationResults = record.expectationResults ?? [];
  if (expectationResults.length === 0) throw new Error("Outcome record must include expectation results");
  const resultIds = new Set<string>();
  for (const result of expectationResults) {
    if (!result.expectationId.trim()) throw new Error("Outcome record expectation result requires an expectation id");
    if (resultIds.has(result.expectationId)) throw new Error(`Outcome record expectation ${result.expectationId} is duplicated`);
    resultIds.add(result.expectationId);
    if (!["passed", "failed", "skipped", "unproven"].includes(result.status)) throw new Error(`Outcome record expectation ${result.expectationId} has an invalid status`);
    requireEvidencePaths(result.evidence, `Outcome record expectation ${result.expectationId} evidence`);
    if (result.status === "passed" && result.evidence.length === 0) throw new Error(`Outcome record passed expectation ${result.expectationId} requires direct evidence`);
  }
  if (!record.expectationContractPath) throw new Error("Outcome record expectation results require expectationContractPath");
  if (expectationDefinitions.length > 0) evaluateExpectationResults(expectationDefinitions, expectationResults);
  for (const decision of record.decisions) {
    if (!decision.question.trim() || !decision.selection.trim()) throw new Error("Outcome record decisions require a question and selection");
    if (decision.evidence.length === 0 || decision.evidence.some((item) => !item.trim())) throw new Error(`Outcome record decision ${decision.question} requires evidence`);
    if (decision.tradeoffs.length === 0 || decision.uncertainty.length === 0 || decision.reversalEvidence.length === 0 || [...decision.tradeoffs, ...decision.uncertainty, ...decision.reversalEvidence].some((item) => !item.trim())) throw new Error(`Outcome record decision ${decision.question} requires tradeoffs, uncertainty, and reversal evidence`);
    requireEvidencePaths(decision.evidence, `Outcome record decision ${decision.question} evidence`);
  }
  for (const repair of record.repairs) {
    if (!repair.finding.trim() || !repair.change.trim() || !["repaired", "unresolved"].includes(repair.status)) throw new Error("Outcome record repairs require a finding, change, and valid status");
    if (repair.failureEvidence.length === 0) throw new Error(`Outcome record repair ${repair.finding} requires failure evidence`);
    requireEvidencePaths(repair.failureEvidence, `Outcome record repair ${repair.finding} failure evidence`);
    requireEvidencePaths(repair.repairEvidence, `Outcome record repair ${repair.finding} repair evidence`);
    if (repair.status === "repaired" && repair.repairEvidence.length === 0) throw new Error(`Outcome record repaired finding ${repair.finding} requires repair evidence`);
  }
  for (const approval of record.approvals) {
    if (!approval.action.trim() || !["not-requested", "requested", "approved", "denied"].includes(approval.status)) throw new Error("Outcome record approvals require an action and valid status");
    requireEvidencePaths(approval.evidence, `Outcome record approval ${approval.action} evidence`);
  }
  for (const externalAction of record.externalActions) {
    if (!externalAction.action.trim() || !["taken", "not-taken"].includes(externalAction.status)) throw new Error("Outcome record external actions require an action and valid status");
    requireEvidencePaths(externalAction.evidence, `Outcome record external action ${externalAction.action} evidence`);
    if (externalAction.status === "taken" && externalAction.evidence.length === 0) throw new Error(`Outcome record external action ${externalAction.action} requires direct evidence`);
  }
  if (!record.verification.reviewer.trim() || record.verification.independentFromImplementation !== true) throw new Error("Outcome record verification requires an independent reviewer");
  if (!["passed", "partial", "failed"].includes(record.verification.status)) throw new Error("Outcome record verification status must be passed, partial, or failed");
  if (record.status === "passed") {
    if (record.verification.status !== "passed" || !expectationResults.some((result) => result.status === "passed")) throw new Error("A passed outcome record requires passed independent verification and at least one passed expectation");
    if (record.repairs.some((repair) => repair.status === "unresolved")) throw new Error("A passed outcome record cannot contain unresolved repairs");
    if (expectationDefinitions.length > 0) {
      const evaluation = evaluateExpectationResults(expectationDefinitions, expectationResults);
      if (evaluation !== "passed") throw new Error(`A passed outcome record requires every active required expectation to pass; current result is ${evaluation}`);
    }
  }
  return record;
}

export function validateOutcomeCheckpoint(checkpoint: OutcomeCheckpoint): OutcomeCheckpoint {
  if (checkpoint.schemaVersion !== 1) throw new Error("Outcome checkpoint schemaVersion must be 1");
  if (!/^[a-z0-9][a-z0-9-]*$/.test(checkpoint.runId)) throw new Error("Outcome checkpoint runId must be a safe identifier");
  if (!/^[a-z0-9][a-z0-9-]*$/.test(checkpoint.packSlug)) throw new Error("Outcome checkpoint packSlug must be a safe identifier");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(checkpoint.completedAt) || Number.isNaN(Date.parse(checkpoint.completedAt))) throw new Error("Outcome checkpoint completedAt must be an ISO timestamp");
  requireSafeRelativePath(checkpoint.receiptPath, "Outcome checkpoint receiptPath");
  if (!["passed", "partial", "failed"].includes(checkpoint.verificationStatus)) throw new Error("Outcome checkpoint verificationStatus must be passed, partial, or failed");
  if (checkpoint.becameTrue.length === 0) throw new Error("Outcome checkpoint must record what became true");
  for (const fact of checkpoint.becameTrue) {
    if (!fact.statement.trim() || fact.evidence.length === 0 || fact.evidence.some((item) => !item.trim())) throw new Error("Every new-reality fact must have direct evidence");
  }
  if (!checkpoint.riskiestAssumption.trim()) throw new Error("Outcome checkpoint must identify the riskiest assumption");
  if (!checkpoint.nextDecision.trim()) throw new Error("Outcome checkpoint must identify the next decision");
  const remainingUnknowns = new Set(checkpoint.remainingUnknowns);
  if (remainingUnknowns.size !== checkpoint.remainingUnknowns.length || checkpoint.remainingUnknowns.some((item) => !item.trim())) throw new Error("Outcome checkpoint remaining unknowns must be unique and non-empty");
  const candidateKeys = new Set<string>();
  for (const candidate of checkpoint.candidateNextOutcomes) {
    if (!candidate.outcome.trim()) throw new Error("Candidate outcome must name the result to pursue");
    if (candidate.matchingPackSlug !== undefined && !/^[a-z0-9][a-z0-9-]*$/.test(candidate.matchingPackSlug)) throw new Error(`Candidate outcome ${candidate.outcome} matchingPackSlug must be a safe identifier`);
    const candidateKey = `${candidate.outcome}\0${candidate.matchingPackSlug ?? ""}`;
    if (candidateKeys.has(candidateKey)) throw new Error(`Candidate outcome ${candidate.outcome} is duplicated`);
    candidateKeys.add(candidateKey);
    if (!candidate.rationale.trim()) throw new Error(`Candidate outcome ${candidate.outcome} must include a rationale`);
    if (candidate.addressesUnknowns.length === 0 || candidate.addressesUnknowns.some((item) => !item.trim())) throw new Error(`Candidate outcome ${candidate.outcome} must identify the unknowns it addresses`);
    if (candidate.addressesUnknowns.some((item) => !remainingUnknowns.has(item))) throw new Error(`Candidate outcome ${candidate.outcome} must address a recorded remaining unknown`);
    if (candidate.testsAssumption !== checkpoint.riskiestAssumption) throw new Error(`Candidate outcome ${candidate.outcome} must test the recorded riskiest assumption`);
    if (candidate.approvalRequired !== true) throw new Error(`Candidate outcome ${candidate.outcome} requires fresh approval`);
    for (const forbidden of ["approved", "execute", "runPrompt", "installCommands"]) if (forbidden in candidate) throw new Error(`Candidate outcome ${candidate.outcome} cannot contain executable or approval state`);
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
  if (pack.lifecycle === "draft") throw new Error(`Outcome pack '${pack.slug}' is a draft and must be reviewed before compilation`);
  return { pack, installCommands: compileInstallCommands(pack), runPrompt: compileRunPrompt(pack) };
}
