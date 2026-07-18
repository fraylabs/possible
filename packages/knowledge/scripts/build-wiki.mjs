import { existsSync } from "node:fs";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { parseDocument } from "yaml";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(packageDir, "../..");
const defaultKnowledgeDir = resolve(repositoryRoot, "knowledge/pages");
const schemaPath = resolve(repositoryRoot, "schema/wiki-page.schema.json");
const generatedPath = resolve(packageDir, "src/generated-data.ts");
const frontmatterKeys = new Set([
  "slug",
  "title",
  "summary",
  "tags",
  "aliases",
  "kind",
  "coverage",
  "routeStatus",
  "reviewedAt",
  "sources",
]);

const args = process.argv.slice(2);
const mode = args.includes("--write")
  ? "write"
  : args.includes("--validate-only")
    ? "validate-only"
    : "check";
const knowledgeDirectoryIndex = args.indexOf("--knowledge-dir");
const knowledgeDir =
  knowledgeDirectoryIndex >= 0 && args[knowledgeDirectoryIndex + 1]
    ? resolve(process.cwd(), args[knowledgeDirectoryIndex + 1])
    : defaultKnowledgeDir;

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) return markdownFiles(path);
      return entry.isFile() && entry.name.endsWith(".md") ? [path] : [];
    }),
  );
  return nested.flat().sort();
}

const locationFor = (file) => relative(repositoryRoot, file);

function parseFrontmatter(source, file) {
  const document = parseDocument(source, { uniqueKeys: true });
  if (document.errors.length > 0) {
    throw new Error(`${locationFor(file)}: invalid YAML frontmatter: ${document.errors[0].message}`);
  }
  const metadata = document.toJS({ maxAliasCount: 0 });
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new Error(`${locationFor(file)}: frontmatter must be a YAML object`);
  }
  const unsupportedKey = Object.keys(metadata).find((key) => !frontmatterKeys.has(key));
  if (unsupportedKey) {
    throw new Error(`${locationFor(file)}: unsupported frontmatter key: ${unsupportedKey}`);
  }
  return metadata;
}

function markdownWithoutCode(body) {
  const visibleLines = [];
  let fence;
  for (const line of body.replace(/<!--[\s\S]*?-->/g, "").split("\n")) {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (marker) {
      const character = marker[1][0];
      if (!fence) fence = { character, length: marker[1].length };
      else if (
        fence.character === character &&
        marker[1].length >= fence.length &&
        line.slice(line.indexOf(marker[1]) + marker[1].length).trim() === ""
      ) fence = undefined;
      visibleLines.push("");
      continue;
    }
    if (fence) {
      visibleLines.push("");
      continue;
    }
    if (/^(?: {4}|\t)/.test(line)) {
      visibleLines.push("");
      continue;
    }

    let visible = "";
    for (let index = 0; index < line.length;) {
      if (line[index] !== "`") {
        visible += line[index];
        index += 1;
        continue;
      }
      let endOfRun = index + 1;
      while (line[endOfRun] === "`") endOfRun += 1;
      const delimiter = line.slice(index, endOfRun);
      const closing = line.indexOf(delimiter, endOfRun);
      if (closing < 0) {
        visible += delimiter;
        index = endOfRun;
      } else {
        visible += " ".repeat(closing + delimiter.length - index);
        index = closing + delimiter.length;
      }
    }
    visibleLines.push(visible);
  }
  return visibleLines.join("\n");
}

