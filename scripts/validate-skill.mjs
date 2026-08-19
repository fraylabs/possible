import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const directory = join(root, "skills", "possible");
const [skill, metadata, entries] = await Promise.all([
  readFile(join(directory, "SKILL.md"), "utf8"),
  readFile(join(directory, "agents", "openai.yaml"), "utf8"),
  readdir(directory),
]);
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const frontmatter = skill.match(/^---\n([\s\S]*?)\n---\n/);
check(Boolean(frontmatter), "SKILL.md must start with frontmatter");
if (frontmatter) {
  const keys = [...frontmatter[1].matchAll(/^([a-z]+):/gm)].map((match) => match[1]).sort();
  check(JSON.stringify(keys) === JSON.stringify(["description", "name"]), "frontmatter must contain only name and description");
}
for (const phrase of ["search_outcomes", "fetch_outcome", "exact prompt", "Do not silently rewrite", "possible bookmark add"]) {
  check(skill.toLowerCase().includes(phrase.toLowerCase()), `SKILL.md must include '${phrase}'`);
}
for (const forbidden of ["Outcome Pack", "expectations", "compile", "trust status", "workstreams"]) {
  check(!skill.toLowerCase().includes(forbidden.toLowerCase()), `SKILL.md must not include '${forbidden}'`);
}
check(/short_description: "Discover exact prompts for agent outcomes"/.test(metadata), "metadata must state the discovery promise");
check(metadata.includes("$possible"), "default prompt must mention $possible");
check(entries.every((entry) => ["SKILL.md", "agents"].includes(entry)), "skill directory contains unexpected top-level files");
if (errors.length) throw new Error(`Possible skill validation failed:\n- ${errors.join("\n- ")}`);
console.log("The Possible discovery skill is valid.");
