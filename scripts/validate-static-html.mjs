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
  ["still", "Still"],
  ["robot-snake", "Robot Snake"],
  ["fold", "Fold"],
  ["web-presentation", "Web Presentation"],
  ["patchproof", "PatchProof"],
];
const demoRoutes = [
  ["still", "Still", ["hardware"], true],
  ["robot-snake", "Robot Snake", [], true],
  ["fold", "Fold", ["game"], false],
  ["web-presentation", "Possible", ["presentation"], false],
  ["patchproof", "PatchProof", [], true],
];
const demoSectionLabels = [
  "Original request",
  "$possible conversation",
  "Recommended Outcome Pack",
  "Compiled workstreams",
  "Outcome artifacts",
  "Verification, repair, and pass",
  "Evidence",
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

const gallery = visibleText(await html("examples/index.html"));
const canonicalCardLinks = gallery.match(/href="\/examples\/(?:still|robot-snake|fold|web-presentation|patchproof)"/g) ?? [];
assert.equal(canonicalCardLinks.length, exampleRoutes.length, "/examples must contain five canonical example cards");
for (const [slug, name] of exampleRoutes) {
  assert.match(gallery, new RegExp(`href="/examples/${escape(slug)}"[\\s\\S]*?${escape(name)}`), `/examples must link ${name} to its canonical example route`);
}
assert.doesNotMatch(gallery, /Software Launch|Open-Source Release|Tiny Slug/i);

const demoIndex = visibleText(await html("demo/index.html"));
const canonicalDemoLinks = demoIndex.match(/href="\/demo\/(?:still|robot-snake|fold|web-presentation|patchproof)"/g) ?? [];
assert.equal(canonicalDemoLinks.length, demoRoutes.length, "/demo must contain five canonical process records");
for (const [slug, name] of demoRoutes) {
  assert.match(demoIndex, new RegExp(`href="/demo/${escape(slug)}"[\\s\\S]*?${escape(name)}`), `/demo must link ${name} to its canonical process record`);
}

for (const [slug, name] of exampleRoutes) {
  const markup = await html(`examples/${slug}/index.html`);
  const text = plainText(visibleText(markup));
  assert.match(markup, /role="dialog"[^>]*aria-modal="true"|aria-modal="true"[^>]*role="dialog"/, `${name} must render as an accessible modal`);
  for (const label of ["Description", "Outcome Pack", "Outputs produced"]) {
    assert.match(markup, new RegExp(`aria-label="${escape(label)}"`), `${name} must expose its ${label} region`);
  }
  assert.ok((markup.match(/class="example-modal-output"/g) ?? []).length >= 2, `${name} must expose at least two finished outputs`);
  assert.match(markup, /href="\/examples"[^>]*>[\s\S]*?(?:CLOSE|BACK TO EXAMPLES)/i, `${name} must close back to /examples`);
  assert.match(text, /OPEN OUTCOME/i, `${name} must expose its finished outcome`);
  assert.match(text, /SEE HOW POSSIBLE MADE THIS/i, `${name} must lead to the run record`);
  assert.match(markup, new RegExp(`href="/demo/${escape(slug)}"`), `${name} must link its canonical Demo`);
  for (const label of demoSectionLabels) {
    assert.doesNotMatch(markup, new RegExp(`aria-label="${escape(label)}"`), `${name} must not expose the Demo-only ${label} section`);
  }
  for (const term of ["conversation", "workstream", "verifier", "receipt"]) {
    const processLink = new RegExp(`<a\\b[^>]*>(?:(?!<\\/a>)[\\s\\S])*\\b${term}s?\\b(?:(?!<\\/a>)[\\s\\S])*<\\/a>`, "i");
    const processHeading = new RegExp(`<h[1-6]\\b[^>]*>(?:(?!<\\/h[1-6]>)[\\s\\S])*\\b${term}s?\\b(?:(?!<\\/h[1-6]>)[\\s\\S])*<\\/h[1-6]>`, "i");
    assert.doesNotMatch(markup, processLink, `${name} must not link a ${term} from the compact outcome modal`);
    assert.doesNotMatch(markup, processHeading, `${name} must not promote ${term} process internals`);
  }
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
  "/demo/patchproof",
]) assert.match(patchProofExample, new RegExp(`href="${escape(href)}"`));
assert.doesNotMatch(patchProofExample, /href="\/examples\/patchproof-chain\/evidence\/chain\.json"/, "PatchProof example must lead to its readable Demo record instead of raw JSON");

const patchProofAlias = await html("examples/patchproof-chain/index.html");
assert.doesNotMatch(patchProofAlias, /NEXT_REDIRECT/, "The legacy PatchProof URL must not export a broken redirect shell");
assert.match(patchProofAlias, /role="dialog"[^>]*aria-modal="true"|aria-modal="true"[^>]*role="dialog"/, "The legacy PatchProof URL must render the canonical shared modal");
assert.match(patchProofAlias, /rel="canonical" href="https:\/\/possible\.sh\/examples\/patchproof\/?"/, "The legacy PatchProof URL must canonicalize to /examples/patchproof");

const demoTemplateMarkers = new Set();
async function assertDemoContract(route, name, preserved) {
  const markup = await html(`${route}/index.html`);
  const marker = markup.match(/<main[^>]*data-demo-template="([^"]+)"/)?.[1];
  assert.ok(marker, `${route} must identify the shared Demo template`);
  demoTemplateMarkers.add(marker);

  const positions = demoSectionLabels.map((label) => {
    const index = markup.indexOf(`aria-label="${label}"`);
    assert.ok(index >= 0, `${route} must expose the ${label} section`);
    return index;
  });
  assert.deepEqual([...positions].sort((a, b) => a - b), positions, `${route} must preserve the canonical Demo section order`);

  const recommendedPack = markup.slice(positions[2], positions[3]);
  assert.match(recommendedPack, /href="\/packs\/[^/"]+"/, `${route} must link its recommended Outcome Pack`);
  const workstreams = markup.slice(positions[3], positions[4]);
  assert.match(workstreams, /<li\b/, `${route} must list its compiled workstreams`);
  const verification = plainText(visibleText(markup.slice(positions[5], positions[6])));
  assert.match(markup.slice(positions[5], positions[6]), /<li\b/, `${route} must state its verification disposition`);
  if (preserved) {
    for (const state of ["fail", "repair", "pass"]) assert.match(verification, new RegExp(state, "i"), `${route} verification must retain the ${state} state`);
  } else {
    assert.match(verification, /reference|not preserved/i, `${route} must not imply a preserved verification run`);
  }
  assert.match(markup.slice(positions[6]), /<a\b[^>]*href=/, `${route} must link its evidence`);
  assert.match(plainText(visibleText(markup)), new RegExp(escape(name), "i"), `${route} must identify ${name}`);
}

for (const [slug, name, aliases, preserved] of demoRoutes) {
  await assertDemoContract(`demo/${slug}`, name, preserved);
  for (const alias of aliases) await assertDemoContract(`demo/${alias}`, name, preserved);
}
assert.equal(demoTemplateMarkers.size, 1, "Every canonical and legacy Demo route must use one shared template");

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