function extractLinks(body, file) {
  const links = [];
  const seen = new Set();
  const candidates = [];
  const visibleMarkdown = markdownWithoutCode(body);
  const markdownLink = /(?<![!\\])\[[^\]\n]*\]\(\s*<?([^>\s)]+)>?(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*\)/g;
  for (const match of visibleMarkdown.matchAll(markdownLink)) {
    candidates.push({ destination: match[1], index: match.index });
  }

  const normalizeReference = (label) => label.trim().replace(/\s+/g, " ").toLowerCase();
  const definitions = new Map();
  const referenceDefinition = /^\s{0,3}\[([^\]\n]+)\]:\s*<?([^>\s]+)>?(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*$/gm;
  for (const match of visibleMarkdown.matchAll(referenceDefinition)) {
    const label = normalizeReference(match[1]);
    if (!definitions.has(label)) definitions.set(label, match[2]);
  }
  const referenceLink = /(?<![!\\])\[([^\]\n]+)\]\[([^\]\n]*)\]/g;
  for (const match of visibleMarkdown.matchAll(referenceLink)) {
    const label = normalizeReference(match[2] || match[1]);
    const destination = definitions.get(label);
    if (destination) candidates.push({ destination, index: match.index });
  }
  const shortcutReference = /(?<![!\\\]])\[([^\]\n]+)\](?![\[(:])/g;
  for (const match of visibleMarkdown.matchAll(shortcutReference)) {
    const destination = definitions.get(normalizeReference(match[1]));
    if (destination) candidates.push({ destination, index: match.index });
  }

  for (const { destination } of candidates.sort((left, right) => left.index - right.index)) {
    if (!destination.startsWith("/wiki/")) continue;
    const canonical = destination.match(/^\/wiki\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
    if (!canonical) {
      throw new Error(`${locationFor(file)}: internal link must use /wiki/<slug>: ${destination}`);
    }
    const slug = canonical[1];
    if (!seen.has(slug)) {
      seen.add(slug);
      links.push(slug);
    }
  }
  return links;
}

function assertNonemptyText(page, file) {
  const errors = [];
  for (const field of ["title", "summary", "body"]) {
    if (!page[field].trim()) errors.push(`${field} must contain non-whitespace text`);
  }
  page.tags.forEach((tag, index) => {
    if (!tag.trim()) errors.push(`tags/${index} must contain non-whitespace text`);
  });
  (page.aliases ?? []).forEach((alias, index) => {
    if (!alias.trim()) errors.push(`aliases/${index} must contain non-whitespace text`);
  });
  (page.coverage ?? []).forEach((scope, index) => {
    if (!scope.trim()) errors.push(`coverage/${index} must contain non-whitespace text`);
  });
  if (page.routeStatus && page.kind !== "outcome") {
    errors.push("routeStatus requires kind: outcome");
  }
  page.sources.forEach((source, index) => {
    if (!source.title.trim()) errors.push(`sources/${index}/title must contain non-whitespace text`);
  });
  if (errors.length > 0) throw new Error(`${locationFor(file)} failed semantic validation:\n${errors.join("\n")}`);
}

async function parsePage(file) {
  const source = (await readFile(file, "utf8")).replace(/^\uFEFF/, "");
  const lines = source.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") {
    throw new Error(`${locationFor(file)}: Markdown page must start with --- frontmatter`);
  }
  const closing = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  if (closing < 0) throw new Error(`${locationFor(file)}: frontmatter is missing its closing ---`);
  const metadata = parseFrontmatter(lines.slice(1, closing).join("\n"), file);
  const body = lines.slice(closing + 1).join("\n").trim();
  return {
    ...metadata,
    body,
    links: extractLinks(body, file),
  };
}

const printableErrors = (errors) =>
  (errors ?? [])
    .map((error) => `${error.instancePath || "/"} ${error.message ?? "is invalid"}`)
    .sort()
    .join("\n");

function assertCorpusIntegrity(parsedPages) {
  const errors = [];
  const bySlug = new Map();
  for (const { file, page } of parsedPages) {
    const previous = bySlug.get(page.slug);
    if (previous) {
      errors.push(`duplicate page slug: ${page.slug} (${previous.file} and ${file})`);
    } else {
      bySlug.set(page.slug, { file, page });
    }
  }
  for (const { file, page } of parsedPages) {
    for (const target of page.links) {
      if (!bySlug.has(target)) errors.push(`${file}: broken internal link: /wiki/${target}`);
    }
  }
  if (errors.length > 0) throw new Error(errors.sort().join("\n"));
  return {
    pages: parsedPages
      .map(({ page }) => page)
      .sort((left, right) => left.slug < right.slug ? -1 : left.slug > right.slug ? 1 : 0),
  };
}

function generatedModule(corpus) {
  return [
    "// Generated from contributor-authored Markdown in knowledge/pages/. Do not edit by hand.",
    'import type { WikiCorpus } from "./types.js";',
    "",
    `export const wikiCorpusData: WikiCorpus = ${JSON.stringify(corpus, null, 2)};`,
    "",
  ].join("\n");
}

export async function compileWiki(directory = knowledgeDir) {
  const schema = JSON.parse(await readFile(schemaPath, "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const files = await markdownFiles(directory);
  if (files.length === 0) throw new Error(`no Markdown wiki pages found in ${directory}`);

  const parsedPages = [];
  for (const file of files) {
    const page = await parsePage(file);
    if (!validate(page)) {
      throw new Error(`${locationFor(file)} failed schema validation:\n${printableErrors(validate.errors)}`);
    }
    assertNonemptyText(page, file);
    for (const source of page.sources) {
      let url;
      try {
        url = new URL(source.url);
      } catch {
        throw new Error(`${locationFor(file)}: source URL is invalid: ${source.url}`);
      }
      if (url.protocol !== "https:" || !url.hostname) {
        throw new Error(`${locationFor(file)}: source URL must use HTTPS with a hostname: ${source.url}`);
      }
    }
    parsedPages.push({ file: locationFor(file), page });
  }

  return assertCorpusIntegrity(parsedPages);
}

async function main() {
  const corpus = await compileWiki(knowledgeDir);
  const generated = generatedModule(corpus);
  if (mode === "write") {
    await writeFile(generatedPath, generated, "utf8");
  } else if (mode === "check") {
    if (!existsSync(generatedPath)) {
      throw new Error("generated wiki data is missing; run npm run generate -w @possible/knowledge");
    }
    const current = await readFile(generatedPath, "utf8");
    if (current !== generated) {
      throw new Error("generated wiki data is stale; run npm run generate -w @possible/knowledge");
    }
  }

  const linkCount = corpus.pages.reduce((total, page) => total + page.links.length, 0);
  process.stdout.write(
    `Validated ${corpus.pages.length} pages and ${linkCount} internal links from ${corpus.pages.length} Markdown files.\n`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
