import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  args.set(process.argv[index], process.argv[index + 1]);
}

const required = ["--thread", "--title", "--prompt", "--json", "--markdown"];
for (const key of required) {
  if (!args.get(key)) throw new Error(`Missing required argument: ${key}`);
}

const rootThreadId = args.get("--thread");
const title = args.get("--title");
const prompt = args.get("--prompt");
const jsonOutput = path.resolve(args.get("--json"));
const markdownOutput = path.resolve(args.get("--markdown"));
const sessionsRoot = path.join(os.homedir(), ".codex", "sessions");

const roleByPath = {
  "/root/product": "Production product",
  "/root/site": "Launch site",
  "/root/film": "Demo film",
  "/root/release": "Release readiness",
  "/root/release_engineering": "Release engineering",
  "/root/documentation_examples": "Documentation and examples",
  "/root/ci_security": "CI and security assurance",
  "/root/fresh_verification": "Independent review",
  "/root/verification": "Independent review",
};

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(target);
    return entry.isFile() && entry.name.endsWith(".jsonl") ? [target] : [];
  });
}

function recordsFor(file) {
  return fs.readFileSync(file, "utf8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function belongsToRun(metadata) {
  if (metadata.id === rootThreadId) return true;
  return metadata.source?.subagent?.thread_spawn?.parent_thread_id === rootThreadId;
}

function humanizePath(agentPath) {
  const segment = agentPath?.split("/").filter(Boolean).at(-1) ?? "specialist";
  return segment.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const sessions = [];
for (const file of walk(sessionsRoot)) {
  const source = fs.readFileSync(file, "utf8");
  if (!source.includes(rootThreadId)) continue;
  const records = recordsFor(file);
  const metadata = records.find((record) => record.type === "session_meta")?.payload;
  if (metadata && belongsToRun(metadata)) sessions.push({ file, metadata, records });
}

if (!sessions.some(({ metadata }) => metadata.id === rootThreadId)) {
  throw new Error(`Could not find root Codex session ${rootThreadId}`);
}

const agents = sessions.map(({ metadata }) => {
  const isCaptain = metadata.id === rootThreadId;
  return {
    name: isCaptain ? "Possible" : metadata.agent_nickname ?? humanizePath(metadata.agent_path),
    role: isCaptain ? "Captain" : roleByPath[metadata.agent_path] ?? humanizePath(metadata.agent_path),
    thread: isCaptain ? "/root" : metadata.agent_path,
  };
});

const messages = sessions.flatMap(({ metadata, records }) => {
  const isCaptain = metadata.id === rootThreadId;
  const agent = agents.find((candidate) => candidate.thread === (isCaptain ? "/root" : metadata.agent_path));
  return records
    .filter((record) => record.type === "event_msg" && record.payload?.type === "agent_message")
    .map((record) => ({
      timestamp: record.timestamp,
      agent: agent.name,
      role: agent.role,
      thread: agent.thread,
      phase: record.payload.phase,
      message: record.payload.message.replaceAll(metadata.cwd ?? "", `throwaway/${title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`),
    }));
}).sort((left, right) => left.timestamp.localeCompare(right.timestamp));

const rootMetadata = sessions.find(({ metadata }) => metadata.id === rootThreadId).metadata;
const transcript = {
  title,
  runId: rootThreadId,
  recordedAt: rootMetadata.timestamp ?? messages[0]?.timestamp,
  disclosure: "Exported from the real clean-room Codex captain and specialist session logs. Includes exact public agent messages. Private reasoning, system instructions, raw tool output, and local machine paths are excluded.",
  prompt,
  agents,
  messages,
};

fs.mkdirSync(path.dirname(jsonOutput), { recursive: true });
fs.mkdirSync(path.dirname(markdownOutput), { recursive: true });
fs.writeFileSync(jsonOutput, `${JSON.stringify(transcript, null, 2)}\n`);

const markdown = [
  `# ${title} — Codex thread`,
  "",
  transcript.disclosure,
  "",
  `Run ID: \`${rootThreadId}\`  `,
  `Agents: ${agents.map((agent) => `${agent.name} (${agent.role})`).join(", ")}  `,
  `Public messages: ${messages.length}`,
  "",
  "## Confirmed outcome",
  "",
  prompt,
  "",
  "## Public thread",
  "",
  ...messages.flatMap((message) => [
    `### ${new Date(message.timestamp).toISOString().slice(11, 19)} UTC — ${message.agent} / ${message.role}`,
    "",
    `\`${message.phase.toUpperCase()}\` · \`${message.thread}\``,
    "",
    message.message,
    "",
  ]),
].join("\n");

fs.writeFileSync(markdownOutput, `${markdown.trim()}\n`);
console.log(`Exported ${messages.length} public messages from ${agents.length} real Codex threads.`);
