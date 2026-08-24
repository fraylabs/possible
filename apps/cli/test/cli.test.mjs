import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
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

test("the CLI exposes authoring, live discovery, source use, and local bookmarks", async () => {
  const { stdout } = await execute(process.execPath, [cli, "--help"]);
  assert.match(stdout, /possible bookmark/);
  assert.match(stdout, /possible create/);
  assert.match(stdout, /possible validate/);
  assert.match(stdout, /possible publish/);
  assert.match(stdout, /possible search/);
  assert.match(stdout, /possible fetch/);
  assert.match(stdout, /possible add/);
  assert.match(stdout, /possible use/);
  assert.doesNotMatch(stdout, /possible init/);
  assert.doesNotMatch(stdout, /possible pack|compile|export/);
});

test("create and validate use the three-file Outcome contract", async () => {
  const project = await fixture();
  const created = await execute(process.execPath, [cli, "create", "quiet-launch-film"], { cwd: project });
  assert.match(created.stdout, /Created .*quiet-launch-film/);
  const folder = join(project, "outcomes", "quiet-launch-film");
  const manifest = JSON.parse(await readFile(join(folder, "outcome.json"), "utf8"));
  assert.equal(manifest.schemaVersion, 3);
  assert.deepEqual(manifest.files, { about: "outcome.md", prompt: "prompt.md" });
  assert.match(await readFile(join(folder, "outcome.md"), "utf8"), /^# /);
  assert.ok((await readFile(join(folder, "prompt.md"), "utf8")).trim());
  const publisherIndex = JSON.parse(await readFile(join(project, "outcomes.json"), "utf8"));
  assert.deepEqual(publisherIndex.outcomes, [{ slug: "quiet-launch-film", url: "./outcomes/quiet-launch-film/outcome.json" }]);
  assert.equal((await execute(process.execPath, [cli, "validate"], { cwd: project })).stdout, "Validated 1 Outcome.\n");
});

test("search and fetch use the live directory contract", async () => {
  const id = "11111111-1111-4111-8111-111111111111";
  const server = createServer((request, response) => {
    response.setHeader("content-type", "application/json");
    const url = new URL(request.url, "http://127.0.0.1");
    if (url.searchParams.get("id")) {
      response.end(JSON.stringify({ outcome: { id, title: "Corridor Cat Shelter", prompt: "Make the printable shelter." } }));
      return;
    }
    response.end(JSON.stringify({ outcomes: [{ id, title: "Corridor Cat Shelter", summary: "A weighted printable shelter.", source_locator: "fraylabs/possible-outcomes" }] }));
  });
  await new Promise((resolve, reject) => server.listen(0, "127.0.0.1", (error) => error ? reject(error) : resolve()));
  try {
    const address = server.address();
    const environment = { ...process.env, POSSIBLE_DIRECTORY_ENDPOINT: `http://127.0.0.1:${address.port}` };
    const search = await execute(process.execPath, [cli, "search", "printable", "cat", "shelter"], { env: environment });
    assert.match(search.stdout, /Corridor Cat Shelter/);
    assert.match(search.stdout, new RegExp(id));
    const fetched = await execute(process.execPath, [cli, "fetch", id], { env: environment });
    assert.equal(fetched.stdout, "Make the printable shelter.\n");
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test("bookmarks store Outcome slugs locally without an account", async () => {
  const project = await fixture();
  const possibleHome = join(project, "possible-home");
  const environment = { ...process.env, POSSIBLE_HOME: possibleHome };
  assert.equal((await execute(process.execPath, [cli, "bookmark", "list"], { cwd: project, env: environment })).stdout, "No bookmarked Outcomes.\n");
  assert.equal((await execute(process.execPath, [cli, "bookmark", "add", "robot-digital-prototype"], { cwd: project, env: environment })).stdout, "Bookmarked robot-digital-prototype.\n");
  const stored = JSON.parse(await readFile(join(possibleHome, "bookmarks.json"), "utf8"));
  assert.deepEqual(stored.outcomes.map(({ slug }) => slug), ["robot-digital-prototype"]);
  assert.equal((await execute(process.execPath, [cli, "bookmark", "list"], { cwd: project, env: environment })).stdout, "robot-digital-prototype\n");
  assert.equal((await execute(process.execPath, [cli, "bookmark", "remove", "robot-digital-prototype"], { cwd: project, env: environment })).stdout, "Removed bookmark robot-digital-prototype.\n");
});

test("bookmark commands preserve malformed local data", async () => {
  const project = await fixture();
  const possibleHome = join(project, "possible-home");
  await mkdir(possibleHome, { recursive: true });
  const bookmarkPath = join(possibleHome, "bookmarks.json");
  await writeFile(bookmarkPath, "{ broken\n");
  await assert.rejects(
    execute(process.execPath, [cli, "bookmark", "add", "robot-digital-prototype"], { cwd: project, env: { ...process.env, POSSIBLE_HOME: possibleHome } }),
    (error) => error.code === 1 && /invalid JSON and were left unchanged/.test(error.stderr),
  );
  assert.equal(await readFile(bookmarkPath, "utf8"), "{ broken\n");
});
