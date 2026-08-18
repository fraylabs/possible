import type { PackCatalogEntry, PackTrustStatus, ResolvedProduct } from "@possible/packs";

export type McpCatalogEntry = PackCatalogEntry & { catalogNumber?: number };

export interface CatalogSourceMetadata {
  origin: "bundled" | "federated";
  locator: string;
  revision: string;
  path: string;
  contentHash: string;
  snapshotRef: string;
  manifestUrl: string;
}

export interface CatalogTrustMetadata {
  status: PackTrustStatus;
  updatedAt: string | null;
  reason: string | null;
}

export interface CatalogEvidenceMetadata {
  acceptedCount: number;
  summaries: string[];
}

export interface NormalizedCatalogMetadata {
  id: string;
  source: CatalogSourceMetadata;
  trust: CatalogTrustMetadata;
  evidence: CatalogEvidenceMetadata;
}

export interface CatalogProductMetadata {
  id: string;
  name: string;
  company: { id: string; name: string };
  summary: string;
  website: string;
  docsUrl: string;
  commerce: ResolvedProduct["commerce"];
}

export function normalizeProductMetadata(product: ResolvedProduct): CatalogProductMetadata {
  return {
    id: product.id,
    name: product.name,
    company: { id: product.company.id, name: product.company.name },
    summary: product.summary,
    website: product.website,
    docsUrl: product.docsUrl,
    commerce: product.commerce,
  };
}

const bundledManifestUrl = (path: string): string =>
  `https://github.com/fraylabs/possible/blob/main/packages/packs/src/${path}`;

export function normalizeCatalogMetadata(entry: McpCatalogEntry): NormalizedCatalogMetadata {
  const { sourceRecord } = entry;
  const manifestUrl = entry.origin.kind === "federated"
    ? `${sourceRecord.source}/blob/${sourceRecord.revision}/${sourceRecord.path}`
    : bundledManifestUrl(sourceRecord.path);
  return {
    id: entry.id,
    source: {
      origin: entry.origin.kind,
      locator: sourceRecord.source,
      revision: sourceRecord.revision,
      path: sourceRecord.path,
      contentHash: sourceRecord.contentHash,
      snapshotRef: entry.snapshotRef,
      manifestUrl,
    },
    trust: {
      status: entry.trust.status,
      updatedAt: entry.trust.updatedAt ?? null,
      reason: entry.trust.reason ?? null,
    },
    evidence: {
      acceptedCount: entry.acceptedEvidenceCount,
      summaries: [...entry.acceptedEvidenceSummary],
    },
  };
}

export type CatalogLookup =
  | { kind: "found"; entry: McpCatalogEntry }
  | { kind: "missing" }
  | { kind: "ambiguous"; matchingIds: string[] };

/** Namespaced ids are exact. A short slug is accepted only when unique. */
export function lookupCatalogEntry(catalog: readonly McpCatalogEntry[], idOrSlug: string): CatalogLookup {
  const byId = catalog.find(({ id }) => id === idOrSlug);
  if (byId !== undefined) return { kind: "found", entry: byId };
  const bySlug = catalog.filter(({ slug }) => slug === idOrSlug);
  if (bySlug.length === 0) return { kind: "missing" };
  if (bySlug.length > 1) return { kind: "ambiguous", matchingIds: bySlug.map(({ id }) => id).sort() };
  return { kind: "found", entry: bySlug[0]! };
}

export const unprefixedSha256 = (digest: string): string => digest.replace(/^sha256:/, "");
