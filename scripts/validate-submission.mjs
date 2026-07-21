import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const repository = new URL("../", import.meta.url);
const read = (relative) => readFile(new URL(relative, repository), "utf8");

const [readme, devpost, video, buildWeek, npmRelease] = await Promise.all([
  read("README.md"),
  read("submission/DEVPOST-COPY.md"),
  read("submission/VIDEO-PACKAGE.md"),
  read("BUILD-WEEK.md"),
  read("submission/NPM-0.1.8-RELEASE.md"),
]);

const coreLanguage = "Possible gives Codex the workstreams, safeguards and verification needed to complete ambitious outcomes involving dozens of coordinated tasks.";
for (const [label, source] of [["README", readme], ["Devpost", devpost], ["video", video]]) {
  assert.match(source, new RegExp(coreLanguage.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${label} must use the core language`);
  assert.match(source, /npx @fraylabs\/possible@0\.1\.8 init/, `${label} must use the canonical install`);
  assert.doesNotMatch(source, /@fraylabs\/possible@0\.1\.[0-7]\b|unpublished|candidate/i, `${label} must not discuss historical package versions`);
  assert.doesNotMatch(source, /50[–-]100 coordinated tasks/i, `${label} must use a bounded task claim`);
  assert.doesNotMatch(source, /NO CONTROLLED RUNS|modeled benchmark|Direct[-– ]vs[-– ]Possible|\/goal comparison/i, `${label} must not revive the retired benchmark story`);
}

for (const name of ["Still", "Robot Snake", "Fold", "Web Presentation"]) {
  assert.match(devpost, new RegExp(name), `Devpost must feature ${name}`);
  assert.match(video, new RegExp(name), `Video must feature ${name}`);
}

assert.doesNotMatch(devpost, /\bMCP\b|recurring operations?|schedule operations/i, "Devpost must keep the primary pitch focused");
assert.doesNotMatch(video, /\bMCP\b|recurring operations?|schedule operations/i, "Video must keep the primary pitch focused");
assert.match(buildWeek, /Primary Codex \/feedback session ID: \[ADD SESSION ID\]/);
assert.match(buildWeek, /Eligible commit range: \[FIRST ELIGIBLE COMMIT\]\.\.\[FINAL SUBMISSION COMMIT\]/);
assert.match(npmRelease, /dist-tag: latest/);
assert.match(npmRelease, /b37e601945cadfe800da92ab59bf0b059546ae36/);

const narration = video.split("\n").filter((line) => line.startsWith("> ")).map((line) => line.slice(2)).join(" ");
const narrationWords = narration.trim().split(/\s+/).filter(Boolean).length;
assert.ok(narrationWords >= 90, `Video narration is too thin at ${narrationWords} words`);
assert.ok(narrationWords <= 230, `Video narration is too dense at ${narrationWords} words`);

console.log(`Submission copy matches the four-outcome story; narration is ${narrationWords} words.`);
