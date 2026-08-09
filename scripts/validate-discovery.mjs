import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { publicCatalog } from "../packages/packs/dist/index.js";

const repository = new URL("../", import.meta.url);
const output = new URL("../apps/web/out/", import.meta.url);
const readOutput = (path) => readFile(new URL(path, output), "utf8");
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const packRouteId = (entry) => entry.origin.kind === "bundled" ? entry.slug : entry.id;
const canonicalRoutes = [
  ["index.html", "https://possible.sh/"],
  ["docs/index.html", "https://possible.sh/docs/"],
  ["docs/how-to-use/index.html", "https://possible.sh/docs/how-to-use/"],
  ["docs/outcome-packs/index.html", "https://possible.sh/docs/outcome-packs/"],
  ["docs/expectations/index.html", "https://possible.sh/docs/expectations/"],
  ["docs/authoring/index.html", "https://possible.sh/docs/authoring/"],
  ["docs/reference/index.html", "https://possible.sh/docs/reference/"],
  ["docs/glossary/index.html", "https://possible.sh/docs/glossary/"],
  ...publicCatalog.map((entry) => [`packs/${packRouteId(entry)}/index.html`, `https://possible.sh/packs/${packRouteId(entry)}/`]),
];

const titles = new Set();
const descriptions = new Set();
for (const [file, canonical] of canonicalRoutes) {
  const markup = await readOutput(file);
  assert.match(markup, new RegExp(`<link rel="canonical" href="${escape(canonical)}"`));
  assert.match(markup, new RegExp(`<meta property="og:url" content="${escape(canonical)}"`));
  assert.match(markup, /<meta name="robots" content="index, follow"\/>/);
  const title = markup.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = markup.match(/<meta name="description" content="([^"]+)"\/>/)?.[1];
  assert.ok(title && description, `${file} must publish unique title and description metadata`);
  assert.ok(!titles.has(title), `${file} repeats title: ${title}`);
  assert.ok(!descriptions.has(description), `${file} repeats description: ${description}`);
  titles.add(title);
  descriptions.add(description);
}

const home = await readOutput("index.html");
assert.match(home, /"@type":"WebSite"/);
assert.match(home, /"@type":"SoftwareSourceCode"/);

const sitemap = await readOutput("sitemap.xml");
for (const [, canonical] of canonicalRoutes) assert.match(sitemap, new RegExp(`<loc>${escape(canonical)}</loc>`));
assert.doesNotMatch(sitemap, /\/(?:demo|examples|judging|comparisons|presentation)\//);

assert.equal(await readOutput("robots.txt"), "User-agent: *\nAllow: /\nSitemap: https://possible.sh/sitemap.xml\n");
const llms = await readOutput("llms.txt");
for (const phrase of ["Agents can do far more", "Outcome Pack library", "structured prompt", "Specialized Skills are optional", "Expectations checklist", "Showcase media is optional"]) assert.match(llms, new RegExp(escape(phrase), "i"));

const cliPackage = JSON.parse(await readFile(new URL("apps/cli/package.json", repository), "utf8"));
assert.equal(cliPackage.homepage, "https://possible.sh");
assert.equal(cliPackage.repository?.url, "git+https://github.com/fraylabs/possible.git");
assert.equal(cliPackage.bugs?.url, "https://github.com/fraylabs/possible/issues");

console.log(`Discovery metadata is consistent across ${canonicalRoutes.length} canonical routes.`);
