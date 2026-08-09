import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { compilePack, getPackShowcase, publicCatalog } from "../packages/packs/dist/index.js";

const webDist = new URL("../apps/web/out/", import.meta.url);
const text = (relative) => readFile(new URL(relative, webDist), "utf8");
const publicationKey = (entry) => entry.origin.kind === "bundled" ? entry.slug : entry.id;
const index = JSON.parse(await text("packs/index.json"));

assert.equal(index.schemaVersion, 1);
assert.deepEqual(index.packs.map(({ id }) => id), publicCatalog.map(({ id }) => id));

for (const [position, entry] of publicCatalog.entries()) {
  const key = publicationKey(entry);
  const compiled = compilePack(entry.pack);
  const showcase = getPackShowcase(entry.slug) ?? null;
  const publication = JSON.parse(await text(`packs/${key}.json`));
  assert.deepEqual(publication, {
    ...compiled,
    showcase,
    catalog: {
      id: entry.id,
      status: entry.trust.status,
      source: entry.sourceRecord,
      snapshotRef: entry.snapshotRef,
      acceptedEvidenceCount: entry.acceptedEvidenceCount,
      acceptedEvidenceSummary: entry.acceptedEvidenceSummary,
    },
  });
  assert.deepEqual(index.packs[position].showcase, showcase);
  assert.equal(index.packs[position].contentHash, entry.sourceRecord.contentHash);
  assert.equal(await text(`packs/${key}/install.txt`), `${compiled.installCommands.join("\n")}\n`);
  assert.equal(await text(`packs/${key}/run.txt`), `${compiled.runPrompt}\n`);
}

for (const showcase of publicCatalog.map(({ slug }) => getPackShowcase(slug)).filter(Boolean)) {
  for (const path of [
    ...(showcase.images ?? []).map(({ src }) => src),
    showcase.video?.src,
    showcase.video?.poster,
    showcase.cad?.preview,
    showcase.cad?.poster,
    ...(showcase.cad?.downloads ?? []).map(({ src }) => src),
  ].filter((value) => value?.startsWith("/pack-media/"))) await access(new URL(path.slice(1), webDist));
}

const llms = await text("llms.txt");
assert.match(llms, /open-source library of Outcome Packs/i);
assert.match(llms, /structured prompt and an Expectations checklist/);
assert.match(llms, /Specialized Skills are optional/);
assert.match(llms, /Showcase media is optional and illustrative/);
assert.match(llms, /- Outcome Pack library: \/#packs/);
assert.doesNotMatch(llms, /\/examples|\/demo|\/judging|evidence\.json/);
for (const entry of publicCatalog) assert.match(llms, new RegExp(`/packs/${publicationKey(entry).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.json`));

console.log("All public pack publications and showcase assets are valid.");
