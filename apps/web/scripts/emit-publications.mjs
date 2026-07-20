import { mkdir, writeFile } from "node:fs/promises";
import { compilePack, outcomePacks } from "@possible/packs";

const outputRoot = new URL("../out/", import.meta.url);
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const write = async (relativePath, contents) => {
  const target = new URL(relativePath, outputRoot);
  await mkdir(new URL("./", target), { recursive: true });
  await writeFile(target, contents);
};

for (const pack of outcomePacks) {
  const compiled = compilePack(pack);
  await write(`packs/${pack.slug}.json`, json(compiled));
  await write(`packs/${pack.slug}/install.txt`, `${compiled.installCommands.join("\n")}\n`);
  await write(`packs/${pack.slug}/run.txt`, `${compiled.runPrompt}\n`);
}

await write("packs/index.json", json({
  schemaVersion: 1,
  packs: outcomePacks.map(({ catalogNumber, slug, lane, name, promise, summary, reviewedAt }) => ({
    catalogNumber,
    slug,
    lane,
    name,
    promise,
    summary,
    reviewedAt,
  })),
}));

await write("llms.txt", [
  "# Possible",
  "",
  "Possible is an outcome skill for Codex. Its packs compile dozens of coordinated tasks, specialist skills, and verification gates into one approved run.",
  "",
  "Skills are ingredients. Possible compiles the outcome.",
  "",
  "- Human documentation: /docs/",
  "- Pack catalog: /packs/",
  "- Pack index: /packs/index.json",
  ...outcomePacks.flatMap((pack) => [
    `- ${pack.name}: /packs/${pack.slug}.json`,
    `  - Human recipe: /packs/${pack.slug}/`,
    `  - Install commands: /packs/${pack.slug}/install.txt`,
    `  - Compiled run prompt: /packs/${pack.slug}/run.txt`,
  ]),
  "- Source: https://github.com/fraylabs/possible",
  "",
  "Review every external skill source before installation. A Possible pack does not authorize deployment, spending, outreach, fabrication, publishing, or unsupported real-world claims.",
  "",
].join("\n"));

await write("robots.txt", "User-agent: *\nAllow: /\nSitemap: https://possible.sh/sitemap.xml\n");
