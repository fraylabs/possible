import assert from "node:assert/strict";
import test from "node:test";
import { publicCatalog, searchPackCatalog } from "../dist/index.js";

test("catalog search shares concise outcome retrieval without searching implementation detail", () => {
  assert.equal(searchPackCatalog({ query: "polished browser game" }, publicCatalog)[0]?.entry.slug, "playable-web-game");
  assert.equal(searchPackCatalog({ query: "editable PowerPoint deck" }, publicCatalog)[0]?.entry.slug, "polished-editable-powerpoint-presentation");
  assert.equal(searchPackCatalog({ query: "sell to real customers" }, publicCatalog)[0]?.entry.slug, "first-customer-sprint");

  const fixture = structuredClone(publicCatalog[0]);
  fixture.pack.expectations.push("Contains the unique marker quuxleflorp.");
  assert.deepEqual(searchPackCatalog({ query: "quuxleflorp" }, [fixture]), []);
});

test("catalog search can retain unmatched packs for complete agent inspection", () => {
  const query = "zyxquux florbnar glimbosity";
  assert.deepEqual(searchPackCatalog({ query }, publicCatalog), []);
  const complete = searchPackCatalog({ query, includeUnmatched: true }, publicCatalog);
  assert.equal(complete.length, publicCatalog.length);
  assert.ok(complete.every(({ lexicalMatch, matchScore }) => !lexicalMatch && matchScore === 0));
});

test("catalog search can focus public results without weakening complete agent inspection", () => {
  const focused = searchPackCatalog({
    query: "browser game",
    minimumMatchingTerms: 2,
    minimumScoreRatio: 0.5,
  }, publicCatalog);

  assert.deepEqual(focused.map(({ entry }) => entry.slug), ["playable-web-game"]);
  assert.equal(searchPackCatalog({
    query: "browser game",
    includeUnmatched: true,
    minimumMatchingTerms: 2,
    minimumScoreRatio: 0.5,
  }, publicCatalog).length, publicCatalog.length);
});

test("catalog search derives publisher attribution from namespaced identity", () => {
  const result = searchPackCatalog({ query: "fraylabs" }, publicCatalog)[0];
  assert.ok(result);
  assert.equal(result.publisher, "fraylabs");
  assert.equal(result.repository, "possible");
  assert.ok(result.matchReasons.some((reason) => reason.startsWith("publisher matched:")));
});
