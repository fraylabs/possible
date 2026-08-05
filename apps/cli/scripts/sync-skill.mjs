import { cp, mkdtemp, rename, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const canonicalRoot = resolve(packageRoot, "..", "..", "skills", "possible");
const snapshotRoot = join(packageRoot, "assets", "possible");
const stagingRoot = await mkdtemp(join(packageRoot, ".possible-skill-"));
const stagedSkill = join(stagingRoot, "possible");

try {
  await cp(canonicalRoot, stagedSkill, { recursive: true, errorOnExist: true });
  await rm(snapshotRoot, { recursive: true, force: true });
  await rename(stagedSkill, snapshotRoot);
  console.log("Synced apps/cli/assets/possible from skills/possible.");
} finally {
  await rm(stagingRoot, { recursive: true, force: true });
}
