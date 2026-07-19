import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { compilePack, outcomePacks } from "../packages/packs/dist/index.js";

const webDist = new URL("../apps/web/dist/", import.meta.url);
const text = (relative) => readFile(new URL(relative, webDist), "utf8");
const index = JSON.parse(await text("packs/index.json"));

assert.deepEqual(
  index.packs.map(({ catalogNumber, slug, lane }) => ({ catalogNumber, slug, lane })),
  outcomePacks.map(({ catalogNumber, slug, lane }) => ({ catalogNumber, slug, lane })),
);

const llms = await text("llms.txt");
for (const pack of outcomePacks) {
  const compiled = compilePack(pack);
  const publication = JSON.parse(await text(`packs/${pack.slug}.json`));
  assert.deepEqual(publication, compiled, `${pack.slug}.json must equal the canonical compiled pack`);
  assert.equal(await text(`packs/${pack.slug}/install.txt`), `${compiled.installCommands.join("\n")}\n`);
  assert.equal(await text(`packs/${pack.slug}/run.txt`), `${compiled.runPrompt}\n`);
  assert.match(llms, new RegExp(`- ${pack.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}: /packs/${pack.slug}\\.json`));
}

console.log(`All ${outcomePacks.length} pack publication sets match the canonical compiler.`);
