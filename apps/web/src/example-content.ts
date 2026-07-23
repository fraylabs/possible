export type ExampleVisual = {
  src: string;
  alt: string;
  kind: "image" | "embed";
  fit?: "contain" | "cover";
  position?: string;
};

export type ExampleLink = {
  href: string;
  label: string;
};

export type ExampleMetadata = {
  title: string;
  description: string;
};

export type DemoConversationMessage = {
  speaker: "USER" | "POSSIBLE";
  text: string;
};

export type DemoPack = {
  name: string;
  href: string;
  role: string;
};

export type DemoItem = {
  title: string;
  description: string;
  href?: string;
  label?: string;
  preview?: {
    src?: string;
    alt?: string;
    kind: "image" | "embed" | "video" | "document";
    poster?: string;
    fit?: "contain" | "cover";
    position?: string;
  };
  tone?: "neutral" | "failure" | "repair" | "pass";
  showcase?: boolean;
};

export type PossibleDemo = {
  runKind: "preserved-run" | "reference-build";
  summary: string;
  request: string;
  conversation: readonly DemoConversationMessage[];
  conversationNote: string;
  packs: readonly [DemoPack, ...DemoPack[]];
  workstreams: readonly DemoItem[];
  artifacts: readonly DemoItem[];
  verification: readonly DemoItem[];
  evidence: readonly DemoItem[];
  boundary: string;
};

export type PossibleExample = {
  slug: string;
  name: string;
  projectLabel: string;
  outcomeLabel: string;
  description: string;
  highlights: readonly string[];
  visual: ExampleVisual;
  primaryOutput: ExampleLink;
  demoHref: string;
  metadata: ExampleMetadata;
  demo: PossibleDemo;
};

