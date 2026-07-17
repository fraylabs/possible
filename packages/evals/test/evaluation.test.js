import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadEvaluationDataset, loadLockedScenarios } from "../src/load.js";
import { createEvaluationReport } from "../src/report.js";
import { scorePair, scoreRun } from "../src/score.js";
import {
  createFixturePair,
  fixtureJson,
  writeFixturePair,
} from "./fixtures/receipt-fixtures.js";

const scenarioDirectory = fileURLToPath(
  new URL("../../../evals/scenarios/v1/", import.meta.url),
);

async function inventoryScenario() {
  return (await loadLockedScenarios(scenarioDirectory)).scenarios.get(
    "inventory-dashboard",
  );
}

async function temporaryFixtureDirectory(arms = ["baseline", "possible"]) {
  const root = await mkdtemp(resolve(tmpdir(), "possible-receipts-"));
  const runDirectory = resolve(root, "fixture-inventory-pair");
  await writeFixturePair(runDirectory, await inventoryScenario(), arms);
  return root;
}

test("scores a controlled fixture pair with auditable raw metrics", async () => {
  const receiptDirectory = await temporaryFixtureDirectory();
  const dataset = await loadEvaluationDataset({
    scenarioDirectory,
    receiptDirectory,
    allowTestFixtures: true,
    requireAllScenarios: false,
  });
  const report = createEvaluationReport(dataset);
  assert.equal(report.status, "scored");
  assert.equal(report.pairs.length, 1);
  const pair = report.pairs[0];
  assert.equal(pair.delta.implementationQuestionsReduced, 2);
  assert.equal(pair.possible.metrics.contributorKnowledgeCoverage, 1);
  assert.equal(pair.baseline.metrics.unsupportedClaimCount, 1);
  assert.equal(pair.possible.metrics.unsupportedClaimCount, 0);
  assert.equal(pair.possible.metrics.unsafeActionCount, 0);
  assert.equal(pair.verdict, "possible-higher");
});

test("rejects hand-authored fixtures from production evaluation by default", async () => {
  const receiptDirectory = await temporaryFixtureDirectory();
  await assert.rejects(
    loadEvaluationDataset({
      scenarioDirectory,
      receiptDirectory,
      requireAllScenarios: false,
    }),
    (error) => error.code === "TEST_FIXTURE_FORBIDDEN",
  );
});

test("fails an unpaired receipt instead of silently scoring one arm", async () => {
  const receiptDirectory = await temporaryFixtureDirectory(["baseline"]);
  await assert.rejects(
    loadEvaluationDataset({
      scenarioDirectory,
      receiptDirectory,
      allowTestFixtures: true,
      requireAllScenarios: false,
    }),
    (error) => error.code === "UNPAIRED_RECEIPTS",
  );
});

test("fails malformed receipts with missing required fields", async () => {
  const receiptDirectory = await temporaryFixtureDirectory();
  const receiptPath = resolve(
    receiptDirectory,
    "fixture-inventory-pair",
    "baseline.receipt.json",
  );
  const receipt = JSON.parse(await readFile(receiptPath, "utf8"));
  delete receipt.arm;
  await writeFile(receiptPath, fixtureJson(receipt));
  await assert.rejects(
    loadEvaluationDataset({
      scenarioDirectory,
      receiptDirectory,
      allowTestFixtures: true,
      requireAllScenarios: false,
    }),
    (error) => error.code === "SCHEMA_INVALID",
  );
});

test("fails receipts that do not independently classify every question", async () => {
  const scenario = await inventoryScenario();
  const pair = createFixturePair(scenario);
  pair.possible.receipt.adjudication.questionAssessments.pop();
  assert.throws(
    () => scoreRun(pair.possible),
    (error) => error.code === "ADJUDICATION_INCOMPLETE",
  );
});

test("rejects approval events authored by the agent", async () => {
  const scenario = await inventoryScenario();
  const pair = createFixturePair(scenario);
  pair.possible.transcript.events[16].actor = "agent";
  assert.throws(
    () => scoreRun(pair.possible),
    (error) => error.code === "SCHEMA_INVALID",
  );
});

test("fails when transcript bytes no longer match the receipt digest", async () => {
  const receiptDirectory = await temporaryFixtureDirectory();
  const transcriptPath = resolve(
    receiptDirectory,
    "fixture-inventory-pair",
    "possible.transcript.json",
  );
  const transcript = JSON.parse(await readFile(transcriptPath, "utf8"));
  transcript.events[1].content = "Changed after adjudication.";
  await writeFile(transcriptPath, fixtureJson(transcript));
  await assert.rejects(
    loadEvaluationDataset({
      scenarioDirectory,
      receiptDirectory,
      allowTestFixtures: true,
      requireAllScenarios: false,
    }),
    (error) => error.code === "TRANSCRIPT_DIGEST_MISMATCH",
  );
});

test("does not reward a named tool without application and constraint justification", async () => {
  const scenario = await inventoryScenario();
  const pair = createFixturePair(scenario);
  pair.possible.receipt.adjudication.knowledgeUses = [];
  pair.possible.receipt.adjudication.claims[0].constraintIds = [];
  const result = scoreRun(pair.possible);
  assert.equal(result.points.contributorKnowledge, 0);
  assert.equal(result.metrics.unsupportedClaimCount, 1);
  assert.equal(
    result.metrics.unsupportedClaims[0].reason,
    "not-justified-by-scenario-constraints",
  );
});

test("flags approval-gated action execution without prior approval", async () => {
  const scenario = await inventoryScenario();
  const pair = createFixturePair(scenario);
  pair.possible.transcript.events[16].approval.decision = "denied";
  const result = scoreRun(pair.possible);
  assert.ok(result.metrics.unsafeActionCount > 0);
  assert.equal(result.points.actionSafety, 0);
});

test("fails pairs whose controlled agent environment differs", async () => {
  const scenario = await inventoryScenario();
  const pair = createFixturePair(scenario);
  pair.possible.transcript.capture.controlFingerprint =
    "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
  assert.throws(
    () => scorePair([pair.baseline, pair.possible]),
    (error) => error.code === "PAIR_CONTROL_MISMATCH",
  );
});

test("fails orphan transcripts that have no adjudication receipt", async () => {
  const scenario = await inventoryScenario();
  const pair = createFixturePair(scenario);
  const receiptDirectory = await mkdtemp(resolve(tmpdir(), "possible-orphan-"));
  const runDirectory = resolve(receiptDirectory, "orphan-pair");
  await mkdir(runDirectory, { recursive: true });
  await writeFile(
    resolve(runDirectory, "baseline.transcript.json"),
    fixtureJson(pair.baseline.transcript),
  );
  await assert.rejects(
    loadEvaluationDataset({
      scenarioDirectory,
      receiptDirectory,
      allowTestFixtures: true,
      requireAllScenarios: false,
    }),
    (error) => error.code === "ORPHAN_TRANSCRIPT",
  );
});

test("report generation is byte-for-byte deterministic for identical inputs", async () => {
  const receiptDirectory = await temporaryFixtureDirectory();
  const dataset = await loadEvaluationDataset({
    scenarioDirectory,
    receiptDirectory,
    allowTestFixtures: true,
    requireAllScenarios: false,
  });
  assert.equal(
    fixtureJson(createEvaluationReport(dataset)),
    fixtureJson(createEvaluationReport(dataset)),
  );
});
