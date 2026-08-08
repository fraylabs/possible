#!/usr/bin/env node

import { execFile } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { validateFederatedRegistryEntry } from "@possible/packs";
import { computePackContentHash } from "@possible/packs/submission";

const execute = promisify(execFile);
const REQUIRED_PACK_ARRAYS = ["useWhen", "notFor", "skills", "workstreams", "outputs", "guardrails", "verification", "expectations"];

export const sha256 = computePackContentHash;

export function validateSourceEntry(input, context = "source entry") {
  return validateFederatedRegistryEntry(input, context);
}

const parsePackSource = (source, context) => {
  try {
    return JSON.parse(typeof source === "string" ? source : Buffer.from(source).toString("utf8"));
  } catch (error) {
    throw new Error(`${context} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export async function validatePackSubmission({ entry: entryInput, packSource, validatePackManifest, compilePack, context = "pack submission" }) {
  const entry = validateSourceEntry(entryInput, `${context}.sourceEntry`);
  if (sha256(packSource) !== entry.contentHash) throw new Error(`${context}.contentHash does not match the exact pack bytes`);
  const pack = validatePackManifest(parsePackSource(packSource, `${context}.pack`), `${context}.pack`);
  if (pack.visibility !== "public" || pack.lifecycle !== "reviewed") {
    throw new Error(`${context}.pack must use visibility=public and lifecycle=reviewed so it is runnable; catalog trust is assigned separately by Possible maintainers`);
  }
  if (entry.id !== `${entry.source.slice("https://github.com/".length)}/${pack.slug}`) {
    throw new Error(`${context}.sourceEntry.id must end with the submitted pack slug ${pack.slug}`);
  }
  for (const field of REQUIRED_PACK_ARRAYS) {
    if (!Array.isArray(pack[field]) || pack[field].length === 0) throw new Error(`${context}.pack.${field} must be non-empty for public submission`);
  }
  const compiled = compilePack(pack);
  return { entry, pack, compiled };
}

export async function validatePackSnapshot({ entry, snapshotSource, remoteSource, validatePackManifest, compilePack, context = "pack submission" }) {
  const snapshotBytes = Buffer.isBuffer(snapshotSource) ? snapshotSource : Buffer.from(snapshotSource);
  const remoteBytes = Buffer.isBuffer(remoteSource) ? remoteSource : Buffer.from(remoteSource);
  if (!snapshotBytes.equals(remoteBytes)) throw new Error(`${context}.snapshot bytes do not match the pinned remote source`);
  return validatePackSubmission({ entry, packSource: snapshotSource, validatePackManifest, compilePack, context });
}

const rawGitHubUrl = (entry) => {
  const [owner, repository] = entry.id.split("/");
  const path = entry.path.split("/").map(encodeURIComponent).join("/");
  return `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/${entry.revision}/${path}`;
};

const fetchPackSource = async (entry) => {
  const url = rawGitHubUrl(entry);
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000), headers: { "user-agent": "possible-pack-submission-validator" } });
  if (!response.ok) throw new Error(`Could not fetch pinned pack source (${response.status}) from ${url}`);
  return Buffer.from(await response.arrayBuffer());
};

const listJsonFiles = async (root) => {
  const files = [];
  const visit = async (directory) => {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile() && entry.name.endsWith(".json")) files.push(path);
    }
  };
  await visit(root);
  return files;
};

const snapshotPathForEntry = (entry, repository) => join(resolve(repository), "registry", "snapshots", `${entry.contentHash.slice("sha256:".length)}.json`);

const readSnapshotSource = async (entry, repository) => {
  const path = snapshotPathForEntry(entry, repository);
  return readFile(path).catch((error) => {
    if (error?.code === "ENOENT") throw new Error(`Missing required immutable pack snapshot: ${relative(repository, path)}`);
    throw error;
  });
};

const changedEntryFiles = async (base, repository) => {
  const { stdout } = await execute("git", ["diff", "--name-only", "--diff-filter=AM", `${base}...HEAD`], { cwd: repository });
  const changed = stdout.split("\n").filter(Boolean);
  const forbiddenTrustChanges = changed.filter((path) => path.startsWith("registry/trust/") || path.startsWith("registry/evidence/"));
  const submissionChanged = changed.some((path) => path.startsWith("registry/entries/") || path.startsWith("registry/snapshots/"));
  if (forbiddenTrustChanges.length > 0 && submissionChanged) {
    throw new Error(`A pack submission cannot assign trust or evidence in the same pull request: ${forbiddenTrustChanges.join(", ")}`);
  }
  const entryPaths = changed.filter((path) => path.startsWith("registry/entries/") && path.endsWith(".json")).map((path) => resolve(repository, path));
  const changedSnapshots = new Set(changed.filter((path) => path.startsWith("registry/snapshots/") && path.endsWith(".json")).map((path) => resolve(repository, path)));
  if (changedSnapshots.size > 0) {
    const allEntries = await listJsonFiles(join(repository, "registry", "entries"));
    for (const entryPath of allEntries) {
      const entry = validateSourceEntry(JSON.parse(await readFile(entryPath, "utf8")), entryPath);
      if (changedSnapshots.delete(snapshotPathForEntry(entry, repository))) entryPaths.push(entryPath);
    }
    if (changedSnapshots.size > 0) {
      throw new Error(`Unreferenced pack snapshots cannot enter the registry: ${[...changedSnapshots].map((path) => relative(repository, path)).join(", ")}`);
    }
  }
  return [...new Set(entryPaths)];
};

const parseArguments = (args) => {
  const values = {};
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    if (!["--entry", "--pack", "--registry", "--changed-from"].includes(flag)) throw new Error(`Unknown option: ${flag}`);
    const value = args[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value`);
    values[flag.slice(2).replace("-", "_")] = value;
    index += 1;
  }
  const modes = [values.entry, values.registry, values.changed_from].filter(Boolean).length;
  if (modes !== 1) throw new Error("Use exactly one of --entry <path>, --registry <directory>, or --changed-from <git-revision>");
  if (values.pack && !values.entry) throw new Error("--pack can only be used with --entry");
  if (values.entry && !values.pack) throw new Error("--entry local validation also requires --pack; use --registry or --changed-from for pinned-source validation");
  return values;
};

