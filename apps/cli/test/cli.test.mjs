import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
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

test("bookmarks public packs locally without requiring an account", async () => {
  const project = await projectFixture();
  const possibleHome = join(project, "possible-home");
  const environment = { ...process.env, POSSIBLE_HOME: possibleHome };

  const empty = await execute(process.execPath, [cli, "bookmark", "list"], { cwd: project, env: environment });
  assert.equal(empty.stdout, "No bookmarked Outcome Packs.\n");

  const added = await execute(process.execPath, [cli, "bookmark", "add", "playable-web-game"], { cwd: project, env: environment });
  assert.equal(added.stdout, "Bookmarked fraylabs/possible/playable-web-game.\n");
  const stored = JSON.parse(await readFile(join(possibleHome, "bookmarks.json"), "utf8"));
  assert.equal(stored.schemaVersion, 1);
  assert.deepEqual(stored.packs.map(({ id }) => id), ["fraylabs/possible/playable-web-game"]);
  assert.ok(!Number.isNaN(Date.parse(stored.packs[0].savedAt)));

  const duplicate = await execute(process.execPath, [cli, "bookmark", "add", "fraylabs/possible/playable-web-game"], { cwd: project, env: environment });
  assert.equal(duplicate.stdout, "fraylabs/possible/playable-web-game is already bookmarked.\n");
  const listed = await execute(process.execPath, [cli, "bookmark", "list"], { cwd: project, env: environment });
  assert.match(listed.stdout, /^fraylabs\/possible\/playable-web-game\tPlayable Web Game$/m);

  const removed = await execute(process.execPath, [cli, "bookmark", "remove", "playable-web-game"], { cwd: project, env: environment });
  assert.equal(removed.stdout, "Removed bookmark fraylabs/possible/playable-web-game.\n");
  assert.deepEqual(JSON.parse(await readFile(join(possibleHome, "bookmarks.json"), "utf8")).packs, []);
});

test("bookmark commands preserve malformed local data and reject missing packs", async () => {
  const project = await projectFixture();
  const possibleHome = join(project, "possible-home");
  const environment = { ...process.env, POSSIBLE_HOME: possibleHome };
  await mkdir(possibleHome, { recursive: true });
  const bookmarkPath = join(possibleHome, "bookmarks.json");
  await writeFile(bookmarkPath, "{ definitely not json\n");

  await assert.rejects(
    execute(process.execPath, [cli, "bookmark", "add", "playable-web-game"], { cwd: project, env: environment }),
    (error) => error.code === 1 && /invalid JSON and were left unchanged/.test(error.stderr),
  );
  assert.equal(await readFile(bookmarkPath, "utf8"), "{ definitely not json\n");

  await writeFile(bookmarkPath, `${JSON.stringify({ schemaVersion: 1, packs: [] }, null, 2)}\n`);
  await assert.rejects(
    execute(process.execPath, [cli, "bookmark", "add", "missing-pack"], { cwd: project, env: environment }),
    (error) => error.code === 1 && /No public Outcome Pack matches missing-pack/.test(error.stderr),
  );
});

