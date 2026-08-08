import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import {
  parsePackIdentity,
  validateAcceptedPackSnapshot,
  validateFederatedRegistryEntry,
  type AcceptedPackSnapshot,
  type FederatedPackRegistryEntry,
  type Sha256Digest,
} from "./registry.js";

export interface ResolvedPackSubmission {
  snapshot: AcceptedPackSnapshot;
  rawManifest: string;
}

export type PackSourceFetcher = (url: string) => Promise<{
  ok: boolean;
  status: number;
  statusText: string;
  text(): Promise<string>;
}>;

export function computePackContentHash(content: string | Uint8Array): Sha256Digest {
  return `sha256:${createHash("sha256").update(content).digest("hex")}`;
}

export function snapshotRelativePath(contentHash: Sha256Digest): string {
  return join("snapshots", `${contentHash.slice("sha256:".length)}.json`);
}

export function githubRawPackUrl(entryInput: FederatedPackRegistryEntry): string {
  const entry = validateFederatedRegistryEntry(entryInput);
  const { owner, repository } = parsePackIdentity(entry.id);
  const path = entry.path.split("/").map(encodeURIComponent).join("/");
  return `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/${entry.revision}/${path}`;
}

/** Explicit submission-time retrieval. Normal catalog imports and builds never call this function. */
export async function fetchPackSubmission(
  entryInput: FederatedPackRegistryEntry,
  fetcher: PackSourceFetcher = globalThis.fetch,
): Promise<ResolvedPackSubmission> {
  const entry = validateFederatedRegistryEntry(entryInput);
  const url = githubRawPackUrl(entry);
  const response = await fetcher(url);
  if (!response.ok) throw new Error(`Could not fetch pack source (${response.status} ${response.statusText}) from ${url}`);
  const rawManifest = await response.text();
  const actualHash = computePackContentHash(rawManifest);
  if (actualHash !== entry.contentHash) {
    throw new Error(`Pack content hash mismatch: expected ${entry.contentHash}, received ${actualHash}`);
  }
  let manifest: unknown;
  try {
    manifest = JSON.parse(rawManifest) as unknown;
  } catch {
    throw new Error("Pack source must contain valid JSON");
  }
  const snapshot = validateAcceptedPackSnapshot({ ...entry, pack: manifest });
  return { snapshot, rawManifest };
}

const resolveInside = (root: string, relativePath: string): string => {
  const absoluteRoot = resolve(root);
  const target = resolve(absoluteRoot, relativePath);
  if (target !== absoluteRoot && !target.startsWith(`${absoluteRoot}${sep}`)) throw new Error(`Refusing to access a snapshot outside ${absoluteRoot}`);
  return target;
};

/** Freeze the exact fetched bytes. Existing content-addressed snapshots can never be overwritten with different content. */
export async function writeAcceptedPackSnapshot(submission: ResolvedPackSubmission, registryRoot: string): Promise<string> {
  const snapshot = validateAcceptedPackSnapshot(submission.snapshot);
  const actualHash = computePackContentHash(submission.rawManifest);
  if (actualHash !== snapshot.contentHash) throw new Error(`Accepted snapshot bytes do not match ${snapshot.contentHash}`);
  const path = resolveInside(registryRoot, snapshotRelativePath(snapshot.contentHash));
  await mkdir(dirname(path), { recursive: true });
  try {
    await writeFile(path, submission.rawManifest, { flag: "wx" });
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException)?.code !== "EEXIST") throw error;
    const existing = await readFile(path);
    if (computePackContentHash(existing) !== snapshot.contentHash) throw new Error(`Immutable snapshot collision at ${path}`);
  }
  return path;
}

/** Load and verify a previously accepted snapshot entirely offline. */
export async function loadAcceptedPackSnapshot(entryInput: FederatedPackRegistryEntry, registryRoot: string): Promise<AcceptedPackSnapshot> {
  const entry = validateFederatedRegistryEntry(entryInput);
  const path = resolveInside(registryRoot, snapshotRelativePath(entry.contentHash));
  const rawManifest = await readFile(path, "utf8");
  const actualHash = computePackContentHash(rawManifest);
  if (actualHash !== entry.contentHash) throw new Error(`Stored snapshot hash mismatch: expected ${entry.contentHash}, received ${actualHash}`);
  let manifest: unknown;
  try {
    manifest = JSON.parse(rawManifest) as unknown;
  } catch {
    throw new Error(`Stored snapshot is not valid JSON: ${path}`);
  }
  return validateAcceptedPackSnapshot({ ...entry, pack: manifest });
}
