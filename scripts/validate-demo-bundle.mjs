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
const rerunGenerator = robotManifest.generators?.find((generator) => generator.sourcePath === "robot/simulation/export_rerun.py");
if (
  rerunGenerator?.sourceSha256 !== "c2facb7aa6725f05295c09e5893667e18629084f82dc63fc2e35f96b7f67dafa"
  || rerunGenerator?.command !== "uv run python -m robot.simulation.export_rerun obstacle_course"
) {
  failures.push("Robot Prototype manifest must preserve the verified Rerun exporter source and command");
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
if (
  !publishedRrd
  || robotViewerReceipt.recording !== "robot-snake.rrd"
  || robotViewerReceipt.source_recording !== "obstacle_course.rrd"
  || robotViewerReceipt.recording_sha256 !== publishedRrd.publishedSha256
  || robotViewerReceipt.coverage?.frames !== 3801
) {
  failures.push("Robot Prototype Rerun receipt does not match the published recording or expected frame coverage");
}
const robotViewerGuide = await readFile(path.join(robotRoot, "viewer/README.md"), "utf8");
if (!robotViewerGuide.includes("uvx --from 'rerun-sdk==0.34.1' rerun robot-snake.rrd")) {
  failures.push("Robot Prototype Rerun guide must include a clean-download uvx quickstart");
}

const appSource = await readFile(path.join(repository, "apps/web/src/App.tsx"), "utf8");
const stylesSource = await readFile(path.join(repository, "apps/web/src/styles.css"), "utf8");
if (!appSource.includes('path === "/demo/game/play"') || !appSource.includes('<PaperPlaneGame />')) {
  failures.push("Playable Web Game proof must expose the full-screen /demo/game/play route");
}
if (!appSource.includes("not presented as a clean-room evaluation")) {
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
if (
  !stylesSource.includes(".demo-evidence-output a { min-width: 0;")
  || !stylesSource.includes(".demo-evidence-output > div:not(.demo-verification-story) { grid-template-columns: repeat(2, minmax(0, 1fr)); }")
  || !stylesSource.includes(".demo-evidence-output > div:not(.demo-verification-story) { grid-template-columns: minmax(0, 1fr); }")
) {
  failures.push("Demo evidence grids must preserve shrinkable tablet and single-column mobile layouts");
}

const patchProofRoot = path.join(repository, "apps/web/public/examples/patchproof-chain");
const patchProofSource = path.join(repository, "examples/patchproof-chain");
const patchProofCopies = {
  "evidence/request.md": "REQUEST.md",
  "evidence/chain.json": ".possible/chain.json",
  "evidence/discovery-receipt.json": "outcome-room/decision-receipt.json",
  "evidence/discovery-verification.md": ".possible/runs/20260722-software-opportunity-discovery-001/verification.md",
  "evidence/discovery-to-product-handoff.json": ".possible/handoffs/20260722-software-opportunity-discovery-001--working-web-app.json",
  "evidence/product-receipt.json": "outcome-room/product-receipt.json",
  "evidence/product-verification.md": "outcome-room/verification.md",
  "evidence/product-repair-log.md": "outcome-room/repair-log.md",
  "evidence/product-desktop.png": "outcome-room/browser-desktop.png",
  "evidence/product-mobile.png": "outcome-room/browser-mobile.png",
  "evidence/product-to-launch-handoff.json": ".possible/handoffs/20260722-working-web-app-001--developer-project-launch.json",
  "evidence/launch-receipt.json": "launch/launch-receipt.json",
  "evidence/launch-verification.md": "launch/evidence/verification.md",
  "evidence/launch-repair-log.md": "launch/evidence/repair-log.md",
  "evidence/remix-decision.json": ".possible/runs/20260722-developer-project-launch-001/remix-decision.json",
  "evidence/remix/continuous-form.png": "launch/direction/previews/continuous-form/preview.png",
  "evidence/remix/evidence-stamp.png": "launch/direction/previews/evidence-stamp/preview.png",
  "evidence/remix/patch-panel.png": "launch/direction/previews/patch-panel/preview.png",
  "evidence/site-desktop.png": "launch/evidence/site-desktop.png",
  "evidence/site-mobile.png": "launch/evidence/site-mobile.png",
  "evidence/transcripts/discovery.json": ".possible/transcripts/discovery.json",
  "evidence/transcripts/discovery.md": ".possible/transcripts/discovery.md",
  "evidence/transcripts/product.json": ".possible/transcripts/product.json",
  "evidence/transcripts/product.md": ".possible/transcripts/product.md",
  "evidence/transcripts/launch.json": ".possible/transcripts/launch.json",
  "evidence/transcripts/launch.md": ".possible/transcripts/launch.md",
};
const patchProofFiles = [
  "product/index.html",
  "product/launch/site/index.html",
  "product/launch/docs/quickstart.md",
  ...Object.keys(patchProofCopies),
];
for (const relative of patchProofFiles) {
  try {
    const details = await stat(path.join(patchProofRoot, relative));
    if (!details.isFile() || details.size === 0) failures.push(`PatchProof published evidence is empty: ${relative}`);
  } catch {
    failures.push(`Missing PatchProof published evidence: ${relative}`);
  }
}
for (const [published, source] of Object.entries(patchProofCopies)) {
  try {
    const [publishedContents, sourceContents] = await Promise.all([
      readFile(path.join(patchProofRoot, published)),
      readFile(path.join(patchProofSource, source)),
    ]);
    if (!publishedContents.equals(sourceContents)) {
      failures.push(`PatchProof published evidence drifted from its preserved source: ${published}`);
    }
  } catch {
    failures.push(`PatchProof source-to-public comparison failed: ${source} → ${published}`);
  }
}
const patchProofProduct = await readFile(path.join(patchProofRoot, "product/index.html"), "utf8");
const patchProofLaunch = await readFile(path.join(patchProofRoot, "product/launch/site/index.html"), "utf8");
if (/\b(?:src|href)="\/assets\//.test(`${patchProofProduct}\n${patchProofLaunch}`)) {
  failures.push("PatchProof compiled pages must use portable asset paths under the public example route");
}
const patchProofChain = JSON.parse(await readFile(path.join(patchProofRoot, "evidence/chain.json"), "utf8"));
if (patchProofChain.stages?.length !== 3 || patchProofChain.stages?.some((stage) => !stage.state.startsWith("completed-"))) {
  failures.push("PatchProof public chain state must preserve three completed stages");
}
const patchProofLaunchReceipt = JSON.parse(await readFile(path.join(patchProofRoot, "evidence/launch-receipt.json"), "utf8"));
if (
  patchProofLaunchReceipt.status !== "passed-local-only"
  || patchProofLaunchReceipt.remix?.candidateCount !== 3
  || patchProofLaunchReceipt.externalGate?.authority !== "none"
  || patchProofLaunchReceipt.externalGate?.deploymentAttempted !== false
) {
  failures.push("PatchProof public launch receipt must preserve Remix coverage and its local-only authority boundary");
}

const transcriptContracts = [
  ["discovery", "patchproof-discovery-20260722", 2, 7],
  ["product", "patchproof-working-web-app-20260722", 4, 28],
  ["launch", "patchproof-developer-project-launch-20260722", 2, 11],
];
let patchProofMessageCount = 0;
for (const [slug, runId, agentCount, messageCount] of transcriptContracts) {
  const [jsonSource, markdown] = await Promise.all([
    readFile(path.join(patchProofRoot, `evidence/transcripts/${slug}.json`), "utf8"),
    readFile(path.join(patchProofRoot, `evidence/transcripts/${slug}.md`), "utf8"),
  ]);
  const transcript = JSON.parse(jsonSource);
  if (
    transcript.runId !== runId
    || transcript.agents?.length !== agentCount
    || transcript.messages?.length !== messageCount
    || transcript.messages?.some((message) => !message.message || !["commentary", "final_answer"].includes(message.phase))
  ) {
    failures.push(`PatchProof ${slug} transcript does not match its recorded run contract`);
  }
  if (!markdown.includes(`Public messages: ${messageCount}`)) {
    failures.push(`PatchProof ${slug} Markdown transcript has the wrong public message count`);
  }
  if (/\/Users\/|\/home\/|\/private\/tmp|\/tmp\/|throwaway\/|\/root(?:\/|`|")|019f[0-9a-f-]{20,}|Goal (?:usage|completed)|::git-commit|VERCEL_TOKEN|CLOUDFLARE|github_pat_|gho_|sk-[A-Za-z0-9]/.test(`${jsonSource}\n${markdown}`)) {
    failures.push(`PatchProof ${slug} transcript leaks a local path, internal metadata, or credential`);
  }
  for (const match of markdown.matchAll(/\]\((\/examples\/patchproof-chain\/[^)]+)\)/g)) {
    const relative = match[1].slice("/examples/patchproof-chain/".length);
    try {
      const details = await stat(path.join(patchProofRoot, relative));
      if (!details.isFile()) failures.push(`PatchProof ${slug} transcript link is not a file: ${match[1]}`);
    } catch {
      failures.push(`PatchProof ${slug} transcript has a broken public link: ${match[1]}`);
    }
  }
  patchProofMessageCount += transcript.messages?.length ?? 0;
}
if (patchProofMessageCount !== 46) {
  failures.push(`PatchProof transcripts must preserve 46 public messages; found ${patchProofMessageCount}`);
}

const publicTranscript = await readFile(path.join(root, "CODEX-THREAD.md"), "utf8");
if (/\/Users\/|\/home\/|\/private\/tmp|\/tmp\//.test(publicTranscript)) {
  failures.push("A public example transcript leaks a local filesystem path");
}

if (failures.length) throw new Error(`Demo bundle validation failed:\n- ${failures.join("\n- ")}`);
console.log(`Four legacy demo evidence bundles and ${Object.keys(patchProofCopies).length} byte-matched PatchProof evidence files are complete.`);
