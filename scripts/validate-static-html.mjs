import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { productCatalog, skillCatalog } from "../packages/catalog/dist/index.js";

const output = new URL("../apps/web/out/", import.meta.url);
const html = (path) => readFile(new URL(path, output), "utf8");
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const htmlText = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#x27;");

const home = await html("index.html");
assert.match(home, /Discover what agents can do/);
assert.match(home, /What do you want an agent to make\?/);
assert.match(home, /Most copied Outcomes/);
assert.match(home, /Loading Outcomes/);
assert.doesNotMatch(home, /Outcome Pack|expectations checklist|structured prompt/);

const outcome = await html("outcomes/view/index.html");
assert.match(outcome, /Loading Outcome/);
assert.doesNotMatch(outcome, /bundled Outcome|generated catalog/i);

for (const product of productCatalog) {
  const slug = product.id.split("/").at(-1);
  const detail = await html(`products/${slug}/index.html`);
  assert.match(detail, new RegExp(escape(htmlText(product.summary))));
  assert.doesNotMatch(detail, /checkout|pricing unknown|agent wallet/i);
}

for (const skill of skillCatalog) {
  const detail = await html(`skills/${skill.slug}/index.html`);
  assert.match(detail, new RegExp(escape(htmlText(skill.name))));
  assert.match(detail, /Open Skill/);
}

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

for (const removed of ["dashboard/index.html", "discover/index.html", "packs/index.html", "products/index.html", "skills/index.html", "docs/outcome-packs/index.html", "docs/expectations/index.html", "docs/glossary/index.html"]) {
  await assert.rejects(html(removed), { code: "ENOENT" });
}
console.log("Static shell, Product, Skill, and documentation pages are valid.");
