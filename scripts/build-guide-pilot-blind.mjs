#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pilotDir = join(repositoryRoot, "evals", "guide-library-v1");
const blindDir = join(pilotDir, "blind");

const baselineSlot = new Map([
  ["inventory-dashboard-handoff", "B"],
  ["motor-bracket-handoff", "A"],
  ["customer-sales-deck", "B"],
  ["browser-3d-configurator", "A"],
  ["digital-frame-launch-package", "B"],
  ["desktop-robot-arm", "A"],
  ["gene-therapy-strategy", "B"],
  ["cross-border-tax-filing", "A"],
]);

const scenarios = JSON.parse(await readFile(join(pilotDir, "scenarios.json"), "utf8"));
const pairs = [];
const key = [];

for (const task of scenarios.tasks) {
  const baseline = await readFile(join(pilotDir, "transcripts", `${task.id}-baseline.md`), "utf8");
  const treatment = await readFile(join(pilotDir, "transcripts", `${task.id}-treatment.md`), "utf8");
  const baselineIsA = baselineSlot.get(task.id) === "A";
  pairs.push({
    scenarioId: task.id,
    title: task.title,
    coverageClass: task.coverageClass,
    materialCriteria: task.materialCriteria,
    responseA: baselineIsA ? baseline : treatment,
    responseB: baselineIsA ? treatment : baseline,
  });
  key.push({
    scenarioId: task.id,
    baseline: baselineIsA ? "A" : "B",
    treatment: baselineIsA ? "B" : "A",
  });
}

await mkdir(blindDir, { recursive: true });
await Promise.all([
  writeFile(join(blindDir, "pairs.json"), `${JSON.stringify({ schemaVersion: "1.0.0", pairs }, null, 2)}\n`),
  writeFile(join(blindDir, "key.json"), `${JSON.stringify({
    schemaVersion: "1.0.0",
    warning: "Do not expose this key to the reviewer before blind judgments are final.",
    key,
  }, null, 2)}\n`),
]);

console.log(`Built ${pairs.length} blind pairs and a separate reveal key.`);
