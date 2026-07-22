import { mkdir, writeFile } from "node:fs/promises";
import { compilePack, getPack, getPackStatus, stableOutcomePacks } from "@possible/packs";

const featuredPacks = stableOutcomePacks;
const developerProjectLaunch = getPack("developer-project-launch");
if (!developerProjectLaunch) throw new Error("Missing Developer Project Launch pack");
const publishedPacks = [...featuredPacks, developerProjectLaunch];

const evidenceManifest = {
  schemaVersion: 1,
  project: {
    name: "Possible",
    url: "https://possible.sh/",
    repository: "https://github.com/fraylabs/possible",
    package: "https://www.npmjs.com/package/@fraylabs/possible",
    judgingPage: "https://possible.sh/judging/",
  },
  recordedComparison: {
    name: "Robot Snake: /goal control versus Possible",
    question: "What operational knowledge does a non-expert's rough robot-snake request cause the agent to include?",
    protocol: {
      model: "gpt-5.6-sol",
      controlPrompt: "/goal I want to make a robot snake",
      onlyFollowUp: "Simulation first. I do not have a fixed budget or access to a 3D printer.",
      controlEnvironment: "Empty Git repository, fresh CODEX_HOME, and no Possible, Robot Prototype, robotics, CAD, or MuJoCo skill.",
      evaluationContract: "The Robot Prototype Outcome Pack contract existed before the control run.",
    },
    observedResults: {
      goalControl: "A browser simulator, firmware handoff, hardware planning, and 18 passing tests.",
      possible: "CAD, URDF/SRDF, MuJoCo simulation, autonomous obstacle-avoidance evidence, Rerun telemetry, 12 tests, 186 interface checks, and three defects caught and repaired by fresh verification.",
    },
    interpretation: {
      goal: "/goal provides dynamic pursuit and adapts execution as evidence changes.",
      possible: "Possible provides the reviewed outcome contract: workstreams, safeguards, interfaces, evidence, and completion conditions.",
      together: "Possible defines the multidisciplinary completion target; /goal can sustain and adapt its execution.",
    },
    evidence: [
      {
        label: "Control protocol and complete human input",
        url: "https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/robot-snake/CONTROL-RUN.md",
      },
      {
        label: "Preserved control artifacts",
        url: "https://possible.sh/demo/robot-snake/control/",
      },
      {
        label: "Possible artifact manifest",
        url: "https://possible.sh/demo/robot-snake/manifest.json",
      },
      {
        label: "Possible completion report",
        url: "https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/robot-snake/evidence/outcome-receipt.md",
      },
    ],
  },
  judgingCriteria: [
    {
      criterion: "Technological Implementation",
      claim: "Typed Outcome Packs coordinate execution and verification.",
      implementationFact: "The compiler converts manifests into skill installs, owned workstreams, approval gates, and completion requirements.",
      significance: "One contract governs the run from preparation through verification.",
      evidence: {
        label: "Outcome Pack compiler source",
        url: "https://github.com/fraylabs/possible/blob/main/packages/packs/src/compiler.ts",
      },
    },
    {
      criterion: "Design",
      claim: "Each demo presents the outcome beside its proof.",
      implementationFact: "The demo gallery exposes four visual outcomes and their preserved evidence.",
      significance: "Judges can inspect the work without reading agent logs first.",
      evidence: {
        label: "Demo gallery",
        url: "https://possible.sh/demo",
      },
    },
    {
      criterion: "Potential Impact",
      claim: "Possible supplies work a novice did not know to request.",
      implementationFact: "The Robot Prototype pack covers mechanical design, simulation, control, telemetry, safety, and review.",
      significance: "One rough request can start multidisciplinary work outside existing expertise.",
      evidence: {
        label: "Robot Prototype pack",
        url: "https://github.com/fraylabs/possible/blob/main/packages/packs/src/robot-prototype.ts",
      },
    },
    {
      criterion: "Quality of the Idea",
      claim: "Outcome Packs make operational judgment reusable.",
      implementationFact: "The Robot Snake run begins with an ambition and ends with an inspectable completion report.",
      significance: "The system transfers more than a single capability or instruction.",
      evidence: {
        label: "Robot Snake completion report",
        url: "https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/robot-snake/evidence/outcome-receipt.md",
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

for (const pack of publishedPacks) {
  const compiled = compilePack(pack);
  await write(`packs/${pack.slug}.json`, json(compiled));
  await write(`packs/${pack.slug}/install.txt`, `${compiled.installCommands.join("\n")}\n`);
  await write(`packs/${pack.slug}/run.txt`, `${compiled.runPrompt}\n`);
}

await write("packs/index.json", json({
  schemaVersion: 1,
  packs: publishedPacks.map(({ slug, lane, name, promise, summary, reviewedAt }) => ({
    slug,
    lane,
    name,
    promise,
    summary,
    reviewedAt,
    status: getPackStatus(slug),
  })),
}));

await write("evidence.json", json(evidenceManifest));

await write("llms.txt", [
  "# Possible",
  "",
  "AI made execution accessible. Possible makes operational judgment accessible.",
  "",
  "Possible turns one rough idea into a coordinated, independently verified, multidisciplinary outcome.",
  "",
  "The Robot Snake run began with 'I want to make a robot snake.' It produced inspectable CAD, URDF/SRDF, MuJoCo control and simulation, simulated autonomous obstacle avoidance, and Rerun telemetry. Fresh verification caught three material defects; after repair, the independent suite passed 12/12 tests and 186/186 interface checks.",
  "",
  "Recorded comparison: a clean GPT-5.6 Sol /goal control received the same rough robot-snake ambition plus one non-expert preference. It produced a useful browser simulator, firmware handoff, hardware planning, and 18 passing tests. Possible supplied the reviewed Robot Prototype outcome contract and added CAD, URDF/SRDF, MuJoCo simulation, autonomous avoidance evidence, Rerun telemetry, interface checks, and fresh verification.",
  "",
  "/goal provides dynamic pursuit. Possible provides the reviewed outcome contract. Possible defines the multidisciplinary completion target; /goal can sustain and adapt its execution.",
  "",
  "Possible.sh is an open-source library of Outcome Packs for Codex. Each typed specification coordinates selected agent skills, owned workstreams, shared constraints, approval boundaries, and the evidence required for completion.",
  "",
  "- Homepage: https://possible.sh/",
  "- Human documentation: /docs/",
  "- Judging evidence: /judging/",
  "- Machine-readable evidence: /evidence.json",
  "- Outcome demos: /demo/",
  "- Robot Snake proof: /demo/robot-snake/",
  "- Recorded /goal comparison protocol: https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/robot-snake/CONTROL-RUN.md",
  "- Preserved /goal control artifacts: /demo/robot-snake/control/",
  "- Possible artifact manifest: /demo/robot-snake/manifest.json",
  "- Possible completion report: https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/robot-snake/evidence/outcome-receipt.md",
  "- Pack catalog: /packs/",
  "- Pack index: /packs/index.json",
  ...publishedPacks.flatMap((pack) => [
    `- ${pack.name}: /packs/${pack.slug}.json`,
    `  - Outcome Pack page: /packs/${pack.slug}/`,
    `  - Install commands: /packs/${pack.slug}/install.txt`,
    `  - Compiled run prompt: /packs/${pack.slug}/run.txt`,
  ]),
  "- GitHub: https://github.com/fraylabs/possible",
  "- npm: https://www.npmjs.com/package/@fraylabs/possible",
  "",
  "Review every external agent skill before installation. Approving an Outcome Pack run does not authorize deployment, spending, outreach, fabrication, publishing, or unsupported real-world claims.",
  "",
].join("\n"));

await write("robots.txt", "User-agent: *\nAllow: /\nSitemap: https://possible.sh/sitemap.xml\n");
