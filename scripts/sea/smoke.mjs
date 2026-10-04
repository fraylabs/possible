import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { codexRows, jsonl } from "../../apps/cli/test/capture-sources-fixture.mjs";

const binary = resolve(process.argv[2] ?? "dist/sea/possible");
const { version } = JSON.parse(await readFile(new URL("../../apps/cli/package.json", import.meta.url), "utf8"));
const directory = await mkdtemp(join(tmpdir(), "possible-sea-"));
// No Node, npm, credentials, or caller's configuration on the binary's PATH.
const run = (...args) => execFileSync(binary, args, { cwd: directory, encoding: "utf8", env: { HOME: directory, PATH: "/usr/bin:/bin" } });
try {
  assert.equal(run("--version").trim(), version);
  console.log(`possible --version: ${version}`);
  assert.match(run("--help"), /Possible CLI/);
  console.log(run("create", "smoke", "--product", "example/product").trim());
  // The scaffolded recipe placeholders must be filled in before validation passes.
  assert.throws(() => execFileSync(binary, ["validate"], { cwd: directory, encoding: "utf8", stdio: "pipe", env: { HOME: directory, PATH: "/usr/bin:/bin" } }), error => /recipe\.steps\[0\] is incomplete/.test(String(error.stderr)));
  const manifestPath = join(directory, "outcomes/smoke/outcome.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  manifest.recipe.steps = [{ title: "Build", instructions: "Build the smoke result." }];
  await writeFile(manifestPath, JSON.stringify(manifest));
  console.log(run("validate").trim());
  const transcript = join(directory, "codex.jsonl");
  await writeFile(transcript, jsonl([
    ...codexRows.slice(0, -1),
    { type: "response_item", payload: { type: "custom_tool_call", name: "exec", input: "await tools.exec_command({cmd:\"uv run --with numpy python -c 'import numpy'\"});" } },
    codexRows.at(-1),
  ]));
  console.log(run("capture", "codex", transcript, "--out", join(directory, "codex-draft")).trim());
  const draft = await readFile(join(directory, "codex-draft/draft.json"), "utf8");
  assert.match(draft, /Make a diagram/);
  assert.ok(JSON.parse(draft).manifest.recipe.tools.some(tool => tool.name === "numpy"));
  assert.doesNotMatch(draft, /ASSISTANT_SECRET|OUTPUT_SECRET|BASE_SECRET|COMMAND_SECRET/);

  // Exercise the dynamically imported node:sqlite inside the executable as well.
  const databasePath = join(directory, "turnless.sqlite");
  const db = new DatabaseSync(databasePath);
  db.exec(`CREATE TABLE projection_threads(thread_id TEXT);
    CREATE TABLE projection_thread_sessions(thread_id TEXT,status TEXT,active_turn_id TEXT);
    CREATE TABLE projection_turns(thread_id TEXT,state TEXT);
    CREATE TABLE projection_thread_messages(thread_id TEXT,message_id TEXT,role TEXT,text TEXT,is_streaming INT,created_at TEXT);
    CREATE TABLE projection_thread_activities(thread_id TEXT,kind TEXT,payload_json TEXT);
    CREATE TABLE orchestration_events(aggregate_kind TEXT,stream_id TEXT,event_type TEXT,sequence INT,payload_json TEXT);
    INSERT INTO projection_threads VALUES('selected');
    INSERT INTO projection_thread_sessions VALUES('selected','ready',NULL);
    INSERT INTO projection_turns VALUES('selected','completed');
    INSERT INTO projection_thread_messages VALUES('selected','a','user','Make a diagram.',0,'2026-01-01');`);
  db.close();
  console.log(run("capture", "turnless", databasePath, "--thread", "selected", "--out", join(directory, "sqlite-draft")).trim());
  assert.match(await readFile(join(directory, "sqlite-draft/draft.json"), "utf8"), /Make a diagram/);
  console.log("SEA smoke passed (authoring, Codex capture, SQLite capture; clean environment)");
} finally {
  await rm(directory, { recursive: true, force: true });
}
