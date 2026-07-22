import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const receipt = JSON.parse(read("outcome-room/decision-receipt.json"));
const chain = JSON.parse(read(".possible/chain.json"));

const fail = (message) => {
  throw new Error(message);
};

if (receipt.status !== "pursue") fail("receipt must be pursue");
if (receipt.selectedOpportunity?.name !== "PatchProof") fail("selected opportunity changed");
if (chain.stages[1]?.slug !== "working-web-app" || chain.stages[1]?.state !== "proposed-unapproved") {
  fail("Working Web App must be the next unapproved stage");
}
if (chain.stages[2]?.slug !== "developer-project-launch" || chain.stages[2]?.state !== "proposed-unapproved") {
  fail("Developer Project Launch must remain later and unapproved");
}

const sourceIds = [...read("opportunity/research/source-ledger.md").matchAll(/\| S(\d{2}) \|/g)];
if (sourceIds.length !== 21) fail(`expected 21 sources, found ${sourceIds.length}`);

const opportunityCount = [...read("outcome-room/opportunities.md").matchAll(/^## \d+\./gm)].length;
if (opportunityCount < 3 || opportunityCount > 5) fail(`expected 3–5 opportunities, found ${opportunityCount}`);

const weights = [25, 20, 15, 20, 10, 10];
const scores = {
  PatchProof: [5, 5, 5, 3, 5, 5],
  "Repo Contract Doctor": [4, 5, 5, 1, 5, 5],
  ExampleLens: [3, 4, 4, 2, 4, 4],
  RunnerGap: [4, 2, 4, 2, 3, 3],
};
const expected = { PatchProof: 92, "Repo Contract Doctor": 79, ExampleLens: 67, RunnerGap: 60 };
for (const [name, values] of Object.entries(scores)) {
  const total = values.reduce((sum, value, index) => sum + (value * weights[index]) / 5, 0);
  if (total !== expected[name]) fail(`${name} score is ${total}, expected ${expected[name]}`);
}

for (const path of Object.values(receipt.evidence)) {
  if (isAbsolute(path) || path.split("/").includes("..")) fail(`unsafe evidence path: ${path}`);
  const absolute = resolve(root, path);
  const inside = relative(realpathSync(root), realpathSync(absolute));
  if (inside.startsWith("..") || isAbsolute(inside)) fail(`evidence escapes repository: ${path}`);
  if (!lstatSync(absolute).isFile() || lstatSync(absolute).isSymbolicLink()) fail(`evidence is not a regular file: ${path}`);
}

console.log("discovery verification: PASS");
