import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readOutcomeFolders } from "./lib/outcome-folders.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = join(repositoryRoot, "apps/web/public/outcome-media");
await rm(publicRoot, { recursive: true, force: true });
await mkdir(publicRoot, { recursive: true });
for (const { slug } of await readOutcomeFolders(repositoryRoot)) {
  const source = join(repositoryRoot, "packages/catalog/src/outcomes", slug, "media");
  await cp(source, join(publicRoot, slug, "media"), { recursive: true, force: true }).catch((error) => {
    if (error?.code !== "ENOENT") throw error;
  });
}
console.log("Synced Outcome media.");
