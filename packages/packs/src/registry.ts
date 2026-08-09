import { validatePackManifest } from "./manifest.js";
import type { OutcomePack, PackTrustStatus } from "./types.js";

export type PackIdentity = `${string}/${string}/${string}`;
export type Sha256Digest = `sha256:${string}`;

export interface FederatedPackSource {
  source: string;
  revision: string;
  path: string;
  contentHash: Sha256Digest;
}

/** The small Git-backed record submitted to Possible. */
export interface FederatedPackRegistryEntry extends FederatedPackSource {
  schemaVersion: 1;
  id: PackIdentity;
}

/** A deterministic package snapshot. Its content digest is the bundled revision. */
export interface BundledPackSourceRecord {
  schemaVersion: 1;
  id: PackIdentity;
  source: `package:${string}`;
  revision: Sha256Digest;
  path: string;
  contentHash: Sha256Digest;
}

export type PackSourceRecord = FederatedPackRegistryEntry | BundledPackSourceRecord;

/** A maintainer-accepted run or review used to support a trust decision. */
export interface AcceptedPackEvidence {
  id: string;
  kind: "run" | "review";
  uri: string;
  contentHash: Sha256Digest;
  acceptedAt: string;
  acceptedBy: string;
  summary: string;
}

/** This record is controlled by Possible maintainers, never by the pack author. */
export interface PackTrustRecord {
  schemaVersion: 1;
  id: PackIdentity;
  status: PackTrustStatus;
  evidence: AcceptedPackEvidence[];
  updatedAt?: string;
  reason?: string;
}

/** A validated pack frozen from the exact source revision and hash in `source`. */
export interface AcceptedPackSnapshot {
  schemaVersion: 1;
  id: PackIdentity;
  source: string;
  revision: string;
  path: string;
  contentHash: Sha256Digest;
  pack: OutcomePack;
}

export type CatalogPackOrigin =
  | { kind: "bundled"; source: BundledPackSourceRecord }
  | { kind: "federated"; source: FederatedPackRegistryEntry };

export interface PackCatalogEntry {
  id: PackIdentity;
  slug: string;
  pack: OutcomePack;
  origin: CatalogPackOrigin;
  sourceRecord: PackSourceRecord;
  snapshotRef: string;
  trust: PackTrustRecord;
  acceptedEvidenceCount: number;
  acceptedEvidenceSummary: string[];
}

export interface ParsedPackIdentity {
  id: PackIdentity;
  owner: string;
  repository: string;
  slug: string;
}

const SAFE_NAMESPACE = /^[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?$/;
const SAFE_SLUG = /^[a-z0-9][a-z0-9-]*$/;
const EXACT_REVISION = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;
const SHA256 = /^sha256:[0-9a-f]{64}$/;
const SAFE_EVIDENCE_ID = /^[a-z0-9][a-z0-9._-]*$/;

const asRecord = (value: unknown, context: string): Record<string, unknown> => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${context} must be a JSON object`);
  return value as Record<string, unknown>;
};

const nonEmptyString = (value: unknown, context: string): string => {
  if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${context} must be a non-empty string`);
  return value;
};

const strictKeys = (record: Record<string, unknown>, keys: readonly string[], context: string): void => {
  const allowed = new Set(keys);
  for (const key of Object.keys(record)) if (!allowed.has(key)) throw new Error(`${context}.${key} is not supported`);
};

const safeRelativePath = (value: unknown, context: string): string => {
  const path = nonEmptyString(value, context);
  if (path.startsWith("/") || path.includes("\\") || path.includes("\0")) throw new Error(`${context} must be a safe repository-relative path`);
  const segments = path.split("/");
  if (segments.some((segment) => segment === "" || segment === "." || segment === "..")) throw new Error(`${context} must be a safe repository-relative path`);
  if (!path.endsWith(".json")) throw new Error(`${context} must point to a JSON manifest`);
  return path;
};

export function parsePackIdentity(value: unknown, context = "pack id"): ParsedPackIdentity {
  const id = nonEmptyString(value, context);
  const segments = id.split("/");
  if (segments.length !== 3) throw new Error(`${context} must use owner/repository/slug`);
  const [owner, repository, slug] = segments;
  if (!owner || !SAFE_NAMESPACE.test(owner)) throw new Error(`${context} has an invalid owner`);
  if (!repository || !SAFE_NAMESPACE.test(repository)) throw new Error(`${context} has an invalid repository`);
  if (!slug || !SAFE_SLUG.test(slug)) throw new Error(`${context} has an invalid pack slug`);
  return { id: id as PackIdentity, owner, repository, slug };
}

