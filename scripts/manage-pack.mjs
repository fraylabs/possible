import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createPackFolder, removePackFolder } from "./lib/pack-folders.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [command, slug] = process.argv.slice(2);
const safeSlug = /^[a-z0-9][a-z0-9-]*$/;

const usage = () => {
  throw new Error("Usage: npm run pack:create -- <slug> | npm run pack:remove -- <slug>");
};
if (!command || !slug || !safeSlug.test(slug)) usage();

if (command === "create") {
  await createPackFolder(repositoryRoot, slug);
  console.log(`Created ${slug}. Complete and review its pack.json plus four discovery cases before generation.`);
} else if (command === "remove") {
  await removePackFolder(repositoryRoot, slug);
  const result = spawnSync("npm", ["run", "packs:generate"], { cwd: repositoryRoot, stdio: "inherit" });
  if (result.status !== 0) throw new Error(`Removed ${slug}, but regeneration failed. Resolve dangling pack references and rerun npm run packs:generate.`);
  console.log(`Removed ${slug} and regenerated every derived catalog surface.`);
} else {
  usage();
}
