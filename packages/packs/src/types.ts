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
  kind: "visual-direction";
  workstreamId: string;
  candidateCount: 3;
  previewRoot: string;
  decisionPath: string;
  onNoChoice: "agent-select";
  preserves: string[];
}

export interface OutcomePrerequisite {
  id: string;
  description: string;
  requiredEvidence: string[];
}

export interface AdaptiveValidationContract {
  kind: "riskiest-assumption-first";
  dimensions: string[];
  assumptionMapPath: string;
  experimentRoot: string;
  decisionReceiptPath: string;
  decisions: ["pursue", "revise", "stop"];
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
  remix?: RemixContract;
  prerequisites?: OutcomePrerequisite[];
  adaptiveValidation?: AdaptiveValidationContract;
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
