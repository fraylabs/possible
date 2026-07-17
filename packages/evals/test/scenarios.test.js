import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadLockedScenarios } from "../src/load.js";

const scenarioDirectory = fileURLToPath(
  new URL("../../../evals/scenarios/v1/", import.meta.url),
);
const schemaDirectory = fileURLToPath(
  new URL("../../../evals/schemas/", import.meta.url),
);

test("loads exactly the two locked golden scenarios and freezes them", async () => {
  const locked = await loadLockedScenarios(scenarioDirectory);
  assert.equal(locked.manifest.setId, "possible-mvp-golden-v1");
  assert.deepEqual([...locked.scenarios.keys()], [
    "inventory-dashboard",
    "motor-bracket-manufacturing",
  ]);
  assert.equal(Object.isFrozen(locked.scenarios.get("inventory-dashboard")), true);
  assert.equal(
    locked.scenarios.get("inventory-dashboard").prompt,
    "Build and deploy an inventory dashboard.",
  );
  assert.equal(
    locked.scenarios.get("motor-bracket-manufacturing").prompt,
    "Design a custom motor bracket and find a suitable manufacturer.",
  );
});

test("fails if locked scenario bytes change without a new manifest digest", async () => {
  const temporaryRoot = await mkdtemp(resolve(tmpdir(), "possible-scenarios-"));
  await cp(scenarioDirectory, temporaryRoot, { recursive: true });
  const path = resolve(temporaryRoot, "inventory-dashboard.json");
  const original = await readFile(path, "utf8");
  await writeFile(path, original.replace("inventory dashboard", "stock dashboard"));
  await assert.rejects(
    loadLockedScenarios(temporaryRoot),
    (error) => error.code === "SCENARIO_DIGEST_MISMATCH",
  );
});

test("publishes parseable, versioned JSON schemas", async () => {
  const expected = {
    "scenario.schema.json": "https://possible.sh/schemas/evals/scenario-1.0.0.json",
    "transcript.schema.json": "https://possible.sh/schemas/evals/transcript-1.0.0.json",
    "receipt.schema.json": "https://possible.sh/schemas/evals/receipt-1.0.0.json",
    "report.schema.json": "https://possible.sh/schemas/evals/report-1.0.0.json",
  };
  for (const [file, id] of Object.entries(expected)) {
    const schema = JSON.parse(await readFile(resolve(schemaDirectory, file), "utf8"));
    assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
    assert.equal(schema.$id, id);
  }
});
