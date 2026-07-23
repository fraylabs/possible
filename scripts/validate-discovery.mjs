import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const repository = new URL("../", import.meta.url);
const output = new URL("../apps/web/out/", import.meta.url);
const readOutput = (path) => readFile(new URL(path, output), "utf8");
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const canonicalRoutes = [
  ["index.html", "https://possible.sh/"],
  ["packs/index.html", "https://possible.sh/packs/"],
  ["docs/index.html", "https://possible.sh/docs/"],
  ["docs/how-to-use/index.html", "https://possible.sh/docs/how-to-use/"],
  ["judging/index.html", "https://possible.sh/judging/"],
  ["examples/index.html", "https://possible.sh/examples/"],
  ["examples/still/index.html", "https://possible.sh/examples/still/"],
  ["examples/robot-snake/index.html", "https://possible.sh/examples/robot-snake/"],
  ["examples/fold/index.html", "https://possible.sh/examples/fold/"],
  ["examples/web-presentation/index.html", "https://possible.sh/examples/web-presentation/"],
  ["examples/patchproof/index.html", "https://possible.sh/examples/patchproof/"],
  ["demo/index.html", "https://possible.sh/demo/"],
  ["demo/still/index.html", "https://possible.sh/demo/still/"],
  ["demo/fold/index.html", "https://possible.sh/demo/fold/"],
  ["demo/web-presentation/index.html", "https://possible.sh/demo/web-presentation/"],
  ["demo/game/play/index.html", "https://possible.sh/demo/game/play/"],
  ["demo/robot-snake/index.html", "https://possible.sh/demo/robot-snake/"],
  ["demo/patchproof/index.html", "https://possible.sh/demo/patchproof/"],
  ["presentation/index.html", "https://possible.sh/presentation/"],
  ["packs/hardware-launch/index.html", "https://possible.sh/packs/hardware-launch/"],
  ["packs/robot-prototype/index.html", "https://possible.sh/packs/robot-prototype/"],
  ["packs/playable-web-game/index.html", "https://possible.sh/packs/playable-web-game/"],
  ["packs/web-presentation/index.html", "https://possible.sh/packs/web-presentation/"],
  ["packs/developer-project-launch/index.html", "https://possible.sh/packs/developer-project-launch/"],
  ["packs/software-opportunity-discovery/index.html", "https://possible.sh/packs/software-opportunity-discovery/"],
];

const compatibilityRoutes = [
  ["demo/hardware/index.html", "https://possible.sh/demo/hardware/", "https://possible.sh/demo/still/"],
  ["demo/game/index.html", "https://possible.sh/demo/game/", "https://possible.sh/demo/fold/"],
  ["demo/presentation/index.html", "https://possible.sh/demo/presentation/", "https://possible.sh/demo/web-presentation/"],
];

const descriptions = new Set();
const titles = new Set();
const metadataRoutes = [
  ...canonicalRoutes.map(([file, canonical]) => [file, canonical]),
  ...compatibilityRoutes.map(([file, , canonical]) => [file, canonical]),
];
for (const [file, canonical] of metadataRoutes) {
  const markup = await readOutput(file);
  assert.match(markup, new RegExp(`<link rel="canonical" href="${escape(canonical)}"`), `${file} must publish the correct canonical URL`);
  assert.match(markup, new RegExp(`<meta property="og:url" content="${escape(canonical)}"`), `${file} must publish its own Open Graph URL`);
  assert.match(markup, /<meta name="robots" content="index, follow"\/>/, `${file} must explicitly allow indexing`);
  assert.doesNotMatch(markup, /noindex/i, `${file} must not block indexing`);

  const title = markup.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = markup.match(/<meta name="description" content="([^"]+)"\/>/)?.[1];
  const openGraphDescription = markup.match(/<meta property="og:description" content="([^"]+)"\/>/)?.[1];
  const twitterDescription = markup.match(/<meta name="twitter:description" content="([^"]+)"\/>/)?.[1];
  assert.ok(title, `${file} must publish a title`);
  assert.ok(description, `${file} must publish a description`);
  assert.equal(openGraphDescription, description, `${file} Open Graph description must match its page description`);
  assert.equal(twitterDescription, description, `${file} Twitter description must match its page description`);
  if (canonicalRoutes.some(([canonicalFile]) => canonicalFile === file)) {
    assert.ok(!titles.has(title), `${file} must not reuse another canonical page title: ${title}`);
    assert.ok(!descriptions.has(description), `${file} must not reuse another canonical page description`);
    titles.add(title);
    descriptions.add(description);
  }
}

const home = await readOutput("index.html");
assert.match(home, /"@type":"WebSite"/);
assert.match(home, /"@type":"SoftwareSourceCode"/);
for (const url of [
  "https://possible.sh/",
  "https://github.com/fraylabs/possible",
  "https://www.npmjs.com/package/@fraylabs/possible",
]) assert.match(home, new RegExp(escape(url)), `Structured discovery data must include ${url}`);

const sitemap = await readOutput("sitemap.xml");
for (const [, canonical] of canonicalRoutes) {
  assert.match(sitemap, new RegExp(`<loc>${escape(canonical)}</loc>`), `Sitemap must include ${canonical}`);
}
for (const [, legacy] of compatibilityRoutes) {
  assert.doesNotMatch(sitemap, new RegExp(`<loc>${escape(legacy)}</loc>`), `Sitemap must not index compatibility URL ${legacy}`);
}
assert.equal((sitemap.match(/<lastmod>2026-07-23<\/lastmod>/g) ?? []).length, canonicalRoutes.length, "Every sitemap entry must publish the current indexed revision date");

const robots = await readOutput("robots.txt");
assert.match(robots, /^User-agent: \*\nAllow: \/\nSitemap: https:\/\/possible\.sh\/sitemap\.xml\n$/);

const llms = await readOutput("llms.txt");
for (const phrase of [
  "Possible turns one rough idea into a coordinated, independently verified, multidisciplinary outcome.",
  "simulated autonomous obstacle avoidance",
  "three material defects",
  "12/12 tests and 186/186 interface checks",
  "https://github.com/fraylabs/possible",
  "https://www.npmjs.com/package/@fraylabs/possible",
]) assert.match(llms, new RegExp(escape(phrase)), `llms.txt must publish ${phrase}`);

const cliPackage = JSON.parse(await readFile(new URL("apps/cli/package.json", repository), "utf8"));
assert.equal(cliPackage.homepage, "https://possible.sh");
assert.equal(cliPackage.repository?.url, "git+https://github.com/fraylabs/possible.git");
assert.equal(cliPackage.repository?.directory, "apps/cli");
assert.equal(cliPackage.bugs?.url, "https://github.com/fraylabs/possible/issues");
for (const keyword of ["codex", "ai-agents", "agent-skills", "outcome-packs", "developer-tools", "verification"]) {
  assert.ok(cliPackage.keywords?.includes(keyword), `CLI metadata must include ${keyword}`);
}

console.log(`Discovery metadata is consistent across ${canonicalRoutes.length} canonical routes and ${compatibilityRoutes.length} compatibility routes.`);
