import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { outcomePacks } from "../packages/packs/dist/index.js";

const output = new URL("../apps/web/out/", import.meta.url);
const html = (relativePath) => readFile(new URL(relativePath, output), "utf8");
const visibleText = (markup) => markup.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ");
const plainText = (markup) => markup
  .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
  .replace(/<footer><a class="wordmark"[\s\S]*?<\/footer>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&[a-z0-9#]+;/gi, " ")
  .replace(/\s+/g, " ")
  .trim();

const homeMarkup = await html("index.html");
const home = visibleText(homeMarkup);
assert.match(home, /What do you want[\s\S]*to build[\s\S]*today\?/);
assert.match(home, /Bring an idea or a live app\. Possible helps Codex build, ship, operate, and safely schedule complete outcomes\./);
assert.match(home, /npx @fraylabs\/possible init/);
assert.match(homeMarkup, /<meta property="og:image" content="https:\/\/possible\.sh\/og\.png"\/>/);
assert.match(homeMarkup, /<meta name="twitter:image" content="https:\/\/possible\.sh\/og\.png"\/>/);
assert.doesNotMatch(home, /<div id="root"><\/div>/);
assert.doesNotMatch(home, /conversational outcome compiler|outcome lanes|ingredient skills|pack knowledge|workstreams/i);
assert.doesNotMatch(home, /class="[^"]*(?:journey|recommendation-example|home-pack-preview)/);

const homeMain = home.match(/<main[\s\S]*<\/main>/i)?.[0];
assert.ok(homeMain, "The homepage must contain a semantic main element");
const homepageWordCount = plainText(homeMain).split(/\s+/).filter(Boolean).length;
assert.ok(homepageWordCount <= 250, `Homepage must stay at or below 250 words; found ${homepageWordCount}`);

const starterActionTags = [...home.matchAll(/<a\b[^>]*aria-label="((?:See|Try) [^"]+)"[^>]*>/gi)]
  .map((match) => ({ label: match[1], href: match[0].match(/href="([^"]+)"/i)?.[1] }));
assert.equal(starterActionTags.length, 6, "The static homepage must expose exactly six labelled starter actions");

for (const [title, href] of [
  ["A strange 3D game", "/demo/game"],
  ["A hardware product", "/demo/hardware"],
  ["A software launch", "/demo/software"],
]) {
  assert.match(home, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.deepEqual(starterActionTags.find(({ label }) => label === `See ${title} demo`), { label: `See ${title} demo`, href });
  assert.deepEqual(starterActionTags.find(({ label }) => label === `Try ${title} with Codex`), { label: `Try ${title} with Codex`, href: "#try" });
  await html(`${href.slice(1)}/index.html`);
}

const catalog = visibleText(await html("packs/index.html"));
assert.match(catalog, /Complete recipes/);
for (const pack of outcomePacks) {
  assert.match(catalog, new RegExp(pack.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  const detail = visibleText(await html(`packs/${pack.slug}/index.html`));
  assert.match(detail, new RegExp(pack.promise.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}

for (const [relativePath, expected] of [
  ["why/index.html", "The bottleneck is no longer what AI can do"],
  ["benchmarks/index.html", "How much of the project"],
  ["docs/index.html", "Build complete outcomes with Possible"],
  ["demo/index.html", "Recorded outcomes"],
  ["demo/hardware/index.html", "Hardware Launch"],
  ["demo/software/index.html", "Software Launch"],
  ["demo/open-source/index.html", "Open-Source Release"],
  ["demo/game/index.html", "Playable Web Game"],
]) {
  assert.match(visibleText(await html(relativePath)), new RegExp(expected));
}

console.log(`All ${outcomePacks.length + 9} public Next.js routes contain meaningful initial HTML.`);
