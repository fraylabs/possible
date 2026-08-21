import { lstat, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";

const SAFE_SLUG = /^[a-z0-9][a-z0-9-]*$/;
const ALLOWED_ENTRIES = new Set(["artifacts", "inputs", "media", "outcome.json"]);
const MEDIA_EXTENSIONS = new Set([".3mf", ".avif", ".glb", ".jpeg", ".jpg", ".mp3", ".mp4", ".ogg", ".png", ".step", ".stl", ".wav", ".webm", ".webp"]);
const FILE_EXTENSIONS = new Set([...MEDIA_EXTENSIONS, ".css", ".csv", ".docx", ".html", ".js", ".json", ".md", ".pdf", ".pptx", ".py", ".txt", ".ts", ".tsx", ".xlsx", ".zip"]);

const parseJson = async (path) => JSON.parse(await readFile(path, "utf8"));

const publicMediaPath = (slug, source) => source.startsWith("https://") ? source : `/outcome-media/${slug}/${source}`;

const visitMedia = (preview, callback) => {
  for (const image of preview?.images ?? []) callback(image, "src");
  for (const key of ["video", "audio"]) {
    const media = preview?.[key];
    if (media?.src) callback(media, "src");
    if (media?.poster) callback(media, "poster");
  }
  if (preview?.cad?.preview) callback(preview.cad, "preview");
  if (preview?.cad?.poster) callback(preview.cad, "poster");
  for (const download of preview?.cad?.downloads ?? []) callback(download, "src");
};

const visitFiles = (files, callback) => {
  for (const file of files ?? []) callback(file, "src");
};

async function validateDirectoryFiles(folder, slug, directory, referenced, allowedExtensions) {
  const root = join(folder, directory);
  const files = await readdir(root, { withFileTypes: true }).catch((error) => error?.code === "ENOENT" ? [] : Promise.reject(error));
  for (const entry of files) {
    const path = join(root, entry.name);
    if (!entry.isFile() || entry.isSymbolicLink()) throw new Error(`${relative(folder, path)} must be a regular file`);
    if (!allowedExtensions.has(extname(entry.name).toLowerCase())) throw new Error(`${slug}/${directory}/${entry.name} uses an unsupported format`);
    if (!referenced.has(`${directory}/${entry.name}`)) throw new Error(`${slug}/${directory}/${entry.name} is not referenced by outcome.json`);
  }
  for (const source of referenced) {
    if (!source.startsWith(`${directory}/`) || source.includes("\\")) throw new Error(`${slug} ${directory} paths must be HTTPS URLs or direct ${directory}/ children`);
    const target = resolve(folder, source);
    if (dirname(target) !== root) throw new Error(`${slug} ${directory} paths must be direct ${directory}/ children`);
    const stats = await lstat(target).catch(() => undefined);
    if (!stats?.isFile() || stats.isSymbolicLink()) throw new Error(`${slug}/${source} is missing or unsupported`);
  }
}

async function validateAndResolveMedia(folder, slug, outcome) {
  const referenced = new Set();
  visitMedia(outcome.preview, (media, key) => {
    const source = media[key];
    if (typeof source !== "string" || source.trim().length === 0) throw new Error(`${slug} has an invalid preview media path`);
    if (!source.startsWith("https://")) referenced.add(source);
    media[key] = publicMediaPath(slug, source);
  });

  await validateDirectoryFiles(folder, slug, "media", referenced, MEDIA_EXTENSIONS);

  for (const directory of ["inputs", "artifacts"]) {
    const files = new Set();
    visitFiles(outcome[directory], (file, key) => {
      const source = file[key];
      if (typeof source !== "string" || source.trim().length === 0) throw new Error(`${slug} has an invalid ${directory} path`);
      if (!source.startsWith("https://")) files.add(source);
      file[key] = publicMediaPath(slug, source);
    });
    await validateDirectoryFiles(folder, slug, directory, files, FILE_EXTENSIONS);
  }
}

async function readRecords(root, kind) {
  const directory = join(root, `packages/catalog/src/${kind}`);
  const entries = await readdir(directory, { withFileTypes: true });
  const records = [];
  for (const entry of entries) {
    if (!entry.isFile() || entry.isSymbolicLink() || extname(entry.name) !== ".json") throw new Error(`${kind}/${entry.name} must be a JSON file`);
    records.push(await parseJson(join(directory, entry.name)));
  }
  return records.sort((left, right) => left.id.localeCompare(right.id));
}

export async function readOutcomeFolders(repositoryRoot) {
  const outcomesRoot = join(repositoryRoot, "packages/catalog/src/outcomes");
  const entries = await readdir(outcomesRoot, { withFileTypes: true });
  const outcomes = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || !SAFE_SLUG.test(entry.name)) throw new Error(`${entry.name} is not a valid Outcome folder`);
    const folder = join(outcomesRoot, entry.name);
    const children = await readdir(folder, { withFileTypes: true });
    for (const child of children) {
      if (!ALLOWED_ENTRIES.has(child.name)) throw new Error(`${relative(repositoryRoot, join(folder, child.name))} is not part of an Outcome`);
      if (["artifacts", "inputs", "media"].includes(child.name) ? !child.isDirectory() : !child.isFile()) throw new Error(`${entry.name}/${child.name} has the wrong type`);
    }
    if (!children.some(({ name }) => name === "outcome.json")) throw new Error(`${entry.name} requires outcome.json`);
    const outcome = await parseJson(join(folder, "outcome.json"));
    await validateAndResolveMedia(folder, entry.name, outcome);
    outcomes.push({ slug: entry.name, outcome });
  }
  if (outcomes.length === 0) throw new Error("The Outcome directory cannot be empty");
  return outcomes.sort((left, right) => left.outcome.title.localeCompare(right.outcome.title) || left.slug.localeCompare(right.slug));
}

export async function buildOutcomeArtifacts(repositoryRoot) {
  const outcomes = await readOutcomeFolders(repositoryRoot);
  const companies = await readRecords(repositoryRoot, "companies");
  const products = await readRecords(repositoryRoot, "products");
  const outcomesModule = [
    "// Generated by npm run outcomes:generate. Do not edit by hand.",
    'import type { Outcome } from "./types.js";',
    "",
    `export const rawOutcomes: Array<{ slug: string; outcome: Outcome }> = ${JSON.stringify(outcomes.map(({ slug, outcome }) => ({ slug, outcome })), null, 2)};`,
    "",
  ].join("\n");
  const productsModule = [
    "// Generated by npm run outcomes:generate. Do not edit by hand.",
    'import type { CompanyRecord, ProductRecord } from "./types.js";',
    "",
    `export const rawCompanies: CompanyRecord[] = ${JSON.stringify(companies, null, 2)};`,
    `export const rawProducts: ProductRecord[] = ${JSON.stringify(products, null, 2)};`,
    "",
  ].join("\n");
  return {
    count: outcomes.length,
    files: new Map([
      [join(repositoryRoot, "packages/catalog/src/generated-outcomes.ts"), outcomesModule],
      [join(repositoryRoot, "packages/catalog/src/generated-products.ts"), productsModule],
    ]),
  };
}

export async function applyOutcomeArtifacts(repositoryRoot, { check = false } = {}) {
  const artifacts = await buildOutcomeArtifacts(repositoryRoot);
  for (const [path, content] of artifacts.files) {
    if (check) {
      const current = await readFile(path, "utf8").catch(() => undefined);
      if (current !== content) throw new Error(`${relative(repositoryRoot, path)} is stale; run npm run outcomes:generate`);
    } else {
      await writeFile(path, content);
    }
  }
  return artifacts;
}
