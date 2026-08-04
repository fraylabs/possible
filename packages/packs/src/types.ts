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

export type FunctionalHardwareModuleId =
  | "battery"
  | "mains-high-energy"
  | "motion"
  | "thermal"
  | "living-contact"
  | "wireless-networked"
  | "health-claims";

export interface FunctionalHardwareModule {
  id: FunctionalHardwareModuleId;
  activationWhen: string;
  earlyHardStops: string[];
  revisionChecks: string[];
  requiredExpectationIds: string[];
}

export interface FunctionalHardwarePrototypeContract {
  kind: "functional-hardware-prototype";
  contractPath: string;
  moduleDecisionPath: string;
  buildRoot: string;
  measurementPath: string;
  safetyRevisionPath: string;
  decisionReceiptPath: string;
  modules: FunctionalHardwareModule[];
  decisions: ["working", "repair-required", "no-go"];
}

export type LaunchContentModuleId =
  | "text-post"
  | "static-visual"
  | "carousel"
  | "short-video"
  | "long-video"
  | "thread";

export interface LaunchContentModule {
  id: LaunchContentModuleId;
  activationWhen: string;
  deliverables: string[];
  productionChecks: string[];
  requiredExpectationIds: string[];
}

export interface LaunchContentPackageContract {
  kind: "launch-content-package";
  minimumActiveModules: 1;
  briefPath: string;
  moduleDecisionPath: string;
  assetRoot: string;
  manifestPath: string;
  decisionReceiptPath: string;
  modules: LaunchContentModule[];
  decisions: ["ready", "repair-required", "no-go"];
}

export interface CrowdfundingCampaignReadinessContract {
  kind: "crowdfunding-campaign-readiness";
  baselinePath: string;
  economicsPath: string;
  campaignPackagePath: string;
  decisionReceiptPath: string;
  decisions: ["ready-for-platform-review", "repair-required", "no-go"];
}

export interface ManufacturingReadinessContract {
  kind: "manufacturing-readiness";
  baselinePath: string;
  rfqPath: string;
  compliancePath: string;
  pilotPath: string;
  decisionReceiptPath: string;
  decisions: ["ready", "repair-required", "no-go"];
}

export interface StudyReadinessContract {
  kind: "study-readiness";
  researchQuestionPath: string;
  protocolPath: string;
  ethicsPath: string;
  analysisPath: string;
  decisionReceiptPath: string;
  decisions: ["ready-for-qualified-review", "repair-required", "no-go"];
}

export interface ModularOutcomeModule {
  id: string;
  activationWhen: string;
  work: string[];
  checks: string[];
  requiredExpectationIds: string[];
}

export interface ModularOutcomeContract {
  kind: "modular-outcome";
  gateName: string;
  action: string;
  contractPath: string;
  moduleDecisionPath: string;
  artifactRoot: string;
  decisionReceiptPath: string;
  minimumActiveModules: number;
  modules: ModularOutcomeModule[];
  decisions: string[];
  steps: string[];
  completionBoundary: string;
}

export interface MechanicalCadReviewContract {
  kind: "mechanical-cad-review";
  requirementsPath: string;
  interfaceProofPath: string;
  vendorPackagePath: string;
  fitCouponPath: string;
  decisionReceiptPath: string;
  decisions: ["review-ready", "repair-required", "no-go"];
}

export type ExpectationLevel = "required" | "preferred";
export type ExpectationSource = "pack" | "user" | "inferred";

export interface PackExpectation {
  id: string;
  moduleId?: string;
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

export type PackStatus = "stable" | "experimental" | "archived";

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
  /** Internal catalog metadata retained for registry compatibility; it never changes run semantics. */
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
  archived?: ArchivedPackMetadata;
  crowdfundingCampaignReadiness?: CrowdfundingCampaignReadinessContract;
  decisionRationale?: DecisionRationaleContract;
  functionalHardwarePrototype?: FunctionalHardwarePrototypeContract;
  hardwarePrototype?: HardwarePrototypeContract;
  launchContentPackage?: LaunchContentPackageContract;
  mechanicalCadReview?: MechanicalCadReviewContract;
  manufacturingReadiness?: ManufacturingReadinessContract;
  modularOutcome?: ModularOutcomeContract;
  studyReadiness?: StudyReadinessContract;
  expectations?: PackExpectation[];
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
  activeModules?: string[];
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
