import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getPackShowcase, publicCatalog } from "../packages/packs/dist/index.js";

const output = new URL("../apps/web/out/", import.meta.url);
const html = (path) => readFile(new URL(path, output), "utf8");
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const routeId = (entry) => entry.origin.kind === "bundled" ? entry.slug : entry.id;
const cliPackage = JSON.parse(await readFile(new URL("../apps/cli/package.json", import.meta.url), "utf8"));
const installCommand = `npx @fraylabs/possible@${cliPackage.version} init`;

const home = await html("index.html");
const headerLinks = home.match(/<div class="nav-links">([\s\S]*?)<\/div>/)?.[1] ?? "";
assert.equal((headerLinks.match(/<a\b/g) ?? []).length, 3);
for (const [href, label] of [["/#packs", "PACKS"], ["/docs", "DOCS"], ["https://github.com/fraylabs/possible", "GITHUB"]]) assert.match(headerLinks, new RegExp(`href="${escape(href)}"[^>]*>${label}`));

for (const markup of [home]) {
  assert.match(markup, /Anything is\s*(?:<[^>]+>)*possible/i);
  assert.match(markup, /What is Possible\?/i);
  assert.match(markup, /Possible\.sh is an open-source library of Outcome Packs\./i);
  assert.match(markup, new RegExp(escape(installCommand)));
  assert.match(markup, /02 \/ ASK CODEX[\s\S]*\$possible/i);
  assert.match(markup, /aria-label="Active Outcome Pack catalog"/);
  assert.doesNotMatch(markup, /START HERE|Three very different possibilities|Software, hardware, and launch storytelling/i);
}
assert.equal((home.match(/class="library-pack-card/g) ?? []).length, Math.min(6, publicCatalog.length));
assert.match(home, /aria-label="Outcome Pack pages"/);
assert.match(home, /aria-label="Search what agents can do"/);
await assert.rejects(html("packs/index.html"), { code: "ENOENT" }, "the duplicate /packs index must not be exported");

for (const entry of publicCatalog) {
  const markup = await html(`packs/${routeId(entry)}/index.html`);
  assert.match(markup, new RegExp(escape(entry.pack.name)));
  for (const phrase of ["Use this pack", "What’s inside", "Expectations", "View contract JSON"]) assert.match(markup, new RegExp(phrase));
  assert.match(markup, /class="pack-detail-technical"/);
  assert.doesNotMatch(markup, /class="pack-detail-sidebar"|class="nav-meta"/);
  assert.doesNotMatch(markup, /SCHEDULABLE|OPTIONAL SCHEDULE/);
  const showcase = getPackShowcase(entry.slug);
  if (showcase) assert.match(markup, /OUTCOME PREVIEW/);
}

const film = await html("packs/html-css-animated-product-launch-film/index.html");
assert.match(film, /<video[^>]*controls/);
assert.match(film, /SHOWCASE MEDIA IS NOT VERIFICATION/);
const robot = await html("packs/robot-digital-prototype/index.html");
for (const value of ["robot-snake-iso.png", "Choose showcase media", "CAD", "SHOWCASE MEDIA IS NOT VERIFICATION"]) assert.match(robot, new RegExp(escape(value)));
const imageShowcase = await html("packs/first-customer-sprint/index.html");
assert.match(imageShowcase, /class="pack-showcase"/);
assert.match(imageShowcase, /private-pack-offer\.png/);

for (const path of ["docs/index.html", "docs/how-to-use/index.html", "docs/outcome-packs/index.html", "docs/expectations/index.html", "docs/authoring/index.html", "docs/reference/index.html", "docs/glossary/index.html"]) {
  const markup = await html(path);
  assert.match(markup, /href="\/#packs"[^>]*>Outcome Pack library/);
  assert.doesNotMatch(markup, /href="\/examples/);
}

for (const retired of ["examples/index.html", "demo/index.html", "judging/index.html", "comparisons/robot-snake/index.html", "presentation/index.html", "evidence.json"]) {
  await assert.rejects(html(retired), { code: "ENOENT" }, `${retired} must not be exported`);
}

const appSource = await readFile(new URL("../apps/web/src/App.tsx", import.meta.url), "utf8");
assert.doesNotMatch(appSource, /ExamplesPage|JudgingPage|RobotSnakeComparisonPage|\/examples|\/demo/);

console.log("The public site contains only the pack library, product details, and documentation surfaces.");
