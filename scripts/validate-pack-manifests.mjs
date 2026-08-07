import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { publicOutcomePacks, validatePackManifest } from "../packages/packs/dist/index.js";

const root = new URL("../packages/packs/src/manifests/", import.meta.url);
const files = (await readdir(root)).filter((file) => file.endsWith(".json")).sort();
assert.equal(files.length, publicOutcomePacks.length, "Every public pack must have one JSON manifest");

const slugs = new Set();
for (const file of files) {
  const manifest = validatePackManifest(JSON.parse(await readFile(new URL(file, root), "utf8")), file);
  assert.equal(manifest.visibility, "public", `${file} must be public in the catalog`);
  assert.ok(manifest.lifecycle === "reviewed" || manifest.lifecycle === "archived", `${file} must be reviewed or archived`);
  assert.equal(file, `${manifest.slug}.json`, `${file} must match its slug`);
  assert.equal(slugs.has(manifest.slug), false, `${file} duplicates a slug`);
  slugs.add(manifest.slug);
}

console.log(`Validated ${files.length} canonical JSON Outcome Pack manifests.`);
