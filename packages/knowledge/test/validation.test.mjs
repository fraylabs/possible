import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("canonical graph validates and generated data is current", () => {
  const result = spawnSync(process.execPath, ["scripts/build-graph.mjs", "--check"], {
    cwd: packageDir,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Validated \d+ nodes and \d+ edges/);
});

test("schema rejects a recommendation without counterconditions or provenance", () => {
  const fixture = resolve(packageDir, "test/fixtures/invalid-recommendation");
  const result = spawnSync(
    process.execPath,
    ["scripts/build-graph.mjs", "--validate-only", "--knowledge-dir", fixture],
    { cwd: packageDir, encoding: "utf8" },
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /failed schema validation/);
  assert.match(result.stderr, /counterconditions|sources/);
});
