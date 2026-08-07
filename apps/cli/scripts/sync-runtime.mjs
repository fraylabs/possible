import { cp, copyFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const compiledRoot = fileURLToPath(new URL("../../../packages/packs/dist/", import.meta.url));
const targetRoot = join(packageRoot, "runtime");

await rm(targetRoot, { recursive: true, force: true });
await mkdir(targetRoot, { recursive: true });

for (const file of ["catalog.js", "compiler.js", "index.js", "local.js", "manifest.js"]) {
  await copyFile(join(compiledRoot, file), join(targetRoot, file));
}
await cp(join(compiledRoot, "manifests"), join(targetRoot, "manifests"), { recursive: true });

console.log("Synced the local JSON pack runtime into the published CLI.");
