import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const repository = new URL("../", import.meta.url);
const read = (relative) => readFile(new URL(relative, repository), "utf8");

const [readme, devpost, video, buildWeek, npmRelease, judging, robotManifestSource, robotReceipt] = await Promise.all([
  read("README.md"),
  read("submission/DEVPOST-COPY.md"),
  read("submission/VIDEO-PACKAGE.md"),
  read("BUILD-WEEK.md"),
  read("submission/NPM-0.1.9-RELEASE.md"),
  read("JUDGING.md"),
  read("apps/web/public/demo/robot-snake/manifest.json"),
  read("apps/web/public/demo/robot-snake/evidence/outcome-receipt.md"),
]);

const robotManifest = JSON.parse(robotManifestSource);

assert.match(readme, /Possible\.sh is an open-source library of Outcome Packs for Codex\./);
for (const [label, source] of [["Devpost", devpost], ["video", video]]) {
  assert.match(source, /Possible\.sh is an open-source library of Outcome Packs\./, `${label} must define Possible`);
  assert.match(source, /reusable execution prompt and selected agent skills for dozens of coordinated tasks/, `${label} must explain an Outcome Pack`);
}
for (const [label, source] of [["README", readme], ["Devpost", devpost], ["video", video]]) {
  assert.match(source, /npx @fraylabs\/possible@0\.1\.9 init/, `${label} must use the canonical install`);
  assert.doesNotMatch(source, /@fraylabs\/possible@0\.1\.[0-8]\b|unpublished|candidate/i, `${label} must not discuss historical package versions`);
  assert.doesNotMatch(source, /50[–-]100 coordinated tasks/i, `${label} must use a bounded task claim`);
  assert.doesNotMatch(source, /NO CONTROLLED RUNS|modeled benchmark|Direct[-– ]vs[-– ]Possible|\/goal comparison/i, `${label} must not revive the retired benchmark story`);
}

for (const name of ["Still", "Robot Snake", "Fold", "Web Presentation"]) {
  assert.match(devpost, new RegExp(name), `Devpost must feature ${name}`);
  assert.match(video, new RegExp(name), `Video must feature ${name}`);
}

for (const [label, source] of [["README", readme], ["Devpost", devpost]]) {
  for (const phrase of [
    "AI made execution accessible. Possible makes operational judgment accessible.",
    "12/12 tests",
    "186/186 interface checks",
  ]) assert.match(source, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${label} must lead with the verified Robot Snake proof`);
  assert.match(source, /robot snake/i, `${label} must lead with Robot Snake`);
  assert.match(source, /CAD[\s\S]{0,100}URDF\/SRDF[\s\S]{0,100}MuJoCo/, `${label} must name the multidisciplinary work`);
  assert.match(source, /three (?:material )?defects/, `${label} must preserve the verifier finding`);
}
assert.equal(robotManifest.verification.freshIndependentSuite, "12/12 passed");
assert.equal(robotManifest.verification.interfaceChecks, "186/186 passed");
assert.match(robotReceipt, /found three material defects before sign-off/);

assert.match(readme, /\[Explore the evidence\]\(https:\/\/possible\.sh\/judging\)/);
assert.match(readme, /\[Read the Build Week record\]\(BUILD-WEEK\.md\)/);
assert.match(readme, /https:\/\/possible\.sh\/judging/);
assert.doesNotMatch(readme, /\bwrapper\b|Why this is not/i, "README must explain Possible directly");
assert.doesNotMatch(devpost, /\bwrapper\b|Why this is not|^## Judging evidence$/im, "Devpost must explain Possible directly");

const judgingWords = judging.trim().split(/\s+/).filter(Boolean).length;
assert.ok(judgingWords <= 500, `JUDGING.md exceeds the 500-word evidence budget at ${judgingWords} words`);
for (const criterion of ["Technological Implementation", "Design", "Potential Impact", "Quality of the Idea"]) {
  assert.equal(judging.match(new RegExp(criterion, "g"))?.length, 1, `JUDGING.md must contain ${criterion} exactly once`);
}
assert.match(judging, /## Guided evidence trail/);
assert.match(judging, /\[Build Week record\]\(BUILD-WEEK\.md\)/);
assert.doesNotMatch(judging, /\bwrapper\b|Why this is not/i, "Judging evidence must stay positive and direct");
assert.doesNotMatch(judging, /hidden text|keyword stuffing|AI screen(?:er|ing)|instructions? (?:to|for) (?:the )?(?:judge|evaluator)/i, "JUDGING.md must remain a factual evidence index");

for (const heading of [
  "Inspiration",
  "What it does",
  "How we built it",
  "Challenges we ran into",
  "Accomplishments that we're proud of",
  "What we learned",
  "What's next for Possible.sh",
  "Built with",
  "Try it out links",
]) {
  assert.match(devpost, new RegExp(`^## ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m"), `Devpost must include ${heading}`);
}
for (const url of [
  "https://possible.sh",
  "https://possible.sh/demo",
  "https://www.npmjs.com/package/@fraylabs/possible",
  "https://github.com/fraylabs/possible",
  "https://youtu.be/s35aGhVI2Eo",
]) {
  assert.match(devpost, new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Devpost must include ${url}`);
}

assert.doesNotMatch(devpost, /\bMCP\b|recurring operations?|schedule operations/i, "Devpost must keep the primary pitch focused");
assert.doesNotMatch(video, /\bMCP\b|recurring operations?|schedule operations/i, "Video must keep the primary pitch focused");
const devpostWords = devpost.trim().split(/\s+/).filter(Boolean).length;
assert.ok(devpostWords <= 700, `Devpost copy is too dense at ${devpostWords} words`);
assert.match(buildWeek, /https:\/\/openai\.devpost\.com\/details\/dates/);
assert.match(buildWeek, /Primary Codex \/feedback session ID: 019f7517-658f-7723-8686-2ecda930c00a/);
assert.match(buildWeek, /Demo video: https:\/\/youtu\.be\/s35aGhVI2Eo/);
assert.match(devpost, /Demo video: https:\/\/youtu\.be\/s35aGhVI2Eo/);
assert.match(video, /Published demo: https:\/\/youtu\.be\/s35aGhVI2Eo/);
assert.match(buildWeek, /Built with: Codex using GPT-5\.6/);
assert.match(buildWeek, /Eligible implementation start: afb5fc1c1e01d746753712ddc79f456df0984826/);
assert.match(buildWeek, /Current submission state: open/);
assert.doesNotMatch(buildWeek, /\[[A-Z][A-Z -]+\]/, "Build Week evidence must not contain unresolved placeholders");
assert.match(npmRelease, /dist-tag: latest/);
assert.match(npmRelease, /8a12fb444ba885e023b564b646fe3948279abb8e/);

const narration = video.split("\n").filter((line) => line.startsWith("> ")).map((line) => line.slice(2)).join(" ");
const narrationWords = narration.trim().split(/\s+/).filter(Boolean).length;
assert.ok(narrationWords >= 90, `Video narration is too thin at ${narrationWords} words`);
assert.ok(narrationWords <= 230, `Video narration is too dense at ${narrationWords} words`);

console.log(`Submission copy matches the four-outcome story; narration is ${narrationWords} words.`);
