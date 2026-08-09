import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import {
  buildPackCatalog,
  compilePack,
  validateFederatedRegistryEntry,
  validatePackManifest,
  validatePackTrustRecord,
} from "../../packages/packs/dist/index.js";
import {
  computePackContentHash,
  fetchPackSubmission,
  loadAcceptedPackSnapshot,
  snapshotRelativePath,
  writeAcceptedPackSnapshot,
} from "../../packages/packs/dist/submission.js";
import { searchPublicPacks } from "../../apps/mcp/src/search.ts";
import { renderPackReference } from "../../scripts/render-pack-reference.mjs";
import { validatePackSubmission } from "../../scripts/validate-pack-submission.mjs";

const evaluationRoot = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(evaluationRoot, "../..");
const fixturePath = (name) => join(evaluationRoot, "fixtures", name);
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const execute = promisify(execFile);

const EXPECTED_SOURCE_KEYS = [
  "contentHash",
  "id",
  "path",
  "revision",
  "schemaVersion",
  "source",
];

const trustAllowsDefaultSelection = (status) => status === "experimental" || status === "verified";

/** Generic policy only: no pack slugs, names, or bespoke conditions are encoded here. */
const selectCandidate = (candidates) => candidates.find((candidate) =>
  trustAllowsDefaultSelection(candidate.status)
  && candidate.conflictingNotForSignals.length === 0,
);

const sourceEntry = await readJson(fixturePath("source-entry.json"));
const trustInput = await readJson(fixturePath("trust-record.json"));
const queries = await readJson(fixturePath("queries.json"));
const rawManifest = await readFile(fixturePath("pack.json"), "utf8");

assert.deepEqual(Object.keys(sourceEntry).sort(), EXPECTED_SOURCE_KEYS);
assert.equal(sourceEntry.schemaVersion, 1);
assert.equal(sourceEntry.contentHash, computePackContentHash(rawManifest));
assert.match(sourceEntry.revision, /^[0-9a-f]{40}$/);

const registryEntry = validateFederatedRegistryEntry(sourceEntry);

const trust = validatePackTrustRecord(trustInput, registryEntry.id);
assert.equal(trust.status, "experimental");
assert.equal(trust.evidence.length, 0);

const canonicalSkillPath = join(repositoryRoot, "skills", "possible", "SKILL.md");
const canonicalSkillBefore = await readFile(canonicalSkillPath);
const canonicalSkillHash = sha256(canonicalSkillBefore);
assert.equal(canonicalSkillBefore.includes(Buffer.from("community-workshop-registration-site")), false);

