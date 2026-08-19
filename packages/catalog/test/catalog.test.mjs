import assert from "node:assert/strict";
import test from "node:test";
import {
  bundledOutcomes,
  getOutcome,
  getProduct,
  outcomeCatalog,
  productCatalog,
  resolveProducts,
  searchOutcomes,
  validateOutcome,
} from "../dist/index.js";

test("the catalog is made from one exact Outcome record per folder", () => {
  assert.equal(outcomeCatalog.length, 15);
  assert.equal(bundledOutcomes.length, outcomeCatalog.length);
  const film = getOutcome("html-css-animated-product-launch-film");
  assert.ok(film);
  assert.match(film.outcome.prompt, /^Use \$hyperframes/);
  assert.deepEqual(film.products.map(({ id }) => id), ["heygen/hyperframes", "uzu/strudel"]);
  assert.match(film.outcome.preview.video.src, /^\/outcome-media\//);
  for (const forbidden of ["expectations", "notFor", "workstreams", "verification", "trust", "lifecycle"]) {
    assert.equal(forbidden in film.outcome, false);
  }
});

test("Outcome validation keeps the prompt exact and rejects framework fields", () => {
  const valid = structuredClone(outcomeCatalog[0].outcome);
  assert.equal(validateOutcome(valid).prompt, valid.prompt);
  assert.throws(() => validateOutcome({ ...valid, expectations: [] }), /not part of the Outcome contract/);
  assert.throws(() => validateOutcome({ ...valid, prompt: ` ${valid.prompt}` }), /leading or trailing whitespace/);
});

test("Product records contain only official directory information", () => {
  const product = getProduct("heygen/hyperframes");
  assert.ok(product);
  assert.equal(product.company.name, "HeyGen");
  assert.equal(product.category, "video");
  assert.match(product.summarySourceUrl, /^https:\/\//);
  for (const forbidden of ["commerce", "checkout", "skills", "prompt", "expectations"]) {
    assert.equal(forbidden in product, false);
  }
  assert.equal(productCatalog.length, 6);
  assert.throws(() => resolveProducts(["missing/product"]), /missing product/i);
});

test("search uses the human-facing Outcome and Product text", () => {
  assert.equal(searchOutcomes(outcomeCatalog, { query: "polished browser game" })[0]?.entry.slug, "playable-web-game");
  assert.equal(searchOutcomes(outcomeCatalog, { query: "editable PowerPoint deck" })[0]?.entry.slug, "polished-editable-powerpoint-presentation");
  assert.deepEqual(searchOutcomes(outcomeCatalog, { query: "zyxquux" }), []);
  assert.equal(searchOutcomes(outcomeCatalog, { query: "" }).length, outcomeCatalog.length);
});
