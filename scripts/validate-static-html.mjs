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
assert.match(home, /Bring an idea or a live app\. Possible gives Codex the skills, plan, and proof to build it, ship it, or keep it running\./);
assert.match(home, /npx @fraylabs\/possible init/);
assert.match(home, /id="packs"/);
assert.match(home, /Packs are complete recipes for[\s\S]*real outcomes/);
assert.match(home, /Browse them, or just describe what you want/);
assert.match(home, /<section class="start-section"[^>]*>[\s\S]*id="start"[\s\S]*id="packs"[\s\S]*<\/section>/);
assert.doesNotMatch(home, /href="\/#packs"|Browse packs/);
assert.match(homeMarkup, /<meta property="og:image" content="https:\/\/possible\.sh\/og\.png"\/>/);
assert.match(homeMarkup, /<meta name="twitter:image" content="https:\/\/possible\.sh\/og\.png"\/>/);
assert.doesNotMatch(home, /<div id="root"><\/div>/);
assert.doesNotMatch(home, /conversational outcome compiler|outcome lanes|ingredient skills|pack knowledge|workstreams/i);
assert.doesNotMatch(home, /class="[^"]*(?:journey|recommendation-example|starter-card)/);

const homeMain = home.match(/<main[\s\S]*<\/main>/i)?.[0];
assert.ok(homeMain, "The homepage must contain a semantic main element");
const homepageWordCount = plainText(homeMain).split(/\s+/).filter(Boolean).length;
assert.ok(homepageWordCount <= 300, `Homepage must stay at or below 300 words; found ${homepageWordCount}`);

for (const pack of outcomePacks) {
  const escapedName = pack.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  assert.match(home, new RegExp(escapedName));
  assert.match(home, new RegExp(`href="/packs/${pack.slug}"`));
}
assert.match(home, /href="\/packs"[^>]*>Open the full pack reference/);

const catalog = visibleText(await html("packs/index.html"));
assert.match(catalog, /Complete recipes/);
for (const pack of outcomePacks) {
  assert.match(catalog, new RegExp(pack.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  const detail = visibleText(await html(`packs/${pack.slug}/index.html`));
  assert.match(detail, new RegExp(pack.promise.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}

const hardwareDemo = await html("demo/hardware/index.html");
const softwareDemo = await html("demo/software/index.html");
const openSourceDemo = await html("demo/open-source/index.html");
const gameDemo = await html("demo/game/index.html");
assert.match(hardwareDemo, /src="\/demo\/still\/site\/index\.html"/);
assert.match(softwareDemo, /src="\/demo\/three\/product\/index\.html"/);
assert.match(softwareDemo, /src="\/demo\/three\/site\/index\.html"/);
for (const [label, markup, hasThread] of [
  ["hardware", hardwareDemo, true],
  ["software", softwareDemo, true],
  ["open-source", openSourceDemo, true],
  ["game", gameDemo, false],
]) {
  const artifactIndex = markup.indexOf('aria-label="Outcome artifacts"');
  const conversationIndex = markup.indexOf('aria-label="$possible conversation"');
  assert.ok(artifactIndex >= 0, `${label} demo must expose its outcome artifacts`);
  assert.ok(conversationIndex > artifactIndex, `${label} demo must show artifacts before the short conversation`);
  assert.match(markup, /What would you like to make possible today\?/);
  assert.match(markup, /Yes, proceed\./);
  assert.match(markup, /01 \/[\s\S]*OUTPUT/);
  assert.match(markup, /02 \/[\s\S]*CONVERSATION/);
  if (hasThread) assert.match(markup, /03 \/[\s\S]*FULL CODEX THREAD/);
  else assert.doesNotMatch(markup, /FULL CODEX THREAD/);
}
for (const [relativePath, assetPrefix] of [
  ["demo/still/site/index.html", "/demo/still/site/assets/"],
  ["demo/three/product/index.html", "/demo/three/product/assets/"],
  ["demo/three/site/index.html", "/demo/three/site/assets/"],
]) {
  const embeddedApp = await html(relativePath);
  assert.match(embeddedApp, new RegExp(`(?:src|href)="${assetPrefix.replaceAll("/", "\\/")}`));
}

for (const [relativePath, expected] of [
  ["blogs/index.html", "What is Possible?"],
  ["blogs/what-is-possible/index.html", "Possible is the outcome layer"],
  ["blogs/why-possible/index.html", "The bottleneck is no longer what AI can do"],
  ["benchmarks/index.html", "How long to reach"],
  ["docs/index.html", "Build complete outcomes with Possible"],
  ["docs/how-to-use/index.html", "How to use Possible"],
  ["demo/index.html", "HARDWARE LAUNCH"],
  ["demo/hardware/index.html", "Hardware Launch"],
  ["demo/software/index.html", "Software Launch"],
  ["demo/open-source/index.html", "Open-Source Release"],
  ["demo/game/index.html", "Playable Web Game"],
]) {
  assert.match(visibleText(await html(relativePath)), new RegExp(expected));
}

console.log(`All ${outcomePacks.length + 12} public Next.js routes contain meaningful initial HTML.`);
