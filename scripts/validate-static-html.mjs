import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { outcomeCatalog, productCatalog } from "../packages/catalog/dist/index.js";

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
assert.match(home, /Describe the result you want/);
assert.match(home, /aria-label="Outcome results"/);
assert.doesNotMatch(home, /Most copied this week|aria-label="Result view"|gallery source|Import JSON/);
assert.doesNotMatch(home, /Outcome Pack|expectations checklist|structured prompt/);

for (const entry of outcomeCatalog) {
  const markup = await html(`outcomes/${entry.slug}/index.html`);
  assert.match(markup, new RegExp(escape(htmlText(entry.outcome.title))));
  if (entry.outcome.originalPrompt) assert.match(markup, /Original request/);
  else assert.doesNotMatch(markup, /Original request/);
  assert.match(markup, />Prompt</);
  assert.match(markup, /Remix this prompt/);
  assert.match(markup, /Made with/);
  assert.match(markup, new RegExp(escape(htmlText(entry.outcome.author.name))));
  assert.doesNotMatch(markup, /trust status|accepted evidence|compiled prompt|verification framework/i);
}

for (const product of productCatalog) {
  const slug = product.id.split("/").at(-1);
  const detail = await html(`products/${slug}/index.html`);
  assert.match(detail, new RegExp(escape(htmlText(product.summary))));
  assert.doesNotMatch(detail, /checkout|pricing unknown|agent wallet/i);
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
console.log("Static Outcome, Product, and documentation pages are valid.");
