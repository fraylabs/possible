export interface SkillSource {
  id: string;
  name: string;
  role: string;
  repository: string;
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
}

export interface OutcomePack {
  schemaVersion: 1;
  slug: string;
  name: string;
  eyebrow: string;
  promise: string;
  summary: string;
  reviewedAt: string;
  skills: SkillSource[];
  workstreams: Workstream[];
  outputs: string[];
  guardrails: string[];
  verification: string[];
}

export interface CompiledPack {
  pack: OutcomePack;
  installCommands: string[];
  runPrompt: string;
}
