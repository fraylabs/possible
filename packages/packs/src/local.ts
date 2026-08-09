import { lstat, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import draftPack from "./draft-pack.json" with { type: "json" };
import { validatePackManifest } from "./manifest.js";
import type { OutcomePack } from "./types.js";

export interface LocalPack {
  slug: string;
  pack: OutcomePack;
  path: string;
}

export const localPacksRoot = (projectDirectory = process.cwd()): string => join(resolve(projectDirectory), ".possible", "packs");

export function createDraftPack(): OutcomePack {
  return {
    schemaVersion: 1,
    name: draftPack.name,
    promise: draftPack.promise,
    prompt: draftPack.prompt,
    expectations: [],
  };
}

const isErrnoException = (cause: unknown): cause is NodeJS.ErrnoException => cause instanceof Error && "code" in cause;

const assertInside = (root: string, candidate: string): void => {
  const rel = relative(root, candidate);
  if (rel === "" || rel === ".." || rel.startsWith(".." + "/") || rel.startsWith(".." + "\\")) throw new Error(`Refusing to access a pack outside ${root}`);
};

export async function writeLocalPack(slug: string, pack: OutcomePack, projectDirectory = process.cwd()): Promise<string> {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) throw new Error("Local pack slug must be lowercase and hyphenated");
  const root = localPacksRoot(projectDirectory);
  const directory = resolve(root, slug);
  assertInside(root, directory);
  await mkdir(directory, { recursive: true });
  const path = join(directory, "pack.json");
  await writeFile(path, `${JSON.stringify(pack, null, 2)}\n`, { flag: "wx" }).catch((cause: unknown) => {
    if (isErrnoException(cause) && cause.code === "EEXIST") throw new Error(`Pack already exists: ${path}`);
    throw cause;
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
      const stats = await lstat(path).catch((cause: unknown) => {
        if (isErrnoException(cause) && cause.code === "ENOENT") return null;
        throw cause;
      });
      if (!stats || !stats.isFile() || stats.isSymbolicLink()) continue;
      const raw: unknown = JSON.parse(await readFile(path, "utf8"));
      const pack = validatePackManifest(raw, path);
      packs.push({ slug: entry.name, pack, path });
    }
    return packs;
  } catch (cause: unknown) {
    if (isErrnoException(cause) && cause.code === "ENOENT") return [];
    throw cause;
  }
}
