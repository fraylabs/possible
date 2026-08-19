import assert from "node:assert/strict";
import test from "node:test";
import {
  getProduct,
  productCatalog,
  publicCatalog,
  resolveProducts,
  validateProductRecord,
} from "../dist/index.js";

test("Product records resolve their Company without owning execution", () => {
  const product = getProduct("heygen/hyperframes");
  assert.ok(product);
  assert.equal(product.company.name, "HeyGen");
  assert.equal(product.commerce.availability, "free");
  assert.equal(product.commerce.agentCheckout, "not-required");
  assert.deepEqual(product.commerce.methods, []);
  assert.match(product.logoUrl, /^https:\/\//);
  assert.match(product.summarySourceUrl, /^https:\/\/github\.com\/heygen-com\/hyperframes\/blob\/[0-9a-f]{40}\/README\.md/);
  for (const forbidden of ["skills", "installCommands", "prompt", "expectations", "instructions"]) {
    assert.equal(forbidden in product, false);
  }
  assert.ok(JSON.stringify(product).length < 1_000, "Product metadata should remain cheap for agents to inspect");
});

test("Outcome Packs can reference Products while Skills remain the execution source", () => {
  const entry = publicCatalog.find(({ slug }) => slug === "html-css-animated-product-launch-film");
  assert.ok(entry);
  assert.deepEqual(entry.products.map(({ id }) => id), ["heygen/hyperframes"]);
  assert.ok(entry.pack.skills?.some(({ directory }) => directory === "skills/hyperframes"));
  assert.equal(productCatalog.length, 1);
  assert.throws(() => resolveProducts(["missing/product"]), /missing product/i);
});

test("Product commerce rejects contradictory free checkout metadata", () => {
  const product = structuredClone(productCatalog[0]);
  product.company = product.company.id;
  product.commerce.agentCheckout = "supported";
  assert.throws(() => validateProductRecord(product), /must be not-required when availability is free/i);
});