const assertRegistryLocation = (entryPath, entry, repository) => {
  const expected = join(resolve(repository), "registry", "entries", ...entry.id.split("/")) + ".json";
  if (resolve(entryPath) !== expected) throw new Error(`${entryPath} must be stored at ${relative(repository, expected)}`);
};

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const repository = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const { compilePack, validatePackManifest } = await import("@possible/packs");
  let entryPaths;
  if (options.entry) entryPaths = [resolve(options.entry)];
  else if (options.registry) entryPaths = await listJsonFiles(resolve(options.registry));
  else entryPaths = await changedEntryFiles(options.changed_from, repository);
  if (entryPaths.length === 0) {
    process.stdout.write("No pack source entries to validate.\n");
    return;
  }
  for (const entryPath of entryPaths) {
    const entry = validateSourceEntry(JSON.parse(await readFile(entryPath, "utf8")), entryPath);
    let result;
    if (options.entry) {
      result = await validatePackSubmission({ entry, packSource: await readFile(resolve(options.pack), "utf8"), validatePackManifest, compilePack, context: entry.id });
    } else {
      assertRegistryLocation(entryPath, entry, repository);
      const [snapshotSource, remoteSource] = await Promise.all([
        readSnapshotSource(entry, repository),
        fetchPackSource(entry),
      ]);
      result = await validatePackSnapshot({ entry, snapshotSource, remoteSource, validatePackManifest, compilePack, context: entry.id });
    }
    process.stdout.write(`Validated ${result.entry.id} at ${result.entry.revision} (${result.entry.contentHash}).\n`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
