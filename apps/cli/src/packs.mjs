import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";

const exists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

const FULL_GIT_REVISION = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;
const GITHUB_PART = /^[A-Za-z0-9_.-]+$/;

const parseExportArguments = (args) => {
  const positional = [];
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (!argument.startsWith("--")) {
      positional.push(argument);
      continue;
    }
    const [flag, inlineValue] = argument.split("=", 2);
    if (!["--source", "--revision", "--path"].includes(flag)) throw new Error(`Unknown pack export option: ${flag}`);
    const value = inlineValue ?? args[index + 1];
    if (!value || (!inlineValue && value.startsWith("--"))) throw new Error(`${flag} requires a value`);
    if (!inlineValue) index += 1;
    options[flag.slice(2)] = value;
  }
  if (positional.length === 0 || positional.length > 2) {
    throw new Error("Usage: possible pack export <slug-or-path> [output-path] [--source <github-url> --revision <commit> --path <repository-pack-path>]");
  }
  const supplied = [options.source, options.revision, options.path].filter(Boolean).length;
  if (supplied !== 0 && supplied !== 3) throw new Error("A PR-ready export requires --source, --revision, and --path together");
  return { value: positional[0], outputValue: positional[1], source: options.source, revision: options.revision, sourcePath: options.path };
};

const parseGitHubSource = (value) => {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("--source must be an HTTPS GitHub repository URL");
  }
  const parts = url.pathname.replace(/\.git$/, "").split("/").filter(Boolean);
  if (url.protocol !== "https:" || url.hostname !== "github.com" || parts.length !== 2 || url.search || url.hash || !parts.every((part) => GITHUB_PART.test(part))) {
    throw new Error("--source must look like https://github.com/<owner>/<repository>");
  }
  return { source: `https://github.com/${parts[0]}/${parts[1]}`, owner: parts[0], repository: parts[1] };
};

const validateSourcePath = (value) => {
  if (value.startsWith("/") || value.includes("\\") || value.split("/").some((part) => part === "" || part === "." || part === "..") || !value.endsWith(".json")) {
    throw new Error("--path must be a safe repository-relative JSON path");
  }
  return value;
};

const sha256 = (value) => `sha256:${createHash("sha256").update(value).digest("hex")}`;

const writeExclusive = async (path, contents) => {
  await writeFile(path, contents, { flag: "wx" }).catch((error) => {
    if (error?.code === "EEXIST") throw new Error(`Export already exists: ${path}`);
    throw error;
  });
};

const submissionInstructions = ({ pack, sourceEntry, sourceEntryName }) => {
  if (!sourceEntry) {
    return `# Submit ${pack.name}\n\nThis reviewed public contract is not PR-ready yet because its Git source is not pinned. Commit the exported \`pack.json\` to a public GitHub repository, then run:\n\n\`\`\`bash\npossible pack export <repository-path-to-pack.json> --source https://github.com/<owner>/<repository> --revision <full-commit> --path <repository-path-to-pack.json>\n\`\`\`\n\nThe exact export creates \`source-entry.json\`. Do not replace the full commit with a branch or tag. The contract lifecycle makes it compilable; it does not grant Possible catalog trust.\n`;
  }
  const registryPath = `registry/entries/${sourceEntry.id}.json`;
  const snapshotPath = `registry/snapshots/${sourceEntry.contentHash.slice("sha256:".length)}.json`;
  const sourceAtRevision = `${sourceEntry.source}/blob/${sourceEntry.revision}/${sourceEntry.path}`;
  return `# Submit ${pack.name}\n\nThis package pins the public source that Possible should review.\n\n- Source: ${sourceAtRevision}\n- Commit: \`${sourceEntry.revision}\`\n- Path: \`${sourceEntry.path}\`\n- Content: \`${sourceEntry.contentHash}\`\n\n## Open the pull request\n\n1. Fork \`fraylabs/possible\` on GitHub and create a branch. No Possible account is required.\n2. Copy \`${sourceEntryName}\` to \`${registryPath}\` in your fork. Do not add a trust or evidence record.\n3. Copy this package's \`pack.json\` unchanged to \`${snapshotPath}\`. This content-addressed snapshot makes the catalog reproducible offline; it is provenance, not trust.\n4. Run \`node scripts/validate-pack-submission.mjs --entry ${registryPath} --pack <path-to-this-package>/pack.json\`.\n5. Run \`npm run registry:sync\` and commit its generated catalog and reference files. Do not edit those files by hand.\n6. Open a pull request describing the outcome, non-scope, and evidence the Expectations require.\n\nPossible's Git-backed registry and immutable snapshot are the submission record; there is no submission database. Merge makes a valid pack listed. Only maintainers can assign experimental, verified, or archived trust through a separate trust record, and verification requires accepted run evidence.\n`;
};

const packPath = (projectDirectory, value) => {
  if (!value) return null;
  if (value.endsWith(".json") || value.includes("/") || value.includes("\\")) return resolve(projectDirectory, value);
  return join(projectDirectory, ".possible", "packs", value, "pack.json");
};

const loadRuntime = async () => {
  try {
    const runtimeRoot = new URL("../runtime/", import.meta.url);
    const [packs, local] = await Promise.all([import(new URL("index.js", runtimeRoot)), import(new URL("local.js", runtimeRoot))]);
    return { ...packs, ...local };
  } catch (error) {
    if (error?.code !== "ERR_MODULE_NOT_FOUND") throw error;
    const [packs, local] = await Promise.all([import("@possible/packs"), import("@possible/packs/local")]);
    return { ...packs, ...local };
  }
};

