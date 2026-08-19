import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { outcomeCatalog, searchOutcomes } from "../../packages/catalog/dist/index.js";

const root = dirname(fileURLToPath(import.meta.url));
const suite = JSON.parse(await readFile(join(root, "cases.json"), "utf8"));
const cases = suite.cases.filter(({ decision }) => decision === "select");
const slugs = new Set(outcomeCatalog.map(({ slug }) => slug));
assert.equal(suite.schemaVersion, 1);
assert.ok(cases.length > 0);
assert.equal(new Set(cases.map(({ id }) => id)).size, cases.length);

let top1 = 0;
let top3 = 0;
let top10 = 0;
const failures = [];
for (const testCase of cases) {
  for (const slug of testCase.intended) assert.ok(slugs.has(slug), `${testCase.id} references missing Outcome ${slug}`);
  const results = searchOutcomes(outcomeCatalog, { query: testCase.outcome });
  const ranked = results.map(({ entry }) => entry.slug);
  const rank = Math.min(...testCase.intended.map((slug) => {
    const index = ranked.indexOf(slug);
    return index === -1 ? Number.POSITIVE_INFINITY : index + 1;
  }));
  if (rank === 1) top1 += 1;
  if (rank <= 3) top3 += 1;
  if (rank <= 10) top10 += 1;
  if (rank > 3) failures.push({ id: testCase.id, intended: testCase.intended, rank: Number.isFinite(rank) ? rank : null, top: ranked.slice(0, 3) });
}

const metrics = {
  schemaVersion: 1,
  outcomes: outcomeCatalog.length,
  cases: cases.length,
  top1: { passed: top1, total: cases.length, rate: top1 / cases.length },
  top3: { passed: top3, total: cases.length, rate: top3 / cases.length },
  top10: { passed: top10, total: cases.length, rate: top10 / cases.length },
  failures,
};
if (process.argv.includes("--enforce")) {
  assert.ok(metrics.top3.rate >= 0.9, `Top-three retrieval must be at least 90%; received ${(metrics.top3.rate * 100).toFixed(1)}%`);
  assert.ok(metrics.top10.rate === 1, `Top-ten retrieval must be 100%; received ${(metrics.top10.rate * 100).toFixed(1)}%`);
}
process.stdout.write(`${JSON.stringify(metrics, null, 2)}\n`);