const temporaryRoot = await mkdtemp(join(tmpdir(), "possible-external-author-evaluation-"));
try {
  const cleanProject = join(temporaryRoot, "clean-install");
  await mkdir(cleanProject, { recursive: true });
  const cliPath = join(repositoryRoot, "apps", "cli", "src", "index.mjs");
  const installResult = await execute(process.execPath, [cliPath, "init"], { cwd: cleanProject });
  assert.match(installResult.stdout, /\$possible/);
  const installedSkillPath = join(cleanProject, ".agents", "skills", "possible", "SKILL.md");
  const installedSkillBefore = await readFile(installedSkillPath);
  assert.equal(installedSkillBefore.includes(Buffer.from("community-workshop-registration-site")), false);

  const authoredPackPath = join(cleanProject, sourceEntry.path);
  await mkdir(dirname(authoredPackPath), { recursive: true });
  await writeFile(authoredPackPath, rawManifest);
  const exportDirectory = join(cleanProject, "submission", "community-workshop-registration-site");
  const exportResult = await execute(process.execPath, [
    cliPath,
    "pack",
    "export",
    sourceEntry.path,
    "submission/community-workshop-registration-site",
    "--source",
    sourceEntry.source,
    "--revision",
    sourceEntry.revision,
    "--path",
    sourceEntry.path,
  ], { cwd: cleanProject });
  assert.match(exportResult.stdout, /PR-ready pack submission/);
  const exportedSourceEntry = await readJson(join(exportDirectory, "source-entry.json"));
  const exportedPackSource = await readFile(join(exportDirectory, "pack.json"), "utf8");
  assert.deepEqual(exportedSourceEntry, sourceEntry);
  assert.equal(exportedPackSource, rawManifest);
  const validatedSubmission = await validatePackSubmission({
    entry: exportedSourceEntry,
    packSource: exportedPackSource,
    validatePackManifest,
    compilePack,
    context: exportedSourceEntry.id,
  });
  assert.equal(validatedSubmission.pack.name, "Community Workshop Registration Site");
  assert.equal(validatedSubmission.compiled.pack, validatedSubmission.pack);

  const expectedRawUrl = [
    "https://raw.githubusercontent.com",
    "outside-author",
    "outcome-library",
    registryEntry.revision,
    "packs/community-workshop-registration-site.json",
  ].join("/");
  let requestedUrl;
  const submission = await fetchPackSubmission(registryEntry, async (url) => {
    requestedUrl = url;
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => rawManifest,
    };
  });
  assert.equal(requestedUrl, expectedRawUrl);
  assert.equal(submission.snapshot.contentHash, sourceEntry.contentHash);
  assert.equal(submission.snapshot.pack.name, "Community Workshop Registration Site");

  const registryRoot = join(temporaryRoot, "accepted-registry");
  const snapshotPath = await writeAcceptedPackSnapshot(submission, registryRoot);
  assert.equal(snapshotPath, join(registryRoot, snapshotRelativePath(registryEntry.contentHash)));
  assert.equal(await readFile(snapshotPath, "utf8"), rawManifest);
  await writeAcceptedPackSnapshot(submission, registryRoot);
  const loadedSnapshot = await loadAcceptedPackSnapshot(registryEntry, registryRoot);
  assert.deepEqual(loadedSnapshot, submission.snapshot);

  await assert.rejects(
    () => writeAcceptedPackSnapshot({ ...submission, rawManifest: `${rawManifest} ` }, registryRoot),
    /snapshot bytes do not match/,
  );

  const catalog = buildPackCatalog({
    acceptedSnapshots: [loadedSnapshot],
    trustRecords: [trust],
  }).map((entry, index) => ({ ...entry, catalogNumber: index + 1 }));
  assert.equal(catalog.length, 1);
  const catalogEntry = catalog[0];
  assert.equal(catalogEntry.id, registryEntry.id);
  assert.equal(catalogEntry.origin.kind, "federated");
  assert.equal(catalogEntry.trust.status, "experimental");
  assert.equal(catalogEntry.snapshotRef, snapshotRelativePath(registryEntry.contentHash));

  // Model the exact package a contributor merge would produce: generic skill
  // bytes stay fixed while the generated offline catalog gains the new pack.
  const postMergeCliRoot = join(temporaryRoot, "post-merge-cli-package");
  await cp(join(repositoryRoot, "apps", "cli", "src"), join(postMergeCliRoot, "src"), { recursive: true });
  await cp(join(repositoryRoot, "skills", "possible"), join(postMergeCliRoot, "assets", "possible"), { recursive: true });
  await writeFile(join(postMergeCliRoot, "assets", "possible", "references", "packs.md"), renderPackReference(catalog));
  const postMergeProject = join(temporaryRoot, "post-merge-clean-install");
  await mkdir(postMergeProject, { recursive: true });
  const postMergeInstall = await execute(process.execPath, [join(postMergeCliRoot, "src", "index.mjs"), "init"], { cwd: postMergeProject });
  assert.match(postMergeInstall.stdout, /\$possible/);
  const postMergeSkillRoot = join(postMergeProject, ".agents", "skills", "possible");
  const postMergeSkill = await readFile(join(postMergeSkillRoot, "SKILL.md"));
  const postMergeReference = await readFile(join(postMergeSkillRoot, "references", "packs.md"), "utf8");
  assert.equal(sha256(postMergeSkill), canonicalSkillHash);
  assert.match(postMergeReference, new RegExp(registryEntry.id));
  assert.match(postMergeReference, /Status: `experimental`/);
  assert.match(postMergeReference, /A native mobile application or app store release\./);

  const dependencies = { catalog };

  const matchingCandidates = searchPublicPacks(queries.match, dependencies);
  const matchingDecision = selectCandidate(matchingCandidates);
  assert.equal(queries.match.expectedDecision, "select");
  assert.equal(matchingDecision?.slug, catalogEntry.slug);
  assert.equal(matchingDecision.conflictingNotForSignals.length, 0);

  const conflictingCandidates = searchPublicPacks(queries.notForConflict, dependencies);
  const conflictingPack = conflictingCandidates.find(({ slug }) => slug === catalogEntry.slug);
  assert.ok(conflictingPack);
  assert.ok(conflictingPack.conflictingNotForSignals.length > 0);
  assert.match(conflictingPack.conflictingNotForSignals[0].statement, /native mobile application/i);
  assert.equal(queries.notForConflict.expectedDecision, "reject");
  assert.equal(selectCandidate(conflictingCandidates), undefined);

  assert.equal(sha256(await readFile(installedSkillPath)), sha256(installedSkillBefore));
  assert.equal(sha256(await readFile(canonicalSkillPath)), canonicalSkillHash);

  await writeFile(snapshotPath, `${rawManifest} `);
  await assert.rejects(
    () => loadAcceptedPackSnapshot(registryEntry, registryRoot),
    /Stored snapshot hash mismatch/,
  );

  const mcpServerSource = await readFile(join(repositoryRoot, "apps", "mcp", "src", "server.ts"), "utf8");
  const productionMcpStillUsesStaticManifestArray = /packs:\s*publicOutcomePacks/.test(mcpServerSource) || !/publicCatalog/.test(mcpServerSource);
  const integrationGaps = productionMcpStillUsesStaticManifestArray
    ? ["The production MCP search still receives a static manifest array rather than the federated catalog built here."]
    : [];

  process.stdout.write(`${JSON.stringify({
    status: "passed",
    source: {
      id: registryEntry.id,
      revision: registryEntry.revision,
      contentHash: registryEntry.contentHash,
      requestedUrl,
      versionedContract: true,
      compatibilityShimUsed: false,
    },
    immutableSnapshot: {
      relativePath: snapshotRelativePath(registryEntry.contentHash),
      exactBytesAccepted: true,
      idempotentRewriteAccepted: true,
      changedBytesRejected: true,
      storedTamperingRejected: true,
    },
    discovery: {
      matchingOutcomeSelected: matchingDecision.slug,
      trustStatus: matchingDecision.status,
      notForConflictDetected: conflictingPack.conflictingNotForSignals,
      conflictingOutcomeRejected: true,
    },
    cleanInstall: {
      installedThroughCli: true,
      exportedThroughCli: true,
      submissionValidatorUsed: true,
      fixtureWasAbsentFromInstalledSkill: true,
      installedSkillUnchanged: true,
      canonicalSkillUnchanged: true,
      postMergeInstalledThroughCli: true,
      postMergeReferenceContainsPack: true,
      postMergeGenericSkillUnchanged: true,
    },
    integrationGaps,
  }, null, 2)}\n`);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