export async function runPackCommand(args, projectDirectory = process.cwd()) {
  const [command, value] = args;
  const runtime = await loadRuntime();

  if (command === "init") {
    const slug = value ?? "my-pack";
    const path = await runtime.writeLocalPack(runtime.createDraftPack(slug), projectDirectory);
    const readmePath = join(dirname(path), "README.md");
    if (!(await exists(readmePath))) {
      await writeFile(readmePath, `# ${slug}\n\nThis private Outcome Pack is a local contract. Complete pack.json, validate it, and request review before compiling or running it.\n`);
    }
    return `Created draft private pack at ${path}`;
  }

  if (command === "validate") {
    const path = packPath(projectDirectory, value);
    const targets = path ? [path] : (await runtime.loadLocalPacks(projectDirectory)).map(({ path: localPath }) => localPath);
    if (targets.length === 0) return "No local packs found under .possible/packs";
    const results = [];
    for (const target of targets) {
      const pack = runtime.validatePackManifest(await readJson(target), target);
      results.push({ path: target, slug: pack.slug, visibility: pack.visibility, lifecycle: pack.lifecycle, valid: true });
    }
    process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
    return null;
  }

  if (command === "compile") {
    const path = packPath(projectDirectory, value);
    if (!path) throw new Error("Usage: possible pack compile <slug-or-path>");
    const pack = runtime.validatePackManifest(await readJson(path), path);
    const compiled = runtime.compilePack(pack);
    process.stdout.write(`${JSON.stringify(compiled, null, 2)}\n`);
    return null;
  }

  if (command === "export") {
    const parsed = parseExportArguments(args.slice(1));
    const path = packPath(projectDirectory, parsed.value);
    const pack = runtime.validatePackManifest(await readJson(path), path);
    const privateReviewed = pack.visibility === "private" && pack.lifecycle === "reviewed";
    const publicReviewed = pack.visibility === "public" && pack.lifecycle === "reviewed";
    if (!privateReviewed && !publicReviewed) throw new Error("Pack export accepts a reviewed private or public pack");
    if (parsed.source && !publicReviewed) {
      throw new Error("A PR-ready export must use the reviewed public pack already committed at --revision so its source and content hash agree");
    }
    let candidate = pack;
    if (privateReviewed) {
      candidate = { ...pack, visibility: "public" };
    }
    const packContents = `${JSON.stringify(candidate, null, 2)}\n`;
    const destination = parsed.outputValue
      ? resolve(projectDirectory, parsed.outputValue)
      : join(projectDirectory, ".possible", "exports", `${pack.slug}-${pack.packVersion}`);
    const outputPath = destination.endsWith(".json") ? destination : join(destination, "pack.json");
    const outputDirectory = dirname(outputPath);
    let sourceEntry = null;
    let sourceEntryName = "source-entry.template.json";
    if (parsed.source) {
      const { source, owner, repository } = parseGitHubSource(parsed.source);
      const revision = parsed.revision.toLowerCase();
      if (!FULL_GIT_REVISION.test(revision)) throw new Error("--revision must be a full 40- or 64-character hexadecimal Git commit");
      const sourcePath = validateSourcePath(parsed.sourcePath);
      sourceEntry = {
        schemaVersion: 1,
        id: `${owner}/${repository}/${pack.slug}`,
        source,
        revision,
        path: sourcePath,
        contentHash: sha256(packContents),
      };
      sourceEntryName = "source-entry.json";
    }
    const sourceEntryContents = sourceEntry
      ? `${JSON.stringify(sourceEntry, null, 2)}\n`
      : `${JSON.stringify({
          schemaVersion: 1,
          id: `<github-owner>/<repository>/${pack.slug}`,
          source: "https://github.com/<github-owner>/<repository>",
          revision: "<full-git-commit>",
          path: "<repository-relative-path-to-pack.json>",
          contentHash: sha256(packContents),
        }, null, 2)}\n`;
    await mkdir(outputDirectory, { recursive: true });
    for (const target of [outputPath, join(outputDirectory, sourceEntryName), join(outputDirectory, "SUBMISSION.md")]) {
      if (await exists(target)) throw new Error(`Export already exists: ${target}`);
    }
    await writeExclusive(outputPath, packContents);
    await writeExclusive(join(outputDirectory, sourceEntryName), sourceEntryContents);
    await writeExclusive(join(outputDirectory, "SUBMISSION.md"), submissionInstructions({ pack: candidate, sourceEntry, sourceEntryName }));
    return sourceEntry
      ? `Exported a PR-ready pack submission at ${outputDirectory}`
      : `Exported a reviewed public contract at ${outputDirectory}; pin its public Git source to make it PR-ready`;
  }

  if (command === "inspect") {
    const path = packPath(projectDirectory, value);
    const targets = path ? [path] : (await runtime.loadLocalPacks(projectDirectory)).map(({ path: localPath }) => localPath);
    if (targets.length === 0) return "No local packs found under .possible/packs";
    const results = [];
    for (const target of targets) {
      const pack = runtime.validatePackManifest(await readJson(target), target);
      results.push({ path: target, slug: pack.slug, name: pack.name, packVersion: pack.packVersion, visibility: pack.visibility, lifecycle: pack.lifecycle, reviewedAt: pack.reviewedAt ?? null, archived: pack.archived ?? null });
    }
    process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
    return null;
  }

  throw new Error(`Unknown pack command: ${command ?? ""}`);
}
