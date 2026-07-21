import { mkdir, writeFile } from "node:fs/promises";
import { compilePack, outcomePacks } from "@possible/packs";

const featuredSlugs = new Set(["hardware-launch", "robot-prototype", "playable-web-game", "web-presentation"]);
const featuredPacks = outcomePacks.filter((pack) => featuredSlugs.has(pack.slug));

const outputRoot = new URL("../out/", import.meta.url);
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const write = async (relativePath, contents) => {
  const target = new URL(relativePath, outputRoot);
  await mkdir(new URL("./", target), { recursive: true });
  await writeFile(target, contents);
};

for (const pack of featuredPacks) {
  const compiled = compilePack(pack);
  await write(`packs/${pack.slug}.json`, json(compiled));
  await write(`packs/${pack.slug}/install.txt`, `${compiled.installCommands.join("\n")}\n`);
  await write(`packs/${pack.slug}/run.txt`, `${compiled.runPrompt}\n`);
}

await write("packs/index.json", json({
  schemaVersion: 1,
  packs: featuredPacks.map(({ slug, lane, name, promise, summary, reviewedAt }) => ({
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
  "- Outcome demos: /demo/",
  "- Pack catalog: /packs/",
  "- Pack index: /packs/index.json",
  ...featuredPacks.flatMap((pack) => [
    `- ${pack.name}: /packs/${pack.slug}.json`,
    `  - Outcome Pack page: /packs/${pack.slug}/`,
    `  - Install commands: /packs/${pack.slug}/install.txt`,
    `  - Compiled run prompt: /packs/${pack.slug}/run.txt`,
  ]),
  "- GitHub: https://github.com/fraylabs/possible",
  "",
  "Review every external agent skill before installation. Approving an Outcome Pack run does not authorize deployment, spending, outreach, fabrication, publishing, or unsupported real-world claims.",
  "",
].join("\n"));

await write("robots.txt", "User-agent: *\nAllow: /\nSitemap: https://possible.sh/sitemap.xml\n");
