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
assert.match(home, /Complete a possible[\s\S]*outcome!/);
assert.match(home, /OPEN SOURCE \/ FOR CODEX/);
assert.match(home, /Possible\.sh is an open-source library of Outcome Packs\./);
assert.match(home, /Each pack combines a reusable execution prompt and selected agent skills for 50–100 coordinated tasks\./);
assert.match(home, /href="https:\/\/github\.com\/fraylabs\/possible"[^>]*>Star on GitHub[\s\S]*↗[\s\S]*<\/a>/);
assert.match(home, /href="\/presentation">See the visual explainer ↗<\/a>/);
assert.match(home, /href="#try">Install ↓<\/a>/);
assert.match(home, /npx @fraylabs\/possible@0\.1\.7 init/);
const headerLinks = home.match(/<div class="nav-links">([\s\S]*?)<\/div>/)?.[1];
assert.ok(headerLinks, "The shared header must render its desktop navigation links");
for (const href of ["/blogs", "/packs", "/benchmarks", "/docs", "/demo", "https://github.com/fraylabs/possible"]) {
  assert.match(headerLinks, new RegExp(`href="${href.replaceAll("/", "\\/")}"`));
}
assert.equal((headerLinks.match(/<a\b/g) ?? []).length, 6, "The shared header must contain exactly six navigation destinations");
assert.doesNotMatch(headerLinks, /href="\/"[^>]*>START/);
assert.match(home, /class="nav-menu-trigger"[^>]*aria-expanded="false"[^>]*aria-controls="mobile-navigation"/);
assert.match(home, /id="packs"/);
assert.match(home, /Outcome Packs coordinate[\s\S]*complete results/);
assert.match(home, /Describe the outcome\.[\s\S]*\$possible[\s\S]*recommends the right pack; you approve the run\./);
assert.match(home, /<section class="start-section"[^>]*>[\s\S]*id="start"[\s\S]*id="packs"[\s\S]*<\/section>/);
assert.match(home, /RECORDED OUTCOMES \/ 03/);
assert.match(home, /See[\s\S]*\$possible[\s\S]*brainstorm—and what it produced/);
for (const href of ["/demo/robot-snake", "/demo/hardware", "/demo/game"]) {
  assert.match(home, new RegExp(`href="${href.replaceAll("/", "\\/")}"`));
}
const heroIndex = home.indexOf('class="build-hero"');
const demoIndex = home.indexOf('class="home-demo"');
const packsIndex = home.indexOf('class="home-pack-index"');
assert.ok(heroIndex >= 0 && demoIndex > heroIndex && packsIndex > demoIndex, "The homepage must place demos between the hero and packs");
assert.match(home, /BENCHMARK SUITE \/ TWO OUTCOMES/);
assert.match(home, /Can Codex infer[\s\S]*what you forgot to ask for/);
assert.match(home, /Compare Direct,[\s\S]*\/goal[\s\S]*\$possible/);
assert.doesNotMatch(home, /href="\/proof"/);
assert.doesNotMatch(home, /href="\/#packs"|Browse packs/);
assert.match(homeMarkup, /<meta property="og:image" content="https:\/\/possible\.sh\/og\.png"\/>/);
assert.match(homeMarkup, /<meta name="twitter:image" content="https:\/\/possible\.sh\/og\.png"\/>/);
assert.match(homeMarkup, /<meta name="description" content="Possible\.sh is an open-source library of Outcome Packs for Codex\. Each pack combines a reusable execution prompt, agent skills, and verification\."\/>/);
assert.doesNotMatch(home, /<div id="root"><\/div>/);
assert.doesNotMatch(home, /conversational outcome compiler|outcome lanes|ingredient skills|pack knowledge|workstreams/i);
assert.doesNotMatch(home, /class="[^"]*(?:journey|recommendation-example|starter-card)/);

const homeMain = home.match(/<main[\s\S]*<\/main>/i)?.[0];
assert.ok(homeMain, "The homepage must contain a semantic main element");
const homepageWordCount = plainText(homeMain).split(/\s+/).filter(Boolean).length;
assert.ok(homepageWordCount <= 250, `Homepage must stay at or below 250 words; found ${homepageWordCount}`);
assert.doesNotMatch(homeMain, /\bAI agents\b|megaprompt|class="[^"]*(?:schedule-entry|quick-path|boundary)/i);

for (const pack of outcomePacks) {
  const escapedName = pack.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  assert.match(home, new RegExp(escapedName));
  assert.match(home, new RegExp(`href="/packs/${pack.slug}"`));
}
assert.doesNotMatch(home, /Open the full pack reference/);

const catalog = visibleText(await html("packs/index.html"));
assert.match(catalog, /Reviewed Outcome Packs/);
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
  const footerIndex = markup.indexOf('class="demo-outcome-footer"');
  assert.ok(artifactIndex >= 0, `${label} demo must expose its outcome artifacts`);
  assert.ok(conversationIndex > artifactIndex, `${label} demo must show artifacts before the short conversation`);
  assert.ok(footerIndex > conversationIndex, `${label} demo must finish with its footer after the conversation`);
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
  ["benchmarks/index.html", "POSSIBLE BENCHMARK SUITE / V0.1"],
  ["benchmarks/kickstarter-funding/index.html", "FUNDING-0.1[\\s\\S]*/[\\s\\S]*FUNDING"],
  ["benchmarks/kickstarter-shipped/index.html", "SHIPPED-0.1[\\s\\S]*/[\\s\\S]*SHIPPING"],
  ["docs/index.html", "Build complete outcomes with Possible"],
  ["docs/how-to-use/index.html", "How to use Possible"],
  ["demo/index.html", "HARDWARE LAUNCH"],
  ["demo/hardware/index.html", "Hardware Launch"],
  ["demo/software/index.html", "Software Launch"],
  ["demo/open-source/index.html", "Open-Source Release"],
  ["demo/game/index.html", "Playable Web Game"],
  ["presentation/index.html", "Possible.sh visual explainer"],
]) {
  assert.match(visibleText(await html(relativePath)), new RegExp(expected));
}

