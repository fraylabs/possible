import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterEach, test } from "node:test";

const execute = promisify(execFile);
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cli = join(packageRoot, "src", "index.mjs");
const temporaryDirectories = [];
const fixture = async () => {
  const directory = await mkdtemp(join(tmpdir(), "possible-cli-"));
  temporaryDirectories.push(directory);
  return directory;
};
afterEach(async () => Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))));

test("the CLI exposes only discovery installation and local bookmarks", async () => {
  const { stdout } = await execute(process.execPath, [cli, "--help"]);
  assert.match(stdout, /possible init/);
  assert.match(stdout, /possible bookmark/);
  assert.doesNotMatch(stdout, /possible pack|compile|validate|export/);
});

test("init installs the small optional discovery skill", async () => {
  const project = await fixture();
  const { stdout, stderr } = await execute(process.execPath, [cli, "init"], { cwd: project });
  assert.equal(stderr, "");
  assert.match(stdout, /Possible installed/);
  const skill = await readFile(join(project, ".agents", "skills", "possible", "SKILL.md"), "utf8");
  assert.match(skill, /directory of exact prompts/);
  assert.doesNotMatch(skill, /Outcome Pack|expectations|workstreams/);
});

test("bookmarks store Outcome slugs locally without an account", async () => {
  const project = await fixture();
  const possibleHome = join(project, "possible-home");
  const environment = { ...process.env, POSSIBLE_HOME: possibleHome };
  assert.equal((await execute(process.execPath, [cli, "bookmark", "list"], { cwd: project, env: environment })).stdout, "No bookmarked Outcomes.\n");
  assert.equal((await execute(process.execPath, [cli, "bookmark", "add", "playable-web-game"], { cwd: project, env: environment })).stdout, "Bookmarked playable-web-game.\n");
  const stored = JSON.parse(await readFile(join(possibleHome, "bookmarks.json"), "utf8"));
  assert.deepEqual(stored.outcomes.map(({ slug }) => slug), ["playable-web-game"]);
  assert.equal((await execute(process.execPath, [cli, "bookmark", "list"], { cwd: project, env: environment })).stdout, "playable-web-game\n");
  assert.equal((await execute(process.execPath, [cli, "bookmark", "remove", "playable-web-game"], { cwd: project, env: environment })).stdout, "Removed bookmark playable-web-game.\n");
});

test("bookmark commands preserve malformed local data", async () => {
  const project = await fixture();
  const possibleHome = join(project, "possible-home");
  await mkdir(possibleHome, { recursive: true });
  const bookmarkPath = join(possibleHome, "bookmarks.json");
  await writeFile(bookmarkPath, "{ broken\n");
  await assert.rejects(
    execute(process.execPath, [cli, "bookmark", "add", "playable-web-game"], { cwd: project, env: { ...process.env, POSSIBLE_HOME: possibleHome } }),
    (error) => error.code === 1 && /invalid JSON and were left unchanged/.test(error.stderr),
  );
  assert.equal(await readFile(bookmarkPath, "utf8"), "{ broken\n");
});
