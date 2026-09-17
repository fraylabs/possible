import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { test } from "node:test";

const execute = promisify(execFile);
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("installed npm package authors and validates current and legacy Outcomes", async () => {
  const directory = await mkdtemp(join(tmpdir(), "possible-package-"));
  try {
    const packed = await execute("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", directory], { cwd: packageRoot });
    const [{ filename }] = JSON.parse(packed.stdout);
    await execute("npm", ["install", "--prefix", directory, "--ignore-scripts", "--no-audit", "--no-fund", "--package-lock=false", join(directory, filename)]);
    const cli = join(directory, "node_modules", ".bin", "possible");
    const run = (...args) => execute(process.execPath, [cli, ...args], { cwd: directory });

    await run("create", "product-result", "--product", "example/product");
    await run("create", "skill-result", "--skill", "example/skills", "skills/cad", "a".repeat(40));
    assert.equal((await run("validate")).stdout, "Validated 2 Outcomes.\n");

    const path = join(directory, "outcomes", "product-result", "outcome.json");
    const manifest = JSON.parse(await readFile(path, "utf8"));
    assert.equal(manifest.schemaVersion, 4);
    assert.deepEqual(manifest.primary, { kind: "product", id: "example/product" });
    delete manifest.primary;
    await writeFile(path, JSON.stringify(manifest));
    await assert.rejects(run("validate"), (error) => error.code === 1 && /primary/.test(error.stderr));

    manifest.schemaVersion = 3;
    manifest.products = ["example/product"];
    await writeFile(path, JSON.stringify(manifest));
    assert.equal((await run("validate")).stdout, "Validated 2 Outcomes.\n");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
