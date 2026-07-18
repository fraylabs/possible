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
for (const phrase of ["list_packs", "compile_pack", "reviewed revisions", "workstream", "fresh verification subagent", "hardware-launch", "software-launch", "open-source-release"]) {
  check(skill.toLowerCase().includes(phrase.toLowerCase()), `SKILL.md must include '${phrase}'`);
}
for (const gate of ["credentials", "deployment", "DNS", "email", "purchases", "spending money", "fabrication"]) {
  check(skill.toLowerCase().includes(gate.toLowerCase()), `SKILL.md must retain the ${gate} gate`);
}
check(/short_description: "Compile skills into complete outcomes"/.test(metadata), "metadata must state the outcome compiler");
check(metadata.includes("$possible"), "default prompt must mention $possible");
check(/value: "possible"/.test(metadata), "metadata must declare the Possible MCP");
check(entries.every((entry) => ["SKILL.md", "agents"].includes(entry)), "skill directory contains unexpected top-level files");
check(skill.split("\n").length <= 500, "SKILL.md must stay under 500 lines");
if (errors.length) throw new Error(`Possible skill validation failed:\n- ${errors.join("\n- ")}`);
console.log("Possible skill is valid.");
