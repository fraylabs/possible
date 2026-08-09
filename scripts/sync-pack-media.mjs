import { cp, lstat, mkdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readPackFolders } from "./lib/pack-folders.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const targetRoot = resolve(repositoryRoot, "apps/web/public/pack-media");
const expectedTarget = join(repositoryRoot, "apps/web/public/pack-media");
if (targetRoot !== expectedTarget) throw new Error("Refusing to publish pack media outside the generated web-media directory");

const folders = await readPackFolders(repositoryRoot);
await rm(targetRoot, { recursive: true, force: true });
await mkdir(targetRoot, { recursive: true });

let copied = 0;
for (const { folder, slug, showcase } of folders) {
  if (!showcase) continue;
  const mediaSource = join(folder, "media");
  const stats = await lstat(mediaSource).catch((error) => error?.code === "ENOENT" ? undefined : Promise.reject(error));
  if (!stats) continue;
  await cp(mediaSource, join(targetRoot, slug, "media"), { recursive: true });
  copied += 1;
}

console.log(`Published local showcase media for ${copied} pack${copied === 1 ? "" : "s"}.`);
