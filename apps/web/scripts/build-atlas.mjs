import { existsSync } from "node:fs";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const webDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(webDirectory, "../..");
const knowledgeDirectory = resolve(repositoryRoot, "knowledge/pages");
const generatedPath = resolve(webDirectory, "src/generated-sections.ts");
const mode = process.argv.includes("--write") ? "write" : "check";

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return entry.isFile() && entry.name.endsWith(".md") ? [path] : [];
  }));
  return nested.flat().sort();
}

function slugFrom(source, file) {
  const match = source.match(/^slug:\s*([a-z0-9]+(?:-[a-z0-9]+)*)\s*$/m);
  if (!match) {
    throw new Error(`${relative(repositoryRoot, file)}: missing canonical slug`);
  }
  return match[1];
}

async function buildSectionIndex() {
  const index = {};
  for (const file of await markdownFiles(knowledgeDirectory)) {
    const section = relative(knowledgeDirectory, file).split(sep)[0];
    const slug = slugFrom(await readFile(file, "utf8"), file);
    if (index[slug]) throw new Error(`duplicate atlas slug: ${slug}`);
    index[slug] = section;
  }
  return Object.fromEntries(Object.entries(index).sort(([left], [right]) => left.localeCompare(right)));
}

function generatedModule(index) {
  const serializedIndex = JSON.stringify(index, null, 2).replaceAll("\n", "\n  ");
  return [
    "// Generated from knowledge/pages/ directory placement. Do not edit by hand.",
    "export const pageSectionBySlug: Readonly<Record<string, string>> =",
    `  Object.freeze(${serializedIndex});`,
    "",
  ].join("\n");
}

const generated = generatedModule(await buildSectionIndex());

if (mode === "write") {
  await writeFile(generatedPath, generated, "utf8");
} else if (!existsSync(generatedPath) || await readFile(generatedPath, "utf8") !== generated) {
  throw new Error("generated atlas sections are stale; run npm run generate:atlas -w @possible/web");
}
