import { chmod, cp, mkdir, readdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawn } from "node:child_process";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = resolve(packageRoot, "src");
const outputRoot = resolve(packageRoot, "dist");

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

const sourceFiles = (await readdir(sourceRoot))
  .filter((name) => name.endsWith(".js"))
  .sort();

for (const sourceFile of sourceFiles) {
  const sourcePath = resolve(sourceRoot, sourceFile);
  await new Promise((resolveCheck, rejectCheck) => {
    const child = spawn(process.execPath, ["--check", sourcePath], {
      stdio: "inherit",
    });
    child.once("error", rejectCheck);
    child.once("exit", (code) => {
      if (code === 0) resolveCheck();
      else rejectCheck(new Error(`Syntax check failed for ${sourceFile}`));
    });
  });
}

await cp(sourceRoot, outputRoot, { recursive: true });
await chmod(resolve(outputRoot, "cli.js"), 0o755);
await import(pathToFileURL(resolve(outputRoot, "index.js")).href);

console.log(`Built @possible/evals (${sourceFiles.length} modules)`);
