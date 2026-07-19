import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, stat, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, test } from "node:test";
import { rm } from "node:fs/promises";
import { installPossibleSkill, InstallConflictError } from "../src/init.mjs";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const temporaryDirectories = [];

const temporaryDirectory = async (prefix) => {
  const directory = await mkdtemp(join(tmpdir(), prefix));
  temporaryDirectories.push(directory);
  return directory;
};

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

test("installs the complete Possible skill repo-locally without disturbing other skills", async () => {
  const project = await temporaryDirectory("possible-cli-install-");
  const existingSkill = join(project, ".agents", "skills", "existing", "SKILL.md");
  await mkdir(dirname(existingSkill), { recursive: true });
  await writeFile(existingSkill, "user-owned\n");

  const result = await installPossibleSkill({ projectDirectory: project });

  assert.deepEqual(result, {
    changed: true,
    filesWritten: 3,
    installPath: join(".agents", "skills", "possible"),
  });
  assert.match(await readFile(join(project, result.installPath, "SKILL.md"), "utf8"), /name: possible/);
  assert.match(await readFile(join(project, result.installPath, "references", "packs.md"), "utf8"), /hardware-launch/);
  assert.match(await readFile(join(project, result.installPath, "references", "packs.md"), "utf8"), /working-web-app/);
  assert.match(await readFile(join(project, result.installPath, "references", "packs.md"), "utf8"), /production-web-release/);
  assert.equal(await readFile(existingSkill, "utf8"), "user-owned\n");
});

test("an exact repeat run is idempotent", async () => {
  const project = await temporaryDirectory("possible-cli-repeat-");
  const first = await installPossibleSkill({ projectDirectory: project });
  const installedSkill = join(project, first.installPath, "SKILL.md");
  const before = await stat(installedSkill);

  const second = await installPossibleSkill({ projectDirectory: project });
  const after = await stat(installedSkill);

  assert.deepEqual(second, {
    changed: false,
    filesWritten: 0,
    installPath: join(".agents", "skills", "possible"),
  });
  assert.equal(after.mtimeMs, before.mtimeMs);
});

test("a conflicting file aborts before any canonical files are added or overwritten", async () => {
  const project = await temporaryDirectory("possible-cli-conflict-");
  const conflict = join(project, ".agents", "skills", "possible", "SKILL.md");
  await mkdir(dirname(conflict), { recursive: true });
  await writeFile(conflict, "my own skill\n");

  await assert.rejects(
    installPossibleSkill({ projectDirectory: project }),
    (error) => error instanceof InstallConflictError && error.conflicts.includes(join(".agents", "skills", "possible", "SKILL.md")),
  );

  assert.equal(await readFile(conflict, "utf8"), "my own skill\n");
  await assert.rejects(readFile(join(dirname(conflict), "agents", "openai.yaml")), { code: "ENOENT" });
});

test("a symlinked install path is rejected without writing outside the project", async () => {
  const project = await temporaryDirectory("possible-cli-project-");
  const external = await temporaryDirectory("possible-cli-external-");
  await symlink(external, join(project, ".agents"), "dir");

  await assert.rejects(
    installPossibleSkill({ projectDirectory: project }),
    (error) => error instanceof InstallConflictError && error.conflicts.includes(".agents"),
  );

  await assert.rejects(stat(join(external, "skills")), { code: "ENOENT" });
});

test("the packaged snapshot is the default install source", async () => {
  const project = await temporaryDirectory("possible-cli-source-");
  await installPossibleSkill({ projectDirectory: project });
  const [packaged, installed] = await Promise.all([
    readFile(join(packageRoot, "assets", "possible", "SKILL.md")),
    readFile(join(project, ".agents", "skills", "possible", "SKILL.md")),
  ]);
  assert.deepEqual(installed, packaged);
});
