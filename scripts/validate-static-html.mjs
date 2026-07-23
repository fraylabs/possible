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
const compatibilityRedirects = [
  ["demo", "/examples"],
  ["demo/still", "/examples/still?view=process"],
  ["demo/hardware", "/examples/still?view=process"],
  ["demo/robot-snake", "/examples/robot-snake?view=process"],
  ["demo/fold", "/examples/fold?view=process"],
  ["demo/game", "/examples/fold?view=process"],
  ["demo/web-presentation", "/examples/web-presentation?view=process"],
  ["demo/presentation", "/examples/web-presentation?view=process"],
  ["demo/patchproof", "/examples/patchproof?view=process"],
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

const comparisonMarkup = await html("comparisons/robot-snake/index.html");
const comparisonText = plainText(visibleText(comparisonMarkup));
assert.match(comparisonText, /Same rough request\.\s*Different starting knowledge\./i);
assert.match(comparisonText, /\/goal I want to make a robot snake/i);
assert.match(comparisonText, /No robotics vocabulary\.\s*No acceptance checklist\./i);
assert.match(comparisonMarkup, /href="\/demo\/robot-snake\/control\/"/, "The comparison must link the preserved /goal output");
assert.match(comparisonMarkup, /href="\/demo\/robot-snake\/manifest\.json"/, "The comparison must link the Possible manifest");
assert.match(comparisonText, /Possible defines what complete means/i);
assert.match(comparisonText, /\/goal sustains the pursuit/i);

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

for (const [slug, name] of exampleRoutes) {
  const markup = await html(`examples/${slug}/index.html`);
  const text = plainText(visibleText(markup));
  assert.match(markup, /role="dialog"[^>]*aria-modal="true"|aria-modal="true"[^>]*role="dialog"/, `${name} must render as an accessible modal`);
  for (const label of ["Description", "Outcome Pack", "Output carousel", "You asked", "Possible added", "Verification caught", "Final outcome"]) {
    assert.match(markup, new RegExp(`aria-label="${escape(label)}"`), `${name} must expose its ${label} region`);
  }
  assert.match(markup, /role="tablist"[^>]*aria-label="Example view"/, `${name} must expose one Outputs / Process switch`);
  assert.match(markup, /role="tab"[^>]*aria-selected="true"[^>]*>OUTPUTS<\/button>/, `${name} must open on Outputs`);
  assert.match(markup, /role="tab"[^>]*aria-selected="false"[^>]*>PROCESS<\/button>/, `${name} must expose its inline Process view`);
  assert.match(markup, /aria-label="Previous output"[^>]*>[\s\S]*?&lt;[\s\S]*?<\/button>/, `${name} must expose a previous-output control`);
  assert.match(markup, /aria-label="Next output"[^>]*>[\s\S]*?&gt;[\s\S]*?<\/button>/, `${name} must expose a next-output control`);
  assert.match(text, /01\s*\/\s*0[1-9]/, `${name} must expose at least one truthful featured output in its carousel`);
  assert.match(markup, /aria-label="Close example"[^>]*>[\s\S]*?CLOSE/i, `${name} must expose a modal close control`);
  assert.match(markup, /class="example-output-inventory"/, `${name} must expose its complete output inventory in the same modal`);
  assert.match(text, /VIEW ALL OUTPUTS[\s\S]*\d+ FEATURED\s*\/\s*\d+ TOTAL/, `${name} must distinguish featured and total outputs`);
  assert.doesNotMatch(text, /OPEN OUTCOME/i, `${name} must not repeat the active output as a second modal action`);
  assert.doesNotMatch(text, /SEE HOW POSSIBLE MADE THIS/i, `${name} must keep Process inside the example modal`);
  assert.doesNotMatch(markup, new RegExp(`href="/demo/${escape(slug)}"`), `${name} must not link a second process page`);
  if (slug !== "web-presentation") assert.match(markup, /class="example-process-evidence"/, `${name} must keep preserved raw evidence optional`);
  if (slug === "robot-snake") {
    assert.match(markup, /class="example-process-comparison"[^>]*href="\/comparisons\/robot-snake"/, "Robot Snake Process must link its recorded comparison");
  }
}

const exampleContentSource = await readFile(new URL("../apps/web/src/example-content.ts", import.meta.url), "utf8");
const appSource = await readFile(new URL("../apps/web/src/App.tsx", import.meta.url), "utf8");
const stylesSource = await readFile(new URL("../apps/web/src/styles.css", import.meta.url), "utf8");
assert.match(exampleContentSource, /export const exampleCatalog\s*=\s*\[/, "Examples must come from one shared catalog");
assert.equal((exampleContentSource.match(/\n\s+slug:\s*"/g) ?? []).length, exampleRoutes.length, "The shared catalog must contain exactly five examples");
assert.match(appSource, /exampleCatalog(?:\.slice\([^)]*\))?\.map\(/, "The gallery must render cards from the shared example catalog");
assert.match(stylesSource, /\.example-modal \[hidden\] \{ display: none !important; \}/, "Inactive example views must remain visually hidden when their layouts define display");
assert.match(stylesSource, /\.example-output-inventory \{ margin-top: auto;/, "The complete output inventory control must stay visible in the modal information column");
assert.match(stylesSource, /\.example-output-inventory ol \{[\s\S]*grid-template-columns: 1fr;/, "Complete output inventories must remain one readable column");
assert.doesNotMatch(exampleContentSource, /title: "Simulation controls"[\s\S]{0,240}\/demo\/robot-snake\/control\//, "The plain /goal control run must not be presented as a Possible output");

const patchProofExample = visibleText(await html("examples/patchproof/index.html"));
assert.doesNotMatch(patchProofExample, /class="chain-example-page"|One rough ambition[\s\S]*Three verified outcomes/, "PatchProof must use the shared compact example modal rather than its bespoke long page");
assert.match(plainText(patchProofExample), /predeclared path[\s\S]{0,220}user validation[\s\S]{0,160}next risk/i, "PatchProof must explain the planning mismatch exposed by discovery");
assert.match(plainText(patchProofExample), /went straight to a browser product[\s\S]{0,180}validation as the next outcome/i, "PatchProof must show why a fixed future sequence was wrong");
for (const href of [
  "/examples/patchproof-chain/product/index.html",
]) assert.match(patchProofExample, new RegExp(`href="${escape(href)}"`));
assert.doesNotMatch(patchProofExample, /href="\/demo\/patchproof"/, "PatchProof must keep its process inside the example modal");

const patchProofAlias = await html("examples/patchproof-chain/index.html");
assert.doesNotMatch(patchProofAlias, /NEXT_REDIRECT/, "The legacy PatchProof URL must not export a broken redirect shell");
assert.match(patchProofAlias, /role="dialog"[^>]*aria-modal="true"|aria-modal="true"[^>]*role="dialog"/, "The legacy PatchProof URL must render the canonical shared modal");
assert.match(patchProofAlias, /rel="canonical" href="https:\/\/possible\.sh\/examples\/patchproof\/?"/, "The legacy PatchProof URL must canonicalize to /examples/patchproof");

for (const [route, destination] of compatibilityRedirects) {
  const markup = await html(`${route}/index.html`);
  assert.match(markup, new RegExp(`NEXT_REDIRECT;replace;${escape(destination)};308;`), `${route} must redirect to ${destination}`);
}
const playableGame = await html("demo/game/play/index.html");
assert.doesNotMatch(playableGame, /NEXT_REDIRECT/, "/demo/game/play must remain the playable Fold output");

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
assert.match(howToUseMarkup, /id="remix-and-journey"/, "/docs/how-to-use must teach Outcome Journeys as retrospective");
assert.match(howToUse, /Outcome Journey[\s\S]{0,120}visible only afterward[\s\S]{0,260}new reality[\s\S]{0,180}fresh approval/i, "/docs/how-to-use must recommend future outcomes one at a time");
assert.doesNotMatch(howToUse, /Outcome Chain|NOW \/ IF THIS PASSES \/ LATER/i, "/docs/how-to-use must not predeclare an Outcome Chain");

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
