export interface SkillReference {
  repository: string;
  lastReviewedCommit: string;
  directory: string;
}

export interface PackShowcaseImage {
  src: string;
  alt: string;
  caption?: string;
  cover?: boolean;
  evidenceRef?: string;
}

export interface PackShowcaseVideo {
  src: string;
  poster: string;
  caption?: string;
  evidenceRef?: string;
}

export interface PackShowcaseCadDownload {
  src: string;
  format: "step" | "stl" | "3mf";
  label?: string;
}

export interface PackShowcaseCad {
  preview?: string;
  poster?: string;
  caption?: string;
  downloads?: PackShowcaseCadDownload[];
  evidenceRef?: string;
}

/** Optional presentation metadata. It never changes how a pack compiles or runs. */
export interface PackShowcase {
  schemaVersion: 1;
  description?: string;
  images?: PackShowcaseImage[];
  video?: PackShowcaseVideo;
  cad?: PackShowcaseCad;
}

/** Maintainer-owned catalog trust. This never belongs in an author manifest. */
export type PackTrustStatus = "listed" | "experimental" | "verified";
export type PackStatus = PackTrustStatus;

export interface OutcomePack {
  schemaVersion: 1;
  name: string;
  promise: string;
  prompt: string;
  expectations: string[];
  skills?: SkillReference[];
  notFor?: string[];
}

export interface CompiledPack {
  pack: OutcomePack;
  installCommands: string[];
  runPrompt: string;
}
