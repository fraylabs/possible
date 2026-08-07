import assert from "node:assert/strict";
import test from "node:test";
import { compilePack, getCatalogNumber, publicOutcomePacks, validatePackManifest } from "../dist/index.js";
import { createDraftPack } from "../dist/local.js";

test("public JSON manifests are validated before entering the registry", () => {
  assert.equal(publicOutcomePacks.length, 30);
  for (const pack of publicOutcomePacks) {
    assert.equal(pack.visibility, "public");
    assert.ok(["reviewed", "archived"].includes(pack.lifecycle));
    assert.match(pack.packVersion, /^\d+\.\d+\.\d+$/);
    assert.equal("catalogNumber" in pack, false);
    assert.equal(getCatalogNumber(pack.slug), publicOutcomePacks.indexOf(pack) + 1);
    assert.doesNotThrow(() => validatePackManifest(pack));
  }
});

test("draft private packs are valid for authoring but cannot compile", () => {
  const draft = createDraftPack("local-example");
  assert.equal(draft.visibility, "private");
  assert.equal(draft.lifecycle, "draft");
  assert.doesNotThrow(() => validatePackManifest(draft));
  assert.throws(() => compilePack(draft), /must be reviewed before compilation/i);
});

test("pack validation rejects malformed versions and duplicate workstream ids", () => {
  const draft = createDraftPack("invalid-example");
  draft.packVersion = "draft";
  assert.throws(() => validatePackManifest(draft), /packVersion must be a semantic version/i);

  const catalogLeak = createDraftPack("catalog-leak");
  catalogLeak.catalogNumber = 1;
  assert.throws(() => validatePackManifest(catalogLeak), /belongs to public catalog metadata/i);

  const duplicate = createDraftPack("duplicate-example");
  duplicate.skills = [{ id: "skill", name: "Skill", role: "role", repository: "owner/repo", skill: "skill", reviewedRevision: "a".repeat(40), reviewUrl: "https://example.com/a" }];
  duplicate.workstreams = [
    { id: "same", name: "One", skills: ["skill"], owns: ["one/"], brief: "one" },
    { id: "same", name: "Two", skills: ["skill"], owns: ["two/"], brief: "two" },
  ];
  assert.throws(() => validatePackManifest(duplicate), /workstreams contains duplicate ids/i);
});
