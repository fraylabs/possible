export interface SkillReference {
  repository: string;
  lastReviewedCommit: string;
  directory: string;
}

export interface OutcomeAuthor {
  name: string;
  url: string;
}

export type OutcomeModelRole = "authorship" | "execution" | "review";

export interface OutcomeModel {
  provider: string;
  model: string;
  agent?: string;
  role: OutcomeModelRole;
}

export type ProductId = `${string}/${string}`;

export interface OutcomePreviewImage {
  src: string;
  alt: string;
  caption?: string;
  cover?: boolean;
}

export interface OutcomePreviewVideo {
  src: string;
  poster?: string;
  caption?: string;
}

export interface OutcomePreviewAudio {
  src: string;
  poster?: string;
  caption?: string;
}

export interface OutcomePreviewCadDownload {
  src: string;
  format: "step" | "stl" | "3mf";
  label?: string;
}

export interface OutcomePreviewCad {
  preview?: string;
  poster?: string;
  caption?: string;
  downloads?: OutcomePreviewCadDownload[];
}

export interface OutcomePreview {
  description?: string;
  images?: OutcomePreviewImage[];
  video?: OutcomePreviewVideo;
  audio?: OutcomePreviewAudio;
  cad?: OutcomePreviewCad;
}

export type OutcomeFileType = "image" | "video" | "audio" | "cad" | "document" | "data" | "source" | "archive" | "other";

export interface OutcomeFile {
  type: OutcomeFileType;
  src: string;
  label: string;
  format?: string;
}

export interface OutcomeFiles {
  about: "outcome.md";
  prompt: "prompt.md";
}

export interface ProductAttribution {
  kind: "product";
  id: ProductId;
}

export interface SkillAttribution extends SkillReference {
  kind: "skill";
}

export type OutcomeAttribution = ProductAttribution | SkillAttribution;

export interface OutcomeManifest {
  schemaVersion: 4;
  slug: string;
  files: OutcomeFiles;
  authoredAt: string | null;
  author: OutcomeAuthor;
  models: OutcomeModel[];
  requirements: string[];
  primary: OutcomeAttribution;
  secondary?: OutcomeAttribution[];
  inputs?: OutcomeFile[];
  artifacts?: OutcomeFile[];
  preview?: OutcomePreview;
}
