import bundledSnapshotRecords from "./bundled-snapshots.json" with { type: "json" };
import bundledTrustRecords from "./bundled-trust.json" with { type: "json" };
import federatedCatalogRecords from "./federated-catalog.json" with { type: "json" };
import { bundledOutcomePacks } from "./manifest.js";
import {
  buildPackCatalog,
  validateAcceptedPackSnapshot,
  validateBundledPackSourceRecord,
  validatePackTrustRecord,
  type BundledPackSourceRecord,
  type PackCatalogEntry,
  type PackIdentity,
} from "./registry.js";

/** Presentation metadata for the public catalog; it is not part of a pack contract. */
export interface PublicCatalogEntry extends PackCatalogEntry {
  catalogNumber: number;
}

if (federatedCatalogRecords.schemaVersion !== 1) throw new Error("Federated catalog schemaVersion must be 1");

const bundledSources: Record<string, BundledPackSourceRecord> = Object.fromEntries(
  Object.entries(bundledSnapshotRecords).map(([slug, record]) => [slug, validateBundledPackSourceRecord(record, slug)]),
);
const acceptedSnapshots = federatedCatalogRecords.acceptedSnapshots.map((snapshot, index) => (
  validateAcceptedPackSnapshot(snapshot, `federatedCatalog.acceptedSnapshots[${index}]`)
));
const trustRecords = [
  ...Object.values(bundledTrustRecords),
  ...federatedCatalogRecords.trustRecords,
].map((trust, index) => validatePackTrustRecord(trust, undefined, `catalog.trustRecords[${index}]`));

export const publicCatalog: PublicCatalogEntry[] = buildPackCatalog({
  bundledPacks: bundledOutcomePacks,
  bundledSources,
  acceptedSnapshots,
  trustRecords,
}).map((entry, index) => ({
  ...entry,
  catalogNumber: index + 1,
}));

export function getCatalogEntry(idOrSlug: PackIdentity | string): PublicCatalogEntry | undefined {
  const exactIdentity = publicCatalog.find(({ id }) => id === idOrSlug);
  if (exactIdentity) return exactIdentity;
  const slugMatches = publicCatalog.filter(({ slug }) => slug === idOrSlug);
  return slugMatches.length === 1 ? slugMatches[0] : undefined;
}

export function getCatalogNumber(idOrSlug: PackIdentity | string): number {
  const entry = getCatalogEntry(idOrSlug);
  if (entry === undefined) throw new Error(`Public catalog has no unique entry for ${idOrSlug}`);
  return entry.catalogNumber;
}
