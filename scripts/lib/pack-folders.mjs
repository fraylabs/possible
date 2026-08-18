import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";

const SAFE_SLUG = /^[a-z0-9][a-z0-9-]*$/;
const ALLOWED_PACK_ENTRIES = new Set(["discovery.json", "media", "pack.json", "showcase.json"]);
const SHOWCASE_KEYS = new Set(["schemaVersion", "description", "images", "video", "cad"]);
const IMAGE_KEYS = new Set(["src", "alt", "caption", "cover", "evidenceRef"]);
const VIDEO_KEYS = new Set(["src", "poster", "caption", "evidenceRef"]);
const CAD_KEYS = new Set(["preview", "poster", "caption", "downloads", "evidenceRef"]);
const CAD_DOWNLOAD_KEYS = new Set(["src", "format", "label"]);
const IMAGE_EXTENSIONS = new Set([".avif", ".jpeg", ".jpg", ".png", ".webp"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm"]);
const CAD_PREVIEW_EXTENSIONS = new Set([".glb"]);
const CAD_DOWNLOAD_EXTENSIONS = new Set([".3mf", ".step", ".stl"]);
const MEDIA_SIZE_LIMITS = { image: 2_000_000, video: 25_000_000, cad: 15_000_000 };
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const draftTemplatePath = new URL("../../packages/packs/src/draft-pack.json", import.meta.url);

const readJson = async (path, context) => {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    throw new Error(`${context} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const asObject = (value, context) => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${context} must be a JSON object`);
  return value;
};

const optionalString = (value, context) => {
  if (value === undefined) return;
  if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${context} must be a non-empty string`);
};

const exactKeys = (record, allowed, context) => {
  for (const key of Object.keys(record)) if (!allowed.has(key)) throw new Error(`${context}.${key} is not supported`);
};

const publicMediaPath = (slug, source) => source.startsWith("https://") ? source : `/pack-media/${slug}/${source}`;

async function validateLocalMedia(folder, source, context, kind, extensions, referencedMedia) {
  if (typeof source !== "string" || source.trim().length === 0) throw new Error(`${context} must be a non-empty string`);
  if (source.startsWith("https://")) return source;
  if (!source.startsWith("media/") || source.includes("\\")) throw new Error(`${context} must be an https URL or a path inside media/`);
  const mediaRoot = resolve(folder, "media");
  const target = resolve(folder, source);
  if (dirname(target) !== mediaRoot) throw new Error(`${context} must reference a direct child of media/`);
  const stats = await lstat(target).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    throw error;
  });
  if (!stats?.isFile() || stats.isSymbolicLink()) throw new Error(`${context} references a missing or unsupported media file`);
  const extension = extname(target).toLowerCase();
  if (!extensions.has(extension)) throw new Error(`${context} uses unsupported ${kind} format ${extension || "(none)"}`);
  if (stats.size > MEDIA_SIZE_LIMITS[kind]) throw new Error(`${context} exceeds the ${Math.round(MEDIA_SIZE_LIMITS[kind] / 1_000_000)} MB local ${kind} limit`);
  referencedMedia.add(source.slice("media/".length));
  return source;
}

async function validateShowcase(folder, slug, source, context) {
  const showcase = asObject(source, context);
  exactKeys(showcase, SHOWCASE_KEYS, context);
  if (showcase.schemaVersion !== 1) throw new Error(`${context}.schemaVersion must be 1`);
  optionalString(showcase.description, `${context}.description`);
  const referencedMedia = new Set();
  const images = showcase.images ?? [];
  if (!Array.isArray(images) || images.length > 5) throw new Error(`${context}.images must contain at most five images`);
  let coverCount = 0;
  const resolvedImages = [];
  for (const [index, value] of images.entries()) {
    const image = asObject(value, `${context}.images[${index}]`);
    exactKeys(image, IMAGE_KEYS, `${context}.images[${index}]`);
    optionalString(image.alt, `${context}.images[${index}].alt`);
    if (image.alt === undefined) throw new Error(`${context}.images[${index}].alt is required`);
    optionalString(image.caption, `${context}.images[${index}].caption`);
    optionalString(image.evidenceRef, `${context}.images[${index}].evidenceRef`);
    if (image.cover !== undefined && typeof image.cover !== "boolean") throw new Error(`${context}.images[${index}].cover must be true or false`);
    if (image.cover) coverCount += 1;
    const src = await validateLocalMedia(folder, image.src, `${context}.images[${index}].src`, "image", IMAGE_EXTENSIONS, referencedMedia);
    resolvedImages.push({ ...image, src: publicMediaPath(slug, src) });
  }
  if (coverCount > 1) throw new Error(`${context}.images may mark only one cover`);

  let resolvedVideo;
  if (showcase.video !== undefined) {
    const video = asObject(showcase.video, `${context}.video`);
    exactKeys(video, VIDEO_KEYS, `${context}.video`);
    optionalString(video.caption, `${context}.video.caption`);
    optionalString(video.evidenceRef, `${context}.video.evidenceRef`);
    const src = await validateLocalMedia(folder, video.src, `${context}.video.src`, "video", VIDEO_EXTENSIONS, referencedMedia);
    const poster = await validateLocalMedia(folder, video.poster, `${context}.video.poster`, "image", IMAGE_EXTENSIONS, referencedMedia);
    resolvedVideo = { ...video, src: publicMediaPath(slug, src), poster: publicMediaPath(slug, poster) };
  }

  let resolvedCad;
  if (showcase.cad !== undefined) {
    const cad = asObject(showcase.cad, `${context}.cad`);
    exactKeys(cad, CAD_KEYS, `${context}.cad`);
    optionalString(cad.caption, `${context}.cad.caption`);
    optionalString(cad.evidenceRef, `${context}.cad.evidenceRef`);
    const downloads = cad.downloads ?? [];
    if (!Array.isArray(downloads)) throw new Error(`${context}.cad.downloads must be an array`);
    if (cad.preview === undefined && downloads.length === 0) throw new Error(`${context}.cad requires a preview or at least one download`);
    if (cad.preview !== undefined && cad.poster === undefined) throw new Error(`${context}.cad.poster is required with a preview`);
    const preview = cad.preview === undefined ? undefined : await validateLocalMedia(folder, cad.preview, `${context}.cad.preview`, "cad", CAD_PREVIEW_EXTENSIONS, referencedMedia);
    const poster = cad.poster === undefined ? undefined : await validateLocalMedia(folder, cad.poster, `${context}.cad.poster`, "image", IMAGE_EXTENSIONS, referencedMedia);
    const resolvedDownloads = [];
    for (const [index, value] of downloads.entries()) {
      const download = asObject(value, `${context}.cad.downloads[${index}]`);
      exactKeys(download, CAD_DOWNLOAD_KEYS, `${context}.cad.downloads[${index}]`);
      if (!new Set(["step", "stl", "3mf"]).has(download.format)) throw new Error(`${context}.cad.downloads[${index}].format is unsupported`);
      optionalString(download.label, `${context}.cad.downloads[${index}].label`);
      const src = await validateLocalMedia(folder, download.src, `${context}.cad.downloads[${index}].src`, "cad", CAD_DOWNLOAD_EXTENSIONS, referencedMedia);
      resolvedDownloads.push({ ...download, src: publicMediaPath(slug, src) });
    }
    resolvedCad = { ...cad };
    if (preview !== undefined) resolvedCad.preview = publicMediaPath(slug, preview);
    if (poster !== undefined) resolvedCad.poster = publicMediaPath(slug, poster);
    if (resolvedDownloads.length > 0) resolvedCad.downloads = resolvedDownloads;
  }

  const mediaPath = join(folder, "media");
  const mediaStats = await lstat(mediaPath).catch((error) => error?.code === "ENOENT" ? undefined : Promise.reject(error));
  if (mediaStats) {
    if (!mediaStats.isDirectory() || mediaStats.isSymbolicLink()) throw new Error(`${context} media must be a real directory`);
    const entries = await readdir(mediaPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || entry.isSymbolicLink()) throw new Error(`${context} media may contain files only`);
      if (!referencedMedia.has(entry.name)) throw new Error(`${context} leaves unreferenced media/${entry.name}`);
    }
  }

  if (showcase.description === undefined && resolvedImages.length === 0 && resolvedVideo === undefined && resolvedCad === undefined) {
    throw new Error(`${context} must contain a description or showcase media`);
  }
  const resolvedShowcase = { schemaVersion: 1 };
  if (showcase.description !== undefined) resolvedShowcase.description = showcase.description;
  if (resolvedImages.length > 0) resolvedShowcase.images = resolvedImages;
  if (resolvedVideo !== undefined) resolvedShowcase.video = resolvedVideo;
  if (resolvedCad !== undefined) resolvedShowcase.cad = resolvedCad;
  return resolvedShowcase;
}

const defaultTrust = (slug) => ({
  schemaVersion: 1,
  id: `fraylabs/possible/${slug}`,
  status: "experimental",
  evidence: [],
  reason: "Bundled pack is experimental pending accepted run evidence.",
});

const comparePacks = (left, right) => left.pack.name.localeCompare(right.pack.name)
  || left.slug.localeCompare(right.slug);

async function readRegistryRecords(repositoryRoot, directory, kind) {
  const root = join(repositoryRoot, `packages/packs/src/${directory}`);
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
  const records = [];
  for (const entry of entries) {
    if (!entry.isFile() || entry.isSymbolicLink() || extname(entry.name) !== ".json") {
      throw new Error(`${relative(repositoryRoot, join(root, entry.name))} must be a JSON file`);
    }
    const path = join(root, entry.name);
    const record = asObject(await readJson(path, relative(repositoryRoot, path)), relative(repositoryRoot, path));
    optionalString(record.id, `${relative(repositoryRoot, path)}.id`);
    if (record.id === undefined) throw new Error(`${relative(repositoryRoot, path)}.id is required`);
    const expectedName = kind === "company" ? `${record.id}.json` : `${record.id.replace("/", "--")}.json`;
    if (entry.name !== expectedName) throw new Error(`${relative(repositoryRoot, path)} must be named ${expectedName}`);
    records.push({ file: entry.name, record });
  }
  return records.sort((left, right) => left.record.id.localeCompare(right.record.id));
}

export async function readPackFolders(repositoryRoot, { excludeSlugs = [] } = {}) {
  const packsRoot = join(repositoryRoot, "packages/packs/src/packs");
  const entries = await readdir(packsRoot, { withFileTypes: true });
  const excluded = new Set(excludeSlugs);
  const folders = [];

  for (const entry of entries) {
    if (excluded.has(entry.name)) continue;
    if (!entry.isDirectory()) throw new Error(`${relative(repositoryRoot, join(packsRoot, entry.name))} must be a pack folder`);
    if (!SAFE_SLUG.test(entry.name)) throw new Error(`${entry.name} is not a valid pack folder slug`);
    const folder = join(packsRoot, entry.name);
    const children = await readdir(folder, { withFileTypes: true });
    for (const child of children) {
      if (!ALLOWED_PACK_ENTRIES.has(child.name)) throw new Error(`${relative(repositoryRoot, join(folder, child.name))} is not part of the pack-folder contract`);
      if (child.name === "media" ? !child.isDirectory() : !child.isFile()) throw new Error(`${relative(repositoryRoot, join(folder, child.name))} has the wrong entry type`);
    }

    const packPath = join(folder, "pack.json");
    const raw = await readFile(packPath);
    const pack = JSON.parse(raw.toString("utf8"));

    const discoveryPath = join(folder, "discovery.json");
    const discoveryEntry = children.find(({ name }) => name === "discovery.json");
    const discovery = discoveryEntry ? await readJson(discoveryPath, relative(repositoryRoot, discoveryPath)) : undefined;
    if (discovery === undefined) throw new Error(`${entry.name} requires discovery.json`);
    if (discovery !== undefined) {
      if (discovery.schemaVersion !== 1 || !Array.isArray(discovery.cases)) throw new Error(`${relative(repositoryRoot, discoveryPath)} must contain schemaVersion 1 and cases`);
      if (discovery.cases.length !== 4) throw new Error(`${entry.name} must own exactly four selection cases`);
      for (const testCase of discovery.cases) {
        if (testCase.decision !== "select" || !Array.isArray(testCase.intended) || testCase.intended.length !== 1 || testCase.intended[0] !== entry.name) {
          throw new Error(`${entry.name} discovery cases must select only their owning pack`);
        }
      }
    }
    const showcasePath = join(folder, "showcase.json");
    const showcaseEntry = children.find(({ name }) => name === "showcase.json");
    const showcase = showcaseEntry
      ? await validateShowcase(folder, entry.name, await readJson(showcasePath, relative(repositoryRoot, showcasePath)), relative(repositoryRoot, showcasePath))
      : undefined;
    if (!showcaseEntry && children.some(({ name }) => name === "media")) throw new Error(`${entry.name}/media requires showcase.json`);
    folders.push({ slug: entry.name, folder, packPath, raw, pack, showcase, discoveryCases: discovery?.cases ?? [] });
  }

  if (folders.length === 0) throw new Error("The bundled pack folder cannot be empty");
  return folders.sort(comparePacks);
}

export async function buildPackArtifacts(repositoryRoot) {
  const folders = await readPackFolders(repositoryRoot);
  const companies = await readRegistryRecords(repositoryRoot, "companies", "company");
  const products = await readRegistryRecords(repositoryRoot, "products", "product");
  const bundledSlugs = new Set(folders.map(({ slug }) => slug));
  const trustSourcePath = join(repositoryRoot, "registry/bundled-trust.json");
  const currentTrust = await readJson(trustSourcePath, relative(repositoryRoot, trustSourcePath));
  if (currentTrust === null || typeof currentTrust !== "object" || Array.isArray(currentTrust)) {
    throw new Error(`${relative(repositoryRoot, trustSourcePath)} must be a JSON object keyed by bundled pack slug`);
  }
  const orphanedTrust = Object.keys(currentTrust).filter((slug) => !bundledSlugs.has(slug));
  if (orphanedTrust.length > 0) throw new Error(`Bundled trust records reference missing packs: ${orphanedTrust.join(", ")}`);
  const catalogCasesPath = join(repositoryRoot, "evaluations/discovery/catalog-cases.json");
  const catalogCases = await readJson(catalogCasesPath, relative(repositoryRoot, catalogCasesPath));
  if (catalogCases.schemaVersion !== 1 || !Array.isArray(catalogCases.cases)) throw new Error("catalog-cases.json must contain schemaVersion 1 and cases");
  if (catalogCases.cases.some(({ decision }) => decision === "select")) throw new Error("Pack selection cases belong in their pack folders");
  const imports = folders.map(({ slug }, index) => `import pack${index} from "./packs/${slug}/pack.json" with { type: "json" };`);
  const generatedModule = [
    "// Generated by npm run packs:generate. Do not edit by hand.",
    ...imports,
    "",
    `export const rawBundledPacks: Array<{ slug: string; pack: unknown }> = [${folders.map(({ slug }, index) => `{ slug: ${JSON.stringify(slug)}, pack: pack${index} }`).join(", ")}];`,
    "",
  ].join("\n");
  const generatedShowcases = [
    "// Generated by npm run packs:generate. Do not edit by hand.",
    'import type { PackShowcase } from "./types.js";',
    "",
    "const definePackShowcases = (showcases: Readonly<Record<string, PackShowcase>>) => showcases;",
    "",
    `export const bundledPackShowcases = definePackShowcases(${JSON.stringify(Object.fromEntries(folders.filter(({ showcase }) => showcase !== undefined).map(({ slug, showcase }) => [slug, showcase])), null, 2)});`,
    "",
  ].join("\n");
  const generatedProducts = [
    "// Generated by npm run packs:generate. Do not edit by hand.",
    'import type { CompanyRecord, ProductRecord } from "./types.js";',
    "",
    `export const rawCompanies: CompanyRecord[] = ${JSON.stringify(companies.map(({ record }) => record), null, 2)};`,
    `export const rawProducts: ProductRecord[] = ${JSON.stringify(products.map(({ record }) => record), null, 2)};`,
    "",
  ].join("\n");

  const snapshots = {};
  const trust = {};
  const discoveryCases = [];
  for (const { slug, raw, discoveryCases: packCases } of folders) {
    const contentHash = `sha256:${createHash("sha256").update(raw).digest("hex")}`;
    snapshots[slug] = {
      schemaVersion: 1,
      id: `fraylabs/possible/${slug}`,
      source: "package:@possible/packs",
      revision: contentHash,
      path: `packs/${slug}/pack.json`,
      contentHash,
    };
    const trustRecord = currentTrust[slug] ?? defaultTrust(slug);
    if (trustRecord.id !== `fraylabs/possible/${slug}`) throw new Error(`Trust identity for ${slug} does not match its folder`);
    trust[slug] = trustRecord;
    discoveryCases.push(...packCases);
  }
  discoveryCases.push(...catalogCases.cases);
  const ids = discoveryCases.map(({ id }) => id);
  if (ids.some((id) => typeof id !== "string") || new Set(ids).size !== ids.length) throw new Error("Discovery case ids must be present and unique");
  for (const testCase of discoveryCases) {
    for (const slug of [testCase.intended, testCase.acceptable, testCase.mustNotRecommend].flat().filter(Boolean)) {
      if (!bundledSlugs.has(slug)) throw new Error(`Discovery case ${testCase.id} references missing pack ${slug}`);
    }
  }

  return {
    count: folders.length,
    activeCount: folders.length,
    files: new Map([
      ["packages/packs/src/generated-manifests.ts", generatedModule],
      ["packages/packs/src/generated-showcases.ts", generatedShowcases],
      ["packages/packs/src/generated-products.ts", generatedProducts],
      ["packages/packs/src/bundled-snapshots.json", json(snapshots)],
      ["packages/packs/src/bundled-trust.json", json(trust)],
      ["evaluations/discovery/cases.json", json({ schemaVersion: 1, cases: discoveryCases })],
    ]),
  };
}

export async function applyPackArtifacts(repositoryRoot, { check = false } = {}) {
  const artifacts = await buildPackArtifacts(repositoryRoot);
  const stale = [];
  for (const [relativePath, expected] of artifacts.files) {
    const target = join(repositoryRoot, relativePath);
    if (check) {
      let actual;
      try {
        actual = await readFile(target, "utf8");
      } catch {
        actual = undefined;
      }
      if (actual !== expected) stale.push(relativePath);
      continue;
    }
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, expected, "utf8");
  }
  if (stale.length > 0) throw new Error(`Generated pack artifacts are stale: ${stale.join(", ")}. Run npm run packs:generate.`);
  return artifacts;
}

export async function createPackFolder(repositoryRoot, slug) {
  if (!SAFE_SLUG.test(slug)) throw new Error("Pack slug must be lowercase and hyphenated");
  const packsRoot = resolve(repositoryRoot, "packages/packs/src/packs");
  const folder = resolve(packsRoot, slug);
  if (dirname(folder) !== packsRoot) throw new Error("Refusing to create a pack outside the bundled pack root");
  const name = slug.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
  const draft = { ...await readJson(draftTemplatePath, "draft pack template"), name };
  await mkdir(folder);
  await writeFile(join(folder, "pack.json"), json(draft), { flag: "wx" });
  await writeFile(join(folder, "discovery.json"), json({ schemaVersion: 1, cases: [] }), { flag: "wx" });
  return folder;
}

export async function removePackFolder(repositoryRoot, slug) {
  if (!SAFE_SLUG.test(slug)) throw new Error("Pack slug must be lowercase and hyphenated");
  const packsRoot = resolve(repositoryRoot, "packages/packs/src/packs");
  const target = resolve(packsRoot, slug);
  if (dirname(target) !== packsRoot) throw new Error("Refusing to remove a pack outside the bundled pack root");
  const stats = await lstat(target).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    throw error;
  });
  if (!stats) throw new Error(`Pack does not exist: ${slug}`);
  if (!stats.isDirectory() || stats.isSymbolicLink()) throw new Error(`Pack path is not a real directory: ${slug}`);
  await readJson(join(target, "pack.json"), `${slug}/pack.json`);
  const folders = await readPackFolders(repositoryRoot, { excludeSlugs: [slug] });
  const references = [];
  for (const folder of folders) {
    if (folder.slug === slug) continue;
    for (const testCase of folder.discoveryCases) {
      if ([testCase.intended, testCase.acceptable, testCase.mustNotRecommend].flat().includes(slug)) references.push(`${folder.slug}/discovery.json case ${testCase.id}`);
    }
  }
  const catalogCases = await readJson(join(repositoryRoot, "evaluations/discovery/catalog-cases.json"), "catalog-cases.json");
  for (const testCase of catalogCases.cases ?? []) {
    if ([testCase.intended, testCase.acceptable, testCase.mustNotRecommend].flat().includes(slug)) references.push(`catalog-cases.json case ${testCase.id}`);
  }
  if (references.length > 0) throw new Error(`Pack ${slug} is still referenced by: ${references.join(", ")}`);
  const trustSourcePath = join(repositoryRoot, "registry/bundled-trust.json");
  const trustSource = await readJson(trustSourcePath, relative(repositoryRoot, trustSourcePath));
  if (trustSource === null || typeof trustSource !== "object" || Array.isArray(trustSource)) {
    throw new Error(`${relative(repositoryRoot, trustSourcePath)} must be a JSON object keyed by bundled pack slug`);
  }
  if (slug in trustSource) {
    delete trustSource[slug];
    await writeFile(trustSourcePath, json(trustSource), "utf8");
  }
  await rm(target, { recursive: true });
  return target;
}
