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

export interface ChainExitContract {
  receiptPath: string;
  advanceStatuses: string[];
  pauseStatuses: string[];
  stopStatuses: string[];
}

export interface ChainEntryRequirement {
  id: string;
  description: string;
  requiredEvidence: string[];
  satisfyWithPack?: string;
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
  chainExit?: ChainExitContract;
  chainEntry?: ChainEntryRequirement[];
}

export interface CompiledPack {
  pack: OutcomePack;
  installCommands: string[];
  runPrompt: string;
}

export interface ChainHandoff {
  from: string;
  to: string;
  exit: ChainExitContract;
  entry: ChainEntryRequirement[];
}

export interface CompiledChain {
  packs: OutcomePack[];
  handoffs: ChainHandoff[];
  runPrompt: string;
}
