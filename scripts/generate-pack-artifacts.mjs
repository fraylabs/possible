import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { applyPackArtifacts } from "./lib/pack-folders.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const result = await applyPackArtifacts(repositoryRoot, { check });
console.log(`${check ? "Validated" : "Generated"} ${result.count} pack folders (${result.activeCount} active) and their derived source artifacts.`);
