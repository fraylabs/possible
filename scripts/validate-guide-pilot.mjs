#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pilotDir = join(repositoryRoot, "evals", "guide-library-v1");

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const fail = (message) => {
  throw new Error(`Field-guide pilot validation failed: ${message}`);
};

const requireObject = (value, label) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} must be an object`);
  }
};

const requireNonemptyString = (value, label) => {
  if (typeof value !== "string" || !value.trim()) fail(`${label} must be non-empty text`);
};

async function validateLockedScenarios() {
  const [manifestBytes, scenarioBytes, controlsBytes] = await Promise.all([
    readFile(join(pilotDir, "manifest.json")),
    readFile(join(pilotDir, "scenarios.json")),
    readFile(join(pilotDir, "controls.json")),
  ]);
  const manifest = JSON.parse(manifestBytes);
  const scenarios = JSON.parse(scenarioBytes);
  const controls = JSON.parse(controlsBytes);

  requireObject(manifest, "manifest");
  requireObject(scenarios, "scenarios");
  if (manifest.status !== "locked") fail("manifest status must be locked");
  if (manifest.scenarioFile !== "scenarios.json") fail("manifest must bind scenarios.json");
  if (manifest.scenarioSha256 !== sha256(scenarioBytes)) fail("scenario digest does not match locked bytes");
  if (manifest.controlsFile !== "controls.json") fail("manifest must bind controls.json");
  if (manifest.controlsSha256 !== sha256(controlsBytes)) fail("controls digest does not match locked bytes");
  if (manifest.setId !== scenarios.setId) fail("manifest and scenario set IDs differ");
  requireObject(controls, "controls");
  for (const field of ["provider", "model", "host", "matchedControlsFingerprintInput"]) {
    requireNonemptyString(controls[field], `controls/${field}`);
  }
  if (!Number.isInteger(controls.responseWordLimit) || controls.responseWordLimit < 100) {
    fail("controls/responseWordLimit must be an integer of at least 100");
  }
  if (!Array.isArray(scenarios.tasks)) fail("scenarios.tasks must be an array");
  if (scenarios.tasks.length !== 8 || manifest.scenarioCount !== 8) fail("pilot must contain exactly eight tasks");

  const ids = new Set();
  const classCounts = { covered: 0, partial: 0, uncovered: 0 };
  for (const [index, task] of scenarios.tasks.entries()) {
    const label = `tasks/${index}`;
    requireObject(task, label);
    for (const field of ["id", "title", "coverageClass", "prompt"]) {
      requireNonemptyString(task[field], `${label}/${field}`);
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(task.id)) fail(`${label}/id must be kebab-case`);
    if (ids.has(task.id)) fail(`duplicate task id: ${task.id}`);
    ids.add(task.id);
    if (!Object.hasOwn(classCounts, task.coverageClass)) fail(`${label}/coverageClass is invalid`);
    classCounts[task.coverageClass] += 1;
    if (/\bpossible\b/i.test(task.prompt)) fail(`${label}/prompt must not name Possible`);
    if (!Array.isArray(task.expectedGuideSlugs)) fail(`${label}/expectedGuideSlugs must be an array`);
    if (!Array.isArray(task.materialCriteria) || task.materialCriteria.length < 3) {
      fail(`${label}/materialCriteria must contain at least three criteria`);
    }
    if (task.coverageClass === "uncovered" && task.expectedGuideSlugs.length !== 0) {
      fail(`${label} uncovered task must not name expected guides`);
    }
    if (task.coverageClass !== "uncovered" && task.expectedGuideSlugs.length === 0) {
      fail(`${label} covered or partial task must name expected guides`);
    }
    for (const [criterionIndex, criterion] of task.materialCriteria.entries()) {
      requireNonemptyString(criterion, `${label}/materialCriteria/${criterionIndex}`);
    }
  }

  const expectedCounts = { covered: 4, partial: 2, uncovered: 2 };
  if (JSON.stringify(classCounts) !== JSON.stringify(expectedCounts)) {
    fail(`coverage classes must be ${JSON.stringify(expectedCounts)}, received ${JSON.stringify(classCounts)}`);
  }
  if (JSON.stringify(manifest.coverageClasses) !== JSON.stringify(expectedCounts)) {
    fail("manifest coverage counts do not match the locked policy");
  }

  return { manifest, scenarios, controls };
}

async function validateCapturedRuns(scenarios, controls) {
  const runsDir = join(pilotDir, "runs");
  let entries;
  try {
    entries = await readdir(runsDir, { withFileTypes: true });
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") return { runCount: 0 };
    throw error;
  }

  const jsonEntries = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".json"));
  const tasks = new Map(scenarios.tasks.map((task) => [task.id, task]));
  const taskIds = new Set(tasks.keys());
  const pairKeys = new Set();
  const controlsFingerprint = sha256(Buffer.from(controls.matchedControlsFingerprintInput, "utf8"));
  const pairFingerprints = new Map();
  for (const entry of jsonEntries) {
    const run = JSON.parse(await readFile(join(runsDir, entry.name), "utf8"));
    requireObject(run, `runs/${entry.name}`);
    if (run.schemaVersion !== "1.0.0") fail(`runs/${entry.name}/schemaVersion is invalid`);
    requireNonemptyString(run.scenarioId, `runs/${entry.name}/scenarioId`);
    if (!taskIds.has(run.scenarioId)) fail(`runs/${entry.name} references unknown scenario ${run.scenarioId}`);
    if (!['baseline', 'treatment'].includes(run.arm)) fail(`runs/${entry.name}/arm is invalid`);
    const expectedName = `${run.scenarioId}-${run.arm}.json`;
    if (entry.name !== expectedName) fail(`runs/${entry.name} must be named ${expectedName}`);
    for (const field of ["agentTaskName", "provider", "model", "host", "controlFingerprint", "promptSha256", "responseFile", "responseSha256"]) {
      requireNonemptyString(run[field], `runs/${entry.name}/${field}`);
    }
    if (run.provider !== controls.provider || run.model !== controls.model || run.host !== controls.host) {
      fail(`runs/${entry.name} does not match locked provider/model/host controls`);
    }
    if (run.responseWordLimit !== controls.responseWordLimit) {
      fail(`runs/${entry.name}/responseWordLimit does not match controls`);
    }
    requireNonemptyString(run.controlFingerprint, `runs/${entry.name}/controlFingerprint`);
    if (run.controlFingerprint !== controlsFingerprint) {
      fail(`runs/${entry.name}/controlFingerprint does not match locked controls`);
    }
    const task = tasks.get(run.scenarioId);
    if (run.promptSha256 !== sha256(Buffer.from(task.prompt, "utf8"))) {
      fail(`runs/${entry.name}/promptSha256 does not bind the exact locked prompt`);
    }
    const expectedResponseFile = `transcripts/${run.scenarioId}-${run.arm}.md`;
    if (run.responseFile !== expectedResponseFile) {
      fail(`runs/${entry.name}/responseFile must be ${expectedResponseFile}`);
    }
    const responseBytes = await readFile(join(pilotDir, run.responseFile));
    if (run.responseSha256 !== sha256(responseBytes)) {
      fail(`runs/${entry.name}/responseSha256 does not match captured bytes`);
    }
    if (run.responseBytes !== responseBytes.length || responseBytes.length === 0) {
      fail(`runs/${entry.name}/responseBytes is invalid`);
    }
    if (!Array.isArray(run.possibleQueries) || !Array.isArray(run.possibleReads)) {
      fail(`runs/${entry.name} must include Possible query and read arrays`);
    }
    if (!Array.isArray(run.externalActionAttempts) || !Array.isArray(run.artifactChecks)) {
      fail(`runs/${entry.name} must include action-attempt and artifact-check arrays`);
    }
    if (run.externalActionAttempts.length > 0) {
      fail(`runs/${entry.name} violated the no-external-action control`);
    }
    if (run.arm === "baseline" && (run.possibleQueries.length > 0 || run.possibleReads.length > 0)) {
      fail(`runs/${entry.name} baseline is contaminated by Possible retrieval`);
    }
    if (run.arm === "treatment" && run.possibleQueries.length === 0) {
      fail(`runs/${entry.name} treatment must exercise real search`);
    }
    if (run.arm === "treatment" && task.coverageClass !== "uncovered" && run.possibleReads.length === 0) {
      fail(`runs/${entry.name} treatment did not read a guide for covered guidance`);
    }
    if (run.arm === "treatment" && task.coverageClass === "uncovered" && run.possibleReads.length > 0) {
      fail(`runs/${entry.name} treatment force-fit a guide to an uncovered task`);
    }
    const pairKey = `${run.scenarioId}:${run.arm}`;
    if (pairKeys.has(pairKey)) fail(`duplicate run arm: ${pairKey}`);
    pairKeys.add(pairKey);
    const priorFingerprint = pairFingerprints.get(run.scenarioId);
    if (priorFingerprint && priorFingerprint !== run.controlFingerprint) {
      fail(`run pair ${run.scenarioId} did not preserve matched controls`);
    }
    pairFingerprints.set(run.scenarioId, run.controlFingerprint);
  }

  if (jsonEntries.length !== 0 && jsonEntries.length !== 16) {
    fail(`captured pilot must be empty or contain all 16 paired runs, received ${jsonEntries.length}`);
  }
  if (jsonEntries.length === 16) {
    for (const taskId of taskIds) {
      for (const arm of ["baseline", "treatment"]) {
        if (!pairKeys.has(`${taskId}:${arm}`)) fail(`missing run ${taskId}:${arm}`);
      }
    }
  }
  return { runCount: jsonEntries.length };
}

async function validateBlindPacket(scenarios) {
  const [packetBytes, keyBytes] = await Promise.all([
    readFile(join(pilotDir, "blind", "pairs.json")),
    readFile(join(pilotDir, "blind", "key.json")),
  ]);
  const packet = JSON.parse(packetBytes);
  const reveal = JSON.parse(keyBytes);
  requireObject(packet, "blind/pairs.json");
  requireObject(reveal, "blind/key.json");
  if (packet.schemaVersion !== "1.0.0" || reveal.schemaVersion !== "1.0.0") {
    fail("blind packet and key must use schema version 1.0.0");
  }
  if (!Array.isArray(packet.pairs) || packet.pairs.length !== scenarios.tasks.length) {
    fail("blind packet must contain all eight pairs");
  }
  if (!Array.isArray(reveal.key) || reveal.key.length !== scenarios.tasks.length) {
    fail("blind reveal key must contain all eight pairs");
  }

  const pairs = new Map(packet.pairs.map((pair) => [pair.scenarioId, pair]));
  const keys = new Map(reveal.key.map((item) => [item.scenarioId, item]));
  for (const task of scenarios.tasks) {
    const pair = pairs.get(task.id);
    const key = keys.get(task.id);
    requireObject(pair, `blind/pairs/${task.id}`);
    requireObject(key, `blind/key/${task.id}`);
    if (pair.title !== task.title || pair.coverageClass !== task.coverageClass) {
      fail(`blind pair ${task.id} drifted from its locked scenario`);
    }
    if (JSON.stringify(pair.materialCriteria) !== JSON.stringify(task.materialCriteria)) {
      fail(`blind pair ${task.id} material criteria drifted`);
    }
    if (!['A', 'B'].includes(key.baseline) || !['A', 'B'].includes(key.treatment) || key.baseline === key.treatment) {
      fail(`blind key ${task.id} must map distinct A/B arms`);
    }
    const [baseline, treatment] = await Promise.all([
      readFile(join(pilotDir, "transcripts", `${task.id}-baseline.md`), "utf8"),
      readFile(join(pilotDir, "transcripts", `${task.id}-treatment.md`), "utf8"),
    ]);
    if (pair[`response${key.baseline}`] !== baseline || pair[`response${key.treatment}`] !== treatment) {
      fail(`blind pair ${task.id} does not preserve captured response bytes`);
    }
  }
  return { blindPacketSha256: sha256(packetBytes) };
}

const { scenarios, controls } = await validateLockedScenarios();
const { runCount } = await validateCapturedRuns(scenarios, controls);
const blind = runCount === 16 ? await validateBlindPacket(scenarios) : null;
console.log(
  `Field-guide pilot is valid: 8 locked tasks, ${runCount} captured runs${blind ? `, blind packet ${blind.blindPacketSha256}` : ""}.`,
);
