import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterEach, test } from "node:test";

const execute = promisify(execFile);
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cli = join(packageRoot, "src", "index.mjs");
const temporaryDirectories = [];

const projectFixture = async () => {
  const directory = await mkdtemp(join(tmpdir(), "possible-cli-e2e-"));
  temporaryDirectories.push(directory);
  return directory;
};

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

test("init prints the Codex invocation after installing", async () => {
  const project = await projectFixture();
  const { stdout, stderr } = await execute(process.execPath, [cli, "init"], { cwd: project });

  assert.equal(stderr, "");
  assert.match(stdout, /^Possible installed at \.agents\/skills\/possible/m);
  assert.match(stdout, /Open Codex in this project and type:\n\n  \$possible/);
  assert.match(await readFile(join(project, ".agents", "skills", "possible", "SKILL.md"), "utf8"), /# Possible/);
});

test("init exits non-zero and explains a conflict without overwriting it", async () => {
  const project = await projectFixture();
  const conflict = join(project, ".agents", "skills", "possible", "SKILL.md");
  await mkdir(dirname(conflict), { recursive: true });
  await writeFile(conflict, "keep me\n");

  await assert.rejects(
    execute(process.execPath, [cli, "init"], { cwd: project }),
    (error) => {
      assert.equal(error.code, 1);
      assert.match(error.stderr, /existing files conflict/);
      assert.match(error.stderr, /\.agents\/skills\/possible\/SKILL\.md/);
      return true;
    },
  );
  assert.equal(await readFile(conflict, "utf8"), "keep me\n");
});
