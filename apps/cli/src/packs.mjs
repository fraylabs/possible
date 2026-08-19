import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";

const exists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

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

const writeExclusive = async (path, contents) => {
  await writeFile(path, contents, { flag: "wx" }).catch((error) => {
    if (error?.code === "EEXIST") throw new Error(`Export already exists: ${path}`);
    throw error;
  });
};

const submissionInstructions = ({ pack, sourceEntry, sourceEntryName }) => {
  if (!sourceEntry) {
    return `# Submit ${pack.name}\n\nThis valid Outcome Pack is not PR-ready yet because its Git source is not pinned. Commit the exported \`pack.json\` to a public GitHub repository, then run:\n\n\`\`\`bash\npossible pack export <repository-path-to-pack.json> --source https://github.com/<owner>/<repository> --revision <full-commit> --path <repository-path-to-pack.json>\n\`\`\`\n\nThe exact export creates \`source-entry.json\`. Do not replace the full commit with a branch or tag. A valid contract is still not Possible catalog trust.\n`;
  }
  const registryPath = `registry/entries/${sourceEntry.id}.json`;
  const snapshotPath = `registry/snapshots/${sourceEntry.contentHash.slice("sha256:".length)}.json`;
  const sourceAtRevision = `${sourceEntry.source}/blob/${sourceEntry.revision}/${sourceEntry.path}`;
  return `# Submit ${pack.name}\n\nThis package pins the public source that Possible should review.\n\n- Source: ${sourceAtRevision}\n- Commit: \`${sourceEntry.revision}\`\n- Path: \`${sourceEntry.path}\`\n- Content: \`${sourceEntry.contentHash}\`\n\n## Open the pull request\n\n1. Fork \`fraylabs/possible\` on GitHub and create a branch. No Possible account is required.\n2. Copy \`${sourceEntryName}\` to \`${registryPath}\` in your fork. Do not add a trust or evidence record.\n3. Copy this package's \`pack.json\` unchanged to \`${snapshotPath}\`. This content-addressed snapshot makes the catalog reproducible offline; it is provenance, not trust.\n4. Run \`node scripts/validate-pack-submission.mjs --entry ${registryPath} --pack <path-to-this-package>/pack.json\`.\n5. Run \`npm run registry:sync\` and commit its generated catalog and reference files. Do not edit those files by hand.\n6. Open a pull request describing the outcome, non-scope, and evidence the Expectations require.\n\nPossible's Git-backed registry and immutable snapshot are the submission record; there is no submission database. Merge makes a valid pack listed. Only maintainers can assign experimental or verified trust through a separate trust record, and verification requires accepted run evidence.\n`;
};

const packPath = (projectDirectory, value) => {
  if (!value) return null;
  if (value.endsWith(".json") || value.includes("/") || value.includes("\\")) return resolve(projectDirectory, value);
  return join(projectDirectory, ".possible", "packs", value, "pack.json");
};

const slugForPackPath = (path) => {
  const file = basename(path);
  const slug = file === "pack.json" ? basename(dirname(path)) : basename(file, extname(file));
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) throw new Error("Pack path must use a lowercase hyphenated folder or filename so its catalog slug is unambiguous");
  return slug;
};

export const loadRuntime = async () => {
  try {
    const runtimeRoot = new URL("../runtime/", import.meta.url);
    const [packs, local, submission] = await Promise.all([import(new URL("index.js", runtimeRoot)), import(new URL("local.js", runtimeRoot)), import(new URL("submission.js", runtimeRoot))]);
    return { ...packs, ...local, ...submission };
  } catch (error) {
    if (error?.code !== "ERR_MODULE_NOT_FOUND") throw error;
    const [packs, local, submission] = await Promise.all([import("@possible/packs"), import("@possible/packs/local"), import("@possible/packs/submission")]);
    return { ...packs, ...local, ...submission };
  }
};

