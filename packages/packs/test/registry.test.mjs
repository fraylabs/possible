import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  buildPackCatalog,
  getPackStatus,
  parsePackIdentity,
  publicCatalog,
  publicOutcomePacks,
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
  const pack = structuredClone(publicOutcomePacks.find(({ lifecycle }) => lifecycle === "reviewed"));
  assert.ok(pack);
  pack.slug = "external-launch-film";
  pack.name = "External Launch Film";
  pack.packVersion = "1.0.0";
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
  summary: "An independently reviewed run satisfied every required expectation.",
};

test("the bundled catalog uses namespaced identities, deterministic snapshots, and conservative trust defaults", async () => {
  assert.equal(publicCatalog.length, publicOutcomePacks.length);
  assert.equal(verifiedOutcomePacks.length, 0);
  for (const entry of publicCatalog) {
    assert.equal(entry.id, `fraylabs/possible/${entry.pack.slug}`);
    assert.equal(entry.origin.kind, "bundled");
    assert.equal(entry.snapshotRef, `manifests/${entry.pack.slug}.json`);
    assert.equal(entry.sourceRecord.source, "package:@possible/packs");
    assert.equal(entry.sourceRecord.revision, `pack:${entry.pack.packVersion}`);
    assert.equal(entry.sourceRecord.path, entry.snapshotRef);
    const rawManifest = await readFile(new URL(`../src/${entry.snapshotRef}`, import.meta.url));
    assert.equal(entry.sourceRecord.contentHash, `sha256:${createHash("sha256").update(rawManifest).digest("hex")}`);
    assert.equal(entry.acceptedEvidenceCount, 0);
    assert.deepEqual(entry.acceptedEvidenceSummary, []);
    assert.equal(entry.trust.status, entry.pack.lifecycle === "archived" ? "archived" : "experimental");
    assert.equal(getPackStatus(entry.id), entry.trust.status);
    assert.equal(getPackStatus(entry.pack.slug), entry.trust.status);
  }
});

test("federated source entries are exact, safe, and tied to owner/repository/slug", () => {
  const rawManifest = `${JSON.stringify(externalManifest(), null, 2)}\n`;
  const entry = sourceEntry(rawManifest);
  assert.deepEqual(validateFederatedRegistryEntry(entry), entry);
  assert.deepEqual(parsePackIdentity(entry.id), {
    id: entry.id,
    owner: "outside-author",
    repository: "outcome-library",
    slug: "external-launch-film",
  });
  assert.equal(
    githubRawPackUrl(entry),
    `https://raw.githubusercontent.com/outside-author/outcome-library/${"a".repeat(40)}/packs/external-launch-film.json`,
  );
  assert.throws(() => validateFederatedRegistryEntry({ ...entry, revision: "main" }), /exact 40- or 64-character lowercase commit hash/);
  assert.throws(() => validateFederatedRegistryEntry({ ...entry, path: "../pack.json" }), /safe repository-relative path/);
  assert.throws(() => validateFederatedRegistryEntry({ ...entry, source: "https://github.com/different/repository" }), /must match the owner and repository/);
  assert.throws(() => validateFederatedRegistryEntry({ ...entry, status: "verified" }), /status is not supported/);
});

test("submission fetching is explicit while accepted snapshots load and verify offline", async () => {
  const rawManifest = `${JSON.stringify(externalManifest(), null, 2)}\n`;
  const entry = sourceEntry(rawManifest);
  let requestedUrl;
  const submission = await fetchPackSubmission(entry, async (url) => {
    requestedUrl = url;
    return { ok: true, status: 200, statusText: "OK", text: async () => rawManifest };
  });
  assert.equal(requestedUrl, githubRawPackUrl(entry));
  assert.equal(submission.snapshot.id, entry.id);
  assert.equal(submission.snapshot.pack.slug, "external-launch-film");

  const registryRoot = await mkdtemp(join(tmpdir(), "possible-registry-"));
  try {
    const written = await writeAcceptedPackSnapshot(submission, registryRoot);
    assert.equal(written, join(registryRoot, snapshotRelativePath(entry.contentHash)));
    assert.equal(await readFile(written, "utf8"), rawManifest);
    assert.deepEqual(await loadAcceptedPackSnapshot(entry, registryRoot), submission.snapshot);

    await writeFile(written, "{}\n");
    await assert.rejects(() => loadAcceptedPackSnapshot(entry, registryRoot), /Stored snapshot hash mismatch/);
    await assert.rejects(() => writeAcceptedPackSnapshot(submission, registryRoot), /Immutable snapshot collision/);
  } finally {
    await rm(registryRoot, { recursive: true, force: true });
  }

  await assert.rejects(
    () => fetchPackSubmission(entry, async () => ({ ok: true, status: 200, statusText: "OK", text: async () => `${rawManifest} ` })),
    /content hash mismatch/,
  );
});

