import { mkdir, writeFile } from "node:fs/promises";
import { compilePack, getPackShowcase, publicCatalog } from "@possible/packs";

const outputRoot = new URL("../out/", import.meta.url);
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const publicationKey = (entry) => entry.origin.kind === "bundled" ? entry.slug : entry.id;
const write = async (relativePath, contents) => {
  const target = new URL(relativePath, outputRoot);
  await mkdir(new URL("./", target), { recursive: true });
  await writeFile(target, contents);
};

for (const entry of publicCatalog) {
  const { pack } = entry;
  const key = publicationKey(entry);
  const compiled = compilePack(pack);
  await write(`packs/${key}.json`, json({
    ...compiled,
    showcase: getPackShowcase(entry.slug) ?? null,
    catalog: {
      id: entry.id,
      status: entry.trust.status,
      source: entry.sourceRecord,
      snapshotRef: entry.snapshotRef,
      acceptedEvidenceCount: entry.acceptedEvidenceCount,
      acceptedEvidenceSummary: entry.acceptedEvidenceSummary,
    },
  }));
  await write(`packs/${key}/install.txt`, `${compiled.installCommands.join("\n")}\n`);
  await write(`packs/${key}/run.txt`, `${compiled.runPrompt}\n`);
}

await write("packs/index.json", json({
  schemaVersion: 1,
  packs: publicCatalog.map((entry) => ({
    id: entry.id,
    route: `/packs/${publicationKey(entry)}`,
    source: entry.sourceRecord,
    snapshotRef: entry.snapshotRef,
    trust: entry.trust,
    acceptedEvidenceCount: entry.acceptedEvidenceCount,
    acceptedEvidenceSummary: entry.acceptedEvidenceSummary,
    slug: entry.slug,
    name: entry.pack.name,
    promise: entry.pack.promise,
    status: entry.trust.status,
    contentHash: entry.sourceRecord.contentHash,
    showcase: getPackShowcase(entry.slug) ?? null,
  })),
}));

await write("llms.txt", [
  "# Possible",
  "",
  "Agents can do far more than most people know to ask for. Possible is an open-source library of Outcome Packs that shows what is possible and gives an agent a proven starting contract for making it real.",
  "",
  "Each Outcome Pack has two required authoring primitives: one structured prompt and an Expectations checklist. Specialized Skills are optional and use the standard Skills installer when present. The compiler appends the checklist plus one proportional-check rule without inventing a workflow or verification framework.",
  "",
  "Showcase media is optional and illustrative. Images, video, and CAD help a person understand the kind of outcome a pack can produce; they are not run evidence and do not make a pack verified.",
  "",
  "- Homepage: https://possible.sh/",
  "- Outcome Pack library: /#packs",
  "- Human documentation: /docs/",
  "- Machine-readable pack index: /packs/index.json",
  ...publicCatalog.flatMap((entry) => {
    const key = publicationKey(entry);
    const links = [
      `- ${entry.pack.name} [${entry.trust.status}]: /packs/${key}.json`,
      `  - Outcome Pack page: /packs/${key}/`,
    ];
    links.push(`  - Install commands: /packs/${key}/install.txt`, `  - Compiled run prompt: /packs/${key}/run.txt`);
    return links;
  }),
  "- GitHub: https://github.com/fraylabs/possible",
  "- npm: https://www.npmjs.com/package/@fraylabs/possible",
  "",
  "Review every external agent skill before installation. Approving an Outcome Pack run does not authorize deployment, spending, outreach, fabrication, publishing, or unsupported real-world claims.",
  "",
].join("\n"));

await write("robots.txt", "User-agent: *\nAllow: /\nSitemap: https://possible.sh/sitemap.xml\n");
