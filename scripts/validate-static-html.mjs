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
assert.match(home, /Anything is/);
assert.match(home, /Discover what agents can do/);
assert.match(home, /aria-label="Outcome directory"/);
assert.match(home, />OUTCOMES</);
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

const products = await html("products/index.html");
for (const product of productCatalog) {
  assert.match(products, new RegExp(escape(htmlText(product.name))));
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

for (const removed of ["packs/index.html", "docs/outcome-packs/index.html", "docs/expectations/index.html", "docs/glossary/index.html"]) {
  await assert.rejects(html(removed), { code: "ENOENT" });
}
console.log("Static Outcome, Product, and documentation pages are valid.");
