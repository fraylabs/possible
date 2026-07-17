import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillDirectory = join(repositoryRoot, "skills", "possible");
const skillPath = join(skillDirectory, "SKILL.md");
const agentMetadataPath = join(skillDirectory, "agents", "openai.yaml");

const errors = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return undefined;

  const entries = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator < 1) {
      errors.push(`Invalid frontmatter line: ${line}`);
      continue;
    }
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (Object.hasOwn(entries, key)) {
      errors.push(`Duplicate frontmatter key: ${key}`);
    }
    entries[key] = value.replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, "$1$2");
  }

  return { entries, body: markdown.slice(match[0].length) };
}

function quotedYamlValue(yaml, key) {
  const match = yaml.match(new RegExp(`^\\s*${key}:\\s*(["'])(.*?)\\1\\s*$`, "m"));
  return match?.[2];
}

async function validate() {
  const [skill, agentMetadata, topLevelEntries] = await Promise.all([
    readFile(skillPath, "utf8"),
    readFile(agentMetadataPath, "utf8"),
    readdir(skillDirectory, { withFileTypes: true }),
  ]);

  const parsed = parseFrontmatter(skill);
  check(Boolean(parsed), "SKILL.md must start with YAML frontmatter");

  if (parsed) {
    const keys = Object.keys(parsed.entries).sort();
    check(
      JSON.stringify(keys) === JSON.stringify(["description", "name"]),
      "SKILL.md frontmatter must contain only name and description",
    );

    const { name = "", description = "" } = parsed.entries;
    check(name === "possible", "Skill name must be possible");
    check(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name), "Skill name must be kebab-case");
    check(name.length <= 64, "Skill name must be at most 64 characters");
    check(description.length >= 80, "Skill description must explain its triggers");
    check(description.length <= 1024, "Skill description must be at most 1024 characters");
    check(parsed.body.trim().length > 0, "SKILL.md must include instructions");
    check(parsed.body.split(/\r?\n/).length <= 500, "SKILL.md must stay under 500 body lines");
  }

  check(!/\bTODO\b|\[TODO/i.test(skill), "SKILL.md must not contain placeholders");
  for (const operation of ["search", "read"]) {
    check(skill.includes(`\`${operation}\``), `SKILL.md must document ${operation}`);
  }
  for (const legacyOperation of [
    "search_knowledge",
    "read_node",
    "expand_node",
    "find_capabilities",
  ]) {
    check(!skill.includes(`\`${legacyOperation}\``), `SKILL.md must not reference ${legacyOperation}`);
  }

  check(/read-only/i.test(skill), "SKILL.md must state the read-only boundary");
  check(
    /follow.+links.+progressively|do\s+not\s+load\s+unrelated\s+branches/i.test(skill),
    "SKILL.md must require progressive retrieval",
  );
  check(/cite.+sources/i.test(skill), "SKILL.md must require source citation");
  check(/review date|reviewedAt/i.test(skill), "SKILL.md must mention page freshness");
  check(/host[\s\S]*plan|agent host[\s\S]*plan/i.test(skill), "SKILL.md must state that the host agent plans");
  check(/host[\s\S]*execut|agent host[\s\S]*execut/i.test(skill), "SKILL.md must state that the host agent executes");
  for (const approvalGate of ["credentials", "spending money", "deployment", "DNS", "fabrication"]) {
    check(
      skill.toLowerCase().includes(approvalGate.toLowerCase()),
      `SKILL.md must retain the ${approvalGate} approval gate`,
    );
  }

  check(/^interface:\s*$/m.test(agentMetadata), "openai.yaml must define interface metadata");
  const displayName = quotedYamlValue(agentMetadata, "display_name") ?? "";
  const shortDescription = quotedYamlValue(agentMetadata, "short_description") ?? "";
  const defaultPrompt = quotedYamlValue(agentMetadata, "default_prompt") ?? "";
  check(displayName === "Possible", "openai.yaml display_name must be Possible");
  check(
    shortDescription.length >= 25 && shortDescription.length <= 64,
    "openai.yaml short_description must be 25-64 characters",
  );
  check(/wiki/i.test(shortDescription), "openai.yaml short_description must mention wiki knowledge");
  check(defaultPrompt.includes("$possible"), "openai.yaml default_prompt must mention $possible");
  check(
    /search/i.test(defaultPrompt) && /read/i.test(defaultPrompt),
    "openai.yaml default_prompt must mention search and read",
  );
  check(/^dependencies:\s*$/m.test(agentMetadata), "openai.yaml must declare its MCP dependency");
  check(/^\s+value:\s+"possible"\s*$/m.test(agentMetadata), "MCP dependency must be named possible");
  check(!/\bTODO\b|\[TODO/i.test(agentMetadata), "openai.yaml must not contain placeholders");

  const allowedTopLevelEntries = new Set(["SKILL.md", "agents"]);
  for (const entry of topLevelEntries) {
    check(
      allowedTopLevelEntries.has(entry.name),
      `Unexpected top-level skill entry: ${entry.name}`,
    );
  }

  if (errors.length > 0) {
    throw new Error(`Possible skill validation failed:\n- ${errors.join("\n- ")}`);
  }

  console.log("Possible skill is valid.");
}

validate().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
