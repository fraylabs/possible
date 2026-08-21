import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { outcomeCatalog } from "../packages/catalog/dist/index.js";

const webDist = new URL("../apps/web/out/", import.meta.url);
const text = (relative) => readFile(new URL(relative, webDist), "utf8");
const index = JSON.parse(await text("outcomes/index.json"));
assert.equal(index.schemaVersion, 2);
assert.deepEqual(index.outcomes.map(({ slug }) => slug), outcomeCatalog.map(({ slug }) => slug));

for (const entry of outcomeCatalog) {
  const publication = JSON.parse(await text(`outcomes/${entry.slug}.json`));
  assert.equal(publication.slug, entry.slug);
  assert.equal(publication.originalPrompt, entry.outcome.originalPrompt);
  assert.equal(publication.executionPrompt, entry.outcome.executionPrompt);
  assert.deepEqual(publication.execution, entry.outcome.execution);
  assert.deepEqual(publication.source, entry.outcome.source);
  assert.deepEqual(publication.inputs, entry.outcome.inputs);
  assert.deepEqual(publication.artifacts, entry.outcome.artifacts);
  if (entry.outcome.originalPrompt) assert.equal(await text(`outcomes/${entry.slug}/request.txt`), `${entry.outcome.originalPrompt}\n`);
  assert.equal(await text(`outcomes/${entry.slug}/prompt.txt`), `${entry.outcome.executionPrompt}\n`);
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
    ...(entry.outcome.inputs ?? []).map(({ src }) => src),
    ...(entry.outcome.artifacts ?? []).map(({ src }) => src),
  ].filter((value) => value?.startsWith("/outcome-media/"))) await access(new URL(path.slice(1), webDist));
}

const llms = await text("llms.txt");
assert.match(llms, /results, exact prompts, and inspectable sources/i);
assert.match(llms, /published prompts remain unchanged/i);
assert.doesNotMatch(llms, /Outcome Pack|expectations|trust status|snapshot/);
for (const entry of outcomeCatalog) assert.match(llms, new RegExp(`/outcomes/${entry.slug}\\.json`));
console.log("All public Outcome publications and media are valid.");
