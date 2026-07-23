import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const expected = {
  "REQUEST.md": "015671d03fbb5920ce4e93fd4174c1fc0906a7ce4eb2bcc97f0d4fae757882e0",
  ".possible/chain.json": "70b3687943442a2e5cfde5cf860c4d97651e26b0e65f07a76ebd3bd81a37e7ee",
  ".possible/handoffs/20260722-software-opportunity-discovery-001--working-web-app.json": "bf5518ca8cb9a8410c76ccb768100b073d6ec245986edfef64dff91f794b340f",
  ".possible/handoffs/20260722-working-web-app-001--developer-project-launch.json": "55739914edc0b2a92034cbd9d5333e12f6f2884abd842acdd13db646adf1726c",
  ".possible/transcript-links.json": "55bb44b543d2034ada84f462d2ed1edbf98fdda0f7c322aa43f57c5df9c04efe",
  ".possible/transcripts/discovery.json": "1d0271dc4a12395b8c74ac5b0b1561e85d8502ee8b670636fd5a0f395892e486",
  ".possible/transcripts/discovery.md": "c173a5c55e1b27a124f7997dcbf6f390b29bd3c4a06920b67d975ef6a2e84358",
  ".possible/transcripts/product.json": "76865a2da18e238c27b1f40750171bc7de5837ef495b4c28855e9a013fa5d4ed",
  ".possible/transcripts/product.md": "a9f36b0a8833196160839ca85d678f2592dad783bf574dfc1683a5451932d660",
  ".possible/transcripts/launch.json": "724a2f69c9e61da760d10e653449283a513e51bf9afc0ee02e3fb5408a48483a",
  ".possible/transcripts/launch.md": "f35250e6b4146a41f0a8e20d614cd50edfa336ef05c67617b2eebb8da9a5fa18",
  ".possible/runs/20260722-software-opportunity-discovery-001/archive-manifest.json": "c307effa535e889e2ef4bf704148dde11a36fe03aba7cabd36be1a4ddafdab1d",
  ".possible/runs/20260722-software-opportunity-discovery-001/verification.md": "46c2b99682974e250d41a35de0e6db5cf2a1fd5b042dcb345ea4468f827c82b4",
  ".possible/runs/20260722-working-web-app-001/archive-manifest.json": "f1df63a219b43674e2524560cd82584b6dfb34b4298716b6a5a145146be68c64",
  ".possible/runs/20260722-developer-project-launch-001/archive-manifest.json": "32cbc0fc5e23708c92056ca96b49a96ccf5928ff7db93b0d82d5a75637929eac",
  "outcome-room/decision-receipt.json": "3702628f1bc97253d7a34a9dbf340caeb9495d2cbe2ffcfdcd0f84f0eaf49766",
  "outcome-room/product-receipt.json": "67a53b4a2a6290ab649dac4deb0a2d2700ce60702fd1e77c3804ff417b22fb17",
  "outcome-room/browser-desktop.png": "5cbd149d489524fadc965b61603de87b3aab5fb7d3cf180986c262714f1b6ea7",
  "outcome-room/browser-mobile.png": "5a86ab6297b44c68e5fab2ee27c84b20e6a50bfdc3decb70a3d46010e6e3d6c5",
  "outcome-room/verification.md": "309b3112f32d9ee08b04b515712fc0e6403a2040e9fe80410762bf719fc3b7a7",
  "outcome-room/repair-log.md": "b9d3cfa6db443e1fd45980c7f6004a17e348b456c642977eaf56ccee9dd77f4a",
  "launch/direction/decision.json": "233036440f7b1a239e7c603f54c5e60ea23b20844430d7be4d644a3edeca2d3c",
  "launch/direction/previews/continuous-form/preview.png": "5ec1b0fbcc328279f2ccfa140c7134574341d6e44d45856325dd1df8ee3ed79a",
  "launch/direction/previews/evidence-stamp/preview.png": "c28214faa194dd080492d93dde9f43cd4626f5ef1b1370ce244c6cb046bd4e4f",
  "launch/direction/previews/patch-panel/preview.png": "87f9af7010228a28ffff2f0eb1f6f49d7bade5d965bd0b82bf01ad79c5c7cec8",
  "launch/launch-receipt.json": "c400753a7c098a1097a1ae5242af6f60967f1260fbf7c6a614dfd6bef88f48b5",
  "launch/evidence/verification.md": "2bc5806336f84ace60767b81428587657d1105bfdf49c16bfbf120a4c94db00f",
  "launch/evidence/repair-log.md": "5923aae09f46020583541b4bb937c053eb167e5cd33f9bfd025a9b57fa5d89a0",
  "launch/evidence/site-desktop.png": "1469191ad0f23fb8dcd4e9b059bb9e34ed4dbc01d81d3e27fc1c00eba6b6faf4",
  "launch/evidence/site-mobile.png": "daf02ee8df33f6ae8e845fe2ab5033a9cb6e2db221a7aeea469633a45d455340",
};

for (const [path, digest] of Object.entries(expected)) {
  const content = await readFile(resolve(root, path));
  assert.equal(createHash("sha256").update(content).digest("hex"), digest, `${path} changed`);
}

const runIds = [
  "20260722-software-opportunity-discovery-001",
  "20260722-working-web-app-001",
  "20260722-developer-project-launch-001",
];
let archivedArtifacts = 0;
for (const runId of runIds) {
  const archiveRoot = `.possible/runs/${runId}`;
  const manifest = JSON.parse(await readFile(resolve(root, archiveRoot, "archive-manifest.json"), "utf8"));
  for (const artifact of manifest.artifacts) {
    const content = await readFile(resolve(root, archiveRoot, artifact.path));
    assert.equal(createHash("sha256").update(content).digest("hex"), artifact.sha256, `${runId}/${artifact.path} changed`);
    archivedArtifacts += 1;
  }
}

const json = async (path) => JSON.parse(await readFile(resolve(root, path), "utf8"));
const chain = await json(".possible/chain.json");
assert.deepEqual(chain.stages.map(({ slug, state }) => [slug, state]), [
  ["software-opportunity-discovery", "completed-pursue"],
  ["working-web-app", "completed-passed"],
  ["developer-project-launch", "completed-passed-local-only"],
]);
assert.equal(chain.currentStage, null);
assert.equal(chain.pendingTransition, null);
assert.equal(chain.externalAuthority, "none");

const discovery = await json("outcome-room/decision-receipt.json");
assert.equal(discovery.selectedOpportunity.name, "PatchProof");
assert.equal(discovery.status, "pursue");
assert.match(discovery.interpretation, /not evidence of product-market fit or launch readiness/i);

const product = await json("outcome-room/product-receipt.json");
assert.equal(product.status, "passed");
assert.equal(product.checks.unitAssertions.passed, 34);
assert.equal(product.checks.fixtureCases.passed, 12);
assert.equal(product.checks.externalBrowserRequests, 0);

const remix = await json("launch/direction/decision.json");
assert.equal(remix.candidateCount, 3);
assert.equal(remix.candidates.length, 3);
assert.equal(remix.selected, "continuous-form");
assert.equal(remix.selectionType, "agent-selected");

const launch = await json("launch/launch-receipt.json");
assert.equal(launch.status, "passed-local-only");
assert.equal(launch.externalGate.authority, "none");
assert.equal(launch.externalGate.deploymentAttempted, false);
assert.equal(launch.verification.freshReview.status, "passed");

console.log(`PatchProof chain example verified: ${Object.keys(expected).length} public evidence files and ${archivedArtifacts} archived artifacts, 3 completed stages, 3 Remix directions, no external authority.`);
