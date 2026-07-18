import { access, readFile, stat } from "node:fs/promises";
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

const viteConfig = await readFile(path.join(repository, "apps/web/vite.config.ts"), "utf8");
for (const directory of ["", ...routeDirectories.map((name) => `/${name}`)]) {
  if (!viteConfig.includes(`"/demo/still${directory}"`)) {
    failures.push(`Vite must serve /demo/still${directory}/ before the SPA fallback`);
  }
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
]) await requirePath(required);

for (const reference of localReferences(index)) await requirePath(reference);
for (const [offset, routeIndex] of routeIndexes.entries()) {
  const directory = routeDirectories[offset];
  for (const reference of localReferences(routeIndex)) await requirePath(path.join(directory, reference));
}

const manifest = JSON.parse(manifestSource);
for (const output of manifest.outputs) await requirePath(output.path);
await requirePath(manifest.verification.browserResult);
await requirePath(manifest.verification.artifactResult);

const events = JSON.parse(eventsSource);
for (const event of events) await requirePath(event.evidence.replace(/^\.\//, ""));

if (failures.length) throw new Error(`Still demo validation failed:\n- ${failures.join("\n- ")}`);
console.log("Still demo presentation and artifact routes are complete.");
