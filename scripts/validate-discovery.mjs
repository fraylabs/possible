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
  ["presentation/index.html", "https://possible.sh/presentation/"],
  ["packs/hardware-launch/index.html", "https://possible.sh/packs/hardware-launch/"],
  ["packs/robot-prototype/index.html", "https://possible.sh/packs/robot-prototype/"],
  ["packs/playable-web-game/index.html", "https://possible.sh/packs/playable-web-game/"],
  ["packs/web-presentation/index.html", "https://possible.sh/packs/web-presentation/"],
  ["packs/developer-project-launch/index.html", "https://possible.sh/packs/developer-project-launch/"],
  ["packs/software-opportunity-discovery/index.html", "https://possible.sh/packs/software-opportunity-discovery/"],
];

const redirectRoutes = [
  ["demo/index.html", "/examples"],
  ["demo/still/index.html", "/examples/still?view=process"],
  ["demo/hardware/index.html", "/examples/still?view=process"],
  ["demo/robot-snake/index.html", "/examples/robot-snake?view=process"],
  ["demo/fold/index.html", "/examples/fold?view=process"],
  ["demo/game/index.html", "/examples/fold?view=process"],
  ["demo/web-presentation/index.html", "/examples/web-presentation?view=process"],
  ["demo/presentation/index.html", "/examples/web-presentation?view=process"],
  ["demo/patchproof/index.html", "/examples/patchproof?view=process"],
];

const descriptions = new Set();
const titles = new Set();
const metadataRoutes = canonicalRoutes;
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
  assert.ok(!titles.has(title), `${file} must not reuse another canonical page title: ${title}`);
  assert.ok(!descriptions.has(description), `${file} must not reuse another canonical page description`);
  titles.add(title);
  descriptions.add(description);
}

for (const [file, destination] of redirectRoutes) {
  const markup = await readOutput(file);
  assert.match(markup, new RegExp(`NEXT_REDIRECT;replace;${escape(destination)};308;`), `${file} must redirect to ${destination}`);
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
assert.doesNotMatch(sitemap, /<loc>https:\/\/possible\.sh\/demo(?:\/|<)/, "Sitemap must not index Demo compatibility routes or raw output paths");
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

console.log(`Discovery metadata is consistent across ${canonicalRoutes.length} canonical routes and ${redirectRoutes.length} exact Demo redirects.`);
