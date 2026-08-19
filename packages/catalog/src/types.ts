export interface SkillReference {
  repository: string;
  lastReviewedCommit: string;
  directory: string;
}

export interface OutcomeAuthor {
  name: string;
  url: string;
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
  poster: string;
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

export interface Outcome {
  schemaVersion: 1;
  title: string;
  summary: string;
  prompt: string;
  author: OutcomeAuthor;
  skills?: SkillReference[];
  products?: ProductId[];
  preview?: OutcomePreview;
}

export interface OutcomeCatalogEntry {
  slug: string;
  outcome: Outcome;
  products: ResolvedProduct[];
  catalogNumber: number;
  sourceUrl: string;
}
