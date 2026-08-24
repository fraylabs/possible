import assert from "node:assert/strict";
import test from "node:test";
import * as contract from "../dist/index.js";

test("the contract does not ship a Product or Skill catalog", () => {
  for (const removed of ["companies", "products", "productCatalog", "skillCatalog", "getProduct", "getSkill"]) {
    assert.equal(removed in contract, false);
  }
});

test("Skill references resolve directly to their external source", () => {
  assert.equal(contract.skillPageUrl({
    repository: "heygen-com/hyperframes",
    directory: "skills/hyperframes",
    lastReviewedCommit: "0123456789012345678901234567890123456789",
  }), "https://skills.sh/heygen-com/hyperframes/hyperframes");
});
