export interface SkillSource {
  id: string;
  name: string;
  role: string;
  repository: string;
  installSource?: string;
  skill: string;
  catalogUrl?: string;
  reviewedRevision: string;
  reviewUrl: string;
}

export interface ScheduleContract {
  request: string;
  title: string;
  description: string;
  safeDefault: string;
}

export interface PluginCapability {
  id: string;
  name: string;
  role: string;
  provider: string;
  invocation: string;
  skills: string[];
  reviewedVersion: string;
  docsUrl: string;
  availability: string;
}

export interface Workstream {
  id: string;
  name: string;
  skills: string[];
  owns: string[];
  brief: string;
  dependsOn?: string[];
  activation?: string;
}

export interface RemixContract {
  kind: "visual-direction" | "physical-direction";
  workstreamId: string;
  candidateCount: 3;
  previewRoot: string;
  decisionPath: string;
  onNoChoice: "agent-select";
  preserves: string[];
}

export interface HardwarePrototypeContract {
  kind: "measured-functional-prototype";
  specificationPath: string;
  hazardPath: string;
  claimsPath: string;
  measurementPath: string;
  decisionReceiptPath: string;
  measurementClasses: ["functional output", "control input", "power", "temperature", "noise", "duty cycle", "failure controls", "measurement uncertainty"];
  decisions: ["working", "repair-required", "no-go"];
}

export interface DecisionRationaleContract {
  kind: "evidence-backed-product-decisions";
  rootPath: string;
  publicNarrativePath: string;
  requiredFields: ["question", "options", "evidence", "selection", "rationale", "tradeoffs", "uncertainty", "reversal evidence", "public explanation"];
}

export interface OutcomePrerequisite {
  id: string;
  description: string;
  requiredEvidence: string[];
}

export interface OpportunityDiscoveryContract {
  kind: "opportunity-discovery";
  candidateRange: [3, 5];
  opportunityBriefPath: string;
  decisionReceiptPath: string;
  decisions: ["select", "broaden", "stop"];
}

export interface FirstCustomerSprintContract {
  kind: "resumable-commercial-evidence";
  evidenceLadder: ["reply", "conversation", "qualified problem", "demo requested", "pilot agreed", "payment attempted", "payment received", "repeat use"];
  statePath: string;
  cycleRoot: string;
  decisionReceiptPath: string;
  resumeCommand: "$possible resume";
  waitingStates: ["awaiting-approval", "awaiting-participants", "awaiting-observation"];
  decisions: ["continue", "revise", "stop"];
}

export type PackLane = "create" | "launch" | "release" | "operate";

export interface OutcomePack {
  schemaVersion: 1;
  catalogNumber: number;
  lane: PackLane;
  slug: string;
  name: string;
  eyebrow: string;
  promise: string;
  summary: string;
  useWhen: string[];
  notFor: string[];
  reviewedAt: string;
  artifactRoot?: string;
  schedule?: ScheduleContract;
  skills: SkillSource[];
  plugins?: PluginCapability[];
  workstreams: Workstream[];
  reviewSkills: string[];
  outputs: string[];
  guardrails: string[];
  verification: string[];
  decisionRationale?: DecisionRationaleContract;
  hardwarePrototype?: HardwarePrototypeContract;
  remix?: RemixContract;
  prerequisites?: OutcomePrerequisite[];
  firstCustomerSprint?: FirstCustomerSprintContract;
  opportunityDiscovery?: OpportunityDiscoveryContract;
}

export interface CompiledPack {
  pack: OutcomePack;
  installCommands: string[];
  runPrompt: string;
}

export interface EvidenceBackedFact {
  statement: string;
  evidence: string[];
}

export type OutcomeProofStatus = "passed" | "failed" | "skipped" | "unproven";

export interface OutcomeProofRecord {
  claim: string;
  status: OutcomeProofStatus;
  evidence: string[];
}

export interface OutcomeArtifactRecord {
  path: string;
  description: string;
  workstreamId: string;
  sha256: string;
}

export interface OutcomeDecisionRecord {
  question: string;
  selection: string;
  evidence: string[];
  tradeoffs: string[];
  uncertainty: string[];
  reversalEvidence: string[];
}

export interface OutcomeRepairRecord {
  finding: string;
  failureEvidence: string[];
  change: string;
  repairEvidence: string[];
  status: "repaired" | "unresolved";
}

export interface OutcomeApprovalRecord {
  action: string;
  status: "not-requested" | "requested" | "approved" | "denied";
  evidence: string[];
}

export interface OutcomeExternalActionRecord {
  action: string;
  status: "taken" | "not-taken";
  evidence: string[];
}

export interface OutcomeRecord {
  schemaVersion: 1;
  runId: string;
  packSlug: string;
  status: "passed" | "partial" | "failed";
  completedAt: string;
  outcomeBriefPath: string;
  packSnapshotPath: string;
  skillLockPath: string;
  workspaceRevision: string;
  artifacts: OutcomeArtifactRecord[];
  proofs: OutcomeProofRecord[];
  decisions: OutcomeDecisionRecord[];
  repairs: OutcomeRepairRecord[];
  approvals: OutcomeApprovalRecord[];
  externalActions: OutcomeExternalActionRecord[];
  limitations: string[];
  verification: {
    reviewer: string;
    independentFromImplementation: true;
    reportPath: string;
    status: "passed" | "partial" | "failed";
  };
  checkpointPath: string;
}

export interface CandidateOutcomeRecommendation {
  outcome: string;
  matchingPackSlug?: string;
  rationale: string;
  addressesUnknowns: string[];
  testsAssumption: string;
  approvalRequired: true;
}

export interface OutcomeCheckpoint {
  schemaVersion: 1;
  runId: string;
  packSlug: string;
  completedAt: string;
  receiptPath: string;
  verificationStatus: "passed" | "partial" | "failed";
  becameTrue: EvidenceBackedFact[];
  remainingUnknowns: string[];
  riskiestAssumption: string;
  nextDecision: string;
  candidateNextOutcomes: CandidateOutcomeRecommendation[];
}

export interface OutcomeJourneyHistory {
  schemaVersion: 1;
  originalAmbition: string;
  completedOutcomes: OutcomeCheckpoint[];
}
