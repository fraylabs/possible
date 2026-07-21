import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const repository = new URL("../", import.meta.url);
const read = (relative) => readFile(new URL(relative, repository), "utf8");

const [
  goal,
  readme,
  app,
  publicProof,
  exportedPublicProof,
  devpost,
  video,
  claims,
  buildWeek,
  npmPreflight,
  worklog,
] = await Promise.all([
  read("GOAL.md"),
  read("README.md"),
  read("apps/web/src/App.tsx"),
  read("benchmarks/outcome-v1/PUBLIC-PROOF.md"),
  read("apps/web/public/benchmarks/outcome-v1/public-proof.md"),
  read("submission/DEVPOST-COPY.md"),
  read("submission/VIDEO-PACKAGE.md"),
  read("submission/CLAIM-LEDGER.md"),
  read("BUILD-WEEK.md"),
  read("submission/NPM-0.1.7-PREFLIGHT.md"),
  read("WORKLOG.md"),
]);

assert.equal(exportedPublicProof, publicProof, "Public benchmark proof must match its canonical source");

const narration = video
  .split("\n")
  .filter((line) => line.startsWith("> "))
  .map((line) => line.slice(2))
  .join(" ");
const narrationWords = narration.trim().split(/\s+/).filter(Boolean).length;
const narrationSecondsAt110Wpm = Math.ceil((narrationWords / 110) * 60);
assert.ok(narrationWords >= 200, `Video narration is unexpectedly thin at ${narrationWords} words`);
assert.ok(narrationWords <= 280, `Video narration is too dense at ${narrationWords} words`);
assert.ok(narrationSecondsAt110Wpm <= 150, `Video narration leaves too little review time at ${narrationSecondsAt110Wpm} seconds`);

const publicClaims = [goal, readme, app, devpost, video, claims].join("\n");
const historicalClaims = [publicClaims, worklog].join("\n");
for (const [label, pattern] of [
  ["unsupported agent-prevalence claim", /Most agents stop when they produce something/i],
  ["causal reliability conclusion", /Possible makes Codex materially more reliable/i],
  ["repository-unproved benchmark model label", /five fresh GPT-5\.6/i],
  ["HTTP responses mislabeled as browser checks", /50\s*\/\s*50 browser checks/i],
  ["overbroad pre-approval claim", /Nothing runs until the user approves/i],
  ["all-pack disjoint-ownership claim", /delegates disjoint workstreams/i],
]) assert.doesNotMatch(historicalClaims, pattern, label);

assert.match(publicProof, /evidence from one run per condition/i);
assert.match(publicProof, /does \*\*not\*\* establish[\s\S]*causality/i);
assert.match(app, /50 SUCCESSFUL BROWSER RESPONSES/);
assert.match(readme, /@fraylabs\/possible@0\.1\.6 init/);
assert.match(readme, /separately verified `0\.1\.7` candidate/);
assert.match(devpost, /Possible condition used the then-published `@fraylabs\/possible@0\.1\.6`/);
assert.match(devpost, /\[ADD THE CORE GPT-5\.6 BUILD SESSION\]/);
assert.match(devpost, /\[FIRST ELIGIBLE COMMIT\]\.\.\[FINAL SUBMISSION COMMIT\]/);
assert.match(video, /One run(?: per condition is not proof of| cannot prove) typical superiority/);
assert.match(claims, /repository does not independently attest the GPT-5\.6 label/);
assert.match(buildWeek, /submission owner should link the official Codex task\/session record/);
assert.match(npmPreflight, /local tarball verified; not published/i);
assert.match(npmPreflight, /measured `possible-r1` pilot used `0\.1\.6`/);

console.log(`Submission claims are internally consistent; narration is ${narrationWords} words (${narrationSecondsAt110Wpm}s at 110 wpm).`);
