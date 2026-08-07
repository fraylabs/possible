import { access, mkdir, readFile, writeFile } from "node:fs/promises";
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
  const [command, value, outputValue] = args;
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
    const path = packPath(projectDirectory, value);
    if (!path) throw new Error("Usage: possible pack export <slug-or-path> [output-path]");
    const pack = runtime.validatePackManifest(await readJson(path), path);
    if (pack.visibility !== "private" || pack.lifecycle !== "reviewed") throw new Error("Only a private reviewed pack can be exported for public review");
    const { reviewedAt: _reviewedAt, archived: _archived, ...draft } = pack;
    const candidate = {
      ...draft,
      visibility: "public",
      lifecycle: "draft",
      eyebrow: "DRAFT / PUBLIC REVIEW",
    };
    const outputPath = outputValue ? resolve(projectDirectory, outputValue) : join(projectDirectory, ".possible", "exports", `${pack.slug}-${pack.packVersion}`, "pack.json");
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(candidate, null, 2)}\n`, { flag: "wx" }).catch((error) => {
      if (error?.code === "EEXIST") throw new Error(`Export already exists: ${outputPath}`);
      throw error;
    });
    return `Exported a public-review draft at ${outputPath}`;
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
