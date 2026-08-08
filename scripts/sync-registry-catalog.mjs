#!/usr/bin/env node

import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildPackCatalog,
  validateAcceptedPackSnapshot,
  validateFederatedRegistryEntry,
  validatePackTrustRecord,
} from "@possible/packs";
import { computePackContentHash } from "@possible/packs/submission";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const registryRoot = join(repositoryRoot, "registry");
const entriesRoot = join(registryRoot, "entries");
const snapshotsRoot = join(registryRoot, "snapshots");
const trustRoot = join(registryRoot, "trust");
const target = join(repositoryRoot, "packages", "packs", "src", "federated-catalog.json");
const checkOnly = process.argv.slice(2).includes("--check");

const jsonFiles = async (root) => {
  const files = [];
  const visit = async (directory) => {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error?.code === "ENOENT") return;
      throw error;
    }
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile() && entry.name.endsWith(".json")) files.push(path);
    }
  };
  await visit(root);
  return files;
};

const readJson = async (path) => {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    throw new Error(`${relative(repositoryRoot, path)} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const expectedRecordPath = (root, id) => join(root, ...id.split("/")) + ".json";
const entries = [];
for (const path of await jsonFiles(entriesRoot)) {
  const entry = validateFederatedRegistryEntry(await readJson(path), relative(repositoryRoot, path));
  if (path !== expectedRecordPath(entriesRoot, entry.id)) throw new Error(`${relative(repositoryRoot, path)} must be stored at ${relative(repositoryRoot, expectedRecordPath(entriesRoot, entry.id))}`);
  entries.push(entry);
}
entries.sort((left, right) => left.id.localeCompare(right.id));

const acceptedSnapshots = [];
const referencedSnapshotPaths = new Set();
for (const entry of entries) {
  const snapshotPath = join(snapshotsRoot, `${entry.contentHash.slice("sha256:".length)}.json`);
  referencedSnapshotPaths.add(snapshotPath);
  const rawManifest = await readFile(snapshotPath, "utf8").catch((error) => {
    if (error?.code === "ENOENT") throw new Error(`Missing immutable snapshot ${relative(repositoryRoot, snapshotPath)} for ${entry.id}`);
    throw error;
  });
  if (computePackContentHash(rawManifest) !== entry.contentHash) throw new Error(`${relative(repositoryRoot, snapshotPath)} does not match ${entry.contentHash}`);
  const pack = JSON.parse(rawManifest);
  acceptedSnapshots.push(validateAcceptedPackSnapshot({ ...entry, pack }, `snapshot for ${entry.id}`));
}
const orphanedSnapshots = (await jsonFiles(snapshotsRoot)).filter((path) => !referencedSnapshotPaths.has(path));
if (orphanedSnapshots.length > 0) {
  throw new Error(`Unreferenced immutable snapshots: ${orphanedSnapshots.map((path) => relative(repositoryRoot, path)).join(", ")}`);
}

const trustRecords = [];
for (const path of await jsonFiles(trustRoot)) {
  const trust = validatePackTrustRecord(await readJson(path), undefined, relative(repositoryRoot, path));
  if (path !== expectedRecordPath(trustRoot, trust.id)) throw new Error(`${relative(repositoryRoot, path)} must be stored at ${relative(repositoryRoot, expectedRecordPath(trustRoot, trust.id))}`);
  trustRecords.push(trust);
}
trustRecords.sort((left, right) => left.id.localeCompare(right.id));

buildPackCatalog({ acceptedSnapshots, trustRecords });
const generated = `${JSON.stringify({ schemaVersion: 1, acceptedSnapshots, trustRecords }, null, 2)}\n`;
if (checkOnly) {
  const current = await readFile(target, "utf8");
  if (current !== generated) throw new Error("Federated catalog is stale; run npm run registry:sync");
  process.stdout.write(`Validated ${entries.length} federated catalog entries and generated snapshots.\n`);
} else {
  await writeFile(target, generated, "utf8");
  process.stdout.write(`Generated ${entries.length} federated catalog entries.\n`);
}