export function formatPackIdentity(owner: string, repository: string, slug: string): PackIdentity {
  return parsePackIdentity(`${owner}/${repository}/${slug}`).id;
}

export function validateFederatedPackSource(input: unknown, identity: PackIdentity, context = "registry entry"): FederatedPackSource {
  const source = asRecord(input, context);
  strictKeys(source, ["source", "revision", "path", "contentHash"], context);
  const { owner, repository } = parsePackIdentity(identity);
  const sourceUrl = nonEmptyString(source.source, `${context}.source`);
  let parsed: URL;
  try {
    parsed = new URL(sourceUrl);
  } catch {
    throw new Error(`${context}.source must be an https://github.com/owner/repository URL`);
  }
  if (parsed.protocol !== "https:" || parsed.hostname !== "github.com" || parsed.username || parsed.password || parsed.port || parsed.search || parsed.hash) {
    throw new Error(`${context}.source must be an https://github.com/owner/repository URL`);
  }
  const pathSegments = parsed.pathname.replace(/^\/+|\/+$/g, "").split("/");
  if (pathSegments.length !== 2 || pathSegments[0]?.toLowerCase() !== owner.toLowerCase() || pathSegments[1]?.replace(/\.git$/, "").toLowerCase() !== repository.toLowerCase()) {
    throw new Error(`${context}.source must match the owner and repository in ${identity}`);
  }
  const revision = nonEmptyString(source.revision, `${context}.revision`);
  if (!EXACT_REVISION.test(revision)) throw new Error(`${context}.revision must be an exact 40- or 64-character lowercase commit hash`);
  const path = safeRelativePath(source.path, `${context}.path`);
  const contentHash = nonEmptyString(source.contentHash, `${context}.contentHash`);
  if (!SHA256.test(contentHash)) throw new Error(`${context}.contentHash must be a sha256 digest`);
  return { source: `https://github.com/${owner}/${repository}`, revision, path, contentHash: contentHash as Sha256Digest };
}

export function validateFederatedRegistryEntry(input: unknown, context = "registry entry"): FederatedPackRegistryEntry {
  const record = asRecord(input, context);
  strictKeys(record, ["schemaVersion", "id", "source", "revision", "path", "contentHash"], context);
  if (record.schemaVersion !== 1) throw new Error(`${context}.schemaVersion must be 1`);
  const { id } = parsePackIdentity(record.id, `${context}.id`);
  const source = validateFederatedPackSource({ source: record.source, revision: record.revision, path: record.path, contentHash: record.contentHash }, id, context);
  return { schemaVersion: 1, id, ...source };
}

export function createFederatedRegistryEntry(input: {
  slug: string;
  source: string;
  revision: string;
  path: string;
  contentHash: Sha256Digest;
}): FederatedPackRegistryEntry {
  let parsed: URL;
  try {
    parsed = new URL(input.source);
  } catch {
    throw new Error("registry entry.source must be an https://github.com/owner/repository URL");
  }
  const segments = parsed.pathname.replace(/^\/+|\/+$/g, "").replace(/\.git$/, "").split("/");
  if (segments.length !== 2 || !segments[0] || !segments[1]) {
    throw new Error("registry entry.source must be an https://github.com/owner/repository URL");
  }
  return validateFederatedRegistryEntry({
    schemaVersion: 1,
    id: `${segments[0]}/${segments[1]}/${input.slug}`,
    source: input.source,
    revision: input.revision,
    path: input.path,
    contentHash: input.contentHash,
  });
}

export function validateBundledPackSourceRecord(input: unknown, expectedSlug: string, context = "bundled source"): BundledPackSourceRecord {
  const record = asRecord(input, context);
  strictKeys(record, ["schemaVersion", "id", "source", "revision", "path", "contentHash"], context);
  if (record.schemaVersion !== 1) throw new Error(`${context}.schemaVersion must be 1`);
  const { id, slug } = parsePackIdentity(record.id, `${context}.id`);
  if (slug !== expectedSlug) throw new Error(`${context}.id must end with ${expectedSlug}`);
  const source = nonEmptyString(record.source, `${context}.source`);
  if (!source.startsWith("package:") || source === "package:") throw new Error(`${context}.source must identify a package snapshot`);
  const revision = nonEmptyString(record.revision, `${context}.revision`);
  if (!SHA256.test(revision)) throw new Error(`${context}.revision must be the bundled content sha256 digest`);
  const path = safeRelativePath(record.path, `${context}.path`);
  const contentHash = nonEmptyString(record.contentHash, `${context}.contentHash`);
  if (!SHA256.test(contentHash)) throw new Error(`${context}.contentHash must be a sha256 digest`);
  if (revision !== contentHash) throw new Error(`${context}.revision must match its contentHash`);
  return {
    schemaVersion: 1,
    id,
    source: source as `package:${string}`,
    revision: revision as Sha256Digest,
    path,
    contentHash: contentHash as Sha256Digest,
  };
}

