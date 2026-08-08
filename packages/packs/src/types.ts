export interface SkillSource {
  id: string;
  name: string;
  role: string;
  repository: string;
  installSource?: string;
  installMode?: "selective" | "full-depth";
  skill: string;
  catalogUrl?: string;
  reviewedRevision: string;
  reviewUrl: string;
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

export type ExpectationLevel = "required" | "preferred";
export type ExpectationSource = "pack" | "user" | "inferred";

export interface PackExpectation {
  id: string;
  statement: string;
  level?: ExpectationLevel;
  failureModes: string[];
  requiredEvidence: string[];
}

export interface OutcomeExpectation extends PackExpectation {
  source: ExpectationSource;
  level: ExpectationLevel;
  active: boolean;
  activationEvidence: string[];
}

export interface OutcomeExpectationContract {
  schemaVersion: 1;
  runId: string;
  packSlug: string;
  frozenAt: string;
  expectations: OutcomeExpectation[];
}

export interface ArchivedPackMetadata {
  archivedAt: string;
  reason: string;
  replacementSlugs: string[];
}

/** Maintainer-owned catalog trust. This never belongs in an author manifest. */
export type PackTrustStatus = "listed" | "experimental" | "verified" | "archived";
export type PackStatus = PackTrustStatus;
export type PackVisibility = "private" | "public";
export type PackLifecycle = "draft" | "reviewed" | "archived";

export type PackLane = "create" | "launch" | "release" | "operate";

export interface OutcomePack {
  schemaVersion: 1;
  packVersion: string;
  visibility: PackVisibility;
  lifecycle: PackLifecycle;
  lane: PackLane;
  slug: string;
  name: string;
  eyebrow: string;
  promise: string;
  summary: string;
  useWhen: string[];
  notFor: string[];
  reviewedAt?: string;
  skills: SkillSource[];
  workstreams: Workstream[];
  reviewSkills: string[];
  outputs: string[];
  guardrails: string[];
  verification: string[];
  archived?: ArchivedPackMetadata;
  expectations?: PackExpectation[];
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

export type ExpectationResultStatus = "passed" | "failed" | "skipped" | "unproven";

export interface ExpectationResult {
  expectationId: string;
  status: ExpectationResultStatus;
  evidence: string[];
  finding?: string;
}

export type ExpectationEvaluation = "passed" | "failed" | "unproven";

export interface OutcomeArtifactRecord {
  path: string;
  description: string;
  workstreamId: string;
  expectationIds?: string[];
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
  expectationContractPath: string;
  expectationResults: ExpectationResult[];
  artifacts: OutcomeArtifactRecord[];
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
