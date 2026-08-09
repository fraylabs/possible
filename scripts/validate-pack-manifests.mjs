import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { bundledOutcomePacks, validatePackManifest } from "../packages/packs/dist/index.js";
import { readPackFolders } from "./lib/pack-folders.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const folders = await readPackFolders(repositoryRoot);
assert.equal(folders.length, bundledOutcomePacks.length, "Every bundled pack must have one source folder");

const slugs = new Set();
for (const { slug, packPath } of folders) {
  const file = relative(repositoryRoot, packPath);
  validatePackManifest(JSON.parse(await readFile(packPath, "utf8")), file);
  assert.equal(slugs.has(slug), false, `${file} duplicates a slug`);
  slugs.add(slug);
}

const manifestLoader = await readFile(resolve(repositoryRoot, "packages/packs/src/manifest.ts"), "utf8");
assert.match(manifestLoader, /from "\.\/generated-manifests\.js"/, "The runtime catalog must use the generated pack index");
assert.doesNotMatch(manifestLoader, /from "\.\/packs\//, "The runtime catalog must not import individual pack folders by hand");
const webCardSources = [
  await readFile(resolve(repositoryRoot, "apps/web/src/App.tsx"), "utf8"),
  await readFile(resolve(repositoryRoot, "apps/web/src/styles.css"), "utf8"),
].join("\n");
for (const slug of slugs) assert.equal(webCardSources.includes(`pack-card--${slug}`), false, `The web renderer has bespoke card code for ${slug}`);

console.log(`Validated ${folders.length} canonical Outcome Pack folders.`);
