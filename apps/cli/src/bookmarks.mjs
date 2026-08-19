import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

const SAFE_SLUG = /^[a-z0-9][a-z0-9-]*$/;
const emptyBookmarks = () => ({ schemaVersion: 1, outcomes: [] });

export const bookmarkFilePath = (environment = process.env) => join(
  environment.POSSIBLE_HOME ? resolve(environment.POSSIBLE_HOME) : join(homedir(), ".possible"),
  "bookmarks.json",
);

const validateBookmarks = (input, path) => {
  if (input === null || typeof input !== "object" || Array.isArray(input)) throw new Error(`Bookmarks at ${path} must be a JSON object`);
  if (input.schemaVersion !== 1 || !Array.isArray(input.outcomes)) throw new Error(`Bookmarks at ${path} must contain schemaVersion 1 and an outcomes array`);
  const slugs = new Set();
  const outcomes = input.outcomes.map((bookmark, index) => {
    if (bookmark === null || typeof bookmark !== "object" || Array.isArray(bookmark)) throw new Error(`Bookmark ${index + 1} must be an object`);
    if (Object.keys(bookmark).some((key) => !["slug", "savedAt"].includes(key))) throw new Error(`Bookmark ${index + 1} contains an unsupported field`);
    if (!SAFE_SLUG.test(bookmark.slug)) throw new Error(`Bookmark ${index + 1}.slug must be lowercase and hyphenated`);
    if (slugs.has(bookmark.slug)) throw new Error(`Bookmarks at ${path} contain duplicate Outcome ${bookmark.slug}`);
    if (typeof bookmark.savedAt !== "string" || Number.isNaN(Date.parse(bookmark.savedAt))) throw new Error(`Bookmark ${index + 1}.savedAt must be an ISO date or date-time`);
    slugs.add(bookmark.slug);
    return { slug: bookmark.slug, savedAt: bookmark.savedAt };
  });
  return { schemaVersion: 1, outcomes };
};

const readBookmarks = async (path) => {
  const contents = await readFile(path, "utf8").catch((error) => error?.code === "ENOENT" ? undefined : Promise.reject(error));
  if (contents === undefined) return emptyBookmarks();
  try {
    return validateBookmarks(JSON.parse(contents), path);
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

export async function runBookmarkCommand(args, options = {}) {
  const [command, slug, ...rest] = args;
  if (rest.length > 0) throw new Error("Bookmark commands accept only one Outcome slug");
  const path = bookmarkFilePath(options.environment);
  const bookmarks = await readBookmarks(path);

  if (command === "list") {
    if (slug !== undefined) throw new Error("Usage: possible bookmark list");
    return bookmarks.outcomes.length ? bookmarks.outcomes.map(({ slug: value }) => value).join("\n") : "No bookmarked Outcomes.";
  }
  if ((command === "add" || command === "remove") && (!slug || !SAFE_SLUG.test(slug))) throw new Error(`Usage: possible bookmark ${command} <outcome-slug>`);
  if (command === "add") {
    if (bookmarks.outcomes.some(({ slug: value }) => value === slug)) return `${slug} is already bookmarked.`;
    bookmarks.outcomes.push({ slug, savedAt: new Date().toISOString() });
    bookmarks.outcomes.sort((left, right) => left.slug.localeCompare(right.slug));
    await writeBookmarks(path, bookmarks);
    return `Bookmarked ${slug}.`;
  }
  if (command === "remove") {
    if (!bookmarks.outcomes.some(({ slug: value }) => value === slug)) throw new Error(`No bookmarked Outcome matches ${slug}`);
    bookmarks.outcomes = bookmarks.outcomes.filter(({ slug: value }) => value !== slug);
    await writeBookmarks(path, bookmarks);
    return `Removed bookmark ${slug}.`;
  }
  throw new Error(`Unknown bookmark command: ${command ?? ""}`);
}
