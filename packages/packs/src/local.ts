import { lstat, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { validatePackManifest } from "./manifest.js";
import type { OutcomePack } from "./types.js";

export interface LocalPack {
  pack: OutcomePack;
  path: string;
}

export const localPacksRoot = (projectDirectory = process.cwd()): string => join(resolve(projectDirectory), ".possible", "packs");

export function createDraftPack(slug = "my-pack"): OutcomePack {
  return {
    schemaVersion: 1,
    packVersion: "0.1.0",
    visibility: "private",
    lifecycle: "draft",
    lane: "create",
    slug,
    name: "My Outcome Pack",
    eyebrow: "DRAFT / OUTCOME PACK",
    promise: "Describe the observable outcome this pack should make true.",
    summary: "Explain the smallest coherent outcome, its evidence, and its stopping boundary.",
    useWhen: [],
    notFor: [],
    skills: [],
    workstreams: [],
    reviewSkills: [],
    outputs: [],
    guardrails: [],
    verification: [],
    expectations: [],
  };
}

const assertInside = (root: string, candidate: string): void => {
  const rel = relative(root, candidate);
  if (rel === "" || rel === ".." || rel.startsWith(".." + "/") || rel.startsWith(".." + "\\")) throw new Error(`Refusing to access a pack outside ${root}`);
};

export async function writeLocalPack(pack: unknown, projectDirectory = process.cwd()): Promise<string> {
  const validated = validatePackManifest(pack, "local pack");
  if (validated.visibility !== "private") throw new Error("Local project packs must use visibility=private");
  const root = localPacksRoot(projectDirectory);
  const directory = resolve(root, validated.slug);
  assertInside(root, directory);
  await mkdir(directory, { recursive: true });
  const path = join(directory, "pack.json");
  await writeFile(path, `${JSON.stringify(validated, null, 2)}\n`, { flag: "wx" }).catch((error: unknown) => {
    if ((error as NodeJS.ErrnoException)?.code === "EEXIST") throw new Error(`Pack already exists: ${path}`);
    throw error;
  });
  return path;
}

export async function loadLocalPacks(projectDirectory = process.cwd()): Promise<LocalPack[]> {
  const root = localPacksRoot(projectDirectory);
  try {
    const entries = await readdir(root, { withFileTypes: true });
    const packs: LocalPack[] = [];
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      if (!entry.isDirectory() || entry.isSymbolicLink()) continue;
      const path = join(root, entry.name, "pack.json");
      const stats = await lstat(path).catch((error: unknown) => {
        if ((error as NodeJS.ErrnoException)?.code === "ENOENT") return null;
        throw error;
      });
      if (!stats || !stats.isFile() || stats.isSymbolicLink()) continue;
      const raw = JSON.parse(await readFile(path, "utf8")) as unknown;
      const pack = validatePackManifest(raw, path);
      if (pack.visibility !== "private") throw new Error(`${path} must use visibility=private`);
      packs.push({ pack, path });
    }
    return packs;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") return [];
    throw error;
  }
}
