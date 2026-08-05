import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");

const htmlPath = "launch/site/index.html";
const html = read(htmlPath);
const app = read("launch/site/app.js");
const decision = JSON.parse(read("launch/direction/decision.json"));
const claims = read("launch/claims/claims-register.md");

assert.equal(decision.candidateCount, 3);
assert.equal(decision.candidates.length, 3);
assert.equal(decision.selectionType, "agent-selected");
assert.equal(decision.selected, "continuous-form");
assert.deepEqual(decision.comparisonViewport, { width: 1440, height: 900 });

for (const candidate of decision.candidates) {
  assert.ok(existsSync(resolve(root, candidate.preview)), `${candidate.preview} missing`);
  assert.ok(existsSync(resolve(root, dirname(candidate.preview), "preview.png")), `${candidate.id} screenshot missing`);
}

assert.match(app, /import \{ buildReceipt \} from "\.\.\/\.\.\/src\/lib\/receipt\.js"/);
assert.match(app, /buildReceipt\(fixture\.draft\)/);
assert.match(html, /name="robots" content="noindex,nofollow"/);
assert.match(html, /Prepared locally · not deployed · not market-validated/);
assert.match(claims, /PatchProof improves review accuracy or speed\. \| Unproven/);
assert.match(claims, /PatchProof is secure or production-ready\. \| Unproven/);

const localTargets = [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((target) => !target.startsWith("#"));

for (const target of localTargets) {
  assert.ok(!/^https?:/.test(target), `external runtime target: ${target}`);
  const path = resolve(root, dirname(htmlPath), target);
  assert.ok(existsSync(path), `missing local target: ${target}`);
}

console.log("launch contract: PASS (truth, Remix, local links, external gate)");
