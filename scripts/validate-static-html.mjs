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
assert.match(home, /What do you want[\s\S]*to achieve[\s\S]*today\?/);
assert.match(home, /Models know how to perform individual tasks\. Possible provides the operational knowledge to coordinate those tasks into a verified outcome\./);
assert.match(home, /npx @fraylabs\/possible@0\.1\.6 init/);
assert.match(home, /id="packs"/);
assert.match(home, /Packs are complete recipes for[\s\S]*real outcomes/);
assert.match(home, /Describe the outcome\. Possible recommends a pack before Codex begins—you do not need to choose one yourself\./);
assert.match(home, /<section class="start-section"[^>]*>[\s\S]*id="start"[\s\S]*id="packs"[\s\S]*<\/section>/);
assert.match(home, /CONTROLLED PILOT \/ FROZEN PROTOCOL/);
assert.match(home, /Direct stopped at[\s\S]*19\/20/);
assert.match(home, /Possible reached 20\/20/);
assert.match(home, /same brief, tools, workspace rules, and independent checks/);
assert.match(home, /one-run pilot is evidence from these runs—not proof of typical superiority/);
assert.match(home, /href="\/proof"/);
assert.doesNotMatch(home, /href="\/#packs"|Browse packs/);
assert.match(homeMarkup, /<meta property="og:image" content="https:\/\/possible\.sh\/og\.png"\/>/);
assert.match(homeMarkup, /<meta name="twitter:image" content="https:\/\/possible\.sh\/og\.png"\/>/);
assert.match(homeMarkup, /<meta name="description" content="Possible gives Codex the operational knowledge to coordinate individual tasks into a verified outcome\."\/>/);
assert.doesNotMatch(home, /<div id="root"><\/div>/);
assert.doesNotMatch(home, /conversational outcome compiler|outcome lanes|ingredient skills|pack knowledge|workstreams/i);
assert.doesNotMatch(home, /class="[^"]*(?:journey|recommendation-example|starter-card)/);

const homeMain = home.match(/<main[\s\S]*<\/main>/i)?.[0];
assert.ok(homeMain, "The homepage must contain a semantic main element");
const homepageWordCount = plainText(homeMain).split(/\s+/).filter(Boolean).length;
assert.ok(homepageWordCount <= 250, `Homepage must stay at or below 250 words; found ${homepageWordCount}`);
assert.doesNotMatch(homeMain, /\bAI agents\b|50[–-]100|megaprompt|class="[^"]*(?:schedule-entry|quick-path|boundary)/i);

for (const pack of outcomePacks) {
  const escapedName = pack.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  assert.match(home, new RegExp(escapedName));
  assert.match(home, new RegExp(`href="/packs/${pack.slug}"`));
}
assert.doesNotMatch(home, /Open the full pack reference/);

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
  ["proof/index.html", "One frozen brief"],
  ["blogs/index.html", "What is Possible?"],
  ["blogs/what-is-possible/index.html", "Possible is the outcome layer"],
  ["blogs/why-possible/index.html", "The bottleneck is no longer what AI can do"],
  ["benchmarks/index.html", "POSSIBLE BENCHMARK SUITE / V0.1"],
  ["benchmarks/simple-prompt/index.html", "SIMPLE-0.1[\\s\\S]*/[\\s\\S]*ONE PROMPT"],
  ["benchmarks/billion-dollar-company/index.html", "\\$1B-0.1[\\s\\S]*/[\\s\\S]*\\$1B COMPANY"],
  ["benchmarks/kickstarter-funding/index.html", "FUNDING-0.1[\\s\\S]*/[\\s\\S]*FUNDING"],
  ["benchmarks/kickstarter-shipped/index.html", "SHIPPED-0.1[\\s\\S]*/[\\s\\S]*SHIPPING"],
  ["benchmarks/step-away/index.html", "The Simple Prompt Benchmark"],
  ["benchmarks/company-systems/index.html", "Make Me a Billion-Dollar Company"],
  ["benchmarks/fulfillment/index.html", "The Kickstarter-to-Shipped Benchmark"],
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

