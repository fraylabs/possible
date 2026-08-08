import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";

const manifestsRoot = new URL("../src/manifests/", import.meta.url);
const output = new URL("../src/bundled-snapshots.json", import.meta.url);
const trustOutput = new URL("../src/bundled-trust.json", import.meta.url);
const files = (await readdir(manifestsRoot)).filter((file) => file.endsWith(".json")).sort();
const snapshots = {};
const trust = {};

for (const file of files) {
  const raw = await readFile(new URL(file, manifestsRoot));
  const pack = JSON.parse(raw.toString("utf8"));
  snapshots[pack.slug] = {
    schemaVersion: 1,
    id: `fraylabs/possible/${pack.slug}`,
    source: "package:@possible/packs",
    revision: `pack:${pack.packVersion}`,
    path: `manifests/${file}`,
    contentHash: `sha256:${createHash("sha256").update(raw).digest("hex")}`,
  };
  trust[pack.slug] = {
    schemaVersion: 1,
    id: `fraylabs/possible/${pack.slug}`,
    status: pack.lifecycle === "archived" ? "archived" : "experimental",
    evidence: [],
    updatedAt: "2026-08-09",
    reason: pack.lifecycle === "archived"
      ? "Migrated as archived from the bundled manifest inventory."
      : "Migrated as experimental pending an audit of accepted run evidence.",
  };
}

await writeFile(output, `${JSON.stringify(snapshots, null, 2)}\n`);
await writeFile(trustOutput, `${JSON.stringify(trust, null, 2)}\n`);
console.log(`Refreshed ${files.length} bundled snapshot and trust records.`);
