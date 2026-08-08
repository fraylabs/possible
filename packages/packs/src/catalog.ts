import bundledSnapshotRecords from "./bundled-snapshots.json" with { type: "json" };
import bundledTrustRecords from "./bundled-trust.json" with { type: "json" };
import federatedCatalogRecords from "./federated-catalog.json" with { type: "json" };
import { publicOutcomePacks } from "./manifest.js";
import { buildPackCatalog, type AcceptedPackSnapshot, type BundledPackSourceRecord, type PackCatalogEntry, type PackIdentity, type PackTrustRecord } from "./registry.js";

/** Presentation metadata for the public catalog; it is not part of a pack contract. */
export interface PublicCatalogEntry extends PackCatalogEntry {
  catalogNumber: number;
}

if (federatedCatalogRecords.schemaVersion !== 1) throw new Error("Federated catalog schemaVersion must be 1");

export const publicCatalog: PublicCatalogEntry[] = buildPackCatalog({
  bundledPacks: publicOutcomePacks,
  bundledSources: bundledSnapshotRecords as Record<string, BundledPackSourceRecord>,
  acceptedSnapshots: federatedCatalogRecords.acceptedSnapshots as AcceptedPackSnapshot[],
  trustRecords: [
    ...Object.values(bundledTrustRecords) as PackTrustRecord[],
    ...federatedCatalogRecords.trustRecords as PackTrustRecord[],
  ],
}).map((entry, index) => ({
  ...entry,
  catalogNumber: index + 1,
}));

export function getCatalogEntry(idOrSlug: PackIdentity | string): PublicCatalogEntry | undefined {
  const exactIdentity = publicCatalog.find(({ id }) => id === idOrSlug);
  if (exactIdentity) return exactIdentity;
  const slugMatches = publicCatalog.filter(({ pack }) => pack.slug === idOrSlug);
  return slugMatches.length === 1 ? slugMatches[0] : undefined;
}

export function getCatalogNumber(idOrSlug: PackIdentity | string): number {
  const entry = getCatalogEntry(idOrSlug);
  if (entry === undefined) throw new Error(`Public catalog has no unique entry for ${idOrSlug}`);
  return entry.catalogNumber;
}
