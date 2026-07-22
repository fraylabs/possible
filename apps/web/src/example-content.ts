export type ExampleVisual = {
  src: string;
  alt: string;
  kind: "image" | "embed";
};

export type ExampleLink = {
  href: string;
  label: string;
};

export type ExampleMetadata = {
  title: string;
  description: string;
};

export type PossibleExample = {
  slug: string;
  name: string;
  projectLabel: string;
  outcomeLabel: string;
  roughRequest: string;
  inferenceLabel?: string;
  inference: string;
  proofMetrics: readonly string[];
  visual: ExampleVisual;
  primaryOutput: ExampleLink;
  evidence: ExampleLink;
  metadata: ExampleMetadata;
};

export const exampleCatalog = [
  {
    slug: "still",
    name: "Still",
    projectLabel: "E-ink focus device",
    outcomeLabel: "Hardware Launch",
    roughRequest: "I want to make a small device that helps me focus without opening my phone.",
    inference: "Possible identified the product, website, film, CAD, honest waitlist, safety boundaries, and independent verification needed for a credible hardware launch.",
    proofMetrics: ["Site + film + CAD", "58 / 58 artifact checks", "1 verifier repair"],
    visual: {
      src: "/demo/still/hardware/still-iso.png",
      alt: "Isometric CAD view of the Still e-ink focus device concept",
      kind: "image",
    },
    primaryOutput: {
      href: "/demo/still/site/index.html",
      label: "Open launch site",
    },
    evidence: {
      href: "/demo/hardware",
      label: "Inspect preserved run",
    },
    metadata: {
      title: "Still hardware launch example",
      description: "See how one rough focus-device idea became a verified local hardware launch with a site, film, CAD, and explicit limitations.",
    },
  },
  {
    slug: "robot-snake",
    name: "Robot Snake",
    projectLabel: "Digital robotics prototype",
    outcomeLabel: "Robot Prototype",
    roughRequest: "I want to make a robot snake.",
    inference: "Possible supplied the mechanical model, robot descriptions, control system, MuJoCo scenarios, autonomous obstacle avoidance, sim-to-real gaps, and fresh verification the request never named.",
    proofMetrics: ["12 / 12 tests", "186 interface checks", "3 verifier repairs"],
    visual: {
      src: "/demo/robot-snake/cad/iso.png",
      alt: "Isometric CAD view of the ten-link Robot Snake digital prototype",
      kind: "image",
    },
    primaryOutput: {
      href: "/demo/robot-snake/control/index.html",
      label: "Open simulation controls",
    },
    evidence: {
      href: "/demo/robot-snake",
      label: "Inspect preserved run",
    },
    metadata: {
      title: "Robot Snake prototype example",
      description: "A rough robot-snake request becomes inspectable CAD, URDF/SRDF, MuJoCo control, obstacle avoidance, telemetry, and independently verified evidence.",
    },
  },
  {
    slug: "fold",
    name: "Fold",
    projectLabel: "Paper-plane storm run",
    outcomeLabel: "Playable Web Game",
    roughRequest: "I want to make a tiny browser game where you pilot a paper plane through a storm.",
    inferenceLabel: "What the pack defines",
    inference: "This reference build demonstrates the five-second player contract, repeatable loop, Three.js runtime, responsive controls, game feel, failure states, and browser review defined by the Playable Web Game Outcome Pack.",
    proofMetrics: ["Three.js runtime", "3 input modes", "1 review repair"],
    visual: {
      src: "/demo/game/play",
      alt: "Playable Fold paper-plane game running in the browser",
      kind: "embed",
    },
    primaryOutput: {
      href: "/demo/game/play",
      label: "Play Fold",
    },
    evidence: {
      href: "/demo/game",
      label: "Inspect reference evidence",
    },
    metadata: {
      title: "Fold playable web game example",
      description: "Play the Fold Three.js game and inspect how a strange one-line idea became a responsive, reviewed browser-game loop.",
    },
  },
  {
    slug: "web-presentation",
    name: "Possible",
    projectLabel: "Ten-slide visual explainer",
    outcomeLabel: "Web Presentation",
    roughRequest: "I need people to understand what Possible.sh is without reading a wall of text.",
    inferenceLabel: "What the pack defines",
    inference: "This reference build demonstrates how the Web Presentation Outcome Pack combines narrative, evidence, visual direction, coded slides, presenter controls, responsive behavior, and browser review.",
    proofMetrics: ["10 coded slides", "Keyboard + touch", "Browser-tested"],
    visual: {
      src: "/presentation/possible-visual-atlas.webp",
      alt: "Illustrations of an agent skill, execution prompt, Outcome Pack, and the Possible guide",
      kind: "image",
    },
    primaryOutput: {
      href: "/presentation",
      label: "Open presentation",
    },
    evidence: {
      href: "/demo/presentation",
      label: "Inspect reference evidence",
    },
    metadata: {
      title: "Possible web presentation example",
      description: "Open the ten-slide coded presentation that explains Possible through a responsive, browser-tested visual story.",
    },
  },
  {
    slug: "patchproof",
    name: "PatchProof",
    projectLabel: "Discover → build → launch",
    outcomeLabel: "Outcome Chain",
    roughRequest: "Discover, build, and launch a useful developer tool without assuming which problem is worth solving.",
    inference: "Possible researched four opportunities, selected a bounded evidence problem, built the working tool, explored three product-specific visual directions, and verified every handoff before continuing.",
    proofMetrics: ["3 chained outcomes", "34 assertions + 12 fixtures", "3 Remix directions"],
    visual: {
      src: "/examples/patchproof-chain/evidence/site-desktop.png",
      alt: "PatchProof launch site produced by a three-stage Possible Outcome Chain",
      kind: "image",
    },
    primaryOutput: {
      href: "/examples/patchproof-chain/product/index.html",
      label: "Open product",
    },
    evidence: {
      href: "/examples/patchproof-chain/evidence/chain.json",
      label: "Inspect chain evidence",
    },
    metadata: {
      title: "PatchProof Outcome Chain example",
      description: "One rough ambition became a researched opportunity, working developer tool, three Remix directions, and a verified local launch across three chained outcomes.",
    },
  },
] as const satisfies readonly PossibleExample[];

export function getExample(slug: string): PossibleExample | undefined {
  return exampleCatalog.find((example) => example.slug === slug);
}