export const exampleCatalog = [
  {
    slug: "still",
    name: "Still",
    projectLabel: "E-ink focus device",
    outcomeLabel: "Hardware Launch",
    description: "A credible launch package for a fictional focus device: product site, film, concept CAD, and an honest local-only waitlist.",
    highlights: ["Launch site", "Product film", "Concept CAD"],
    visual: {
      src: "/demo/still/hardware/still-iso.png",
      alt: "Isometric CAD view of the Still e-ink focus device concept",
      kind: "image",
    },
    primaryOutput: { href: "/demo/still/site/index.html", label: "Open launch site" },
    demoHref: "/demo/still",
    metadata: {
      title: "Still hardware launch example",
      description: "A finished hardware-launch outcome with a site, film, CAD, and explicit limitations.",
    },
    demo: {
      runKind: "preserved-run",
      summary: "One rough device idea became a coordinated product, launch, film, CAD, safety, and verification run.",
      request: "I want to make a small device that helps me focus without opening my phone.",
      conversationNote: "Preserved intake from the recorded run.",
      conversation: [
        { speaker: "USER", text: "$possible" },
        { speaker: "POSSIBLE", text: "What would you like to make possible today? A rough idea is enough—we can brainstorm it together." },
        { speaker: "USER", text: "I want to make a small device that helps me focus without opening my phone." },
        { speaker: "POSSIBLE", text: "When this is finished, what would make it feel real to you?" },
        { speaker: "USER", text: "A believable launch: the device concept, a website, and a short product film." },
        { speaker: "POSSIBLE", text: "I recommend the Hardware Launch Outcome Pack. Proceed with this local-only outcome?" },
        { speaker: "USER", text: "Yes, proceed." },
      ],
      packs: [{ name: "Hardware Launch", href: "/packs/hardware-launch", role: "Coordinates the product story, launch site, film, prototype CAD, waitlist boundary, and fresh review." }],
      workstreams: [
        { title: "Product direction", description: "Define the device, intended ritual, audience, claims, and limits." },
        { title: "Launch system", description: "Build the responsive site and local-only waitlist behavior." },
        { title: "Film and CAD", description: "Produce a short product film and portable concept geometry." },
        { title: "Independent verification", description: "Review every artifact against the shared completion contract." },
      ],
      artifacts: [
        { title: "Launch website", description: "Responsive product story with a deliberately local-only waitlist.", href: "/demo/still/site/index.html", label: "Open site", preview: { src: "/demo/still/site/index.html", kind: "embed" } },
        { title: "Product film", description: "A 24-second, 1080p launch film with preserved review frames.", href: "/demo/still/film/still-launch.mp4", label: "Play film", preview: { src: "/demo/still/film/still-launch.mp4", kind: "video", poster: "/demo/still/film/still-launch-preview.png" } },
        { title: "Prototype CAD", description: "Measured concept geometry in STEP, GLB, and STL review formats.", href: "/demo/still/hardware/still.step", label: "Download STEP", preview: { src: "/demo/still/hardware/still-iso.png", alt: "Isometric CAD view of the Still focus device", kind: "image" } },
        { title: "Artifact manifest", description: "The complete local output inventory and recorded status.", href: "/demo/still/manifest.json", label: "Inspect manifest", showcase: false },
      ],
      verification: [
        { title: "Produced", description: "The first integrated launch package passed its artifact suite." },
        { title: "Withheld", description: "Possible did not declare completion before an independent browser review." },
        { title: "Failed", description: "The reviewer caught visible interaction and presentation defects.", href: "/demo/still/verification/browser-results-initial-failure.json", label: "Open failed review", tone: "failure" },
        { title: "Repaired", description: "The implementation was corrected and the affected checks were rerun.", tone: "repair" },
        { title: "Passed", description: "The final package passed 58 of 58 artifact checks with the repair history preserved.", href: "/demo/still/evidence/final-receipt.md", label: "Open final receipt", tone: "pass" },
      ],
      evidence: [
        { title: "Outcome brief", description: "The shared definition of the requested outcome.", href: "/demo/still/PRODUCT-BRIEF.md", label: "Read brief" },
        { title: "Recorded Codex thread", description: "The preserved public execution record.", href: "/demo/still/CODEX-THREAD.md", label: "Read thread" },
        { title: "Completion receipt", description: "Checks, repairs, claims, and remaining limits.", href: "/demo/still/evidence/final-receipt.md", label: "Read receipt" },
      ],
      boundary: "Fictional concept. Nothing was deployed, fabricated, purchased, emailed, or connected to real data collection.",
    },
  },
  {
    slug: "robot-snake",
    name: "Robot Snake",
    projectLabel: "Digital robotics prototype",
    outcomeLabel: "Robot Prototype",
    description: "An inspectable ten-link robot with CAD, robot descriptions, MuJoCo control, autonomous obstacle avoidance, and telemetry.",
    highlights: ["CAD + URDF", "MuJoCo control", "Rerun telemetry"],
    visual: {
      src: "/demo/robot-snake/cad/iso.png",
      alt: "Isometric CAD view of the ten-link Robot Snake digital prototype",
      kind: "image",
    },
    primaryOutput: { href: "/demo/robot-snake/control/index.html", label: "Open simulation controls" },
    demoHref: "/demo/robot-snake",
    metadata: {
      title: "Robot Snake prototype example",
      description: "A finished digital robotics outcome with CAD, control, simulation, telemetry, and bounded claims.",
    },
    demo: {
      runKind: "preserved-run",
      summary: "Possible supplied the multidisciplinary robotics work that the two-sentence request never named.",
      request: "I want to make a robot snake that can slither convincingly and navigate around obstacles on its own.",
      conversationNote: "Preserved intake from the isolated Robot Prototype run.",
      conversation: [
        { speaker: "USER", text: "$possible\nI want to make a robot snake." },
        { speaker: "POSSIBLE", text: "What should it be able to do when it is finished?" },
        { speaker: "USER", text: "Slither convincingly and navigate around obstacles on its own." },
        { speaker: "POSSIBLE", text: "Where should it operate, what are we starting from, and should the first proof be physical or digital?" },
        { speaker: "USER", text: "A smooth indoor floor. Starting from the idea. I want a convincing digital prototype now, with a path toward fabrication later." },
        { speaker: "POSSIBLE", text: "I recommend the Robot Prototype Outcome Pack. Proceed with this digital prototype?" },
        { speaker: "USER", text: "Yes, proceed." },
      ],
      packs: [{ name: "Robot Prototype", href: "/packs/robot-prototype", role: "Coordinates mechanical CAD, robot descriptions, control, seeded simulation, telemetry, sim-to-real gaps, and verification." }],
      workstreams: [
        { title: "Mechanical model", description: "Create reviewable geometry, assembly dimensions, and portable CAD exports." },
        { title: "Robot description", description: "Generate URDF and SRDF with explicit joints, limits, links, and planning groups." },
        { title: "Control and simulation", description: "Implement deterministic MuJoCo locomotion and autonomous obstacle avoidance." },
        { title: "Telemetry and verification", description: "Record the run, expose sim-to-real gaps, and assign fresh review." },
      ],
      artifacts: [
        { title: "Inspectable CAD", description: "Ten links and nine joints in STEP and GLB.", href: "/demo/robot-snake/cad/robot-snake.step", label: "Download STEP", preview: { src: "/demo/robot-snake/cad/iso.png", alt: "Isometric CAD view of the Robot Snake assembly", kind: "image" } },
        { title: "Simulation controls", description: "Browser controls for the preserved digital prototype.", href: "/demo/robot-snake/control/index.html", label: "Open controls", preview: { src: "/demo/robot-snake/control/index.html", kind: "embed" } },
        { title: "MuJoCo replay", description: "Seeded autonomous avoidance with zero obstacle contact steps.", href: "/demo/robot-snake/simulation/obstacle-course/preview.gif", label: "Watch replay", preview: { src: "/demo/robot-snake/simulation/obstacle-course/preview.gif", alt: "Robot Snake autonomous obstacle avoidance replay", kind: "image" } },
        { title: "Rerun telemetry", description: "A 3,801-frame engineering timeline of geometry, state, and measurements.", href: "/demo/robot-snake/viewer/robot-snake.rrd", label: "Download RRD", preview: { src: "/demo/robot-snake/viewer/preview.png", alt: "Rerun telemetry viewer showing the Robot Snake engineering timeline", kind: "image" } },
      ],
      verification: [
        { title: "Produced", description: "CAD, robot descriptions, control, and seeded simulation passed the lead agent’s suite." },
        { title: "Withheld", description: "A separate verification workstream reviewed the integrated outcome." },
        { title: "Failed", description: "Fresh review found an unlatching safe stop, unsafe targets, and a hidden velocity overshoot.", tone: "failure" },
        { title: "Repaired", description: "Stop behavior was latched and frozen; physics-step measurement exposed and removed the overshoot.", tone: "repair" },
        { title: "Passed", description: "The regenerated suite passed 12 of 12 tests and 186 interface checks.", href: "/demo/robot-snake/evidence/outcome-receipt.md", label: "Open receipt", tone: "pass" },
      ],
      evidence: [
        { title: "Intake transcript", description: "The preserved user–Possible conversation.", href: "/demo/robot-snake/INTAKE-TRANSCRIPT.md", label: "Read intake" },
        { title: "Outcome brief", description: "The shared robotics contract and definition of done.", href: "/demo/robot-snake/evidence/outcome-brief.md", label: "Read brief" },
        { title: "Published manifest", description: "Artifact inventory and provenance.", href: "/demo/robot-snake/manifest.json", label: "Inspect manifest" },
        { title: "Review geometry", description: "Portable GLB geometry for browser and desktop inspection.", href: "/demo/robot-snake/cad/robot-snake.glb", label: "Download GLB" },
        { title: "CAD snapshot", description: "Isometric review image of the preserved assembly.", href: "/demo/robot-snake/cad/iso.png", label: "Open image" },
        { title: "Locomotion replay", description: "The preserved seeded locomotion preview.", href: "/demo/robot-snake/simulation/locomotion/preview.gif", label: "Watch replay" },
        { title: "Locomotion metrics", description: "Machine-readable measurements from the locomotion scenario.", href: "/demo/robot-snake/simulation/locomotion/metrics.json", label: "Open metrics" },
        { title: "Obstacle metrics", description: "Machine-readable measurements from autonomous avoidance.", href: "/demo/robot-snake/simulation/obstacle-course/metrics.json", label: "Open metrics" },
        { title: "URDF", description: "Generated robot structure and joint limits.", href: "/demo/robot-snake/model/robot-snake.urdf", label: "Open URDF" },
        { title: "SRDF", description: "Generated planning groups and semantic robot description.", href: "/demo/robot-snake/model/robot-snake.srdf", label: "Open SRDF" },
        { title: "Simulation contract", description: "Exactly what the deterministic scenarios prove.", href: "/demo/robot-snake/evidence/simulation-contract.md", label: "Read contract" },
        { title: "Sim-to-real gaps", description: "What the digital prototype does not prove.", href: "/demo/robot-snake/evidence/sim-to-real-gaps.md", label: "Read boundaries" },
        { title: "Rerun manifest", description: "Checksums and coverage for the engineering timeline.", href: "/demo/robot-snake/viewer/robot-snake.manifest.json", label: "Inspect manifest" },
        { title: "Rerun guide", description: "Clean-download instructions for opening the recording locally.", href: "/demo/robot-snake/viewer/README.md", label: "Read guide" },
        { title: "Rerun preview", description: "Static preview of the telemetry and geometry timeline.", href: "/demo/robot-snake/viewer/preview.png", label: "Open preview" },
      ],
      boundary: "Digital prototype only. Aggregate propulsion and steering remain simulated surrogates. Physical locomotion, actuator suitability, fabrication readiness, manufacturability, and functional safety remain unproven.",
    },
  },
  {
    slug: "fold",
    name: "Fold",
    projectLabel: "Paper-plane storm run",
    outcomeLabel: "Playable Web Game",
    description: "A responsive Three.js game with one clear action, a repeatable score loop, crash state, and pointer, touch, and keyboard controls.",
    highlights: ["Playable loop", "Three input modes", "Responsive"],
    visual: {
      src: "/demo/game/play",
      alt: "Playable Fold paper-plane game running in the browser",
      kind: "embed",
    },
    primaryOutput: { href: "/demo/game/play", label: "Play Fold" },
    demoHref: "/demo/fold",
    metadata: {
      title: "Fold playable web game example",
      description: "A finished responsive Three.js paper-plane game.",
    },
    demo: {
      runKind: "reference-build",
      summary: "A reference implementation showing the complete output shape of the Playable Web Game Outcome Pack.",
      request: "Make a tiny browser game where you pilot a paper plane through a storm.",
      conversationNote: "No preserved $possible conversation exists for this reference build. This page reports only the artifacts and review evidence that remain.",
      conversation: [],
      packs: [{ name: "Playable Web Game", href: "/packs/playable-web-game", role: "Defines the player contract, core loop, Three.js runtime, responsive controls, game feel, and browser review." }],
      workstreams: [
        { title: "Player contract", description: "Make the action, objective, and failure state legible within seconds." },
        { title: "Core loop", description: "Steer, score, crash, and restart without leaving the game." },
        { title: "Runtime and controls", description: "Implement Three.js with pointer, touch, and keyboard input." },
        { title: "Review", description: "Test the full loop across responsive browser sizes." },
      ],
      artifacts: [
        { title: "Playable game", description: "The finished Fold browser game.", href: "/demo/game/play", label: "Play Fold", preview: { src: "/demo/game/play", kind: "embed" } },
        { title: "Game brief", description: "The product and interaction contract used by the reference build.", href: "/demo/fold/game-brief.md", label: "Read brief", preview: { kind: "document" } },
      ],
      verification: [
        { title: "Reviewed", description: "The reference build received an implementation review and one repair." },
        { title: "Checked", description: "The retained verification notes cover the player loop and responsive controls.", href: "/demo/fold/verification.md", label: "Read checks", tone: "pass" },
        { title: "Not preserved", description: "No independent $possible verification run or raw failure trace was preserved for this reference build.", tone: "neutral" },
      ],
      evidence: [
        { title: "Game brief", description: "Intended experience and interaction contract.", href: "/demo/fold/game-brief.md", label: "Read brief" },
        { title: "Review notes", description: "Recorded implementation review and repair.", href: "/demo/fold/review.md", label: "Read review" },
        { title: "Verification notes", description: "Retained checks for the reference build.", href: "/demo/fold/verification.md", label: "Read verification" },
      ],
      boundary: "Reference build. It is not presented as a clean-room evaluation and does not preserve an end-to-end $possible run.",
    },
  },
  {
    slug: "web-presentation",
    name: "Possible",
    projectLabel: "Ten-slide visual explainer",
    outcomeLabel: "Web Presentation",
    description: "A coded, responsive ten-slide deck explaining Possible with custom visual language and keyboard, touch, and button navigation.",
    highlights: ["10 coded slides", "Keyboard + touch", "Responsive"],
    visual: {
      src: "/presentation/possible-visual-atlas.webp",
      alt: "Illustrations of an agent skill, execution prompt, Outcome Pack, and the Possible guide",
      kind: "image",
    },
    primaryOutput: { href: "/presentation", label: "Open presentation" },
    demoHref: "/demo/web-presentation",
    metadata: {
      title: "Possible web presentation example",
      description: "A finished coded presentation with responsive presenter controls.",
    },
    demo: {
      runKind: "reference-build",
      summary: "A reference implementation showing how narrative, evidence, visual direction, and coded interaction become one browser-native deck.",
      request: "Help people understand Possible without making them read a wall of text.",
      conversationNote: "No preserved $possible conversation, compiled run, or independent review receipt exists for this reference build.",
      conversation: [],
      packs: [{ name: "Web Presentation", href: "/packs/web-presentation", role: "Coordinates the narrative, source evidence, visual direction, coded slides, presenter controls, responsive behavior, and review." }],
      workstreams: [
        { title: "Narrative", description: "Turn the product thesis into a short audience-first arc." },
        { title: "Visual direction", description: "Choose a coherent coded presentation system and illustrative metaphor." },
        { title: "Implementation", description: "Build browser-native slides with presenter controls." },
        { title: "Responsive review", description: "Check the deck with keyboard, touch, and compact viewports." },
      ],
      artifacts: [
        { title: "Coded presentation", description: "The complete ten-slide browser deck.", href: "/presentation", label: "Open presentation", preview: { src: "/presentation", kind: "embed" } },
        { title: "Visual atlas", description: "Custom illustrations used to explain the Possible system.", href: "/presentation/possible-visual-atlas.webp", label: "Open atlas", preview: { src: "/presentation/possible-visual-atlas.webp", alt: "Visual atlas used throughout the Possible presentation", kind: "image" } },
      ],
      verification: [
        { title: "Browser checks", description: "The retained site suite exercises route, controls, and responsive behavior.", tone: "pass" },
        { title: "Not preserved", description: "No independent $possible verification run or repair receipt was preserved for this reference build.", tone: "neutral" },
      ],
      evidence: [
        { title: "Coded deck", description: "The self-contained presentation artifact.", href: "/presentation/possible.html", label: "Open HTML" },
        { title: "Visual atlas", description: "The supporting illustration sheet.", href: "/presentation/possible-visual-atlas.webp", label: "Open image" },
      ],
      boundary: "Reference build. It demonstrates the Web Presentation pack’s intended output, not a preserved end-to-end $possible run.",
    },
  },
  {
    slug: "patchproof",
    name: "PatchProof",
    projectLabel: "Discover → build → launch",
    outcomeLabel: "Outcome Chain",
    description: "A local developer tool that turns supplied test evidence into an inspectable claim result, discovered, built, and launched through three outcomes.",
    highlights: ["Working product", "3 outcome stages", "3 Remix directions"],
    visual: {
      src: "/examples/patchproof-chain/evidence/site-desktop.png",
      alt: "PatchProof launch site produced by a three-stage Possible Outcome Chain",
      kind: "image",
      fit: "cover",
      position: "top",
    },
    primaryOutput: { href: "/examples/patchproof-chain/product/index.html", label: "Open product" },
    demoHref: "/demo/patchproof",
    metadata: {
      title: "PatchProof Outcome Chain example",
      description: "A finished developer tool discovered, built, remixed, and locally launched through three verified outcomes.",
    },
    demo: {
      runKind: "preserved-run",
      summary: "Possible chained discovery, product implementation, and developer-project launch while carrying verified evidence across every handoff.",
      request: "Discover, build, and launch a useful developer tool. I do not already know which problem is worth solving.",
      conversationNote: "The preserved record contains the initial request and separate public transcripts for all three stages.",
      conversation: [
        { speaker: "USER", text: "$possible\nI want to discover, build, and launch a useful developer tool. I do not already know which problem is worth solving." },
        { speaker: "POSSIBLE", text: "I recommend chaining Software Opportunity Discovery, Working Web App, and Developer Project Launch. Each stage must pass before its evidence can enter the next. Proceed locally?" },
        { speaker: "USER", text: "Yes, proceed." },
      ],
      packs: [
        { name: "Software Opportunity Discovery", href: "/packs/software-opportunity-discovery", role: "Compare evidence-backed problems before choosing what to build." },
        { name: "Working Web App", href: "/packs/working-web-app", role: "Turn the selected opportunity into a bounded working product." },
        { name: "Developer Project Launch", href: "/packs/developer-project-launch", role: "Remix and package the verified product without changing its factual claims." },
      ],
      workstreams: [
        { title: "Discover", description: "Compare four developer-tool opportunities against 21 dated sources." },
        { title: "Build", description: "Implement deterministic claim states, fixture contracts, exports, and browser flows." },
        { title: "Remix and launch", description: "Explore three factual-equivalent directions and implement the selected one." },
        { title: "Verify every handoff", description: "Require independent review and hashed evidence before advancing the chain." },
      ],
      artifacts: [
        { title: "PatchProof product", description: "A local browser tool for converting supplied patch evidence into inspectable claim results.", href: "/examples/patchproof-chain/product/index.html", label: "Open product", preview: { src: "/examples/patchproof-chain/product/index.html", kind: "embed" } },
        { title: "Launch site", description: "The selected Continuous Form launch direction.", href: "/examples/patchproof-chain/product/launch/site/index.html", label: "Open launch site", preview: { src: "/examples/patchproof-chain/product/launch/site/index.html", kind: "embed" } },
        { title: "Remix directions", description: "Three comparable visual directions using identical factual copy.", href: "/examples/patchproof-chain/evidence/remix/continuous-form.png", label: "Open selected direction", preview: { src: "/examples/patchproof-chain/evidence/remix/continuous-form.png", alt: "Continuous Form visual direction selected for PatchProof", kind: "image", fit: "cover", position: "top" } },
        { title: "Chain state", description: "The machine-readable record connecting all three stages.", href: "/examples/patchproof-chain/evidence/chain.json", label: "Inspect chain", showcase: false },
      ],
      verification: [
        { title: "Produced", description: "Each stage produced an artifact and a candidate completion receipt." },
        { title: "Withheld", description: "The chain could not advance until a separate verifier reviewed the stage." },
        { title: "Failed", description: "Review found truth-model, import-flow, fixture, resume, and visual-proof defects.", href: "/examples/patchproof-chain/evidence/product-repair-log.md", label: "Open repair log", tone: "failure" },
        { title: "Repaired", description: "The owning stage repaired the defect and regenerated affected evidence.", tone: "repair" },
        { title: "Passed", description: "All three outcomes passed their local completion contracts before the chain was finalized.", href: "/examples/patchproof-chain/evidence/launch-verification.md", label: "Open final review", tone: "pass" },
      ],
      evidence: [
        { title: "Original request", description: "The initial ambition and local-only authority boundary.", href: "/examples/patchproof-chain/evidence/request.md", label: "Read request" },
        { title: "Recorded transcripts", description: "Public captain and specialist messages for every stage.", href: "/examples/patchproof-chain/evidence/transcripts/discovery.md", label: "Start with discovery" },
        { title: "Chain state", description: "Stage status, revisions, and evidence handoffs.", href: "/examples/patchproof-chain/evidence/chain.json", label: "Inspect state" },
        { title: "Launch receipt", description: "The final local-only completion report.", href: "/examples/patchproof-chain/evidence/launch-receipt.json", label: "Open receipt" },
      ],
      boundary: "Local-only run. No deployment, publication, customer contact, account creation, purchase, or other external action was authorized.",
    },
  },
] as const satisfies readonly PossibleExample[];

export function getExample(slug: string): PossibleExample | undefined {
  return exampleCatalog.find((example) => example.slug === slug);
}