const presentation = await html("presentation/possible.html");
assert.equal((presentation.match(/class="slide(?: [^"]*)?"/g) ?? []).length, 10, "The visual explainer must contain ten coded slides");
for (const phrase of ["Agent skill", "Execution prompt", "Outcome Pack", "$possible", "50–100 coordinated tasks", "npx @fraylabs/possible init"]) {
  assert.match(presentation, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `The visual explainer must teach '${phrase}'`);
}
assert.match(presentation, /possible-visual-atlas\.webp/);
assert.match(presentation, /data-action="notes"/);
assert.match(presentation, /prefers-reduced-motion/);

await assert.rejects(html("proof/index.html"), { code: "ENOENT" }, "The retired /proof route must not be exported");
await assert.rejects(html("benchmarks/billion-dollar-company/index.html"), { code: "ENOENT" }, "The retired billion-dollar benchmark must not be exported");
const [sourcePublicProof, exportedPublicProof] = await Promise.all([
  readFile(new URL("../benchmarks/outcome-v1/PUBLIC-PROOF.md", import.meta.url), "utf8"),
  html("benchmarks/outcome-v1/public-proof.md"),
]);
assert.equal(exportedPublicProof, sourcePublicProof, "The exported benchmark proof must match its canonical source");

const benchmarkGallery = visibleText(await html("benchmarks/index.html"));
assert.match(benchmarkGallery, /Which workflow supplies[\s\S]*the missing judgment/);
assert.doesNotMatch(benchmarkGallery, /href="\/benchmarks\/simple-prompt"/);
assert.doesNotMatch(benchmarkGallery, /href="\/benchmarks\/billion-dollar-company"/);
assert.match(benchmarkGallery, /href="\/benchmarks\/kickstarter-funding"/);
assert.match(benchmarkGallery, /href="\/benchmarks\/kickstarter-shipped"/);
assert.match(benchmarkGallery, /NO CONTROLLED RUNS[\s\S]*Modeled · one prompt · same starting point · judgment, artifacts, and human time/);

const fundingBenchmark = visibleText(await html("benchmarks/kickstarter-funding/index.html"));
assert.match(fundingBenchmark, /The Kickstarter Funding Benchmark/);
assert.match(fundingBenchmark, /Get my product funded on Kickstarter/);
assert.match(fundingBenchmark, /21[\s\S]*ARTIFACTS/);
assert.match(fundingBenchmark, /4 hr 12 min/);
assert.match(fundingBenchmark, /campaign\/receipts\/payout-ledger\.csv/);
assert.match(fundingBenchmark, /href="\/packs\/kickstarter-funding"/);

const shippedBenchmark = visibleText(await html("benchmarks/kickstarter-shipped/index.html"));
assert.match(shippedBenchmark, /The Kickstarter-to-Shipped Benchmark/);
assert.match(shippedBenchmark, /Get this funded Kickstarter shipped/);
assert.match(shippedBenchmark, /18[\s\S]*ARTIFACTS/);
assert.match(shippedBenchmark, /5 hr 20 min/);
assert.match(shippedBenchmark, /fulfillment\/milestones\/shipment-ledger\.csv/);
assert.match(shippedBenchmark, /href="\/packs\/kickstarter-fulfillment"/);

for (const [relativePath, heading] of [["blogs/index.html", "Possible writing"], ["demo/index.html", "Possible outcome demos"]]) {
  const markup = await html(relativePath);
  assert.equal((markup.match(/<h1\b/g) ?? []).length, 1, `${relativePath} must contain exactly one h1`);
  assert.match(markup, new RegExp(`<h1[^>]*>${heading}<\\/h1>`));
}

const [appSource, stylesSource] = await Promise.all([
  readFile(new URL("../apps/web/src/App.tsx", import.meta.url), "utf8"),
  readFile(new URL("../apps/web/src/styles.css", import.meta.url), "utf8"),
]);
assert.doesNotMatch(`${appSource}\n${stylesSource}`, /\breplay-page(?:--[\w-]+)?\b/);
assert.doesNotMatch(stylesSource, /Editorial benchmark treatment/);

const writingStandard = await readFile(new URL("../WRITING.md", import.meta.url), "utf8");
assert.match(writingStandard, /Google's \[Technical Writing One\]/);
assert.match(writingStandard, /Give each sentence one idea/);
assert.match(writingStandard, /Every benchmark page uses the same order/);
assert.match(writingStandard, /Put results before explanation/);
assert.match(writingStandard, /Observed:[\s\S]*Modeled:[\s\S]*Projected:[\s\S]*Unknown:/);

console.log(`All ${outcomePacks.length + 15} public Next.js routes contain meaningful initial HTML.`);
