import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { publicCatalog } from "../../packages/packs/dist/index.js";
import { searchPublicPacks } from "../../apps/mcp/src/search.ts";

const root = dirname(fileURLToPath(import.meta.url));
const suite = JSON.parse(await readFile(join(root, "cases.json"), "utf8"));
assert.equal(suite.schemaVersion, 1);
assert.equal(suite.cases.length, 100, "Discovery evaluation must contain exactly 100 cases");
assert.equal(new Set(suite.cases.map(({ id }) => id)).size, suite.cases.length, "Discovery case ids must be unique");

const activeEntries = publicCatalog.filter(({ pack, trust }) => pack.lifecycle !== "archived" && trust.status !== "archived");
const activeSlugs = new Set(activeEntries.map(({ pack }) => pack.slug));
const selectCases = suite.cases.filter(({ decision }) => decision === "select");
const caseCountByPack = new Map([...activeSlugs].map((slug) => [slug, 0]));

for (const testCase of suite.cases) {
  assert.ok(["select", "clarify", "no-fit"].includes(testCase.decision), `${testCase.id} has an invalid decision`);
  assert.equal(typeof testCase.outcome, "string", `${testCase.id} needs an outcome`);
  assert.ok(testCase.outcome.trim().length >= 8, `${testCase.id} outcome is too short to be a useful evaluation`);
  const intended = testCase.intended ?? [];
  const acceptable = testCase.acceptable ?? [];
  const excluded = testCase.mustNotRecommend ?? [];
  if (testCase.decision === "select") assert.ok(intended.length > 0, `${testCase.id} must name an intended pack`);
  if (testCase.decision === "clarify") assert.ok(acceptable.length >= 2, `${testCase.id} must preserve genuine ambiguity`);
  if (testCase.decision === "no-fit") assert.ok(excluded.length > 0, `${testCase.id} must name the tempting packs to reject`);
  for (const slug of [...intended, ...acceptable, ...excluded]) assert.ok(activeSlugs.has(slug), `${testCase.id} references missing or archived pack ${slug}`);
  for (const slug of intended) caseCountByPack.set(slug, (caseCountByPack.get(slug) ?? 0) + 1);
}

for (const [slug, count] of caseCountByPack) assert.equal(count, 4, `${slug} must have four ordinary-language selection cases`);
assert.equal(selectCases.length, activeSlugs.size * 4, "Every active pack must have four selection cases");

let top1 = 0;
let top3 = 0;
let top10 = 0;
let intendedMissing = 0;
let intendedFalseConflicts = 0;
let forbiddenTop1 = 0;
let forbiddenTop3 = 0;
let noFitConflictTargets = 0;
let noFitConflictHits = 0;
const failures = [];

for (const testCase of suite.cases) {
  const candidates = searchPublicPacks({
    outcome: testCase.outcome,
    currentReality: testCase.currentReality,
    constraints: testCase.constraints,
  }, { catalog: publicCatalog });
  const slugs = candidates.map(({ slug }) => slug);
  const intended = testCase.intended ?? [];
  const forbidden = testCase.mustNotRecommend ?? [];

  if (testCase.decision === "select") {
    const rank = Math.min(...intended.map((slug) => {
      const index = slugs.indexOf(slug);
      return index === -1 ? Number.POSITIVE_INFINITY : index + 1;
    }));
    if (rank === 1) top1 += 1;
    if (rank <= 3) top3 += 1;
    if (rank <= 10) top10 += 1;
    if (!Number.isFinite(rank)) intendedMissing += 1;
    const conflict = candidates.find(({ slug }) => intended.includes(slug))?.conflictingNotForSignals.length ?? 0;
    if (conflict > 0) intendedFalseConflicts += 1;
    if (rank > 3 || conflict > 0) failures.push({ id: testCase.id, rank: Number.isFinite(rank) ? rank : null, intended, top: slugs.slice(0, 3), intendedConflictSignals: conflict });
  }

  if (forbidden.includes(slugs[0])) forbiddenTop1 += 1;
  if (slugs.slice(0, 3).some((slug) => forbidden.includes(slug))) forbiddenTop3 += 1;

  if (testCase.decision === "no-fit") {
    for (const slug of forbidden) {
      noFitConflictTargets += 1;
      const candidate = candidates.find((item) => item.slug === slug);
      if (candidate?.conflictingNotForSignals.length) noFitConflictHits += 1;
    }
  }
}

const metrics = {
  schemaVersion: 1,
  cases: suite.cases.length,
  activePacks: activeSlugs.size,
  selectionCases: selectCases.length,
  top1: { passed: top1, total: selectCases.length, rate: top1 / selectCases.length },
  top3: { passed: top3, total: selectCases.length, rate: top3 / selectCases.length },
  top10: { passed: top10, total: selectCases.length, rate: top10 / selectCases.length },
  intendedMissing,
  intendedFalseConflicts,
  forbiddenTop1,
  forbiddenTop3,
  noFitConflictRecall: { passed: noFitConflictHits, total: noFitConflictTargets, rate: noFitConflictTargets === 0 ? 1 : noFitConflictHits / noFitConflictTargets },
  failures,
};

if (process.argv.includes("--enforce")) {
  assert.ok(metrics.top3.rate >= 0.9, `Top-three retrieval must be at least 90%; received ${(metrics.top3.rate * 100).toFixed(1)}%`);
  assert.ok(metrics.top10.rate >= 0.98, `Top-ten retrieval must be at least 98%; received ${(metrics.top10.rate * 100).toFixed(1)}%`);
  assert.ok(metrics.intendedFalseConflicts <= 2, `Intended packs may have at most two false conflict cases; received ${metrics.intendedFalseConflicts}`);
  assert.equal(metrics.intendedMissing, 0, "Every intended pack must remain visible in the complete active catalog");
}

process.stdout.write(`${JSON.stringify(metrics, null, 2)}\n`);
