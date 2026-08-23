import assert from "node:assert/strict";
import test from "node:test";
import {
  getProduct,
  getSkill,
  productCatalog,
  resolveProducts,
  skillCatalog,
} from "../dist/index.js";

test("Product records contain only official directory information", () => {
  const product = getProduct("heygen/hyperframes");
  assert.ok(product);
  assert.equal(product.company.name, "HeyGen");
  assert.equal(product.category, "video");
  assert.match(product.summarySourceUrl, /^https:\/\//);
  for (const forbidden of ["commerce", "checkout", "skills", "prompt", "executionPrompt", "expectations"]) {
    assert.equal(forbidden in product, false);
  }
  assert.equal(productCatalog.length, 7);
  assert.throws(() => resolveProducts(["missing/product"]), /missing product/i);
});

test("Skill records are lightweight links to their public Skills pages", () => {
  const skill = getSkill("heygen-com/hyperframes/skills/hyperframes");
  assert.ok(skill);
  assert.equal(skill.name, "HyperFrames");
  assert.equal(skill.sourceUrl, "https://skills.sh/heygen-com/hyperframes/hyperframes");
  assert.equal(getSkill(skill.slug), skill);
  assert.ok(skillCatalog.length > 0);
  assert.ok(skillCatalog.every((entry) => entry.sourceUrl.startsWith("https://skills.sh/")));
});