const proof = visibleText(await html("proof/index.html"));
assert.match(proof, /OUTCOME-V1 \/ MEASURED PILOT/);
assert.match(proof, /One frozen brief[\s\S]*Five workflows[\s\S]*One verifier/);
assert.match(proof, /Direct prompt[\s\S]*Not verified[\s\S]*19 \/ 20/);
assert.match(proof, /\$possible[\s\S]*Verified[\s\S]*20 \/ 20/);
assert.match(proof, /Production is not completion[\s\S]*Possible stops only when the outcome passes[\s\S]*honest no-go/);
assert.match(proof, /four 404 errors inside the outcome room/);
assert.match(proof, /One run per condition does not estimate typical performance or variance/);
assert.match(proof, /href="\/benchmarks\/outcome-v1\/public-proof\.md"/);
const [sourcePublicProof, exportedPublicProof] = await Promise.all([
  readFile(new URL("../benchmarks/outcome-v1/PUBLIC-PROOF.md", import.meta.url), "utf8"),
  html("benchmarks/outcome-v1/public-proof.md"),
]);
assert.equal(exportedPublicProof, sourcePublicProof, "The exported benchmark proof must match its canonical source");

const benchmarkGallery = visibleText(await html("benchmarks/index.html"));
assert.match(benchmarkGallery, /Measure the[\s\S]*whole outcome/);
assert.match(benchmarkGallery, /href="\/benchmarks\/simple-prompt"/);
assert.match(benchmarkGallery, /href="\/benchmarks\/billion-dollar-company"/);
assert.match(benchmarkGallery, /href="\/benchmarks\/kickstarter-funding"/);
assert.match(benchmarkGallery, /href="\/benchmarks\/kickstarter-shipped"/);
assert.match(benchmarkGallery, /Fixed task · explicit metric · reproducible protocol · evidence-backed results · disclosed limitations/);

const simplePromptBenchmark = visibleText(await html("benchmarks/simple-prompt/index.html"));
assert.match(simplePromptBenchmark, /The Simple Prompt Benchmark/);
assert.match(simplePromptBenchmark, /Useful verified work/);
assert.match(simplePromptBenchmark, /A score requires a receipt/);
assert.doesNotMatch(simplePromptBenchmark, /7h 20m|91% modeled|PRIMARY SOURCE BASIS/);

const companyBenchmark = visibleText(await html("benchmarks/billion-dollar-company/index.html"));
assert.match(companyBenchmark, /Make Me a Billion-Dollar Company/);
assert.match(companyBenchmark, /Verified revenue/);
assert.match(companyBenchmark, /earned rubric points ÷ 48 × 100/);
assert.match(companyBenchmark, /Coverage never substitutes for money/);
assert.match(companyBenchmark, /revenue record stays at \$0/);
assert.match(companyBenchmark, /Atlassian FY2025 Form 10-K/);
assert.match(companyBenchmark, /GitLab public marketing handbook/);
assert.match(companyBenchmark, /Cloudflare 2019 prospectus/);
assert.doesNotMatch(companyBenchmark, /Projected time to \$100M|8–13 years/);

const fundingBenchmark = visibleText(await html("benchmarks/kickstarter-funding/index.html"));
assert.match(fundingBenchmark, /The Kickstarter Funding Benchmark/);
assert.match(fundingBenchmark, /Net funds received/);
assert.match(fundingBenchmark, /Payout received/);
assert.match(fundingBenchmark, /Unfunded campaigns remain in the cohort/);

const shippedBenchmark = visibleText(await html("benchmarks/kickstarter-shipped/index.html"));
assert.match(shippedBenchmark, /The Kickstarter-to-Shipped Benchmark/);
assert.match(shippedBenchmark, /FUNDED TO 95% SHIPPED/);
assert.match(shippedBenchmark, /Delayed and unfinished campaigns remain in the cohort/);
assert.match(shippedBenchmark, /Kickstarter fulfillment dashboard guidance/);
assert.doesNotMatch(shippedBenchmark, /Net funds received|TIME TO KICKSTARTER/);

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

console.log(`All ${outcomePacks.length + 20} public Next.js routes contain meaningful initial HTML.`);
