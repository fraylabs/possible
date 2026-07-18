import assert from "node:assert/strict";
import test from "node:test";
import * as tinySlug from "./index.js";

const { slugify } = tinySlug;

test("exports only the named slugify function", () => {
  assert.deepEqual(Object.keys(tinySlug), ["slugify"]);
  assert.equal(typeof slugify, "function");
});

test("lowercases ASCII letters", () => {
  assert.equal(slugify("Hello WORLD"), "hello-world");
});

test("collapses separator runs to one hyphen", () => {
  assert.equal(slugify("one ,_ / two"), "one-two");
});

test("removes separators from both boundaries", () => {
  assert.equal(slugify("  --hello--  "), "hello");
});

test("preserves ASCII digits", () => {
  assert.equal(slugify("Release 2026.07"), "release-2026-07");
});

test("returns an empty string when no ASCII letters or digits remain", () => {
  assert.equal(slugify(""), "");
  assert.equal(slugify(" --_ "), "");
  assert.equal(slugify("你好"), "");
});

test("treats non-ASCII characters as separators", () => {
  assert.equal(slugify("München guide"), "m-nchen-guide");
  assert.equal(slugify("foo—bar"), "foo-bar");
});

test("does not transliterate through Unicode case folding", () => {
  assert.equal(slugify("Kelvin"), "elvin");
  assert.equal(slugify("İstanbul"), "stanbul");
});

test("throws a stable TypeError for non-string input", () => {
  const invalidValues = [
    undefined,
    null,
    42,
    true,
    Symbol("text"),
    ["text"],
    { toString: () => "text" },
    new String("text"),
  ];

  for (const value of invalidValues) {
    assert.throws(() => slugify(value), {
      name: "TypeError",
      message: "slugify() expects a string",
    });
  }
});
