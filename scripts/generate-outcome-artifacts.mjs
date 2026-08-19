import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { applyOutcomeArtifacts } from "./lib/outcome-folders.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const result = await applyOutcomeArtifacts(repositoryRoot, { check });
console.log(`${check ? "Validated" : "Generated"} ${result.count} Outcomes.`);
