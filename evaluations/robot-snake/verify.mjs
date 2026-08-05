import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile, stat } from "node:fs/promises";

const repository = new URL("../../", import.meta.url);
const loadJson = async (relative) => JSON.parse(await readFile(new URL(relative, repository), "utf8"));
const [protocol, results, manifest] = await Promise.all([
  loadJson("evaluations/robot-snake/protocol.json"),
  loadJson("evaluations/robot-snake/results.json"),
  loadJson("apps/web/public/demo/robot-snake/manifest.json"),
]);

assert.equal(protocol.schemaVersion, 1);
assert.equal(protocol.control.prompt, "/goal I want to make a robot snake");
assert.match(protocol.control.environment, /Empty Git repository.*fresh CODEX_HOME.*no AGENTS\.md.*Possible.*CAD.*MuJoCo/i);
assert.equal(protocol.contractPredatesControl, true);
assert.ok(protocol.limitations.length >= 3);
assert.equal(results.schemaVersion, 1);
assert.equal(results.criteria.length, 9);

for (const criterion of results.criteria) {
  assert.match(criterion.id, /^[a-z0-9-]+$/);
  assert.ok(["met", "partial", "not-recorded"].includes(criterion.control));
  assert.ok(["met", "partial", "not-recorded"].includes(criterion.possible));
  for (const key of ["controlEvidence", "possibleEvidence"]) {
    if (criterion[key]) await access(new URL(criterion[key], repository));
  }
  if (criterion.control === "met") assert.ok(criterion.controlEvidence);
  if (criterion.possible === "met") assert.ok(criterion.possibleEvidence);
}

for (const file of manifest.files) {
  const relative = `apps/web/public${file.publishedUrl}`;
  const target = new URL(relative, repository);
  const [contents, details] = await Promise.all([readFile(target), stat(target)]);
  assert.equal(details.size, file.publishedBytes, `${relative} byte count drifted`);
  assert.equal(createHash("sha256").update(contents).digest("hex"), file.publishedSha256, `${relative} checksum drifted`);
}

const receipt = await readFile(new URL("apps/web/public/demo/robot-snake/evidence/outcome-receipt.md", repository), "utf8");
assert.equal(manifest.verification.captainSuite, "12/12 passed");
assert.equal(manifest.verification.freshIndependentSuite, "12/12 passed");
assert.equal(manifest.verification.interfaceChecks, "186/186 passed");
assert.match(receipt, /found three material defects/i);
assert.match(receipt, /no remaining material defect/i);

console.log(`Robot Snake evidence is reproducible: ${results.criteria.length} criteria and ${manifest.files.length} checksummed artifacts verified.`);
