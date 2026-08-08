import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { publicCatalog } from "../packages/packs/dist/index.js";
import { renderPackReference } from "./render-pack-reference.mjs";

const catalog = await readFile(new URL("../skills/possible/references/packs.md", import.meta.url), "utf8");
assert.equal(catalog, renderPackReference(), "Bundled pack reference is stale; run npm run packs:sync-reference");
assert.equal((catalog.match(/^## /gm) ?? []).length, publicCatalog.length, "Bundled pack reference must include every catalog entry exactly once");
console.log(`Bundled pack reference exactly matches ${publicCatalog.length} generated catalog entries.`);
