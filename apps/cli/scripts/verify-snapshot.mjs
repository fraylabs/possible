import { readFile, readdir } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const canonicalRoot = resolve(packageRoot, "..", "..", "skills", "possible");
const snapshotRoot = join(packageRoot, "assets", "possible");

const listFiles = async (root, current = "") => {
  const entries = await readdir(join(root, current), { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const child = join(current, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(root, child)));
    else if (entry.isFile()) files.push(child);
    else throw new Error(`Unsupported skill entry: ${child}`);
  }
  return files;
};

const [canonicalFiles, snapshotFiles] = await Promise.all([listFiles(canonicalRoot), listFiles(snapshotRoot)]);
if (JSON.stringify(canonicalFiles) !== JSON.stringify(snapshotFiles)) {
  throw new Error("CLI skill snapshot file list differs from skills/possible. Run `npm run sync:skill -w @possible/cli`.");
}

for (const path of canonicalFiles) {
  const [canonical, snapshot] = await Promise.all([
    readFile(join(canonicalRoot, path)),
    readFile(join(snapshotRoot, path)),
  ]);
  if (!canonical.equals(snapshot)) {
    throw new Error(`CLI skill snapshot differs at ${relative(packageRoot, join(snapshotRoot, path))}. Run \`npm run sync:skill -w @possible/cli\`.`);
  }
}

if (!process.argv.includes("--quiet")) {
  console.log(`CLI skill snapshot matches the canonical Possible skill (${canonicalFiles.length} files).`);
}
