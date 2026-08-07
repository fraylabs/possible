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

test("publishes the Possible executable without npm normalizing it away", async () => {
  const manifest = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"));
  assert.deepEqual(manifest.bin, { possible: "src/index.mjs" });
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

test("pack init and validate create a private JSON authoring surface", async () => {
  const project = await projectFixture();
  const init = await execute(process.execPath, [cli, "pack", "init", "cat-house"], { cwd: project });
  assert.match(init.stdout, /Created draft private pack/);
  const manifestPath = join(project, ".possible", "packs", "cat-house", "pack.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assert.deepEqual({ visibility: manifest.visibility, lifecycle: manifest.lifecycle, slug: manifest.slug }, { visibility: "private", lifecycle: "draft", slug: "cat-house" });

  const validation = await execute(process.execPath, [cli, "pack", "validate", "cat-house"], { cwd: project });
  assert.match(validation.stdout, /"valid": true/);
  await assert.rejects(
    execute(process.execPath, [cli, "pack", "compile", "cat-house"], { cwd: project }),
    (error) => error.code === 1 && /must be reviewed before compilation/.test(error.stderr),
  );
});

test("pack export creates a public-review draft without publishing it", async () => {
  const project = await projectFixture();
  const source = JSON.parse(await readFile(resolve(packageRoot, "..", "..", "packages", "packs", "src", "manifests", "playable-web-game.json"), "utf8"));
  source.visibility = "private";
  source.lifecycle = "reviewed";
  await mkdir(join(project, ".possible", "packs", "playable-web-game"), { recursive: true });
  await writeFile(join(project, ".possible", "packs", "playable-web-game", "pack.json"), `${JSON.stringify(source, null, 2)}\n`);

  const result = await execute(process.execPath, [cli, "pack", "export", "playable-web-game"], { cwd: project });
  assert.match(result.stdout, /public-review draft/);
  const exported = JSON.parse(await readFile(join(project, ".possible", "exports", "playable-web-game-1.0.0", "pack.json"), "utf8"));
  assert.deepEqual({ visibility: exported.visibility, lifecycle: exported.lifecycle }, { visibility: "public", lifecycle: "draft" });
  assert.equal("reviewedAt" in exported, false);
});
