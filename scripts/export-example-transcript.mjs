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
const publicRunId = args.get("--public-run") ?? rootThreadId;
const linkMap = args.get("--link-map")
  ? JSON.parse(fs.readFileSync(path.resolve(args.get("--link-map")), "utf8"))
  : {};
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
  "/root/chain_discovery_run/discovery_verifier": "Independent discovery review",
  "/root/chain_product_run/patchproof_product_contract": "Product contract",
  "/root/chain_product_run/patchproof_application": "Application implementation",
  "/root/chain_product_run/patchproof_fresh_verifier": "Independent product review",
  "/root/chain_launch_run/patchproof_launch_verifier": "Independent launch review",
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

function runStart(records, metadata) {
  const incomingTask = records.find((record) => {
    if (record.type !== "response_item" || record.payload?.type !== "agent_message") return false;
    if (record.payload.recipient !== metadata.agent_path) return false;
    return record.payload.content?.some(
      (item) => item.type === "input_text" && item.text.includes("Message Type: NEW_TASK"),
    );
  });
  return incomingTask?.timestamp;
}

function sanitizeMessage(message, metadata, transcriptSlug) {
  let sanitized = message
    .replaceAll(/\/Users\/[^/\s]+\/coding\/possible-test\/remix-chain-example/g, `throwaway/${transcriptSlug}`)
    .replaceAll(metadata.cwd ?? "", `throwaway/${transcriptSlug}`)
    .replaceAll(/\/Users\/[^/\s]+/g, "<home>")
    .replaceAll(/\/private\/tmp\/[^\s)`\]}>,"']+/g, "temporary/workspace")
    .replaceAll(/\/tmp\/[^\s)`\]}>,"']+/g, "temporary/workspace");

  for (const [source, published] of Object.entries(linkMap)) {
    sanitized = sanitized.replaceAll(`throwaway/${transcriptSlug}/${source}`, published);
  }

  return sanitized
    .replace(/\n\nGoal usage:[^\n]*/g, "")
    .replace(/\n\nGoal completed[^\n]*/g, "")
    .replace(/ Goal completed in [^\n]+\./g, "")
    .replace(/\n*::git-commit\{[^}\n]*\}\s*$/g, "")
    .trim();
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

const agentBySessionId = new Map();
const agents = sessions.map(({ metadata }) => {
  const isCaptain = metadata.id === rootThreadId;
  const role = isCaptain ? "Captain" : roleByPath[metadata.agent_path] ?? humanizePath(metadata.agent_path);
  const agent = {
    name: isCaptain ? "Possible" : metadata.agent_nickname ?? humanizePath(metadata.agent_path),
    role,
    thread: isCaptain ? "captain" : role.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-"),
  };
  agentBySessionId.set(metadata.id, agent);
  return agent;
});

const messages = sessions.flatMap(({ metadata, records }) => {
  const agent = agentBySessionId.get(metadata.id);
  const startedAt = runStart(records, metadata);
  const transcriptSlug = title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");
  return records
    .filter((record) => (
      record.type === "response_item"
      && record.payload?.type === "message"
      && record.payload.role === "assistant"
      && (!startedAt || record.timestamp > startedAt)
    ))
    .map((record) => ({
      timestamp: record.timestamp,
      agent: agent.name,
      role: agent.role,
      thread: agent.thread,
      phase: record.payload.phase,
      message: sanitizeMessage(
        record.payload.content
          ?.filter((item) => item.type === "output_text")
          .map((item) => item.text)
          .join("\n") ?? "",
        metadata,
        transcriptSlug,
      ),
    }));
}).sort((left, right) => left.timestamp.localeCompare(right.timestamp));

const rootMetadata = sessions.find(({ metadata }) => metadata.id === rootThreadId).metadata;
const transcript = {
  title,
  runId: publicRunId,
  recordedAt: rootMetadata.timestamp ?? messages[0]?.timestamp,
  disclosure: "Exported from the real clean-room Codex captain and specialist session logs. Includes their public assistant messages with local paths normalized and evidence links mapped to the public record. Private reasoning, system instructions, user metadata, raw tool output, usage telemetry, and UI annotations are excluded. Revision IDs mentioned belong to the isolated run; its Git object history is not embedded here, while archived SHA-256 manifests verify the portable files.",
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
  `Run ID: \`${publicRunId}\``,
  "",
  `Agents: ${agents.map((agent) => `${agent.name} (${agent.role})`).join(", ")}`,
  "",
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
