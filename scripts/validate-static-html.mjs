import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const output = new URL("../apps/web/out/", import.meta.url);
const html = (path) => readFile(new URL(path, output), "utf8");

const home = await html("index.html");
assert.match(home, /Discover what agents can do/);
assert.match(home, /What do you want an agent to make\?/);
assert.match(home, /All Outcomes/);
assert.doesNotMatch(home, /Most copied Outcomes/);
assert.match(home, /Loading Outcomes/);
assert.doesNotMatch(home, /Outcome Pack|expectations checklist|structured prompt/);

const outcome = await html("outcomes/view/index.html");
assert.match(outcome, /Loading Outcome/);
assert.doesNotMatch(outcome, /bundled Outcome|generated catalog/i);

for (const path of ["docs/index.html", "docs/how-to-use/index.html", "docs/authoring/index.html", "docs/reference/index.html"]) {
  const markup = await html(path);
  assert.match(markup, /Browse Outcomes/);
  assert.doesNotMatch(markup, /Outcome Pack|expectations checklist|trust status/i);
}

const publish = await html("publish/index.html");
assert.match(publish, /Publish from your source/);
assert.match(publish, /outcomes\.json/);
assert.match(publish, /no account required/i);
assert.doesNotMatch(publish, /sign in|claim/i);

for (const removed of ["dashboard/index.html", "discover/index.html", "packs/index.html", "products/index.html", "products/seedance/index.html", "skills/index.html", "skills/earthtojake--text-to-cad--skills--cad/index.html", "docs/outcome-packs/index.html", "docs/expectations/index.html", "docs/glossary/index.html"]) {
  await assert.rejects(html(removed), { code: "ENOENT" });
}
const paths = JSON.parse(await html("outcome-paths.json"));
const sitemap = await html("sitemap.xml");
assert.ok(Object.keys(paths).length > 0, "Published outcomes must be prerendered");
for (const path of Object.values(paths)) {
  const markup = await html(`${path.slice(1)}index.html`);
  const heading = markup.match(/<h1>(.*?)<\/h1>/)?.[1];
  assert.ok(heading, `Missing outcome heading: ${path}`);
  assert.ok(markup.includes(`<title>${heading} — Possible</title>`), `Wrong outcome title: ${path}`);
  assert.ok(markup.includes(`<link rel="canonical" href="https://possible.sh${path}"`), `Wrong canonical: ${path}`);
  assert.match(markup, /<meta name="description" content="[^"]+"/);
  assert.match(markup, /<meta property="og:title" content="[^"]+"/);
  assert.match(markup, /class="outcome-about"/);
  assert.doesNotMatch(markup, /Loading Outcome…/);
  assert.ok(sitemap.includes(`https://possible.sh${path}`), `Missing sitemap URL: ${path}`);
}
console.log(`Static directory, documentation, and ${Object.keys(paths).length} outcome pages are valid.`);
