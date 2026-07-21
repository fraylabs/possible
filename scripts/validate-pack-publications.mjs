import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { compilePack, outcomePacks } from "../packages/packs/dist/index.js";

const webDist = new URL("../apps/web/out/", import.meta.url);
const text = (relative) => readFile(new URL(relative, webDist), "utf8");
const index = JSON.parse(await text("packs/index.json"));
const featuredSlugs = new Set(["hardware-launch", "robot-prototype", "playable-web-game", "web-presentation"]);
const featuredPacks = outcomePacks.filter((pack) => featuredSlugs.has(pack.slug));
const evidence = JSON.parse(await text("evidence.json"));
const judgingDocument = await readFile(new URL("../JUDGING.md", import.meta.url), "utf8");
const nonEmptyString = (value, label) => {
  assert.equal(typeof value, "string", `${label} must be a string`);
  assert.ok(value.trim(), `${label} must not be empty`);
};

assert.equal(evidence.schemaVersion, 1);
assert.equal(evidence.project.package, "https://www.npmjs.com/package/@fraylabs/possible");
const comparison = evidence.recordedComparison;
assert.ok(comparison && typeof comparison === "object", "evidence.json must publish the recorded comparison as structured data");
for (const [key, value] of Object.entries({
  name: comparison.name,
  question: comparison.question,
  model: comparison.protocol?.model,
  controlPrompt: comparison.protocol?.controlPrompt,
  onlyFollowUp: comparison.protocol?.onlyFollowUp,
  controlEnvironment: comparison.protocol?.controlEnvironment,
  evaluationContract: comparison.protocol?.evaluationContract,
  goalControlResult: comparison.observedResults?.goalControl,
  possibleResult: comparison.observedResults?.possible,
  goalInterpretation: comparison.interpretation?.goal,
  possibleInterpretation: comparison.interpretation?.possible,
  combinedInterpretation: comparison.interpretation?.together,
})) nonEmptyString(value, `recordedComparison.${key}`);

assert.match(comparison.name, /robot snake/i);
assert.match(comparison.question, /(?:operational knowledge|non-expert|rough request)/i, "The manifest must state the comparison's evaluation question");
assert.match(comparison.protocol.model, /^gpt-5\.6/i, "The manifest must identify the recorded control model");
assert.match(comparison.protocol.controlPrompt, /^\/goal\b[\s\S]*robot snake/i, "The manifest must preserve the control's initiating prompt");
assert.match(comparison.protocol.onlyFollowUp, /simulation[\s\S]*(?:printer|budget)/i, "The manifest must preserve the only control follow-up");
assert.match(comparison.protocol.controlEnvironment, /empty Git[\s\S]*fresh (?:CODEX_HOME|Codex home)[\s\S]*(?:no|without) Possible/i, "The manifest must preserve the clean control environment");
assert.match(comparison.protocol.evaluationContract, /Robot Prototype[\s\S]*(?:before|pre[- ]exist)/i, "The manifest must identify the pre-existing evaluation contract");
assert.match(comparison.observedResults.goalControl, /browser[\s\S]*(?:firmware|hardware)[\s\S]*18/i, "The manifest must summarize the useful control result");
assert.match(comparison.observedResults.possible, /CAD[\s\S]*URDF\/SRDF[\s\S]*MuJoCo[\s\S]*(?:Rerun|telemetry)[\s\S]*12[\s\S]*186/i, "The manifest must summarize the distinct Possible evidence");
assert.match(comparison.interpretation.goal, /(?:pursuit|persist|adapt)/i, "The manifest must distinguish the role of /goal");
assert.match(comparison.interpretation.possible, /(?:reviewed|controlled)[\s\S]*(?:outcome )?contract/i, "The manifest must distinguish the role of Possible");
assert.match(comparison.interpretation.together, /Possible[\s\S]*\/goal|\/goal[\s\S]*Possible/i, "The manifest must state how the two approaches combine");

