import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  buildPackCatalog,
  bundledOutcomePacks,
  getPackStatus,
  parsePackIdentity,
  publicCatalog,
  validateFederatedRegistryEntry,
  validatePackManifest,
  validatePackTrustRecord,
  verifiedOutcomePacks,
} from "../dist/index.js";
import {
  computePackContentHash,
  fetchPackSubmission,
  githubRawPackUrl,
  loadAcceptedPackSnapshot,
  snapshotRelativePath,
  writeAcceptedPackSnapshot,
} from "../dist/submission.js";

const externalManifest = () => {
  const pack = structuredClone(bundledOutcomePacks[0].pack);
  pack.name = "External Launch Film";
  return pack;
};

const sourceEntry = (rawManifest) => ({
  schemaVersion: 1,
  id: "outside-author/outcome-library/external-launch-film",
  source: "https://github.com/outside-author/outcome-library",
  revision: "a".repeat(40),
  path: "packs/external-launch-film.json",
  contentHash: computePackContentHash(rawManifest),
});

const acceptedEvidence = {
  id: "accepted-run-001",
  kind: "run",
  uri: "evidence/external-launch-film/run-001.json",
  contentHash: `sha256:${"b".repeat(64)}`,
  acceptedAt: "2026-08-09T03:00:00.000Z",
  acceptedBy: "possible-maintainers",
  summary: "An independently reviewed run satisfied every expectation.",
};

test("the bundled catalog keeps identity, revision, and trust outside pack.json", async () => {
  assert.equal(publicCatalog.length, bundledOutcomePacks.length);
  assert.equal(verifiedOutcomePacks.length, 0);
  for (const entry of publicCatalog) {
    assert.equal(entry.id, `fraylabs/possible/${entry.slug}`);
    assert.equal(entry.origin.kind, "bundled");
    assert.equal(entry.snapshotRef, `packs/${entry.slug}/pack.json`);
    assert.equal(entry.sourceRecord.source, "package:@possible/packs");
    const rawManifest = await readFile(new URL(`../src/${entry.snapshotRef}`, import.meta.url));
    const contentHash = `sha256:${createHash("sha256").update(rawManifest).digest("hex")}`;
    assert.equal(entry.sourceRecord.contentHash, contentHash);
    assert.equal(entry.sourceRecord.revision, contentHash);
    assert.equal("slug" in entry.pack, false);
    assert.equal("status" in entry.pack, false);
    assert.equal(getPackStatus(entry.id), entry.trust.status);
    assert.equal(getPackStatus(entry.slug), entry.trust.status);
  }
});

test("federated source entries are exact, safe, and namespaced", () => {
  const rawManifest = `${JSON.stringify(externalManifest(), null, 2)}\n`;
  const entry = sourceEntry(rawManifest);
  assert.deepEqual(validateFederatedRegistryEntry(entry), entry);
  assert.deepEqual(parsePackIdentity(entry.id), { id: entry.id, owner: "outside-author", repository: "outcome-library", slug: "external-launch-film" });
  assert.equal(githubRawPackUrl(entry), `https://raw.githubusercontent.com/outside-author/outcome-library/${"a".repeat(40)}/packs/external-launch-film.json`);
  assert.throws(() => validateFederatedRegistryEntry({ ...entry, revision: "main" }), /exact 40- or 64-character lowercase commit hash/);
  assert.throws(() => validateFederatedRegistryEntry({ ...entry, path: "../pack.json" }), /safe repository-relative path/);
  assert.throws(() => validateFederatedRegistryEntry({ ...entry, status: "verified" }), /status is not supported/);
});

test("submission fetching is explicit while accepted snapshots verify offline", async () => {
  const rawManifest = `${JSON.stringify(externalManifest(), null, 2)}\n`;
  const entry = sourceEntry(rawManifest);
  const submission = await fetchPackSubmission(entry, async () => ({ ok: true, status: 200, statusText: "OK", text: async () => rawManifest }));
  assert.equal(submission.snapshot.id, entry.id);
  assert.equal(submission.snapshot.pack.name, "External Launch Film");

  const registryRoot = await mkdtemp(join(tmpdir(), "possible-registry-"));
  try {
    const written = await writeAcceptedPackSnapshot(submission, registryRoot);
    assert.equal(written, join(registryRoot, snapshotRelativePath(entry.contentHash)));
    assert.equal(await readFile(written, "utf8"), rawManifest);
    assert.deepEqual(await loadAcceptedPackSnapshot(entry, registryRoot), submission.snapshot);
    await writeFile(written, "{}\n");
    await assert.rejects(() => loadAcceptedPackSnapshot(entry, registryRoot), /Stored snapshot hash mismatch/);
  } finally {
    await rm(registryRoot, { recursive: true, force: true });
  }
});

test("maintainer trust stays separate and verified requires accepted run evidence", () => {
  const rawManifest = `${JSON.stringify(externalManifest(), null, 2)}\n`;
  const entry = sourceEntry(rawManifest);
  const snapshot = { ...entry, pack: externalManifest() };
  const listedCatalog = buildPackCatalog({ acceptedSnapshots: [snapshot] });
  assert.equal(listedCatalog[0]?.slug, "external-launch-film");
  assert.equal(listedCatalog[0]?.trust.status, "listed");
  assert.throws(() => validatePackTrustRecord({ schemaVersion: 1, id: entry.id, status: "verified", evidence: [] }), /cannot be verified without accepted run evidence/);

  const trust = validatePackTrustRecord({ schemaVersion: 1, id: entry.id, status: "verified", evidence: [acceptedEvidence] });
  const verifiedCatalog = buildPackCatalog({ acceptedSnapshots: [snapshot], trustRecords: [trust] });
  assert.equal(verifiedCatalog[0]?.trust.status, "verified");
  assert.equal(verifiedCatalog[0]?.acceptedEvidenceCount, 1);

  const authoredTrustLeak = externalManifest();
  authoredTrustLeak.status = "verified";
  assert.throws(() => validatePackManifest(authoredTrustLeak), /status is not part of the Outcome Pack contract/);
});
