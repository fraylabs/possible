import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { chmod, copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const { version } = JSON.parse(await readFile(new URL("../../apps/cli/package.json", import.meta.url), "utf8"));
const archive = `possible-v${version}-${process.platform}-${process.arch}.tar.gz`;
const directory = await mkdtemp(join(tmpdir(), "possible-install-test-"));
const fixture = join(directory, "fixture");
const mock = join(directory, "mock");
const home = join(directory, "home");
await mkdir(fixture); await mkdir(mock); await mkdir(home);
await copyFile(resolve("dist/sea", archive), join(fixture, archive));
const digest = createHash("sha256").update(await readFile(join(fixture, archive))).digest("hex");
const sums = join(fixture, "SHA256SUMS");
await writeFile(sums, `${digest}  ${archive}\n`);
await writeFile(join(mock, "curl"), `#!/bin/sh
set -eu
url= out=
while [ "$#" -gt 0 ]; do
  case "$1" in
    -o) out=$2; shift 2 ;;
    --proto|--proto-redir|--retry|-w) shift 2 ;;
    https://*) url=$1; shift ;;
    *) shift ;;
  esac
done
case "$url" in
  */latest) printf 'https://github.com/fraylabs/possible/releases/tag/v%s' "$FIXTURE_VERSION" ;;
  */download/v"$FIXTURE_VERSION"/*) cp "$FIXTURE_DIR/\${url##*/}" "$out" ;;
  *) exit 22 ;;
esac
`);
await chmod(join(mock, "curl"), 0o755);
const env = { HOME: home, PATH: `${mock}:/usr/bin:/bin`, FIXTURE_DIR: fixture, FIXTURE_VERSION: version };
const installer = resolve("apps/web/public/install.sh");
const run = extra => execFileSync("/bin/sh", [installer], { env: { ...env, ...extra }, encoding: "utf8" });
try {
  console.log(run({}).trim());
  assert.equal(execFileSync(join(home, ".local/bin/possible"), ["--version"], { env, encoding: "utf8" }).trim(), version);
  const custom = join(directory, "custom dir");
  console.log(run({ POSSIBLE_VERSION: `v${version}`, POSSIBLE_INSTALL_DIR: custom }).trim());
  const before = await readFile(join(custom, "possible"));
  for (const bad of [`${"0".repeat(64)}  ${archive}\n`, `${digest}  ${archive}\n${digest}  ${archive}\n`]) {
    await writeFile(sums, bad);
    assert.throws(() => run({ POSSIBLE_VERSION: version, POSSIBLE_INSTALL_DIR: custom }), error => error.status === 1 && /SHA256 verification failed|ambiguous/.test(String(error.stderr)));
    assert.deepEqual(await readFile(join(custom, "possible")), before);
  }
  console.log("Installer smoke passed (latest, pinned, custom directory, corrupt/duplicate checksums refused; existing install preserved)");
} finally {
  await rm(directory, { recursive: true, force: true });
}
