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

test("the catalog is made from one request-to-result record per folder", () => {
  assert.equal(outcomeCatalog.length, 5);
  assert.equal(bundledOutcomes.length, outcomeCatalog.length);
  const film = getOutcome("html-css-animated-product-launch-film");
  assert.ok(film);
  assert.equal(film.outcome.originalPrompt, "nono just to explain what possible is");
  assert.match(film.outcome.executionPrompt, /^Use \$hyperframes/);
  assert.equal(film.outcome.execution.model, "GPT-5.6");
  assert.deepEqual(film.products.map(({ id }) => id), ["heygen/hyperframes", "uzu/strudel"]);
  assert.match(film.outcome.preview.video.src, /^\/outcome-media\//);
  for (const forbidden of ["expectations", "notFor", "workstreams", "verification", "trust", "lifecycle"]) {
    assert.equal(forbidden in film.outcome, false);
  }
});

test("Outcome validation keeps both prompts exact and rejects framework fields", () => {
  const valid = structuredClone(outcomeCatalog[0].outcome);
  assert.equal(validateOutcome(valid).originalPrompt, valid.originalPrompt);
  assert.equal(validateOutcome(valid).executionPrompt, valid.executionPrompt);
  assert.throws(() => validateOutcome({ ...valid, expectations: [] }), /not part of the Outcome contract/);
  assert.throws(() => validateOutcome({ ...valid, originalPrompt: ` ${valid.originalPrompt}` }), /leading or trailing whitespace/);
  assert.throws(() => validateOutcome({ ...valid, executionPrompt: `${valid.executionPrompt} ` }), /leading or trailing whitespace/);
  assert.throws(() => validateOutcome({ ...valid, execution: { ...valid.execution, timestamp: "yesterday" } }), /ISO 8601/);
});

test("Product records contain only official directory information", () => {
  const product = getProduct("heygen/hyperframes");
  assert.ok(product);
  assert.equal(product.company.name, "HeyGen");
  assert.equal(product.category, "video");
  assert.match(product.summarySourceUrl, /^https:\/\//);
  for (const forbidden of ["commerce", "checkout", "skills", "prompt", "executionPrompt", "expectations"]) {
    assert.equal(forbidden in product, false);
  }
  assert.equal(productCatalog.length, 6);
  assert.throws(() => resolveProducts(["missing/product"]), /missing product/i);
});

test("search uses the human-facing Outcome and Product text", () => {
  assert.equal(searchOutcomes(outcomeCatalog, { query: "digital robot simulation" })[0]?.entry.slug, "robot-digital-prototype");
  assert.equal(searchOutcomes(outcomeCatalog, { query: "editable PowerPoint deck" })[0]?.entry.slug, "polished-editable-powerpoint-presentation");
  assert.deepEqual(searchOutcomes(outcomeCatalog, { query: "zyxquux" }), []);
  assert.equal(searchOutcomes(outcomeCatalog, { query: "" }).length, outcomeCatalog.length);
});
