import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { lstatSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const load = (path) => JSON.parse(readFileSync(resolve(root, path), "utf8"));
const sha256 = (path) => createHash("sha256").update(readFileSync(resolve(root, path))).digest("hex");
const sha256Buffer = (value) => createHash("sha256").update(value).digest("hex");
const assertSafeFile = (path) => {
  if (isAbsolute(path) || path.split("/").includes("..")) throw new Error(`unsafe path: ${path}`);
  const absolute = resolve(root, path);
  const inside = relative(realpathSync(root), realpathSync(absolute));
  if (inside.startsWith("..") || isAbsolute(inside)) throw new Error(`path escapes repository: ${path}`);
  const stat = lstatSync(absolute);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`not a regular file: ${path}`);
};
const assertHash = ({ path, sha256: expected }) => {
  assertSafeFile(path);
  const actual = sha256(path);
  if (actual !== expected) throw new Error(`hash mismatch: ${path}`);
};
const assertLiveOrImmutableHash = ({ path, sha256: expected }, revision) => {
  assertSafeFile(path);
  if (sha256(path) === expected) return;
  if (!/^[0-9a-f]{40}$/.test(revision)) throw new Error(`invalid immutable revision: ${revision}`);
  const historical = execFileSync("git", ["show", `${revision}:${path}`], { cwd: root });
  if (sha256Buffer(historical) !== expected) throw new Error(`hash mismatch in live and immutable evidence: ${path}`);
};

const chain = load(".possible/chain.json");
const pendingHandoff = chain.pendingTransition?.handoff;
const chainCompleted = !chain.currentStage
  && !pendingHandoff
  && chain.stages.every((stage) => stage.state.startsWith("completed-"));
const handoffDestination = chain.currentStage || (chainCompleted ? chain.stages.at(-1)?.slug : null);
const inboundCandidates = handoffDestination
  ? readdirSync(resolve(root, ".possible/handoffs"))
      .filter((name) => name.endsWith(`--${handoffDestination}.json`))
      .map((name) => `.possible/handoffs/${name}`)
  : [];
if (!pendingHandoff && inboundCandidates.length !== 1) {
  throw new Error(`expected one inbound handoff for active stage, found ${inboundCandidates.length}`);
}
const handoffPath = pendingHandoff || inboundCandidates[0];
assertSafeFile(handoffPath);
const handoff = load(handoffPath);
if (handoff.eligibility.status !== "eligible") throw new Error("handoff is not eligible");
if (!handoff.eligibility.review) throw new Error("handoff has no independent eligibility review");
assertHash(handoff.eligibility.review);
const expectedAuthorization = pendingHandoff ? "proposed" : "approved";
if (handoff.authorization.status !== expectedAuthorization || handoff.authorization.externalAuthority !== "none") {
  throw new Error(`handoff must be ${expectedAuthorization} with no external authority`);
}
if (!pendingHandoff && handoff.destination.packSlug !== handoffDestination) {
  throw new Error("inbound handoff destination does not match active stage");
}

assertHash(handoff.source.receipt);
assertHash(handoff.source.verification);
assertHash({ path: handoff.destination.packDefinitionSource, sha256: handoff.destination.packDefinitionSourceSha256 });
for (const evidence of handoff.transfer.evidence) {
  assertLiveOrImmutableHash(evidence, handoff.source.workspaceRevision);
}

assertSafeFile(handoff.source.archiveManifest);
const manifest = load(handoff.source.archiveManifest);
const archiveRoot = dirname(handoff.source.archiveManifest);
for (const artifact of manifest.artifacts) {
  assertHash({ path: `${archiveRoot}/${artifact.path}`, sha256: artifact.sha256 });
}

console.log("chain handoff verification: PASS");
