import { build } from "esbuild";
import { inject } from "postject";
import { chmod, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const output = join(root, "dist/sea");
const cli = join(root, "apps/cli");
const { version } = JSON.parse(await readFile(join(cli, "package.json"), "utf8"));
if (process.version !== "v22.23.3") throw new Error("Build with the pinned Node v22.23.3 runtime");
if (!['darwin', 'linux'].includes(process.platform) || !['arm64', 'x64'].includes(process.arch)) throw new Error("Unsupported build platform");
await mkdir(output, { recursive: true });

// Keep the CLI's ESM source intact. Only its top-level command dispatch needs
// an async wrapper to bundle into the CommonJS entry point supported by Node 22 SEA.
const source = (await readFile(join(cli, "src/index.mjs"), "utf8")).replace(/^#![^\n]*\n/, "");
const boundary = source.indexOf("const HELP =");
if (boundary < 0 || !source.slice(0, boundary).trim().endsWith(";")) throw new Error("CLI entry layout changed; inspect the SEA wrapper");
await build({
  stdin: {
    contents: `${source.slice(0, boundary)}\n(async () => {\nif (process.argv.length === 3 && process.argv[2] === "--version") { process.stdout.write(${JSON.stringify(version + "\n")}); return; }\n${source.slice(boundary)}\n})().catch(error => { process.stderr.write(String(error?.message ?? error) + "\\n"); process.exitCode = 1; });`,
    resolveDir: join(cli, "src"),
    sourcefile: "sea-entry.mjs",
  },
  outfile: join(output, "entry.cjs"),
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node22.23",
  legalComments: "inline",
});
const config = join(output, "sea-config.json");
const blob = join(output, "sea.blob");
await writeFile(config, JSON.stringify({ main: join(output, "entry.cjs"), output: blob, disableExperimentalSEAWarning: true, useSnapshot: false, useCodeCache: false }));
execFileSync(process.execPath, ["--experimental-sea-config", config], { stdio: "inherit" });
const binary = join(output, "possible");
await copyFile(process.execPath, binary);
await chmod(binary, 0o755);
if (process.platform === "darwin") execFileSync("codesign", ["--remove-signature", binary]);
await inject(binary, "NODE_SEA_BLOB", await readFile(blob), {
  sentinelFuse: "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2",
  ...(process.platform === "darwin" ? { machoSegmentName: "NODE_SEA" } : {}),
});
if (process.platform === "darwin") {
  execFileSync("codesign", ["--sign", "-", binary]);
  execFileSync("codesign", ["--verify", "--strict", binary]);
}
// Include both application and embedded Node runtime licenses.
await copyFile(join(cli, "LICENSE"), join(output, "LICENSE"));
await copyFile(join(dirname(process.execPath), "../LICENSE"), join(output, "NODE-LICENSE"));
const name = `possible-v${version}-${process.platform}-${process.arch}.tar.gz`;
execFileSync("tar", ["-czf", join(output, name), "-C", output, "possible", "LICENSE", "NODE-LICENSE"]);
console.log(`Built ${name}`);