export async function runPackCommand(args, projectDirectory = process.cwd()) {
  const [command, value] = args;
  const runtime = await loadRuntime();

  if (command === "init") {
    const slug = value ?? "my-pack";
    const path = await runtime.writeLocalPack(slug, runtime.createDraftPack(), projectDirectory);
    const readmePath = join(dirname(path), "README.md");
    if (!(await exists(readmePath))) {
      await writeFile(readmePath, `# ${slug}\n\nComplete the structured prompt and Expectations in pack.json, add Skills only when specialized capabilities are needed, then validate and compile it. This folder remains project-local unless you explicitly export and submit it.\n`);
    }
    return `Created Outcome Pack draft at ${path}`;
  }

  if (command === "validate") {
    const path = packPath(projectDirectory, value);
    const targets = path ? [path] : (await runtime.loadLocalPacks(projectDirectory)).map(({ path: localPath }) => localPath);
    if (targets.length === 0) return "No local packs found under .possible/packs";
    const results = [];
    for (const target of targets) {
      const pack = runtime.validatePackManifest(await readJson(target), target);
      results.push({ path: target, slug: slugForPackPath(target), name: pack.name, valid: true });
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
    const slug = slugForPackPath(path);
    const packContents = `${JSON.stringify(pack, null, 2)}\n`;
    const destination = parsed.outputValue
      ? resolve(projectDirectory, parsed.outputValue)
      : join(projectDirectory, ".possible", "exports", slug);
    const outputPath = destination.endsWith(".json") ? destination : join(destination, "pack.json");
    const outputDirectory = dirname(outputPath);
    let sourceEntry = null;
    let sourceEntryName = "source-entry.template.json";
    if (parsed.source) {
      sourceEntry = runtime.createFederatedRegistryEntry({
        slug,
        source: parsed.source,
        revision: parsed.revision.toLowerCase(),
        path: parsed.sourcePath,
        contentHash: runtime.computePackContentHash(packContents),
      });
      sourceEntryName = "source-entry.json";
    }
    const sourceEntryContents = sourceEntry
      ? `${JSON.stringify(sourceEntry, null, 2)}\n`
      : `${JSON.stringify({
          schemaVersion: 1,
          id: `<github-owner>/<repository>/${slug}`,
          source: "https://github.com/<github-owner>/<repository>",
          revision: "<full-git-commit>",
          path: "<repository-relative-path-to-pack.json>",
          contentHash: runtime.computePackContentHash(packContents),
        }, null, 2)}\n`;
    await mkdir(outputDirectory, { recursive: true });
    for (const target of [outputPath, join(outputDirectory, sourceEntryName), join(outputDirectory, "SUBMISSION.md")]) {
      if (await exists(target)) throw new Error(`Export already exists: ${target}`);
    }
    await writeExclusive(outputPath, packContents);
    await writeExclusive(join(outputDirectory, sourceEntryName), sourceEntryContents);
    await writeExclusive(join(outputDirectory, "SUBMISSION.md"), submissionInstructions({ pack, sourceEntry, sourceEntryName }));
    return sourceEntry
      ? `Exported a PR-ready pack submission at ${outputDirectory}`
      : `Exported a valid Outcome Pack at ${outputDirectory}; pin its public Git source to make it PR-ready`;
  }

  if (command === "inspect") {
    const path = packPath(projectDirectory, value);
    const targets = path ? [path] : (await runtime.loadLocalPacks(projectDirectory)).map(({ path: localPath }) => localPath);
    if (targets.length === 0) return "No local packs found under .possible/packs";
    const results = [];
    for (const target of targets) {
      const pack = runtime.validatePackManifest(await readJson(target), target);
      results.push({ path: target, slug: slugForPackPath(target), name: pack.name, promise: pack.promise, skills: pack.skills?.length ?? 0, expectations: pack.expectations?.length ?? 0 });
    }
    process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
    return null;
  }

  throw new Error(`Unknown pack command: ${command ?? ""}`);
}
