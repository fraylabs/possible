import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { compilePack, outcomePacks } from "../packages/packs/dist/index.js";

const webDist = new URL("../apps/web/out/", import.meta.url);
const text = (relative) => readFile(new URL(relative, webDist), "utf8");
const index = JSON.parse(await text("packs/index.json"));
const featuredSlugs = new Set(["hardware-launch", "robot-prototype", "playable-web-game", "web-presentation"]);
const featuredPacks = outcomePacks.filter((pack) => featuredSlugs.has(pack.slug));

assert.deepEqual(
  index.packs.map(({ slug, lane }) => ({ slug, lane })),
  featuredPacks.map(({ slug, lane }) => ({ slug, lane })),
);

const llms = await text("llms.txt");
assert.match(llms, /AI made execution accessible\. Possible makes operational judgment accessible\./);
assert.match(llms, /Possible\.sh is an open-source library of Outcome Packs for Codex\./);
assert.match(llms, /Each pack combines a reusable execution prompt, selected agent skills, sequencing, safeguards, and completion checks for one outcome\./);
assert.doesNotMatch(llms, /\b(?:recipes?|ingredients?|megaprompt|captain)\b|outcome compiler|composition layer/i);
for (const pack of featuredPacks) {
  const compiled = compilePack(pack);
  const publication = JSON.parse(await text(`packs/${pack.slug}.json`));
  assert.deepEqual(publication, compiled, `${pack.slug}.json must equal the canonical compiled pack`);
  assert.equal(await text(`packs/${pack.slug}/install.txt`), `${compiled.installCommands.join("\n")}\n`);
  assert.equal(await text(`packs/${pack.slug}/run.txt`), `${compiled.runPrompt}\n`);
  assert.match(llms, new RegExp(`- ${pack.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}: /packs/${pack.slug}\\.json`));
}

console.log("All featured pack publications match the canonical compiler.");