const validateAcceptedEvidence = (input: unknown, context: string): AcceptedPackEvidence => {
  const evidence = asRecord(input, context);
  strictKeys(evidence, ["id", "kind", "uri", "contentHash", "acceptedAt", "acceptedBy", "summary"], context);
  const id = nonEmptyString(evidence.id, `${context}.id`);
  if (!SAFE_EVIDENCE_ID.test(id)) throw new Error(`${context}.id must be a safe identifier`);
  if (evidence.kind !== "run" && evidence.kind !== "review") throw new Error(`${context}.kind must be run or review`);
  const contentHash = nonEmptyString(evidence.contentHash, `${context}.contentHash`);
  if (!SHA256.test(contentHash)) throw new Error(`${context}.contentHash must be a sha256 digest`);
  const acceptedAt = nonEmptyString(evidence.acceptedAt, `${context}.acceptedAt`);
  if (Number.isNaN(Date.parse(acceptedAt))) throw new Error(`${context}.acceptedAt must be an ISO date or date-time`);
  return {
    id,
    kind: evidence.kind,
    uri: nonEmptyString(evidence.uri, `${context}.uri`),
    contentHash: contentHash as Sha256Digest,
    acceptedAt,
    acceptedBy: nonEmptyString(evidence.acceptedBy, `${context}.acceptedBy`),
    summary: nonEmptyString(evidence.summary, `${context}.summary`),
  };
};

export function validatePackTrustRecord(input: unknown, expectedId?: PackIdentity, context = "trust record"): PackTrustRecord {
  const record = asRecord(input, context);
  strictKeys(record, ["schemaVersion", "id", "status", "evidence", "updatedAt", "reason"], context);
  if (record.schemaVersion !== 1) throw new Error(`${context}.schemaVersion must be 1`);
  const { id } = parsePackIdentity(record.id, `${context}.id`);
  if (expectedId !== undefined && id !== expectedId) throw new Error(`${context}.id must match ${expectedId}`);
  if (record.status !== "listed" && record.status !== "experimental" && record.status !== "verified") {
    throw new Error(`${context}.status must be listed, experimental, or verified`);
  }
  if (!Array.isArray(record.evidence)) throw new Error(`${context}.evidence must be a JSON array`);
  const evidence = record.evidence.map((item, index) => validateAcceptedEvidence(item, `${context}.evidence[${index}]`));
  if (new Set(evidence.map(({ id: evidenceId }) => evidenceId)).size !== evidence.length) throw new Error(`${context}.evidence contains duplicate ids`);
  if (record.status === "verified" && !evidence.some(({ kind }) => kind === "run")) {
    throw new Error(`${context} cannot be verified without accepted run evidence`);
  }
  const updatedAt = record.updatedAt === undefined ? undefined : nonEmptyString(record.updatedAt, `${context}.updatedAt`);
  if (updatedAt !== undefined && Number.isNaN(Date.parse(updatedAt))) throw new Error(`${context}.updatedAt must be an ISO date or date-time`);
  const reason = record.reason === undefined ? undefined : nonEmptyString(record.reason, `${context}.reason`);
  const trust: PackTrustRecord = {
    schemaVersion: 1,
    id,
    status: record.status,
    evidence,
  };
  if (updatedAt !== undefined) trust.updatedAt = updatedAt;
  if (reason !== undefined) trust.reason = reason;
  return trust;
}

export function defaultPackTrust(id: PackIdentity): PackTrustRecord {
  return {
    schemaVersion: 1,
    id,
    status: "listed",
    evidence: [],
  };
}

/** Authorship never assigns catalog trust; maintainers own this separate record. */
export function validatePackTrustForManifest(trustInput: PackTrustRecord, _pack?: OutcomePack, context = "catalog trust"): PackTrustRecord {
  return validatePackTrustRecord(trustInput, trustInput.id, context);
}

