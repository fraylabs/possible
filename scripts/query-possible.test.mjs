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

test("plain outcome search and slug read work through the real stdio helper", () => {
  const search = query("search", "I want to make a robot arm.");
  assert.equal(search.ok, true);
  assert.equal(search.data.results[0]?.slug, "robotic-arms");

  const read = query("read", search.data.results[0].slug);
  assert.equal(read.ok, true);
  assert.equal(read.data.page.title, "Robotic arms");
  assert.equal(read.data.page.reviewedAt, "2026-07-17");
  assert(read.data.page.sources.length > 0);
});
