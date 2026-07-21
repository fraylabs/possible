import { mkdir, writeFile } from "node:fs/promises";
import { compilePack, outcomePacks } from "@possible/packs";

const featuredSlugs = new Set(["hardware-launch", "robot-prototype", "playable-web-game", "web-presentation"]);
const featuredPacks = outcomePacks.filter((pack) => featuredSlugs.has(pack.slug));

const evidenceManifest = {
  schemaVersion: 1,
  project: {
    name: "Possible",
    url: "https://possible.sh/",
    repository: "https://github.com/fraylabs/possible",
    judgingPage: "https://possible.sh/judging/",
  },
  judgingCriteria: [
    {
      criterion: "Technological Implementation",
      claim: "Possible compiles outcomes instead of returning a static prompt.",
      implementationFact: "The compiler transforms typed manifests into install commands and an execution prompt with owned workstreams, approval gates, verification and completion reporting.",
      significance: "One reviewed contract controls preparation, execution and completion.",
      evidence: {
        label: "Outcome Pack compiler source",
        url: "https://github.com/fraylabs/possible/blob/main/packages/packs/src/compiler.ts",
      },
    },
    {
      criterion: "Design",
      claim: "Complete outcomes remain inspectable instead of disappearing into agent logs.",
      implementationFact: "The public Still demo presents the generated site, film, CAD, receipts and review evidence together.",
      significance: "People can inspect both the product and its proof.",
      evidence: {
        label: "Still demo",
        url: "https://possible.sh/demo/hardware",
      },
    },
    {
      criterion: "Potential Impact",
      claim: "A rough ambition can become coordinated specialist work without requiring the user to enumerate every task.",
      implementationFact: "The preserved Still run expands one hardware brief into site, film, CAD and independent-review workstreams.",
      significance: "Possible reduces coordination burden while preserving explicit limits.",
      evidence: {
        label: "Still Codex transcript",
        url: "https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/still/CODEX-THREAD.md",
      },
    },
    {
      criterion: "Quality of the Idea",
      claim: "Outcome Packs are a distinct layer above prompts, skills and agents.",
      implementationFact: "The Hardware Launch manifest binds reviewed skills to owned workstreams, outputs, safeguards and fresh verification.",
      significance: "It packages operational judgment, not only model capability.",
      evidence: {
        label: "Hardware Launch manifest",
        url: "https://github.com/fraylabs/possible/blob/main/packages/packs/src/hardware-launch.ts",
      },
    },
  ],
  guidedEvidenceTrail: [
    {
      step: 1,
      stage: "Intake",
      fact: "The confirmed product brief records facts, constraints, required outputs and acceptance checks.",
      url: "https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/still/PRODUCT-BRIEF.md",
    },
    {
      step: 2,
      stage: "Compiled workstreams",
      fact: "The generated run prompt assigns site, film and CAD ownership before execution.",
      url: "https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/still/CODEX-THREAD.md#run-prompt",
    },
    {
      step: 3,
      stage: "Verification failure",
      fact: "The first browser trace preserves the integrated site's asset-path 404s.",
      url: "https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/still/verification/browser-results-initial-failure.json",
    },
    {
      step: 4,
      stage: "Repair",
      fact: "The fresh-review receipt records the relative-base fix and mandatory rerun.",
      url: "https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/still/evidence/final-receipt.md#material-failure-found-and-repaired",
    },
    {
      step: 5,
      stage: "Passing completion",
      fact: "The outcome receipt reports the post-repair browser pass, 58/58 artifact audit and remaining limitations.",
      url: "https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/still/OUTCOME-RECEIPT.md",
    },
  ],
};

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

await write("evidence.json", json(evidenceManifest));

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
  "- Judging evidence: /judging/",
  "- Machine-readable evidence: /evidence.json",
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
