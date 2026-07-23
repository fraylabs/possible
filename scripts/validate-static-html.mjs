import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stableOutcomePacks } from "../packages/packs/dist/index.js";

const output = new URL("../apps/web/out/", import.meta.url);
const html = (relativePath) => readFile(new URL(relativePath, output), "utf8");
const visibleText = (markup) => markup.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ");
const plainText = (markup) => markup.replace(/<[^>]+>/g, " ").replace(/&[a-z0-9#]+;/gi, " ").replace(/\s+/g, " ").trim();
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const featuredPacks = stableOutcomePacks;
const exampleRoutes = [
  ["still", "Still", "helps me focus"],
  ["robot-snake", "Robot Snake", "robot snake"],
  ["fold", "Fold", "paper plane"],
  ["web-presentation", "Web Presentation", "wall of text"],
  ["patchproof", "PatchProof", "problem is worth solving"],
];

const homeMarkup = await html("index.html");
const home = visibleText(homeMarkup);
assert.match(home, /Complete a possible[\s\S]*outcome\./);
assert.match(home, /Possible\.sh is an open-source library of Outcome Packs\.[\s\S]*dozens of coordinated tasks\./);
assert.match(home, /npx @fraylabs\/possible@0\.1\.10 init/);
assert.match(home, /DESCRIBE[\s\S]*APPROVE[\s\S]*EXECUTE[\s\S]*VERIFY/);
assert.match(home, /FEATURED OUTCOMES/);

const judgingMarkup = await html("judging/index.html");
const judgingText = plainText(visibleText(judgingMarkup));
const evidenceManifest = JSON.parse(await html("evidence.json"));
for (const item of evidenceManifest.judgingCriteria) {
  for (const value of [item.criterion, item.claim, item.implementationFact, item.significance]) {
    assert.ok(judgingText.includes(value), `/judging must publish the canonical evidence text: ${value}`);
  }
}
assert.ok(judgingText.split(/\s+/).filter(Boolean).length <= 500, "/judging must contain its complete visible argument within 500 words");
assert.doesNotMatch(judgingMarkup, /<caption[^>]*class="sr-only"/i, "/judging must not hide evidence text");
assert.match(judgingMarkup, /href="https:\/\/github\.com\/fraylabs\/possible\/blob\/main\/BUILD-WEEK\.md"/, "/judging must link the Build Week record");
assert.doesNotMatch(judgingText, /\bwrapper\b|Why this is not/i, "/judging must explain Possible directly");
assert.match(judgingText, /recorded[\s\S]{0,120}\/goal[\s\S]{0,120}(?:comparison|control)|\/goal[\s\S]{0,120}(?:comparison|control)/i, "/judging must surface the recorded /goal comparison");
assert.match(judgingText, /\/goal[\s\S]{0,160}(?:dynamic pursuit|persist|adapt)/i, "/judging must explain the role of /goal");
assert.match(judgingText, /Possible[\s\S]{0,160}(?:reviewed|controlled)[\s\S]{0,100}(?:outcome )?contract/i, "/judging must explain the role of Possible");
for (const [label, targets] of [
  ["control protocol", [
    "/demo/robot-snake/CONTROL-RUN.md",
    "https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/robot-snake/CONTROL-RUN.md",
  ]],
  ["preserved control artifacts", ["/demo/robot-snake/control/", "https://possible.sh/demo/robot-snake/control/"]],
  ["Possible artifact manifest", ["/demo/robot-snake/manifest.json", "https://possible.sh/demo/robot-snake/manifest.json"]],
  ["Possible completion report", [
    "/demo/robot-snake/evidence/outcome-receipt.md",
    "https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/robot-snake/evidence/outcome-receipt.md",
  ]],
]) {
  assert.ok(targets.some((target) => judgingMarkup.includes(`href="${target}"`)), `/judging must directly link the ${label}`);
}
assert.match(judgingMarkup, /href="https:\/\/github\.com\/fraylabs\/possible\/blob\/main\/apps\/web\/public\/demo\/still\/CODEX-THREAD\.md#run-prompt"/, "/judging must link the preserved Still run prompt, not the current generic pack output");
assert.doesNotMatch(judgingMarkup, /href="\/packs\/hardware-launch\/run\.txt"/, "/judging must not substitute a mutable generic prompt for preserved run evidence");

const headerLinks = home.match(/<div class="nav-links">([\s\S]*?)<\/div>/)?.[1];
assert.ok(headerLinks, "The shared header must render desktop navigation");
assert.equal((headerLinks.match(/<a\b/g) ?? []).length, 3, "The header must contain Examples, Docs, and GitHub only");
for (const [href, label] of [["/examples", "EXAMPLES"], ["/docs", "DOCS"], ["https://github.com/fraylabs/possible", "GITHUB"]]) {
  assert.match(headerLinks, new RegExp(`href="${escape(href)}"[^>]*>${label}`));
}
assert.doesNotMatch(headerLinks, /BLOGS|PACKS|BENCH|SOURCE/);

for (const [href, name] of [
  ["/examples/still", "Still"],
  ["/examples/robot-snake", "Robot Snake"],
  ["/examples/fold", "Fold"],
  ["/examples/web-presentation", "Web Presentation"],
]) {
  assert.match(home, new RegExp(`href="${escape(href)}"[\\s\\S]*?${escape(name)}`));
}

for (const pack of featuredPacks) {
  assert.match(home, new RegExp(escape(pack.name)));
  assert.match(home, new RegExp(`href="/packs/${pack.slug}"`));
}

for (const forbidden of [
  /50[–-]100 coordinated tasks/i,
  /RECORDED OUTCOMES \/ \d+/i,
  /BENCHMARK|NO CONTROLLED RUNS/i,
  /Compare Direct|\/goal comparisons?/i,
  /schedule operations|recurring operation/i,
]) assert.doesNotMatch(home, forbidden);

const heroIndex = home.indexOf('class="build-hero"');
const workflowIndex = home.indexOf('class="home-workflow"');
const demosIndex = home.indexOf('class="home-demo"');
const technicalIndex = home.indexOf('class="home-pack-index"');
const sourceIndex = home.indexOf('aria-labelledby="home-source-heading"');
assert.ok(heroIndex >= 0 && workflowIndex > heroIndex && demosIndex > workflowIndex && technicalIndex > demosIndex && sourceIndex > technicalIndex, "Homepage sections must follow the judge journey");

const homepageWordCount = plainText(home.match(/<main[\s\S]*<\/main>/)?.[0] ?? "").split(/\s+/).filter(Boolean).length;
assert.ok(homepageWordCount <= 330, `Homepage must remain concise; found ${homepageWordCount} words`);
assert.match(homeMarkup, /<meta property="og:image" content="https:\/\/possible\.sh\/og\.png"\/>/);
assert.doesNotMatch(home, /<div id="root"><\/div>/);

const catalog = visibleText(await html("packs/index.html"));
for (const pack of featuredPacks) {
  assert.match(catalog, new RegExp(escape(pack.name)));
  const detail = visibleText(await html(`packs/${pack.slug}/index.html`));
  assert.match(detail, new RegExp(escape(pack.promise)));
  assert.doesNotMatch(detail, /SCHEDULABLE|OPTIONAL SCHEDULE|Schedule the operating loop/i);
  assert.doesNotMatch(detail, /EXPERIMENTAL OUTCOME PACK|Preserved end-to-end evidence is still in progress/i);
}
assert.match(catalog, /Outcome Packs page 1 of 2/);
assert.match(catalog, /Outcome Packs page 2 of 2/);
assert.match(catalog, /aria-label="Outcome Pack pages"/);
for (const slug of ["software-launch", "open-source-release", "marketing-operations", "billion-dollar-saas"]) {
  await assert.rejects(html(`packs/${slug}/index.html`), { code: "ENOENT" }, `${slug} must not be exported`);
}

for (const galleryFile of ["examples/index.html", "demo/index.html"]) {
  const gallery = visibleText(await html(galleryFile));
  const canonicalCardLinks = gallery.match(/href="\/examples\/(?:still|robot-snake|fold|web-presentation|patchproof)"/g) ?? [];
  assert.equal(canonicalCardLinks.length, exampleRoutes.length, `${galleryFile} must contain five canonical example cards`);
  for (const [slug, name] of exampleRoutes) {
    assert.match(gallery, new RegExp(`href="/examples/${escape(slug)}"[\\s\\S]*?${escape(name)}`), `${galleryFile} must link ${name} to its canonical example route`);
  }
  assert.doesNotMatch(gallery, /Software Launch|Open-Source Release|Tiny Slug/i);
}

for (const [slug, name, requestSnippet] of exampleRoutes) {
  const markup = await html(`examples/${slug}/index.html`);
  const text = plainText(visibleText(markup));
  assert.match(markup, /role="dialog"[^>]*aria-modal="true"|aria-modal="true"[^>]*role="dialog"/, `${name} must render as an accessible modal`);
  for (const label of ["Original request", "Preview"]) assert.match(markup, new RegExp(`aria-label="${escape(label)}"`), `${name} must expose its ${label} region`);
  assert.match(markup, /aria-label="What (?:Possible inferred|the pack defines)"/, `${name} must explain the operational judgment behind the result`);
  assert.match(markup, /aria-label="Proof(?: metrics)?"/i, `${name} must expose its proof metrics region`);
  assert.match(markup, /aria-label="Outcome (?:Pack|Chain)"/, `${name} must identify the Outcome Pack or Outcome Chain behind the result`);
  assert.match(markup, /href="\/examples"[^>]*>[\s\S]*?(?:CLOSE|BACK TO EXAMPLES)/i, `${name} must close back to /examples`);
  assert.match(text, /OPEN OUTPUT/i, `${name} must expose its primary output`);
  assert.match(text, /INSPECT EVIDENCE/i, `${name} must expose its preserved evidence`);

  assert.match(text, new RegExp(escape(requestSnippet), "i"), `${name} must preserve its unique original request in static HTML`);
}

const exampleContentSource = await readFile(new URL("../apps/web/src/example-content.ts", import.meta.url), "utf8");
const appSource = await readFile(new URL("../apps/web/src/App.tsx", import.meta.url), "utf8");
assert.match(exampleContentSource, /export const exampleCatalog\s*=\s*\[/, "Examples must come from one shared catalog");
assert.equal((exampleContentSource.match(/\n\s+slug:\s*"/g) ?? []).length, exampleRoutes.length, "The shared catalog must contain exactly five examples");
assert.match(appSource, /exampleCatalog(?:\.slice\([^)]*\))?\.map\(/, "The gallery must render cards from the shared example catalog");

const patchProofExample = visibleText(await html("examples/patchproof/index.html"));
assert.doesNotMatch(patchProofExample, /class="chain-example-page"|One rough ambition[\s\S]*Three verified outcomes/, "PatchProof must use the shared compact example modal rather than its bespoke long page");
for (const href of [
  "/examples/patchproof-chain/product/index.html",
  "/examples/patchproof-chain/evidence/chain.json",
]) assert.match(patchProofExample, new RegExp(`href="${escape(href)}"`));

const patchProofAlias = await html("examples/patchproof-chain/index.html");
assert.doesNotMatch(patchProofAlias, /NEXT_REDIRECT/, "The legacy PatchProof URL must not export a broken redirect shell");
assert.match(patchProofAlias, /role="dialog"[^>]*aria-modal="true"|aria-modal="true"[^>]*role="dialog"/, "The legacy PatchProof URL must render the canonical shared modal");
assert.match(patchProofAlias, /rel="canonical" href="https:\/\/possible\.sh\/examples\/patchproof\/?"/, "The legacy PatchProof URL must canonicalize to /examples/patchproof");

for (const [label, route, hasThread] of [
  ["hardware", "demo/hardware/index.html", true],
  ["robot", "demo/robot-snake/index.html", false],
  ["game", "demo/game/index.html", false],
  ["presentation", "demo/presentation/index.html", false],
]) {
  const markup = await html(route);
  const artifacts = markup.indexOf('aria-label="Outcome artifacts"');
  const conversation = markup.indexOf('aria-label="$possible conversation"');
  const footer = markup.indexOf('class="demo-outcome-footer"');
  assert.ok(artifacts >= 0 && conversation > artifacts && footer > conversation, `${label} must show output, conversation, then footer`);
  assert.match(markup, /Yes, proceed\./);
  if (hasThread) assert.match(markup, /FULL CODEX THREAD/);
}

const docs = visibleText(await html("docs/index.html"));
assert.match(docs, /npx @fraylabs\/possible@0\.1\.10 init/);
assert.doesNotMatch(docs, /schedule operations|recurring outcome|\.possible\/schedule\.json/i);

const howToUseMarkup = await html("docs/how-to-use/index.html");
const howToUse = plainText(visibleText(howToUseMarkup));
assert.match(howToUseMarkup, /id="goal-and-possible"/, "/docs/how-to-use must give the combined workflow a stable section");
assert.match(howToUseMarkup, /href="#goal-and-possible"/, "/docs/how-to-use must expose the combined workflow in its table of contents");
assert.match(howToUse, /\/goal[\s\S]{0,240}(?:pursuit|persist|adapt)/i, "/docs/how-to-use must explain the role of /goal");
assert.match(howToUse, /Possible[\s\S]{0,240}(?:reviewed|controlled)[\s\S]{0,120}(?:outcome )?contract/i, "/docs/how-to-use must explain the role of Possible");
assert.match(howToUse, /(?:together|combine|both)[\s\S]{0,320}(?:target|execution|revision|discover)/i, "/docs/how-to-use must explain their combined workflow");

const presentation = await html("presentation/possible.html");
assert.equal((presentation.match(/class="slide(?: [^"]*)?"/g) ?? []).length, 10, "The visual explainer must contain ten coded slides");
for (const phrase of ["Agent skill", "Execution prompt", "Outcome Pack", "$possible", "dozens of coordinated tasks", "npx @fraylabs/possible@0.1.10 init"]) {
  assert.match(presentation, new RegExp(escape(phrase)), `The visual explainer must teach '${phrase}'`);
}

for (const retired of [
  "blogs/index.html",
  "benchmarks/index.html",
  "demo/software/index.html",
  "demo/open-source/index.html",
]) await assert.rejects(html(retired), { code: "ENOENT" }, `${retired} must not be exported`);

console.log("All public routes match the five-example gallery and evidence journey.");
