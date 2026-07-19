import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const directory = join(root, "skills", "possible");
const [skill, metadata, catalog, entries] = await Promise.all([
  readFile(join(directory, "SKILL.md"), "utf8"),
  readFile(join(directory, "agents", "openai.yaml"), "utf8"),
  readFile(join(directory, "references", "packs.md"), "utf8"),
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
for (const phrase of ["What are you trying to make real?", "one question per turn", "Do not mention pack names", "Recommend one primary pack", "Do not ask the user to choose a lane", "Proceed with this outcome?", "outcome-brief.md", "fresh verification subagent", "$possible resume"]) {
  check(skill.toLowerCase().includes(phrase.toLowerCase()), `SKILL.md must include '${phrase}'`);
}
for (const gate of ["credentials", "deployment", "DNS", "email", "purchases", "spending money", "fabrication"]) {
  check(skill.toLowerCase().includes(gate.toLowerCase()), `SKILL.md must retain the ${gate} gate`);
}
for (const slug of ["hardware-launch", "software-launch", "open-source-release", "playable-web-game"]) {
  check(catalog.includes(`Slug: \`${slug}\``), `pack reference must include ${slug}`);
}
for (const [slug, lane] of [["hardware-launch", "launch"], ["software-launch", "launch"], ["open-source-release", "release"], ["playable-web-game", "create"]]) {
  const start = catalog.indexOf(`Slug: \`${slug}\``);
  const end = catalog.indexOf("\n## ", start);
  const section = start === -1 ? "" : catalog.slice(start, end === -1 ? undefined : end);
  check(section.includes(`Lane: \`${lane}\``), `pack reference must map ${slug} to ${lane}`);
}
for (const source of ["anthropics/skills", "vercel-labs/agent-skills", "remotion-dev/skills", "earthtojake/text-to-cad", "github/awesome-copilot", "mrgoonie/claudekit-skills", "dylantarre/animation-principles"]) {
  check(catalog.includes(source), `pack reference must include ${source}`);
}
check((catalog.match(/npx skills@1\.5\.19 add/g) ?? []).length === 11, "pack reference must include all eleven grouped install commands");
check(/short_description: "Turn a conversation into a complete outcome"/.test(metadata), "metadata must state the guided outcome promise");
check(metadata.includes("$possible"), "default prompt must mention $possible");
check(entries.every((entry) => ["SKILL.md", "agents", "references"].includes(entry)), "skill directory contains unexpected top-level files");
check(skill.split("\n").length <= 500, "SKILL.md must stay under 500 lines");
if (errors.length) throw new Error(`Possible skill validation failed:\n- ${errors.join("\n- ")}`);
console.log("Possible skill is valid.");
