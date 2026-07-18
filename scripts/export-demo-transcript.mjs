import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runDirectory = path.resolve(repository, "../possible-hardware-demo-run");
const sessionDirectory = path.join(os.homedir(), ".codex/sessions/2026/07/18");

const sessionSpecs = [
  {
    file: "rollout-2026-07-18T22-27-18-019f759f-dd0a-7c83-acd7-f1bea33a502d.jsonl",
    role: "Captain",
  },
  {
    file: "rollout-2026-07-18T22-28-49-019f75a1-3f56-72b2-86ad-7d0e629bffe7.jsonl",
    role: "Launch site",
  },
  {
    file: "rollout-2026-07-18T22-28-55-019f75a1-54c9-7690-a52d-d818bcab8dcb.jsonl",
    role: "Launch film",
  },
  {
    file: "rollout-2026-07-18T22-32-27-019f75a4-91e5-7250-8bb1-38de64eedf3e.jsonl",
    role: "Prototype CAD",
  },
  {
    file: "rollout-2026-07-18T22-44-15-019f75af-61df-7822-81f7-eb529625da26.jsonl",
    role: "Independent review",
  },
];

function readJsonLines(file) {
  return fs.readFileSync(file, "utf8").trim().split("\n").map((line) => JSON.parse(line));
}

function sanitize(message) {
  return message
    .replaceAll(`${path.dirname(repository)}/possible-hardware-demo-run/`, "repos/possible-hardware-demo-run/")
    .replaceAll("/Users/brianlim/coding/fray/repos/possible-hardware-demo-run/", "repos/possible-hardware-demo-run/");
}

const agents = [];
const messages = [];

for (const spec of sessionSpecs) {
  const records = readJsonLines(path.join(sessionDirectory, spec.file));
  const metadata = records.find((record) => record.type === "session_meta")?.payload;
  const start = records.findLastIndex(
    (record) => record.type === "event_msg" && record.payload?.type === "task_started",
  );

  if (!metadata || start < 0) throw new Error(`Could not locate current thread in ${spec.file}`);

  const agent = {
    name: metadata.agent_nickname,
    role: spec.role,
    thread: metadata.agent_path,
  };
  agents.push(agent);

  for (const record of records.slice(start + 1)) {
    if (record.type !== "event_msg" || record.payload?.type !== "agent_message") continue;
    messages.push({
      timestamp: record.timestamp,
      agent: agent.name,
      role: agent.role,
      thread: agent.thread,
      phase: record.payload.phase,
      message: sanitize(record.payload.message),
    });
  }
}

messages.sort((left, right) => left.timestamp.localeCompare(right.timestamp));

const prompt = fs.readFileSync(path.join(runDirectory, "RUN-PROMPT.md"), "utf8").trim();
const transcript = {
  title: "Still / Hardware Launch",
  runId: "019f759f-dd0a-7c83-acd7-f1bea33a502d",
  recordedAt: "2026-07-18T14:27:18.946Z",
  disclosure:
    "Exported from the real captain and specialist session logs. Includes the exact public agent messages and run prompt. Private reasoning, system instructions, encrypted handoffs, and raw tool output are excluded; the local machine path prefix is shortened.",
  prompt,
  agents,
  messages,
};

const sourceOutput = path.join(repository, "apps/web/src/demo-thread.json");
const publicOutput = path.join(repository, "apps/web/public/demo/still/CODEX-THREAD.md");
fs.writeFileSync(sourceOutput, `${JSON.stringify(transcript, null, 2)}\n`);

const markdown = [
  "# Still / Hardware Launch — Codex thread",
  "",
  transcript.disclosure,
  "",
  `Run ID: \`${transcript.runId}\`  `,
  `Agents: ${agents.map((agent) => `${agent.name} (${agent.role})`).join(", ")}  `,
  `Public messages: ${messages.length}`,
  "",
  "## Run prompt",
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

fs.writeFileSync(publicOutput, `${markdown.trim()}\n`);
console.log(`Exported ${messages.length} public messages from ${agents.length} real Codex threads.`);
