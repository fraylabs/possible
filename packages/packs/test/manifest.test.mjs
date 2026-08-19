import assert from "node:assert/strict";
import test from "node:test";
import { bundledOutcomePacks, compilePack, getCatalogNumber, validatePackManifest } from "../dist/index.js";
import { createDraftPack } from "../dist/local.js";

test("bundled manifests contain only the minimal authored contract", () => {
  assert.ok(bundledOutcomePacks.length > 0);
  for (const [index, { slug, pack }] of bundledOutcomePacks.entries()) {
    assert.match(slug, /^[a-z0-9][a-z0-9-]*$/);
    assert.equal(getCatalogNumber(slug), index + 1);
    assert.equal(validatePackManifest(pack), pack);
    assert.doesNotThrow(() => compilePack(pack));
  }
});

test("an empty expectations array is invalid while a direct prompt may omit it", () => {
  const draft = createDraftPack();
  assert.equal("skills" in draft, false);
  assert.throws(() => validatePackManifest(draft), /expectations must be a non-empty array/i);
  delete draft.expectations;
  assert.equal(validatePackManifest(draft), draft);
});

test("Skills are optional but must be complete when supplied", () => {
  const withoutSkills = structuredClone(bundledOutcomePacks[0].pack);
  delete withoutSkills.skills;
  assert.equal(validatePackManifest(withoutSkills), withoutSkills);

  const emptySkills = { ...withoutSkills, skills: [] };
  assert.throws(() => validatePackManifest(emptySkills), /skills must be omitted or a non-empty array/i);
});

test("validation rejects extra framework fields and invalid Skill review commits", () => {
  const valid = structuredClone(bundledOutcomePacks[0].pack);
  valid.slug = "catalog-leak";
  assert.throws(() => validatePackManifest(valid), /slug is not part of the Outcome Pack contract/i);

  const invalidReviewCommit = structuredClone(bundledOutcomePacks[0].pack);
  invalidReviewCommit.skills[0].lastReviewedCommit = "main";
  assert.throws(() => validatePackManifest(invalidReviewCommit), /exact 40- or 64-character lowercase commit hash/i);

  const duplicate = structuredClone(bundledOutcomePacks[0].pack);
  duplicate.skills.push(structuredClone(duplicate.skills[0]));
  assert.throws(() => validatePackManifest(duplicate), /duplicate Skill directory/i);

  const legacy = structuredClone(bundledOutcomePacks[0].pack);
  legacy.skills[0] = {
    source: legacy.skills[0].repository,
    lastReviewedCommit: legacy.skills[0].lastReviewedCommit,
    skill: "legacy-selector",
  };
  assert.throws(() => validatePackManifest(legacy), /source is not a supported Skill field/i);

  const unsafeDirectory = structuredClone(bundledOutcomePacks[0].pack);
  unsafeDirectory.skills[0].directory = "../skills/example";
  assert.throws(() => validatePackManifest(unsafeDirectory), /safe repository-relative directory/i);
});

test("Product attribution is optional, namespaced, and unique", () => {
  const valid = structuredClone(bundledOutcomePacks[0].pack);
  valid.products = ["heygen/hyperframes"];
  assert.equal(validatePackManifest(valid), valid);

  const duplicate = structuredClone(valid);
  duplicate.products.push("heygen/hyperframes");
  assert.throws(() => validatePackManifest(duplicate), /products contains duplicates/i);

  const invalid = structuredClone(valid);
  invalid.products = ["hyperframes"];
  assert.throws(() => validatePackManifest(invalid), /company\/product/i);
});
