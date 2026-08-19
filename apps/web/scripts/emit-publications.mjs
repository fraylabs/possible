import { mkdir, writeFile } from "node:fs/promises";
import { outcomeCatalog } from "@possible/catalog";

const outputRoot = new URL("../out/", import.meta.url);
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const write = async (relativePath, contents) => {
  const target = new URL(relativePath, outputRoot);
  await mkdir(new URL("./", target), { recursive: true });
  await writeFile(target, contents);
};

for (const entry of outcomeCatalog) {
  await write(`outcomes/${entry.slug}.json`, json({ slug: entry.slug, ...entry.outcome, products: entry.products }));
  await write(`outcomes/${entry.slug}/original-prompt.txt`, `${entry.outcome.originalPrompt}\n`);
  await write(`outcomes/${entry.slug}/execution-prompt.txt`, `${entry.outcome.executionPrompt}\n`);
}

await write("outcomes/index.json", json({
  schemaVersion: 2,
  outcomes: outcomeCatalog.map((entry) => ({
    slug: entry.slug,
    route: `/outcomes/${entry.slug}`,
    title: entry.outcome.title,
    summary: entry.outcome.summary,
    originalPrompt: entry.outcome.originalPrompt,
    execution: entry.outcome.execution,
    author: entry.outcome.author,
    products: entry.products.map(({ id, name, company }) => ({ id, name, company: company.name })),
    skills: entry.outcome.skills ?? [],
    preview: entry.outcome.preview,
  })),
}));

await write("llms.txt", [
  "# Possible",
  "",
  "Possible is an open-source directory connecting rough original prompts, full execution prompts, execution provenance, and representative outcomes.",
  "",
  "Every Outcome has a title, summary, original prompt, full execution prompt, execution provenance, and author. Products, Skills, images, video, audio, and CAD are optional context. Published records remain unchanged.",
  "",
  "- Homepage and Outcome directory: https://possible.sh/",
  "- Human documentation: /docs/",
  "- Machine-readable Outcome index: /outcomes/index.json",
  ...outcomeCatalog.flatMap((entry) => [
    `- ${entry.outcome.title}: /outcomes/${entry.slug}.json`,
    `  - Web page: /outcomes/${entry.slug}/`,
    `  - Original prompt: /outcomes/${entry.slug}/original-prompt.txt`,
    `  - Execution prompt: /outcomes/${entry.slug}/execution-prompt.txt`,
  ]),
  "- Products: /products/",
  "- GitHub: https://github.com/fraylabs/possible",
  "",
].join("\n"));

await write("robots.txt", "User-agent: *\nAllow: /\nSitemap: https://possible.sh/sitemap.xml\n");
