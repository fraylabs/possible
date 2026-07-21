import { access, readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.join(repository, "apps/web/public/demo/still");
const failures = [];

async function requirePath(relative) {
  const target = path.join(root, relative);
  try {
    const details = await stat(target);
    if (details.isDirectory()) await access(path.join(target, "index.html"));
  } catch {
    failures.push(`Missing public demo path: ${relative}`);
  }
}

function localReferences(source) {
  return [...source.matchAll(/(?:href|poster|src)="\.\/([^"#?]+)"/g)].map((match) => match[1]);
}

const routeDirectories = ["site", "film", "hardware", "evidence", "verification"];
const [index, manifestSource, eventsSource, ...routeIndexes] = await Promise.all([
  readFile(path.join(root, "index.html"), "utf8"),
  readFile(path.join(root, "manifest.json"), "utf8"),
  readFile(path.join(root, "run-events.json"), "utf8"),
  ...routeDirectories.map((directory) => readFile(path.join(root, directory, "index.html"), "utf8")),
]);

const nextConfig = await readFile(path.join(repository, "apps/web/next.config.ts"), "utf8");
if (!nextConfig.includes('output: "export"') || !nextConfig.includes("trailingSlash: true")) {
  failures.push("Next.js must export directory index routes for nested public demo presentations");
}

const liveSources = [index, manifestSource, eventsSource].join("\n");
if (/outcome-room|assets\/(?:site|film|hardware)/.test(liveSources)) {
  failures.push("Live demo files must not expose the retired outcome-room/assets layout");
}

for (const required of [
  "index.html",
  "site/",
  "film/still-launch.mp4",
  "hardware/still.step",
  "evidence/final-receipt.md",
  "verification/browser-results.json",
  "CODEX-THREAD.md",
]) await requirePath(required);

for (const reference of localReferences(index)) await requirePath(reference);
for (const [offset, routeIndex] of routeIndexes.entries()) {
  const directory = routeDirectories[offset];
  for (const reference of localReferences(routeIndex)) await requirePath(path.join(directory, reference));
}
if (!routeIndexes[0].includes('src="/demo/still/site/assets/') || !routeIndexes[0].includes('href="/demo/still/site/assets/')) {
  failures.push("Hardware Launch site entry must use absolute asset URLs that survive clean-URL redirects");
}

const manifest = JSON.parse(manifestSource);
for (const output of manifest.outputs) await requirePath(output.path);
await requirePath(manifest.verification.browserResult);
await requirePath(manifest.verification.artifactResult);

const events = JSON.parse(eventsSource);
for (const event of events) await requirePath(event.evidence.replace(/^\.\//, ""));

if (failures.length) throw new Error(`Still demo validation failed:\n- ${failures.join("\n- ")}`);

const threeRoot = path.join(repository, "apps/web/public/demo/three");
const releaseRoot = path.join(repository, "apps/web/public/demo/tiny-slug");
const gameRoot = path.join(repository, "apps/web/public/demo/fold");
const robotRoot = path.join(repository, "apps/web/public/demo/robot-snake");

async function requireExamplePath(exampleRoot, relative, label) {
  const target = path.join(exampleRoot, relative);
  try {
    return await stat(target);
  } catch {
    failures.push(`Missing ${label} path: ${relative}`);
    return null;
  }
}

for (const relative of [
  "product/index.html",
  "site/index.html",
  "film/three-demo.mp4",
  "film/stills/04-done.png",
  ".possible/outcome-brief.md",
  "evidence/product-test-receipt.md",
  "evidence/site-test-receipt.md",
  "evidence/film-render-receipt.md",
  "evidence/final-verification.md",
  "evidence/failed-review-01/README.md",
  "evidence/integration-repairs.md",
  "evidence/runtime/integrated-verifier.json",
  "release/release-plan.md",
  "CODEX-THREAD.md",
]) await requireExamplePath(threeRoot, relative, "Software Launch demo");

for (const directory of ["product", "site"]) {
  const html = await readFile(path.join(threeRoot, directory, "index.html"), "utf8");
  const assetPrefix = `/demo/three/${directory}/assets/`;
  if (!html.includes(`src="${assetPrefix}`) || !html.includes(`href="${assetPrefix}`)) {
    failures.push(`Software Launch ${directory} build must use absolute assets that survive clean-URL redirects`);
  }
}

const film = await requireExamplePath(threeRoot, "film/three-demo.mp4", "Software Launch demo");
if (film && film.size < 1_000_000) failures.push("Software Launch film is unexpectedly small");

const integratedReceipt = JSON.parse(await readFile(path.join(threeRoot, "evidence/runtime/integrated-verifier.json"), "utf8"));
if (integratedReceipt.result !== "passed") failures.push("Software Launch integrated verifier did not pass");
const finalVerification = await readFile(path.join(threeRoot, "evidence/final-verification.md"), "utf8");
if (!/L0[^\n]*L8|L0.L8/s.test(finalVerification) || !/pass|ready/i.test(finalVerification)) {
  failures.push("Software Launch final verification does not record an L0–L8 passing decision");
}

for (const relative of [
  "index.js",
  "index.d.ts",
  "index.test.js",
  "package.json",
  "README.md",
  ".github/workflows/ci.yml",
  ".possible/outcome-receipt.md",
  "release/security-review.md",
  "CODEX-THREAD.md",
]) await requireExamplePath(releaseRoot, relative, "Open-Source Release demo");

for (const relative of ["game-brief.md", "review.md", "verification.md"]) {
  await requireExamplePath(gameRoot, relative, "Playable Web Game proof");
}

const robotManifest = JSON.parse(await readFile(path.join(robotRoot, "manifest.json"), "utf8"));
if (robotManifest.taskId !== "019f8493-b105-7be1-bcce-9f38005e7d81" || robotManifest.model !== "gpt-5.6-sol") {
  failures.push("Robot Prototype manifest must preserve the isolated task ID and model");
}
if (robotManifest.pack?.revision !== "9b3d3dfcc28af2b78d947f80dfa447d03eb35c75") {
  failures.push("Robot Prototype manifest must preserve the reviewed pack revision");
}
if (!/aggregate propulsion and steering.*surrogates/i.test(robotManifest.boundary ?? "")) {
  failures.push("Robot Prototype manifest must disclose the aggregate propulsion/steering surrogate");
}

for (const file of robotManifest.files ?? []) {
  if (!file.publishedUrl?.startsWith("/demo/robot-snake/") || file.publishedUrl.includes("..")) {
    failures.push(`Robot Prototype manifest has an invalid public URL: ${file.publishedUrl}`);
    continue;
  }
  const relative = file.publishedUrl.slice("/demo/robot-snake/".length);
  const target = path.join(robotRoot, relative);
  try {
    const contents = await readFile(target);
    const details = await stat(target);
    const digest = createHash("sha256").update(contents).digest("hex");
    if (details.size !== file.publishedBytes || digest !== file.publishedSha256) {
      failures.push(`Robot Prototype published artifact drifted from its manifest: ${relative}`);
    }
    if (relative.endsWith(".rrd")) {
      const header = contents.subarray(0, 4).toString("ascii");
      const footer = contents.subarray(Math.max(0, contents.length - 64)).toString("ascii");
      if (header !== "RRF2" || !footer.includes("RRF2FOOT")) {
        failures.push(`Robot Prototype RRD is missing its expected RRF2 header or footer: ${relative}`);
      }
    }
    if (/byte-for-byte copy/.test(file.derivation) && (file.sourceBytes !== file.publishedBytes || file.sourceSha256 !== file.publishedSha256)) {
      failures.push(`Robot Prototype copied artifact no longer matches its recorded source: ${relative}`);
    }
  } catch {
    failures.push(`Missing Robot Prototype published artifact: ${relative}`);
  }
}
const robotViewerReceipt = JSON.parse(await readFile(path.join(robotRoot, "viewer/robot-snake.manifest.json"), "utf8"));
const publishedRrd = robotManifest.files.find((file) => file.publishedUrl.endsWith(".rrd"));
if (!publishedRrd || robotViewerReceipt.recording_sha256 !== publishedRrd.publishedSha256 || robotViewerReceipt.coverage?.frames !== 3801) {
  failures.push("Robot Prototype Rerun receipt does not match the published recording or expected frame coverage");
}

const appSource = await readFile(path.join(repository, "apps/web/src/App.tsx"), "utf8");
if (!appSource.includes('path === "/demo/game/play"') || !appSource.includes('<PaperPlaneGame />')) {
  failures.push("Playable Web Game proof must expose the full-screen /demo/game/play route");
}
if (!appSource.includes("not presented as a clean-room pack evaluation")) {
  failures.push("Playable Web Game proof must disclose that it is not a clean-room pack evaluation");
}
for (const file of robotManifest.files ?? []) {
  if (!appSource.includes(file.publishedUrl)) failures.push(`Robot Prototype page does not link its manifested artifact: ${file.publishedUrl}`);
}
for (const claimBoundary of ["Aggregate propulsion", "Physical locomotion", "actuator suitability", "fabrication readiness", "functional safety"]) {
  if (!appSource.toLowerCase().includes(claimBoundary.toLowerCase())) {
    failures.push(`Robot Prototype page is missing claim boundary: ${claimBoundary}`);
  }
}

const packageJson = JSON.parse(await readFile(path.join(releaseRoot, "package.json"), "utf8"));
if (packageJson.name !== "tiny-slug" || packageJson.type !== "module") {
  failures.push("Open-Source Release package contract is not the verified tiny-slug ESM package");
}

const publicTranscripts = await Promise.all([
  readFile(path.join(root, "CODEX-THREAD.md"), "utf8"),
  readFile(path.join(threeRoot, "CODEX-THREAD.md"), "utf8"),
  readFile(path.join(releaseRoot, "CODEX-THREAD.md"), "utf8"),
]);
if (publicTranscripts.some((source) => /\/Users\/|\/private\/tmp|\/tmp\//.test(source))) {
  failures.push("A public example transcript leaks a local filesystem path");
}

if (failures.length) throw new Error(`Demo bundle validation failed:\n- ${failures.join("\n- ")}`);
console.log("Hardware, Software, Open-Source, and Robot Prototype demos plus the Playable Web Game proof are complete.");
