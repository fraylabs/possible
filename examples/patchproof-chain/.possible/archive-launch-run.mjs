import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runId = "20260722-developer-project-launch-001";
const archiveRoot = resolve(root, ".possible", "runs", runId);
const verifiedWorkspaceRevision = "29b6e94a0c45ba8b996d7f0036f276d2ceda1e25";
const completionRevision = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const entries = [
  [".possible/outcome-brief.md", "outcome-brief.md"],
  [".possible/pack.json", "pack.json"],
  [".possible/skills-lock.json", "skills-lock.json"],
  [".possible/chain.json", "chain.json"],
  ["launch/launch-receipt.json", "launch-receipt.json"],
  ["launch/evidence/completion-report.md", "completion-report.md"],
  ["launch/evidence/verification.md", "verification.md"],
  ["launch/evidence/claims-review.md", "claims-review.md"],
  ["launch/evidence/clean-room-quickstart.md", "clean-room-quickstart.md"],
  ["launch/evidence/implementation-report.md", "implementation-report.md"],
  ["launch/evidence/repair-log.md", "repair-log.md"],
  ["launch/evidence/browser-report.json", "browser-report.json"],
  ["launch/evidence/site-desktop.png", "site-desktop.png"],
  ["launch/evidence/site-mobile.png", "site-mobile.png"],
  ["launch/direction/decision.json", "remix-decision.json"],
];

const sha256 = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");

mkdirSync(archiveRoot, { recursive: true });
for (const [source, destination] of entries) {
  const sourcePath = resolve(root, source);
  const destinationPath = resolve(archiveRoot, destination);
  if (existsSync(destinationPath) && sha256(destinationPath) !== sha256(sourcePath)) {
    throw new Error(`archive conflict: ${destination}`);
  }
  copyFileSync(sourcePath, destinationPath);
}

const manifest = {
  schemaVersion: 1,
  runId,
  packSlug: "developer-project-launch",
  status: "passed-local-only",
  verifiedWorkspaceRevision,
  completionRevision,
  externalAuthority: "none",
  artifacts: entries.map(([, destination]) => ({
    path: destination,
    sha256: sha256(resolve(archiveRoot, destination)),
  })),
};

writeFileSync(resolve(archiveRoot, "archive-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`launch archive: PASS (${manifest.artifacts.length} artifacts)`);
