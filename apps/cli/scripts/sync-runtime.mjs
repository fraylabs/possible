import { cp, copyFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const compiledRoot = fileURLToPath(new URL("../../../packages/packs/dist/", import.meta.url));
const targetRoot = join(packageRoot, "runtime");

await rm(targetRoot, { recursive: true, force: true });
await mkdir(targetRoot, { recursive: true });

for (const file of [
  "bundled-snapshots.json",
  "bundled-trust.json",
  "catalog.js",
  "compiler.js",
  "federated-catalog.json",
  "generated-manifests.js",
  "index.js",
  "local.js",
  "manifest.js",
  "registry.js",
  "search.js",
  "submission.js",
]) {
  await copyFile(join(compiledRoot, file), join(targetRoot, file));
}
await cp(join(compiledRoot, "packs"), join(targetRoot, "packs"), { recursive: true });

console.log("Synced the local JSON pack runtime into the published CLI.");