test("pack init creates an intentionally incomplete minimal authoring surface", async () => {
  const project = await projectFixture();
  const init = await execute(process.execPath, [cli, "pack", "init", "cat-house"], { cwd: project });
  assert.match(init.stdout, /Created Outcome Pack draft/);
  const manifestPath = join(project, ".possible", "packs", "cat-house", "pack.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assert.deepEqual(Object.keys(manifest), ["schemaVersion", "name", "promise", "prompt", "expectations"]);

  await assert.rejects(
    execute(process.execPath, [cli, "pack", "validate", "cat-house"], { cwd: project }),
    (error) => error.code === 1 && /expectations must be a non-empty array/.test(error.stderr),
  );
});

test("pack export creates a valid contract package without publishing it", async () => {
  const project = await projectFixture();
  const source = JSON.parse(await readFile(resolve(packageRoot, "..", "..", "packages", "packs", "src", "packs", "playable-web-game", "pack.json"), "utf8"));
  delete source.skills;
  await mkdir(join(project, ".possible", "packs", "playable-web-game"), { recursive: true });
  await writeFile(join(project, ".possible", "packs", "playable-web-game", "pack.json"), `${JSON.stringify(source, null, 2)}\n`);

  const result = await execute(process.execPath, [cli, "pack", "export", "playable-web-game"], { cwd: project });
  assert.match(result.stdout, /valid Outcome Pack/);
  const exportDirectory = join(project, ".possible", "exports", "playable-web-game");
  const exported = JSON.parse(await readFile(join(exportDirectory, "pack.json"), "utf8"));
  assert.deepEqual(exported, source);
  assert.match(await readFile(join(exportDirectory, "source-entry.template.json"), "utf8"), /<full-git-commit>/);
  assert.match(await readFile(join(exportDirectory, "SUBMISSION.md"), "utf8"), /not PR-ready yet/);
});

test("pack export creates an exact PR-ready source package that the submission validator accepts", async () => {
  const project = await projectFixture();
  const source = JSON.parse(await readFile(resolve(packageRoot, "..", "..", "packages", "packs", "src", "packs", "playable-web-game", "pack.json"), "utf8"));
  const sourcePath = join(project, "packs", "playable-web-game.json");
  await mkdir(dirname(sourcePath), { recursive: true });
  await writeFile(sourcePath, `${JSON.stringify(source, null, 2)}\n`);
  const revision = "a".repeat(40);
  const result = await execute(process.execPath, [
    cli,
    "pack",
    "export",
    "packs/playable-web-game.json",
    "submission/playable-web-game",
    "--source",
    "https://github.com/example/outcome-packs",
    "--revision",
    revision,
    "--path",
    "packs/playable-web-game.json",
  ], { cwd: project });

  assert.match(result.stdout, /PR-ready pack submission/);
  const exportDirectory = join(project, "submission", "playable-web-game");
  const entryPath = join(exportDirectory, "source-entry.json");
  const packPath = join(exportDirectory, "pack.json");
  const entry = JSON.parse(await readFile(entryPath, "utf8"));
  assert.deepEqual(entry, {
    schemaVersion: 1,
    id: "example/outcome-packs/playable-web-game",
    source: "https://github.com/example/outcome-packs",
    revision,
    path: "packs/playable-web-game.json",
    contentHash: entry.contentHash,
  });
  assert.match(entry.contentHash, /^sha256:[0-9a-f]{64}$/);
  const instructions = await readFile(join(exportDirectory, "SUBMISSION.md"), "utf8");
  assert.match(instructions, new RegExp(revision));
  assert.match(instructions, new RegExp(entry.contentHash));
  assert.match(instructions, new RegExp(`registry/snapshots/${entry.contentHash.slice("sha256:".length)}\\.json`));
  assert.match(instructions, /content-addressed snapshot makes the catalog reproducible offline; it is provenance, not trust/);
  assert.match(instructions, /npm run registry:sync/);
  assert.match(instructions, /Do not edit those files by hand/);
  assert.match(instructions, /No Possible account is required/);
  assert.match(instructions, /no submission database/i);
  assert.match(instructions, /Only maintainers can assign experimental or verified trust/);

  const validator = resolve(packageRoot, "..", "..", "scripts", "validate-pack-submission.mjs");
  const validation = await execute(process.execPath, [validator, "--entry", entryPath, "--pack", packPath], { cwd: resolve(packageRoot, "..", "..") });
  assert.match(validation.stdout, /Validated example\/outcome-packs\/playable-web-game/);
  await assert.rejects(
    execute(process.execPath, [validator, "--entry", entryPath], { cwd: resolve(packageRoot, "..", "..") }),
    (error) => error.code === 1 && /also requires --pack/.test(error.stderr),
  );

  const [{ validatePackSnapshot }, { compilePack, validatePackManifest }] = await Promise.all([
    import(pathToFileURL(validator).href),
    import("@possible/packs"),
  ]);
  const snapshotSource = await readFile(packPath, "utf8");
  await validatePackSnapshot({ entry, snapshotSource, remoteSource: snapshotSource, validatePackManifest, compilePack, context: entry.id });
  await assert.rejects(
    validatePackSnapshot({ entry, snapshotSource, remoteSource: `${snapshotSource}\n`, validatePackManifest, compilePack, context: entry.id }),
    /snapshot bytes do not match the pinned remote source/,
  );

  entry.status = "verified";
  await writeFile(entryPath, `${JSON.stringify(entry, null, 2)}\n`);
  await assert.rejects(
    execute(process.execPath, [validator, "--entry", entryPath, "--pack", packPath], { cwd: resolve(packageRoot, "..", "..") }),
    (error) => error.code === 1 && /status is not supported/.test(error.stderr),
  );

  delete entry.status;
  delete entry.schemaVersion;
  await writeFile(entryPath, `${JSON.stringify(entry, null, 2)}\n`);
  await assert.rejects(
    execute(process.execPath, [validator, "--entry", entryPath, "--pack", packPath], { cwd: resolve(packageRoot, "..", "..") }),
    (error) => error.code === 1 && /schemaVersion must be 1/.test(error.stderr),
  );

  entry.schemaVersion = 1;
  await writeFile(entryPath, `${JSON.stringify(entry, null, 2)}\n`);
  await writeFile(packPath, `${await readFile(packPath, "utf8")}\n`);
  await assert.rejects(
    execute(process.execPath, [validator, "--entry", entryPath, "--pack", packPath], { cwd: resolve(packageRoot, "..", "..") }),
    (error) => error.code === 1 && /contentHash does not match the exact pack bytes/.test(error.stderr),
  );
});

test("pack export refuses incomplete or unpinned source metadata", async () => {
  const project = await projectFixture();
  const source = JSON.parse(await readFile(resolve(packageRoot, "..", "..", "packages", "packs", "src", "packs", "playable-web-game", "pack.json"), "utf8"));
  const sourcePath = join(project, "packs", "playable-web-game.json");
  await mkdir(dirname(sourcePath), { recursive: true });
  await writeFile(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  await assert.rejects(
    execute(process.execPath, [cli, "pack", "export", "packs/playable-web-game.json", "--source", "https://github.com/example/outcome-packs"], { cwd: project }),
    (error) => error.code === 1 && /requires --source, --revision, and --path together/.test(error.stderr),
  );
  await assert.rejects(
    execute(process.execPath, [
      cli,
      "pack",
      "export",
      "packs/playable-web-game.json",
      "--source",
      "https://github.com/example/outcome-packs",
      "--revision",
      "main",
      "--path",
      "packs/playable-web-game.json",
    ], { cwd: project }),
    (error) => error.code === 1 && /exact 40- or 64-character/.test(error.stderr),
  );
  await assert.rejects(
    execute(process.execPath, [
      cli,
      "pack",
      "export",
      "packs/playable-web-game.json",
      "--source",
      "https://github.com/example/outcome-packs",
      "--revision",
      "a".repeat(40),
      "--path",
      "../pack.json",
    ], { cwd: project }),
    (error) => error.code === 1 && /safe repository-relative path/.test(error.stderr),
  );
  source.expectations = [];
  await writeFile(sourcePath, `${JSON.stringify(source, null, 2)}\n`);
  await assert.rejects(
    execute(process.execPath, [cli, "pack", "export", "packs/playable-web-game.json"], { cwd: project }),
    (error) => error.code === 1 && /expectations must be a non-empty array/.test(error.stderr),
  );
});
