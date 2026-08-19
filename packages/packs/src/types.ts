export interface SkillReference {
  repository: string;
  lastReviewedCommit: string;
  directory: string;
}

export type CompanyId = string;
export type ProductId = `${string}/${string}`;

export interface CompanyRecord {
  schemaVersion: 1;
  id: CompanyId;
  name: string;
  website: string;
}

export type ProductAvailability = "free" | "paid" | "contact-sales" | "unavailable" | "unknown";
export type AgentCheckoutSupport = "not-required" | "supported" | "manual-only" | "not-supported" | "unknown";

export interface ProductCommerce {
  availability: ProductAvailability;
  agentCheckout: AgentCheckoutSupport;
  methods: string[];
  pricingUrl: string | null;
}

export interface ProductRecord {
  schemaVersion: 1;
  id: ProductId;
  name: string;
  company: CompanyId;
  summary: string;
  summarySourceUrl: string;
  logoUrl: string;
  website: string;
  docsUrl: string;
  commerce: ProductCommerce;
}

export interface ResolvedProduct extends Omit<ProductRecord, "company"> {
  company: CompanyRecord;
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
  expectations?: string[];
  skills?: SkillReference[];
  products?: ProductId[];
  notFor?: string[];
}

export interface CompiledPack {
  pack: OutcomePack;
  installCommands: string[];
  runPrompt: string;
}
