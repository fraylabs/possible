import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const temporaryRoot = mkdtempSync(join(tmpdir(), "tiny-slug-verify-"));
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const expectedFiles = [
  "CHANGELOG.md",
  "LICENSE",
  "README.md",
  "index.d.ts",
  "index.js",
  "package.json",
];

const npmEnvironment = {
  ...process.env,
  npm_config_audit: "false",
  npm_config_cache: join(temporaryRoot, "npm-cache"),
  npm_config_fund: "false",
  npm_config_offline: "true",
  npm_config_update_notifier: "false",
};

function run(command, args, options = {}) {
  try {
    return execFileSync(command, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      ...options,
    });
  } catch (error) {
    if (error.stdout) {
      process.stderr.write(error.stdout);
    }
    if (error.stderr) {
      process.stderr.write(error.stderr);
    }
    throw error;
  }
}

try {
  const manifest = JSON.parse(
    readFileSync(join(packageRoot, "package.json"), "utf8"),
  );

  assert.equal(manifest.name, "tiny-slug");
  assert.equal(manifest.version, "1.0.0");
  assert.equal(manifest.type, "module");
  assert.equal(manifest.license, "MIT");
  assert.equal(manifest.dependencies, undefined);

  const packDirectory = join(temporaryRoot, "packed");
  mkdirSync(packDirectory);

  const packOutput = run(
    npmCommand,
    [
      "pack",
      "--json",
      "--ignore-scripts",
      "--pack-destination",
      packDirectory,
    ],
    { cwd: packageRoot, env: npmEnvironment },
  );
  const packResults = JSON.parse(packOutput);

  assert.equal(packResults.length, 1, "npm pack should produce one tarball");
  const [packResult] = packResults;
  assert.equal(packResult.name, manifest.name);
  assert.equal(packResult.version, manifest.version);

  const packedFiles = packResult.files.map(({ path }) => path).sort();
  assert.deepEqual(
    packedFiles,
    expectedFiles,
    "packed artifact contains an unexpected or missing file",
  );

  const tarballPath = join(packDirectory, packResult.filename);
  const consumerDirectory = join(temporaryRoot, "consumer");
  mkdirSync(consumerDirectory);
  writeFileSync(
    join(consumerDirectory, "package.json"),
    `${JSON.stringify({ private: true, type: "module" }, null, 2)}\n`,
  );

  run(
    npmCommand,
    [
      "install",
      "--offline",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--package-lock=false",
      tarballPath,
    ],
    { cwd: consumerDirectory, env: npmEnvironment },
  );

  const smokeTestPath = join(consumerDirectory, "smoke.mjs");
  writeFileSync(
    smokeTestPath,
    `import assert from "node:assert/strict";
import * as tinySlug from "tiny-slug";

assert.deepEqual(Object.keys(tinySlug), ["slugify"]);
assert.equal(tinySlug.slugify("Hello, Package!"), "hello-package");
assert.equal(tinySlug.slugify("München"), "m-nchen");
assert.throws(() => tinySlug.slugify(null), {
  name: "TypeError",
  message: "slugify() expects a string",
});
`,
  );
  run(process.execPath, [smokeTestPath], { cwd: consumerDirectory });

  console.log(`Verified ${packResult.filename} with exactly these files:`);
  for (const file of packedFiles) {
    console.log(`- ${file}`);
  }
  console.log("Verified an offline install and named ESM import in a clean consumer.");
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
