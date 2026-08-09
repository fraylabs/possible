import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { loadRuntime } from "./packs.mjs";

const emptyBookmarks = () => ({ schemaVersion: 1, packs: [] });

export const bookmarkFilePath = (environment = process.env) => join(
  environment.POSSIBLE_HOME ? resolve(environment.POSSIBLE_HOME) : join(homedir(), ".possible"),
  "bookmarks.json",
);

const validateBookmarks = (input, runtime, path) => {
  if (input === null || typeof input !== "object" || Array.isArray(input)) throw new Error(`Bookmarks at ${path} must be a JSON object`);
  if (input.schemaVersion !== 1) throw new Error(`Bookmarks at ${path} must use schemaVersion 1`);
  if (!Array.isArray(input.packs)) throw new Error(`Bookmarks at ${path} must contain a packs array`);
  const ids = new Set();
  const packs = input.packs.map((bookmark, index) => {
    if (bookmark === null || typeof bookmark !== "object" || Array.isArray(bookmark)) throw new Error(`Bookmark ${index + 1} at ${path} must be an object`);
    if (Object.keys(bookmark).some((key) => !["id", "savedAt"].includes(key))) throw new Error(`Bookmark ${index + 1} at ${path} contains an unsupported field`);
    const { id } = runtime.parsePackIdentity(bookmark.id, `bookmark ${index + 1}.id`);
    if (ids.has(id)) throw new Error(`Bookmarks at ${path} contain duplicate pack ${id}`);
    ids.add(id);
    if (typeof bookmark.savedAt !== "string" || Number.isNaN(Date.parse(bookmark.savedAt))) throw new Error(`Bookmark ${index + 1}.savedAt at ${path} must be an ISO date or date-time`);
    return { id, savedAt: bookmark.savedAt };
  });
  return { schemaVersion: 1, packs };
};

const readBookmarks = async (path, runtime) => {
  let contents;
  try {
    contents = await readFile(path, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return emptyBookmarks();
    throw error;
  }
  try {
    return validateBookmarks(JSON.parse(contents), runtime, path);
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error(`Bookmarks at ${path} contain invalid JSON and were left unchanged`);
    throw error;
  }
};

const writeBookmarks = async (path, bookmarks) => {
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(bookmarks, null, 2)}\n`, { flag: "wx" });
  await rename(temporaryPath, path);
};

const resolveCatalogEntry = (runtime, value) => {
  const exact = runtime.publicCatalog.find(({ id }) => id === value);
  if (exact) return exact;
  const matches = runtime.publicCatalog.filter(({ slug }) => slug === value);
  if (matches.length > 1) throw new Error(`Pack slug ${value} is ambiguous; use one of: ${matches.map(({ id }) => id).sort().join(", ")}`);
  if (matches.length === 0) throw new Error(`No public Outcome Pack matches ${value}`);
  return matches[0];
};

const resolveSavedId = (bookmarks, value) => {
  if (bookmarks.packs.some(({ id }) => id === value)) return value;
  const matches = bookmarks.packs.map(({ id }) => id).filter((id) => id.endsWith(`/${value}`));
  if (matches.length > 1) throw new Error(`Saved pack slug ${value} is ambiguous; use one of: ${matches.sort().join(", ")}`);
  if (matches.length === 0) throw new Error(`No bookmarked Outcome Pack matches ${value}`);
  return matches[0];
};

export async function runBookmarkCommand(args, options = {}) {
  const [command, value, ...rest] = args;
  if (rest.length > 0) throw new Error("Bookmark commands accept only one pack id or slug");
  const runtime = await loadRuntime();
  const path = bookmarkFilePath(options.environment);
  const bookmarks = await readBookmarks(path, runtime);

  if (command === "list") {
    if (value !== undefined) throw new Error("Usage: possible bookmark list");
    if (bookmarks.packs.length === 0) return "No bookmarked Outcome Packs.";
    return bookmarks.packs.map(({ id }) => {
      const entry = runtime.publicCatalog.find(({ id: candidateId }) => candidateId === id);
      return entry ? `${id}\t${entry.pack.name}` : `${id}\tUnavailable from the current catalog`;
    }).join("\n");
  }

  if (command === "add") {
    if (!value) throw new Error("Usage: possible bookmark add <pack-id-or-slug>");
    const entry = resolveCatalogEntry(runtime, value);
    if (bookmarks.packs.some(({ id }) => id === entry.id)) return `${entry.id} is already bookmarked.`;
    bookmarks.packs.push({ id: entry.id, savedAt: new Date().toISOString() });
    bookmarks.packs.sort((left, right) => left.id.localeCompare(right.id));
    await writeBookmarks(path, bookmarks);
    return `Bookmarked ${entry.id}.`;
  }

  if (command === "remove") {
    if (!value) throw new Error("Usage: possible bookmark remove <pack-id-or-slug>");
    const id = resolveSavedId(bookmarks, value);
    bookmarks.packs = bookmarks.packs.filter(({ id: candidateId }) => candidateId !== id);
    await writeBookmarks(path, bookmarks);
    return `Removed bookmark ${id}.`;
  }

  throw new Error(`Unknown bookmark command: ${command ?? ""}`);
}