assert.ok(Array.isArray(comparison.evidence), "recordedComparison.evidence must be an array of direct evidence links");
for (const [index, item] of comparison.evidence.entries()) {
  nonEmptyString(item?.label, `recordedComparison.evidence[${index}].label`);
  assert.match(item?.url ?? "", /^https:\/\//, `recordedComparison.evidence[${index}].url must be absolute`);
  assert.ok(judgingDocument.includes(item.url), `JUDGING.md must expose recorded comparison evidence: ${item.url}`);
}
const comparisonUrls = comparison.evidence.map(({ url }) => url);
for (const url of [
  "https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/robot-snake/CONTROL-RUN.md",
  "https://possible.sh/demo/robot-snake/control/",
  "https://possible.sh/demo/robot-snake/manifest.json",
  "https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/robot-snake/evidence/outcome-receipt.md",
]) assert.ok(comparisonUrls.includes(url), `evidence.json must directly expose ${url}`);
assert.deepEqual(
  evidence.judgingCriteria.map(({ criterion }) => criterion),
  ["Technological Implementation", "Design", "Potential Impact", "Quality of the Idea"],
);
assert.deepEqual(
  evidence.guidedEvidenceTrail.map(({ step, stage }) => ({ step, stage })),
  [
    { step: 1, stage: "Intake" },
    { step: 2, stage: "Compiled workstreams" },
    { step: 3, stage: "Verification failure" },
    { step: 4, stage: "Repair" },
    { step: 5, stage: "Passing completion" },
  ],
);

for (const item of evidence.judgingCriteria) {
  assert.equal(typeof item.claim, "string");
  assert.equal(typeof item.implementationFact, "string");
  assert.equal(typeof item.significance, "string");
  assert.match(item.evidence.url, /^https:\/\//);
  assert.ok(judgingDocument.includes(item.criterion));
  assert.ok(judgingDocument.includes(item.claim));
  assert.ok(judgingDocument.includes(item.significance));
  assert.ok(judgingDocument.includes(item.evidence.url));
}

for (const item of evidence.guidedEvidenceTrail) {
  assert.equal(typeof item.fact, "string");
  assert.match(item.url, /^https:\/\//);
  assert.match(judgingDocument, new RegExp(`\\*\\*${item.stage}:\\*\\*`));
  assert.ok(judgingDocument.includes(item.url));
}

const possibleUrls = [
  evidence.project.judgingPage,
  ...comparisonUrls,
  ...evidence.judgingCriteria.map(({ evidence: itemEvidence }) => itemEvidence.url),
  ...evidence.guidedEvidenceTrail.map(({ url }) => url),
].filter((url) => url.startsWith("https://possible.sh/"));

for (const value of new Set(possibleUrls)) {
  const { pathname } = new URL(value);
  const basename = pathname.split("/").at(-1);
  const relativePath = pathname.endsWith("/")
    ? `${pathname.slice(1)}index.html`
    : basename.includes(".")
      ? pathname.slice(1)
      : `${pathname.slice(1)}/index.html`;
  await access(new URL(relativePath, webDist));
}

const repositoryUrls = [
  ...comparisonUrls,
  ...evidence.judgingCriteria.map(({ evidence: itemEvidence }) => itemEvidence.url),
  ...evidence.guidedEvidenceTrail.map(({ url }) => url),
].filter((url) => url.startsWith("https://github.com/fraylabs/possible/blob/main/"));

for (const value of new Set(repositoryUrls)) {
  const { pathname } = new URL(value);
  const relativePath = pathname.replace("/fraylabs/possible/blob/main/", "");
  await access(new URL(`../${relativePath}`, import.meta.url));
}

assert.equal(await text("evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`);

const initialBrowserResult = await text("demo/still/verification/browser-results-initial-failure.json");
const passingBrowserResult = await text("demo/still/verification/browser-results.json");
assert.match(initialBrowserResult, /"status": "failed"/);
assert.match(initialBrowserResult, /"bad_response_count": 4/);
assert.match(passingBrowserResult, /"status": "passed"/);
assert.match(passingBrowserResult, /"response_count": 50/);
assert.match(passingBrowserResult, /"console_error_count": 0/);
assert.match(passingBrowserResult, /"page_error_count": 0/);
assert.match(passingBrowserResult, /"request_failure_count": 0/);
assert.match(passingBrowserResult, /"bad_response_count": 0/);

assert.deepEqual(
  index.packs.map(({ slug, lane }) => ({ slug, lane })),
  featuredPacks.map(({ slug, lane }) => ({ slug, lane })),
);

const llms = await text("llms.txt");
assert.match(llms, /AI made execution accessible\. Possible makes operational judgment accessible\./);
assert.match(llms, /Possible\.sh is an open-source library of Outcome Packs for Codex\./);
assert.match(llms, /Each typed specification coordinates selected agent skills, owned workstreams, shared constraints, approval boundaries, and the evidence required for completion\./);
assert.match(llms, /- Judging evidence: \/judging\//);
assert.match(llms, /- Machine-readable evidence: \/evidence\.json/);
assert.match(llms, /recorded[\s\S]{0,160}\/goal[\s\S]{0,160}(?:control|comparison)/i, "llms.txt must surface the recorded /goal comparison");
assert.match(llms, /\/goal[\s\S]{0,120}(?:pursuit|persist|adapt)/i, "llms.txt must distinguish the role of /goal");
assert.match(llms, /Possible[\s\S]{0,120}(?:reviewed|controlled)[\s\S]{0,80}(?:outcome )?contract/i, "llms.txt must distinguish the role of Possible");
for (const url of comparisonUrls) {
  const parsed = new URL(url);
  const acceptedTargets = parsed.origin === "https://possible.sh" ? [url, parsed.pathname] : [url];
  assert.ok(acceptedTargets.some((target) => llms.includes(target)), `llms.txt must directly link recorded comparison evidence: ${url}`);
}
assert.doesNotMatch(llms, /\b(?:recipes?|ingredients?|megaprompt|captain)\b|outcome compiler|composition layer/i);
for (const pack of featuredPacks) {
  const compiled = compilePack(pack);
  const publication = JSON.parse(await text(`packs/${pack.slug}.json`));
  assert.deepEqual(publication, compiled, `${pack.slug}.json must equal the canonical compiled pack`);
  assert.equal(await text(`packs/${pack.slug}/install.txt`), `${compiled.installCommands.join("\n")}\n`);
  assert.equal(await text(`packs/${pack.slug}/run.txt`), `${compiled.runPrompt}\n`);
  assert.match(llms, new RegExp(`- ${pack.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}: /packs/${pack.slug}\\.json`));
}

console.log("All featured pack and judging evidence publications are valid.");