test("maintainer trust is separate, absent trust is listed, and verified requires accepted evidence", () => {
  const rawManifest = `${JSON.stringify(externalManifest(), null, 2)}\n`;
  const entry = sourceEntry(rawManifest);
  const snapshot = { ...entry, pack: externalManifest() };
  const listedCatalog = buildPackCatalog({ acceptedSnapshots: [snapshot] });
  assert.equal(listedCatalog[0]?.trust.status, "listed");
  assert.equal(listedCatalog[0]?.snapshotRef, `snapshots/${entry.contentHash.slice("sha256:".length)}.json`);
  assert.deepEqual(listedCatalog[0]?.sourceRecord, entry);

  assert.throws(
    () => validatePackTrustRecord({ schemaVersion: 1, id: entry.id, status: "verified", evidence: [] }),
    /cannot be verified without accepted run evidence/,
  );
  assert.throws(
    () => validatePackTrustRecord({ schemaVersion: 1, id: entry.id, status: "verified", evidence: [{ ...acceptedEvidence, kind: "review" }] }),
    /cannot be verified without accepted run evidence/,
  );
  const trust = validatePackTrustRecord({
    schemaVersion: 1,
    id: entry.id,
    status: "verified",
    evidence: [acceptedEvidence],
    updatedAt: "2026-08-09T04:00:00.000Z",
    reason: "Accepted completion evidence supports the pack promise.",
  });
  const verifiedCatalog = buildPackCatalog({ acceptedSnapshots: [snapshot], trustRecords: [trust] });
  assert.equal(verifiedCatalog[0]?.trust.status, "verified");
  assert.equal(verifiedCatalog[0]?.acceptedEvidenceCount, 1);
  assert.deepEqual(verifiedCatalog[0]?.acceptedEvidenceSummary, [acceptedEvidence.summary]);
  assert.deepEqual(verifiedCatalog[0]?.trust.evidence, [acceptedEvidence]);
  assert.throws(
    () => buildPackCatalog({ acceptedSnapshots: [snapshot], trustRecords: [{ ...trust, id: "outside-author/outcome-library/missing-pack" }] }),
    /Trust record has no catalog pack/,
  );

  const authoredTrustLeak = externalManifest();
  authoredTrustLeak.status = "verified";
  assert.throws(() => validatePackManifest(authoredTrustLeak), /status is not part of the standard prompt, skills, and expectations contract/);
});

test("public drafts can be listed but cannot receive reviewed or archived trust", () => {
  const draft = externalManifest();
  draft.lifecycle = "draft";
  delete draft.reviewedAt;
  const rawManifest = `${JSON.stringify(draft, null, 2)}\n`;
  const entry = sourceEntry(rawManifest);
  const snapshot = { ...entry, pack: draft };
  const catalog = buildPackCatalog({ acceptedSnapshots: [snapshot] });
  assert.equal(catalog[0]?.pack.lifecycle, "draft");
  assert.equal(catalog[0]?.trust.status, "listed");

  const experimental = { schemaVersion: 1, id: entry.id, status: "experimental", evidence: [] };
  assert.throws(
    () => buildPackCatalog({ acceptedSnapshots: [snapshot], trustRecords: [experimental] }),
    /draft packs may only be listed|experimental trust requires a reviewed pack contract/,
  );
  const archived = { schemaVersion: 1, id: entry.id, status: "archived", evidence: [] };
  assert.throws(
    () => buildPackCatalog({ acceptedSnapshots: [snapshot], trustRecords: [archived] }),
    /draft packs may only be listed|archived trust requires an archived pack contract/,
  );
});
