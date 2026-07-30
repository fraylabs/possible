import type { OutcomePack } from "./types.js";
import { developerProjectLaunchPack } from "./developer-project-launch.js";

const skills = developerProjectLaunchPack.skills.filter(({ id }) =>
  ["copywriting", "create-readme", "documentation-writer", "webapp-testing", "frontend-design", "deploy-to-vercel"].includes(id),
);

export const developerAdoptionReadinessPack: OutcomePack = {
  schemaVersion: 1,
  catalogNumber: 23,
  lane: "launch",
  slug: "developer-adoption-readiness",
  name: "Developer Adoption Readiness",
  eyebrow: "23 / EXPERIMENTAL PACK",
  promise: "Make one working developer project understandable and verifiably usable by an outsider.",
  summary: "A truthful adoption contract, one clean-room first-use path, only the presentation modules the project actually needs, and an independent readiness receipt.",
  useWhen: [
    "A working CLI, library, API, application, or developer tool is hard for an outsider to understand or try.",
    "The missing outcome is a trustworthy first-use path rather than product implementation or repository release engineering.",
  ],
  notFor: [
    "Building missing core functionality; use the relevant creation pack.",
    "Licensing, packaging, CI, versioning, or publishing a repository release; use Open-Source Release.",
    "A mandatory launch site or broad content campaign when a verified README and quickstart are enough.",
  ],
  reviewedAt: "2026-07-29",
  skills,
  workstreams: [
    { id: "truth", name: "Audience and product truth", skills: ["copywriting"], owns: ["adoption/contract/", "adoption/claims/"], brief: "Define the intended developer, painful job, demonstrated capabilities, unsupported claims, first meaningful result, and minimum adoption surface." },
    { id: "path", name: "Verified first-use path", skills: ["create-readme", "documentation-writer", "frontend-design"], owns: ["adoption/path/", "adoption/artifacts/"], dependsOn: ["truth"], brief: "Create the shortest honest route from a clean environment to one meaningful result, plus only the active presentation modules." },
    { id: "review", name: "Fresh adoption review", skills: ["webapp-testing"], owns: ["adoption/review/", "adoption/readiness-receipt.json"], dependsOn: ["path"], brief: "Have an implementation-independent outsider follow only the supplied material, challenge claims, and record comprehension, setup, failures, repairs, and limits." },
  ],
  reviewSkills: ["webapp-testing", "documentation-writer"],
  outputs: ["Audience and claims contract", "Verified clean-room first-use path", "Selected adoption artifacts", "Independent outsider review", "Adoption readiness receipt"],
  guardrails: [
    "Do not invent adoption, users, testimonials, benchmarks, compatibility, security, or capabilities.",
    "Do not add a launch site, demo, expanded documentation, examples, or deployment unless its module activates from the brief.",
    "Do not deploy, publish, collect analytics, or mutate provider state without separate approval for the exact candidate and rollback.",
    "Preserve secrets, private repositories, personal data, licenses, trademarks, and attribution.",
  ],
  verification: [
    "Trace every material claim to the working project or visibly qualify it.",
    "Run the first-use path from a clean temporary environment using only the supplied instructions.",
    "Require a fresh outsider to identify the audience, value, next action, and first meaningful result without creator explanation.",
    "Record active and inactive modules, exact verifier commands, failures, repairs, limitations, and external actions not taken.",
  ],
  prerequisites: [{ id: "working-project", description: "The project's primary flow already works.", requiredEvidence: ["immutable revision", "local run command", "passing primary-flow check"] }],
  expectations: [
    { id: "working-baseline", statement: "The project performs its primary flow before adoption work.", failureModes: ["broken primary flow", "launch material masking missing functionality"], requiredEvidence: ["baseline execution log"] },
    { id: "truthful-claims", statement: "The audience, value, and material claims match direct project evidence.", failureModes: ["invented capability", "unsupported benchmark", "unclear audience"], requiredEvidence: ["claims register", "source trace"] },
    { id: "verified-first-use", statement: "A clean outsider can reach one meaningful result using only supplied instructions.", failureModes: ["hidden prerequisite", "stale command", "creator intervention"], requiredEvidence: ["clean-room transcript", "result capture"] },
    { id: "outsider-comprehension", statement: "A fresh reviewer understands what the project does and what to do next.", failureModes: ["ambiguous value", "unclear action", "misread limitation"], requiredEvidence: ["fresh review report"] },
    { id: "launch-site-output", moduleId: "launch-site", statement: "The selected launch site truthfully supports the adoption path.", failureModes: ["decorative shell", "broken CTA", "claim drift"], requiredEvidence: ["browser review", "claim comparison"] },
    { id: "interactive-demo-output", moduleId: "interactive-demo", statement: "The selected demo reproduces real project behavior.", failureModes: ["mock presented as real", "unreproducible result"], requiredEvidence: ["demo execution log", "behavior comparison"] },
    { id: "documentation-expansion-output", moduleId: "documentation-expansion", statement: "Expanded documentation resolves named adoption blockers.", failureModes: ["generic documentation", "unverified instructions"], requiredEvidence: ["blocker mapping", "documentation test"] },
    { id: "examples-output", moduleId: "examples", statement: "Selected examples run and teach a named use case.", failureModes: ["broken example", "irrelevant example"], requiredEvidence: ["example execution log"] },
    { id: "public-deployment-output", moduleId: "public-deployment", statement: "The approved deployment matches the verified candidate and can be rolled back.", failureModes: ["unapproved mutation", "revision mismatch", "missing rollback"], requiredEvidence: ["approval record", "live check", "rollback record"] },
  ],
  modularOutcome: {
    kind: "modular-outcome", gateName: "Developer adoption readiness", action: "Prepare and verify",
    contractPath: "adoption/contract/outcome.json", moduleDecisionPath: "adoption/contract/modules.json",
    artifactRoot: "adoption/artifacts/", decisionReceiptPath: "adoption/readiness-receipt.json", minimumActiveModules: 0,
    modules: [
      { id: "launch-site", activationWhen: "A browsable public explanation is an explicit adoption requirement.", work: ["build the smallest responsive site that supports the first-use path"], checks: ["browser, accessibility, claims, and CTA review"], requiredExpectationIds: ["launch-site-output"] },
      { id: "interactive-demo", activationWhen: "Prospective users cannot evaluate the real behavior through the core first-use path alone.", work: ["create a reproducible demonstration of real behavior"], checks: ["compare demo and project outputs"], requiredExpectationIds: ["interactive-demo-output"] },
      { id: "documentation-expansion", activationWhen: "Named adoption blockers require material beyond the core quickstart.", work: ["add only task-focused documentation that resolves those blockers"], checks: ["follow every new instruction"], requiredExpectationIds: ["documentation-expansion-output"] },
      { id: "examples", activationWhen: "A named use case requires a runnable example beyond the first-use path.", work: ["add the smallest runnable example"], checks: ["execute from clean state"], requiredExpectationIds: ["examples-output"] },
      { id: "public-deployment", activationWhen: "The user explicitly wants a public candidate and separately approves provider mutation.", work: ["deploy the exact verified revision"], checks: ["verify URL, access, revision, and rollback"], requiredExpectationIds: ["public-deployment-output"] },
    ],
    decisions: ["ready", "repair-required", "no-go"],
    steps: ["Prove the existing project baseline and define one first meaningful result.", "Build and test the core first-use path before optional presentation work.", "Run the active modules only after their activation evidence is recorded.", "Use a fresh outsider review and repair material failures before deciding readiness."],
    completionBoundary: "Ready means one truthful adoption path passes fresh outsider verification; it does not claim market demand, production release, or public deployment unless that module passed.",
  },
};
