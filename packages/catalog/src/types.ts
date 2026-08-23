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

export type CompanyId = string;
export type ProductId = `${string}/${string}`;

export interface CompanyRecord {
  schemaVersion: 1;
  id: CompanyId;
  name: string;
  website: string;
}

export type ProductCategory = "video" | "audio" | "3d" | "robotics";

export interface ProductRecord {
  schemaVersion: 1;
  id: ProductId;
  name: string;
  company: CompanyId;
  category: ProductCategory;
  summary: string;
  summarySourceUrl: string;
  logoUrl: string;
  website: string;
  docsUrl: string;
}

export interface ResolvedProduct extends Omit<ProductRecord, "company"> {
  company: CompanyRecord;
}

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

export interface OutcomeManifest {
  schemaVersion: 3;
  slug: string;
  files: OutcomeFiles;
  authoredAt: string | null;
  author: OutcomeAuthor;
  models: OutcomeModel[];
  requirements: string[];
  skills?: SkillReference[];
  products?: ProductId[];
  inputs?: OutcomeFile[];
  artifacts?: OutcomeFile[];
  preview?: OutcomePreview;
}

export interface Outcome extends OutcomeManifest {
  title: string;
  summary: string;
  aboutMarkdown: string;
  executionPrompt: string;
  originalPrompt?: string;
}

export interface OutcomeCatalogEntry {
  slug: string;
  outcome: Outcome;
  products: ResolvedProduct[];
  catalogNumber: number;
  sourceUrl: string;
}
