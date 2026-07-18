import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function query(tool, argument) {
  const result = spawnSync(
    process.execPath,
    ["scripts/query-possible.mjs", tool, argument],
    { cwd: repositoryRoot, encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test("focused guide searches and exact reads work through the real stdio helper", () => {
  const search = query("search", "I want to make a robot arm.");
  assert.equal(search.ok, true);
  assert.equal(Object.hasOwn(search.data, "assessment"), false);
  assert.equal(search.data.results[0]?.slug, "robotic-arms");
  assert.deepEqual(
    Object.keys(search.data.results[0]).sort(),
    ["aliases", "matchedTerms", "slug", "summary", "title"],
  );

  const focusedSearch = query("search", "robot calibration safety");
  assert.equal(focusedSearch.ok, true);
  assert.equal(
    focusedSearch.data.results[0]?.slug,
    "robot-calibration-safety-physical-verification",
  );

  const read = query("read", search.data.results[0].slug);
  assert.equal(read.ok, true);
  assert.equal(read.data.page.title, "Robotic arms");
  assert.equal(read.data.page.reviewedAt, "2026-07-18");
  assert(read.data.page.sources.length > 0);
  assert.equal(Object.hasOwn(read.data.page, "kind"), false);
  assert.equal(Object.hasOwn(read.data.page, "coverage"), false);
  assert.equal(Object.hasOwn(read.data.page, "routeStatus"), false);
  assert.doesNotMatch(read.data.page.markdown, /^(?:kind|coverage|routeStatus):/m);

  const missing = query("search", "zzzz-no-existing-guide");
  assert.deepEqual(missing.data, {
    query: "zzzz-no-existing-guide",
    count: 0,
    results: [],
  });
});
