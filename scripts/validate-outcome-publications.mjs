import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { outcomeCatalog } from "../packages/catalog/dist/index.js";

const webDist = new URL("../apps/web/out/", import.meta.url);
const text = (relative) => readFile(new URL(relative, webDist), "utf8");
const index = JSON.parse(await text("outcomes/index.json"));
assert.equal(index.schemaVersion, 1);
assert.deepEqual(index.outcomes.map(({ slug }) => slug), outcomeCatalog.map(({ slug }) => slug));

for (const entry of outcomeCatalog) {
  const publication = JSON.parse(await text(`outcomes/${entry.slug}.json`));
  assert.equal(publication.slug, entry.slug);
  assert.equal(publication.prompt, entry.outcome.prompt);
  assert.equal(await text(`outcomes/${entry.slug}/prompt.txt`), `${entry.outcome.prompt}\n`);
  const preview = entry.outcome.preview;
  for (const path of [
    ...(preview?.images ?? []).map(({ src }) => src),
    preview?.video?.src,
    preview?.video?.poster,
    preview?.audio?.src,
    preview?.audio?.poster,
    preview?.cad?.preview,
    preview?.cad?.poster,
    ...(preview?.cad?.downloads ?? []).map(({ src }) => src),
  ].filter((value) => value?.startsWith("/outcome-media/"))) await access(new URL(path.slice(1), webDist));
}

const llms = await text("llms.txt");
assert.match(llms, /directory of exact prompts/i);
assert.match(llms, /does not compile, rewrite, verify, or execute/i);
assert.doesNotMatch(llms, /Outcome Pack|expectations|trust status|snapshot/);
for (const entry of outcomeCatalog) assert.match(llms, new RegExp(`/outcomes/${entry.slug}\\.json`));
console.log("All public Outcome publications and media are valid.");
