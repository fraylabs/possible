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
  "AI made execution accessible. Possible makes operational judgment accessible.",
  "",
  "Possible.sh is an open-source library of Outcome Packs for Codex.",
  "",
  "Each pack combines a reusable execution prompt, selected agent skills, sequencing, safeguards, and completion checks for one outcome.",
  "",
  "- Human documentation: /docs/",
  "- Benchmark gallery: /benchmarks/",
  "- Recorded outcome demos: /demo/",
  "- Controlled-pilot evidence: /benchmarks/outcome-v1/public-proof.md",
  "- Pack catalog: /packs/",
  "- Pack index: /packs/index.json",
  ...outcomePacks.flatMap((pack) => [
    `- ${pack.name}: /packs/${pack.slug}.json`,
    `  - Outcome Pack page: /packs/${pack.slug}/`,
    `  - Install commands: /packs/${pack.slug}/install.txt`,
    `  - Compiled run prompt: /packs/${pack.slug}/run.txt`,
  ]),
  "- Source: https://github.com/fraylabs/possible",
  "",
  "Review every external agent skill before installation. Approving an Outcome Pack run does not authorize deployment, spending, outreach, fabrication, publishing, or unsupported real-world claims.",
  "",
].join("\n"));

await write("robots.txt", "User-agent: *\nAllow: /\nSitemap: https://possible.sh/sitemap.xml\n");