export function validateAcceptedPackSnapshot(input: unknown, context = "accepted snapshot"): AcceptedPackSnapshot {
  const snapshot = asRecord(input, context);
  strictKeys(snapshot, ["schemaVersion", "id", "source", "revision", "path", "contentHash", "pack"], context);
  if (snapshot.schemaVersion !== 1) throw new Error(`${context}.schemaVersion must be 1`);
  const { id } = parsePackIdentity(snapshot.id, `${context}.id`);
  const source = validateFederatedPackSource({ source: snapshot.source, revision: snapshot.revision, path: snapshot.path, contentHash: snapshot.contentHash }, id, context);
  const pack = validatePackManifest(snapshot.pack, `${context}.pack`);
  return { schemaVersion: 1, id, ...source, pack };
}

export interface BuildPackCatalogInput {
  bundledPacks?: readonly { slug: string; pack: OutcomePack }[];
  bundledSources?: Readonly<Record<string, BundledPackSourceRecord>>;
  acceptedSnapshots?: readonly AcceptedPackSnapshot[];
  trustRecords?: readonly PackTrustRecord[];
  bundledOwner?: string;
  bundledRepository?: string;
}

/** Build one catalog from bundled packs and immutable federated snapshots. No network access occurs here. */
export function buildPackCatalog({
  bundledPacks = [],
  bundledSources = {},
  acceptedSnapshots = [],
  trustRecords = [],
  bundledOwner = "fraylabs",
  bundledRepository = "possible",
}: BuildPackCatalogInput): PackCatalogEntry[] {
  const trustById = new Map<PackIdentity, PackTrustRecord>();
  for (const trustInput of trustRecords) {
    const trust = validatePackTrustRecord(trustInput);
    if (trustById.has(trust.id)) throw new Error(`Duplicate trust record for ${trust.id}`);
    trustById.set(trust.id, trust);
  }

  const entries: PackCatalogEntry[] = [];
  for (const [index, bundled] of bundledPacks.entries()) {
    if (!SAFE_SLUG.test(bundled.slug)) throw new Error(`bundledPacks[${index}].slug must be a lowercase hyphenated identifier`);
    const slug = bundled.slug;
    const pack = validatePackManifest(bundled.pack, `bundledPacks[${index}].pack`);
    const id = formatPackIdentity(bundledOwner, bundledRepository, slug);
    const sourceInput = bundledSources[slug];
    if (sourceInput === undefined) throw new Error(`Bundled pack ${slug} requires deterministic snapshot metadata`);
    const sourceRecord = validateBundledPackSourceRecord(sourceInput, slug, `bundledSources.${slug}`);
    if (sourceRecord.id !== id) throw new Error(`bundledSources.${slug}.id must match ${id}`);
    const trust = validatePackTrustForManifest(trustById.get(id) ?? defaultPackTrust(id), pack, `catalog trust for ${id}`);
    entries.push({
      id,
      slug,
      pack,
      origin: { kind: "bundled", source: sourceRecord },
      sourceRecord,
      snapshotRef: sourceRecord.path,
      trust,
      acceptedEvidenceCount: trust.evidence.length,
      acceptedEvidenceSummary: trust.evidence.map(({ summary }) => summary),
    });
  }
  for (const [index, snapshotInput] of acceptedSnapshots.entries()) {
    const snapshot = validateAcceptedPackSnapshot(snapshotInput, `acceptedSnapshots[${index}]`);
    const { slug } = parsePackIdentity(snapshot.id);
    const trust = validatePackTrustForManifest(
      trustById.get(snapshot.id) ?? defaultPackTrust(snapshot.id),
      snapshot.pack,
      `catalog trust for ${snapshot.id}`,
    );
    entries.push({
      id: snapshot.id,
      slug,
      pack: snapshot.pack,
      origin: {
        kind: "federated",
        source: {
          schemaVersion: 1,
          id: snapshot.id,
          source: snapshot.source,
          revision: snapshot.revision,
          path: snapshot.path,
          contentHash: snapshot.contentHash,
        },
      },
      sourceRecord: {
        schemaVersion: 1,
        id: snapshot.id,
        source: snapshot.source,
        revision: snapshot.revision,
        path: snapshot.path,
        contentHash: snapshot.contentHash,
      },
      snapshotRef: `snapshots/${snapshot.contentHash.slice("sha256:".length)}.json`,
      trust,
      acceptedEvidenceCount: trust.evidence.length,
      acceptedEvidenceSummary: trust.evidence.map(({ summary }) => summary),
    });
  }
  const ids = new Set<PackIdentity>();
  for (const entry of entries) {
    if (ids.has(entry.id)) throw new Error(`Duplicate pack identity ${entry.id}`);
    ids.add(entry.id);
  }
  for (const trustId of trustById.keys()) if (!ids.has(trustId)) throw new Error(`Trust record has no catalog pack: ${trustId}`);
  return entries;
}
