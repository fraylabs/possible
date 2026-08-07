import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import * as packApi from "../dist/index.js";
import { activeOutcomePacks, archivedOutcomePacks, compilePack, compileWorkstreamWaves, evaluateExpectationResults, experimentalOutcomePacks, getCatalogNumber, getPackStatus, publicOutcomePacks, recordOutcomeJourney, stableOutcomePacks, validateExpectationContract, validateOutcomeCheckpoint, validateOutcomeRecord } from "../dist/index.js";

const publicPacks = publicOutcomePacks;

test("every outcome pack compiles to inspectable installs and a complete prompt", () => {
  assert.deepEqual(publicPacks.map((pack) => pack.slug), [
    "hardware-launch",
    "open-source-release",
    "playable-web-game",
    "web-app-operations",
    "working-web-app",
    "production-web-release",
    "marketing-operations",
    "kickstarter-funding",
    "kickstarter-fulfillment",
    "robot-prototype",
    "web-presentation",
    "developer-project-launch",
    "software-opportunity-discovery",
    "first-customer-sprint",
    "working-hardware-prototype",
    "launch-content-campaign",
    "manufacturing-readiness",
    "study-readiness",
    "mechanical-cad-review",
    "functional-hardware-prototype",
    "launch-content-package",
    "crowdfunding-campaign-readiness",
    "developer-adoption-readiness",
    "robot-digital-prototype",
    "production-readiness-decision",
    "research-protocol-readiness",
    "crowdfunding-funding-run",
    "crowdfunding-fulfillment-operations",
    "developer-product-readiness",
  ]);
  assert.deepEqual(publicPacks.map(({ slug, lane }) => [slug, lane]), [
    ["hardware-launch", "launch"],
    ["open-source-release", "release"],
    ["playable-web-game", "create"],
    ["web-app-operations", "operate"],
    ["working-web-app", "create"],
    ["production-web-release", "release"],
    ["marketing-operations", "operate"],
    ["kickstarter-funding", "launch"],
    ["kickstarter-fulfillment", "operate"],
    ["robot-prototype", "create"],
    ["web-presentation", "create"],
    ["developer-project-launch", "launch"],
    ["software-opportunity-discovery", "create"],
    ["first-customer-sprint", "launch"],
    ["working-hardware-prototype", "create"],
    ["launch-content-campaign", "launch"],
    ["manufacturing-readiness", "release"],
    ["study-readiness", "create"],
    ["mechanical-cad-review", "create"],
    ["functional-hardware-prototype", "create"],
    ["launch-content-package", "launch"],
    ["crowdfunding-campaign-readiness", "launch"],
    ["developer-adoption-readiness", "launch"],
    ["robot-digital-prototype", "create"],
    ["production-readiness-decision", "release"],
    ["research-protocol-readiness", "create"],
    ["crowdfunding-funding-run", "operate"],
    ["crowdfunding-fulfillment-operations", "operate"],
    ["developer-product-readiness", "launch"],
  ]);
  assert.deepEqual(publicPacks.map((pack) => getCatalogNumber(pack.slug)), Array.from({ length: 29 }, (_, index) => index + 1));
  assert.equal(new Set(publicPacks.map((pack) => getCatalogNumber(pack.slug))).size, publicPacks.length);
  assert.equal(new Set(publicPacks.map((pack) => pack.slug)).size, publicPacks.length);
  assert.deepEqual(stableOutcomePacks.map((pack) => pack.slug), [
    "playable-web-game",
    "web-presentation",
    "software-opportunity-discovery",
    "first-customer-sprint",
  ]);
  assert.equal(experimentalOutcomePacks.length, 15);
  assert.equal(activeOutcomePacks.length, 19);
  assert.deepEqual(archivedOutcomePacks.map((pack) => pack.slug), ["hardware-launch", "kickstarter-funding", "kickstarter-fulfillment", "robot-prototype", "developer-project-launch", "working-hardware-prototype", "launch-content-campaign", "manufacturing-readiness", "study-readiness", "developer-adoption-readiness"]);
  assert.equal(getPackStatus("hardware-launch"), "archived");
  assert.equal(getPackStatus("missing"), undefined);

  for (const pack of publicPacks) {
    assert.ok(["create", "launch", "release", "operate"].includes(pack.lane));
    assert.match(pack.eyebrow, new RegExp(`^${String(getCatalogNumber(pack.slug)).padStart(2, "0")} / `));
    for (const forbidden of ["lanes", "category", "categories", "track", "tracks"]) assert.equal(forbidden in pack, false);
    const compiled = compilePack(pack);
    assert.equal(compiled.pack.lane, pack.lane);
    assert.ok(compiled.installCommands.length >= 1);
    assert.ok(pack.skills.length >= 3);
    assert.ok(pack.workstreams.length >= 2);
    assert.ok(pack.outputs.length >= 4);
    assert.ok(pack.useWhen.length >= 2);
    assert.ok(pack.notFor.length >= 2);
    assert.equal(new Set(pack.useWhen).size, pack.useWhen.length);
    assert.equal(new Set(pack.notFor).size, pack.notFor.length);
    for (const source of pack.skills) {
      assert.match(compiled.runPrompt, new RegExp("\\$" + source.skill.replaceAll("-", "\\-")));
      assert.equal(source.reviewedRevision.length, 40);
      assert.match(source.reviewUrl, new RegExp(source.reviewedRevision));
      assert.ok(
        compiled.installCommands.some((command) => command.includes(`@${source.reviewedRevision}`) && command.includes(`--skill ${source.skill}`)),
        `${source.id} must install the reviewed revision`,
      );
    }
    for (const plugin of pack.plugins ?? []) {
      assert.match(plugin.invocation, /^@/);
      assert.ok(plugin.skills.length >= 1);
      assert.match(compiled.runPrompt, new RegExp(plugin.invocation.replace("@", "@")));
      for (const skill of plugin.skills) assert.match(compiled.runPrompt, new RegExp("\\$" + skill));
    }
    for (const reviewer of pack.reviewSkills) assert.match(compiled.runPrompt, new RegExp("\\$" + reviewer));
    assert.match(compiled.runPrompt, /never create one subagent per skill/i);
    assert.match(compiled.runPrompt, /fresh reviewer/i);
    assert.match(compiled.runPrompt, /explicit approval|explicitly tested|direct evidence/i);
    assert.match(compiled.runPrompt, /passed\/failed\/skipped/);
    assert.match(compiled.runPrompt, /OUTCOME RECORD/);
    assert.match(compiled.runPrompt, /\.possible\/runs\/<run-id>\/outcome-record\.json/);
    assert.match(compiled.runPrompt, /index of preserved evidence, not the evidence itself/i);
    assert.match(compiled.runPrompt, /artifacts with repository-relative path, description, owning workstream id, expectationIds, and SHA-256/i);
    assert.match(compiled.runPrompt, /EXPECTATION CONTRACT/);
    assert.match(compiled.runPrompt, /Expectations describe what becomes true—not implementation tasks/i);
    assert.match(compiled.runPrompt, /OUTCOME REVIEW LOOP/);
    assert.match(compiled.runPrompt, /one coherent, integrated outcome before judging completion/i);
    assert.match(compiled.runPrompt, /isolated component previews are inputs, not substitutes/i);
    assert.match(compiled.runPrompt, /inspect that complete outcome expectation by expectation/i);
    assert.match(compiled.runPrompt, /repair the actual outcome.*never delete, relabel, or weaken the expectation/is);
    assert.match(compiled.runPrompt, /rerun the complete-outcome review/i);
    assert.match(compiled.runPrompt, /Pass only the final integrated revision/i);
    assert.ok(compiled.runPrompt.indexOf("EXPECTATION CONTRACT") < compiled.runPrompt.indexOf("OUTCOME REVIEW LOOP"));
    assert.ok(compiled.runPrompt.indexOf("OUTCOME REVIEW LOOP") < compiled.runPrompt.indexOf("OUTCOME RECORD"));
    assert.match(compiled.runPrompt, /NEW-REALITY CHECKPOINT/);
    assert.match(compiled.runPrompt, /what became true, with direct evidence/i);
    assert.match(compiled.runPrompt, /remaining unknowns/i);
    assert.match(compiled.runPrompt, /single riskiest assumption/i);
    assert.match(compiled.runPrompt, /next decision the user faces/i);
    assert.match(compiled.runPrompt, /approvalRequired: true/);
    assert.match(compiled.runPrompt, /Do not install, compile, start, or imply approval for a candidate next outcome/i);
    assert.match(compiled.runPrompt, /retrospective journey history/i);
    assert.match(compiled.runPrompt, /Do not add planned, pending, approved, or future stages to that history/i);
    assert.doesNotMatch(compiled.runPrompt, /choose a lane|\nLANE\n/i);
    if (pack.archived) {
      assert.match(pack.archived.archivedAt, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(pack.archived.reason.trim());
      assert.ok(pack.archived.replacementSlugs.length >= 1);
      for (const replacementSlug of pack.archived.replacementSlugs) {
        assert.ok(activeOutcomePacks.some(({ slug }) => slug === replacementSlug), `${pack.slug} replacement ${replacementSlug} must be active`);
      }
    }
  }
});

test("Mechanical CAD Review rejects the unrestrained cat-house roof", async () => {
  const pack = publicPacks.find((candidate) => candidate.slug === "mechanical-cad-review");
  assert.ok(pack);
  assert.equal(getCatalogNumber(pack.slug), 19);
  assert.equal(pack.lane, "create");
  assert.equal(pack.workstreams.length, 2);
  assert.equal(pack.skills.length, 3);
  assert.deepEqual(compileWorkstreamWaves(pack).map((wave) => wave.map(({ id }) => id)), [
    ["mechanical-design"],
    ["mechanical-review"],
  ]);
  assert.match(pack.notFor.join(" "), /launch site.*film.*campaign.*waitlist/i);
  assert.match(pack.guardrails.join(" "), /watertight mesh.*interference-free assembly.*stay assembled/i);

  const compiled = compilePack(pack);
  assert.equal(compiled.installCommands.length, 2);
  assert.match(compiled.runPrompt, /PACK EXPECTATION TEMPLATES/);
  assert.match(compiled.runPrompt, /MECHANICAL CAD REVIEW GATE/);
  assert.match(compiled.runPrompt, /all six movement directions/i);
  assert.match(compiled.runPrompt, /lift, spread, slide, rack, flex, and pull-out/i);
  assert.match(compiled.runPrompt, /review-ready means ready for a fabricator to quote and critique/i);
  assert.match(compiled.runPrompt, /File existence and hashes.*cannot by themselves satisfy an expectation/i);
  assert.doesNotMatch(compiled.runPrompt, /REMIX GATE|OPENAI SITES MVP PATH|MEASURED HARDWARE PROTOTYPE GATE/);

  const fixture = JSON.parse(await readFile(new URL("./fixtures/cat-house-unrestrained-roof.json", import.meta.url), "utf8"));
  assert.equal(evaluateExpectationResults(pack.expectations, fixture.results), "failed");
  const allPassing = fixture.results.map((result) => ({
    ...result,
    status: "passed",
  }));
  assert.equal(evaluateExpectationResults(pack.expectations, allPassing), "passed");
  assert.equal(evaluateExpectationResults(pack.expectations, allPassing.slice(0, -1)), "unproven");

  const record = {
    schemaVersion: 1,
    runId: fixture.name,
    packSlug: pack.slug,
    status: fixture.requestedStatus,
    completedAt: "2026-07-26T04:00:00.000Z",
    outcomeBriefPath: ".possible/runs/cat-house-unrestrained-roof/outcome-brief.md",
    expectationContractPath: ".possible/runs/cat-house-unrestrained-roof/expectations.json",
    packSnapshotPath: ".possible/runs/cat-house-unrestrained-roof/pack.json",
    skillLockPath: ".possible/runs/cat-house-unrestrained-roof/skills-lock.json",
    workspaceRevision: "cat-house-cad-revision",
    artifacts: [{
      path: "mechanical/cad/cat-house.step",
      description: "Cat house assembly",
      workstreamId: "mechanical-design",
      expectationIds: ["assembly-restraint"],
      sha256: "b".repeat(64),
    }],
    expectationResults: fixture.results,
    decisions: [],
    repairs: [],
    approvals: [],
    externalActions: [],
    limitations: ["No physical fit coupon or full print has been tested."],
    verification: {
      reviewer: "fresh-mechanical-reviewer",
      independentFromImplementation: true,
      reportPath: "mechanical/review/cat-house-failed.json",
      status: "passed",
    },
    checkpointPath: ".possible/checkpoints/cat-house-unrestrained-roof.json",
  };
  assert.throws(
    () => validateOutcomeRecord(record, pack.expectations),
    /requires every active required expectation to pass; current result is failed/,
  );
});

test("expectations connect user intent to evidence without making preferences completion blockers", () => {
  const contract = {
    schemaVersion: 1,
    runId: "cat-house-001",
    packSlug: "mechanical-cad-review",
    frozenAt: "2026-07-30T02:00:00.000Z",
    expectations: [
      {
        id: "roof-remains-attached",
        statement: "The roof remains mechanically restrained during normal cat use.",
        source: "user",
        level: "required",
        active: true,
        activationEvidence: [".possible/runs/cat-house-001/outcome-brief.md"],
        failureModes: ["roof lifts", "walls spread and release the roof"],
        requiredEvidence: ["six-direction restraint review", "assembled CAD section"],
      },
      {
        id: "warm-color",
        statement: "The house uses a warm color.",
        source: "inferred",
        level: "preferred",
        active: true,
        activationEvidence: [".possible/runs/cat-house-001/outcome-brief.md"],
        failureModes: ["finish conflicts with the selected environment"],
        requiredEvidence: ["render review"],
      },
      {
        id: "outdoor-weatherproofing",
        statement: "The house withstands outdoor weather.",
        source: "inferred",
        level: "required",
        active: false,
        activationEvidence: [".possible/runs/cat-house-001/outcome-brief.md"],
        failureModes: ["water enters the house"],
        requiredEvidence: ["weather exposure test"],
      },
    ],
  };
  assert.equal(validateExpectationContract(contract), contract);
  assert.equal(evaluateExpectationResults(contract.expectations, [
    { expectationId: "roof-remains-attached", status: "passed", evidence: ["mechanical/review/restraint.json"] },
    { expectationId: "warm-color", status: "failed", evidence: ["mechanical/review/finish.json"] },
  ]), "passed");
  assert.equal(evaluateExpectationResults(contract.expectations, [
    { expectationId: "warm-color", status: "passed", evidence: ["mechanical/review/finish.json"] },
  ]), "unproven");
  const record = {
    schemaVersion: 1,
    runId: contract.runId,
    packSlug: contract.packSlug,
    status: "passed",
    completedAt: "2026-07-30T03:00:00.000Z",
    outcomeBriefPath: ".possible/runs/cat-house-001/outcome-brief.md",
    expectationContractPath: ".possible/runs/cat-house-001/expectations.json",
    packSnapshotPath: ".possible/runs/cat-house-001/pack.json",
    skillLockPath: ".possible/runs/cat-house-001/skills-lock.json",
    workspaceRevision: "cat-house-001-revision",
    artifacts: [{
      path: "mechanical/cad/cat-house.step",
      description: "Cat house assembly",
      workstreamId: "mechanical-design",
      expectationIds: ["roof-remains-attached"],
      sha256: "c".repeat(64),
    }],
    expectationResults: [
      { expectationId: "roof-remains-attached", status: "passed", evidence: ["mechanical/review/restraint.json"] },
      { expectationId: "warm-color", status: "failed", evidence: ["mechanical/review/finish.json"] },
    ],
    decisions: [],
    repairs: [],
    approvals: [],
    externalActions: [],
    limitations: ["The inactive outdoor weatherproofing expectation was not tested."],
    verification: {
      reviewer: "fresh-mechanical-reviewer",
      independentFromImplementation: true,
      reportPath: "mechanical/review/final.json",
      status: "passed",
    },
    checkpointPath: ".possible/checkpoints/cat-house-001.json",
  };
  assert.equal(validateOutcomeRecord(record, contract), record);
  const wrongRun = structuredClone(record);
  wrongRun.runId = "another-run";
  assert.throws(() => validateOutcomeRecord(wrongRun, contract), /must match its frozen expectation contract/);

  const noRequired = structuredClone(contract);
  noRequired.expectations[0].level = "preferred";
  assert.throws(() => validateExpectationContract(noRequired), /at least one active required expectation/);
});

test("Functional Hardware Prototype activates only the expectation modules present in the artifact", async () => {
  const pack = publicPacks.find((candidate) => candidate.slug === "functional-hardware-prototype");
  assert.ok(pack);
  assert.equal(getCatalogNumber(pack.slug), 20);
  assert.equal(pack.lane, "create");
  assert.equal(pack.workstreams.length, 3);
  assert.equal(pack.skills.length, 6);
  assert.deepEqual(pack.functionalHardwarePrototype.modules.map(({ id }) => id), [
    "battery",
    "mains-high-energy",
    "motion",
    "thermal",
    "living-contact",
    "wireless-networked",
    "health-claims",
  ]);
  assert.deepEqual(compileWorkstreamWaves(pack).map((wave) => wave.map(({ id }) => id)), [
    ["prototype-contract"],
    ["prototype-build"],
    ["prototype-test-revision"],
  ]);
  assert.doesNotMatch(pack.skills.map(({ id }) => id).join(" "), /customer-research|product-marketing|copywriting/);
  assert.doesNotMatch(pack.outputs.join(" "), /three.*direction|launch site|film|waitlist/i);

  const compiled = compilePack(pack);
  assert.equal(compiled.installCommands.length, 3);
  assert.match(compiled.runPrompt, /^Build, test, and revise the Functional Hardware Prototype outcome/);
  assert.match(compiled.runPrompt, /FUNCTIONAL HARDWARE PROTOTYPE GATE/);
  assert.match(compiled.runPrompt, /CONDITIONAL MODULES/);
  assert.match(compiled.runPrompt, /Safety is a design revision around real geometry and behavior, not a universal pre-design dossier/i);
  assert.match(compiled.runPrompt, /A passive artifact activates no electronics work/i);
  assert.match(compiled.runPrompt, /Inactive expectations and modules create no implementation work/i);
  assert.doesNotMatch(compiled.runPrompt, /PHYSICAL REMIX GATE|MEASURED HARDWARE PROTOTYPE GATE|PRODUCT DECISION RECORD/);

  const fixture = JSON.parse(await readFile(new URL("./fixtures/functional-hardware-core-only.json", import.meta.url), "utf8"));
  assert.equal(evaluateExpectationResults(pack.expectations, fixture.results, []), "passed");
  assert.equal(evaluateExpectationResults(pack.expectations, fixture.results, ["battery"]), "unproven");
  assert.equal(evaluateExpectationResults(pack.expectations, [...fixture.results, fixture.batteryResult], ["battery"]), "passed");
  assert.throws(
    () => evaluateExpectationResults(pack.expectations, fixture.results, ["future-module"]),
    /Unknown active expectation module future-module/,
  );

  const passedRecord = {
    schemaVersion: 1,
    runId: fixture.name,
    packSlug: pack.slug,
    status: "passed",
    completedAt: "2026-07-27T05:00:00.000Z",
    outcomeBriefPath: ".possible/runs/bench-powered-core-prototype/outcome-brief.md",
    expectationContractPath: ".possible/runs/bench-powered-core-prototype/expectations.json",
    packSnapshotPath: ".possible/runs/bench-powered-core-prototype/pack.json",
    skillLockPath: ".possible/runs/bench-powered-core-prototype/skills-lock.json",
    workspaceRevision: "functional-prototype-revision",
    activeModules: ["battery"],
    artifacts: [{
      path: "prototype/build/integrated-artifact.md",
      description: "Integrated artifact inspection",
      workstreamId: "prototype-build",
      expectationIds: ["integrated-artifact"],
      sha256: "c".repeat(64),
    }],
    expectationResults: fixture.results,
    decisions: [],
    repairs: [],
    approvals: [],
    externalActions: [],
    limitations: ["Battery module evidence is absent."],
    verification: {
      reviewer: "fresh-functional-reviewer",
      independentFromImplementation: true,
      reportPath: "prototype/revisions/final-review.json",
      status: "passed",
    },
    checkpointPath: ".possible/checkpoints/bench-powered-core-prototype.json",
  };
  assert.throws(
    () => validateOutcomeRecord(passedRecord, pack.expectations),
    /requires every active required expectation to pass; current result is unproven/,
  );

  const wrongModuleProof = structuredClone(pack);
  wrongModuleProof.functionalHardwarePrototype.modules[0].requiredExpectationIds = ["motion-system"];
  assert.throws(() => compilePack(wrongModuleProof), /expectation motion-system must declare the same moduleId/);

  const unlistedModuleProof = structuredClone(pack);
  unlistedModuleProof.expectations.push({
    ...structuredClone(pack.expectations.find(({ id }) => id === "battery-system")),
    id: "battery-secondary-proof",
  });
  assert.throws(() => compilePack(unlistedModuleProof), /battery must list conditional expectation battery-secondary-proof/);

  const unrelatedConditionalProof = structuredClone(publicPacks.find((candidate) => candidate.slug === "mechanical-cad-review"));
  unrelatedConditionalProof.expectations[0].moduleId = "battery";
  assert.throws(() => compilePack(unrelatedConditionalProof), /conditional expectations require a conditional module contract/);
});

test("every run exposes one extractable outcome record", () => {
  const record = {
    schemaVersion: 1,
    runId: "robot-snake-001",
    packSlug: "robot-prototype",
    status: "passed",
    completedAt: "2026-07-24T04:00:00.000Z",
    outcomeBriefPath: ".possible/runs/robot-snake-001/outcome-brief.md",
    expectationContractPath: ".possible/runs/robot-snake-001/expectations.json",
    packSnapshotPath: ".possible/runs/robot-snake-001/pack.json",
    skillLockPath: ".possible/runs/robot-snake-001/skills-lock.json",
    workspaceRevision: "0123456789abcdef",
    artifacts: [{
      path: "robot/cad/body.step",
      description: "Robot body CAD",
      workstreamId: "mechanical",
      sha256: "a".repeat(64),
    }],
    expectationResults: [{
      expectationId: "robot-interface",
      status: "passed",
      evidence: ["verification/interface-checks.json"],
    }],
    decisions: [{
      question: "Which locomotion geometry should the prototype use?",
      selection: "Modular serpentine chain",
      evidence: ["robot/decisions/locomotion.json"],
      tradeoffs: ["More joints increase control complexity."],
      uncertainty: ["Durability is not established by simulation."],
      reversalEvidence: ["Bench testing shows joint loads exceed the actuator limit."],
    }],
    repairs: [{
      finding: "The initial joint limit exceeded the actuator envelope.",
      failureEvidence: ["verification/reviews/001-failed.json"],
      change: "Reduced the joint limit and regenerated the controller.",
      repairEvidence: ["verification/reviews/002-passed.json"],
      status: "repaired",
    }],
    approvals: [],
    externalActions: [{
      action: "Deploy or publish the prototype",
      status: "not-taken",
      evidence: [],
    }],
    limitations: ["Simulation does not establish physical reliability."],
    verification: {
      reviewer: "verification-agent",
      independentFromImplementation: true,
      reportPath: "verification/reviews/002-passed.json",
      status: "passed",
    },
    checkpointPath: ".possible/checkpoints/robot-snake-001.json",
  };
  assert.equal(validateOutcomeRecord(record), record);

  const missingProof = structuredClone(record);
  missingProof.expectationResults = [];
  assert.throws(() => validateOutcomeRecord(missingProof), /must include expectation results/);

  const unsafeEvidence = structuredClone(record);
  unsafeEvidence.expectationResults[0].evidence = ["../outside.json"];
  assert.throws(() => validateOutcomeRecord(unsafeEvidence), /safe repository-relative path/);

  const incompletePass = structuredClone(record);
  incompletePass.verification.status = "partial";
  assert.throws(() => validateOutcomeRecord(incompletePass), /requires passed independent verification/);

  const visibleUnknown = structuredClone(record);
  visibleUnknown.expectationResults.push({ expectationId: "physical-reliability", status: "unproven", evidence: [] });
  assert.equal(validateOutcomeRecord(visibleUnknown), visibleUnknown);
});

test("custom install sources cannot drift from the reviewed revision", () => {
  const pack = structuredClone(publicPacks[0]);
  pack.skills[0].installSource = `${pack.skills[0].repository}@main`;
  assert.throws(() => compilePack(pack), /must install the exact reviewed revision/);
});

test("Developer Project Launch remixes project-specific direction before implementation", () => {
  const developer = publicPacks.find((pack) => pack.slug === "developer-project-launch");
  assert.ok(developer);
  assert.deepEqual(compileWorkstreamWaves(developer).map((wave) => wave.map(({ id }) => id)), [
    ["positioning", "developer-experience"],
    ["creative-direction"],
    ["showcase"],
  ]);
  assert.equal(developer.remix?.candidateCount, 3);
  assert.equal(developer.remix?.decisionPath, "launch/direction/decision.json");
  assert.deepEqual(developer.workstreams.find(({ id }) => id === "showcase")?.dependsOn, ["positioning", "developer-experience", "creative-direction"]);
  const prompt = compilePack(developer).runPrompt;
  assert.match(prompt, /REMIX GATE/);
  assert.match(prompt, /exactly 3 project-specific directions/i);
  assert.match(prompt, /same truthful copy, content, and viewport/i);
  assert.match(prompt, /differ materially in at least three/i);
  assert.match(prompt, /Never randomize.*design jargon/is);
  assert.match(prompt, /Otherwise select the best-supported direction/i);
  assert.match(prompt, /launch\/direction\/decision\.json/);
  assert.match(prompt, /does not silently change claims, documentation, product behavior/i);

  const missing = structuredClone(developer);
  missing.remix.workstreamId = "missing";
  assert.throws(() => compilePack(missing), /does not exist/);
  const unsafe = structuredClone(developer);
  unsafe.remix.previewRoot = "../outside";
  assert.throws(() => compilePack(unsafe), /safe repository-relative path/);
  const wrongCount = structuredClone(developer);
  wrongCount.remix.candidateCount = 4;
  assert.throws(() => compilePack(wrongCount), /exactly three directions/);

  const missingDependency = structuredClone(developer);
  missingDependency.workstreams[0].dependsOn = ["missing"];
  assert.throws(() => compileWorkstreamWaves(missingDependency), /depends on missing workstream/);
  const cycle = structuredClone(developer);
  cycle.workstreams.find(({ id }) => id === "positioning").dependsOn = ["creative-direction"];
  assert.throws(() => compileWorkstreamWaves(cycle), /dependency cycle/);

  assert.doesNotMatch(compilePack(publicPacks.find((pack) => pack.slug === "hardware-launch")).runPrompt, /REMIX GATE/);
});

test("outcomes produce new-reality checkpoints, while journeys preserve only completed history", () => {
  const pack = (slug) => publicPacks.find((candidate) => candidate.slug === slug);
  const discovery = pack("software-opportunity-discovery");
  const working = pack("working-web-app");
  const developer = pack("developer-project-launch");
  assert.equal("outcomePacks" in packApi, false);
  assert.equal("compileChain" in packApi, false);
  assert.equal("chainExit" in discovery, false);
  assert.equal("chainEntry" in working, false);
  assert.equal("chainExit" in working, false);
  assert.deepEqual(working.prerequisites, [{
    id: "selected-opportunity",
    description: "A specific software opportunity has been selected for implementation, with enough evidence to distinguish it from an untested feature request.",
    requiredEvidence: ["selected opportunity and intended user", "source evidence or user-supplied rationale", "unresolved assumptions and validation boundary"],
  }]);
  assert.equal(developer.prerequisites.find(({ id }) => id === "working-project").requiredEvidence[0], "immutable workspace revision");
  assert.match(compilePack(working).runPrompt, /OUTCOME PREREQUISITES/);
  assert.match(compilePack(working).runPrompt, /Do not silently compile or execute another Outcome Pack/i);

  const discoveryCheckpoint = {
    schemaVersion: 1,
    runId: "discovery-001",
    packSlug: discovery.slug,
    completedAt: "2026-07-23T10:00:00.000Z",
    receiptPath: "outcome-room/decision-receipt.json",
    verificationStatus: "passed",
    becameTrue: [{
      statement: "Developers lose time checking whether agent completion claims are supported.",
      evidence: ["outcome-room/research/interviews.md", "outcome-room/decision-receipt.json"],
    }],
    remainingUnknowns: ["Whether a receipt beats raw logs for real reviewers."],
    riskiestAssumption: "Reviewers will trust and use a compact evidence receipt.",
    nextDecision: "Which offer can test reviewer willingness to pay before product implementation?",
    candidateNextOutcomes: [{
      outcome: "Try to sell a completion-receipt pilot to real developer teams.",
      rationale: "Request meaningful commitment before choosing a delivery mechanism.",
      addressesUnknowns: ["Whether a receipt beats raw logs for real reviewers."],
      testsAssumption: "Reviewers will trust and use a compact evidence receipt.",
      approvalRequired: true,
    }],
  };
  assert.equal(validateOutcomeCheckpoint(discoveryCheckpoint), discoveryCheckpoint);

  const customerCheckpoint = {
    ...structuredClone(discoveryCheckpoint),
    runId: "customer-002",
    packSlug: "first-customer-sprint",
    completedAt: "2026-07-23T12:00:00.000Z",
    becameTrue: [{
      statement: "One developer team agreed to a paid inline pull-request receipt pilot.",
      evidence: ["outcome-room/first-customer-receipt.json"],
    }],
    remainingUnknowns: ["Whether teams will enforce receipt policies in CI."],
    riskiestAssumption: "Teams will accept merge enforcement.",
    nextDecision: "Whether to pilot a GitHub Action or stop.",
    candidateNextOutcomes: [{
      outcome: "Pilot automatic completion receipts inside pull requests.",
      rationale: "Build only the delivery surface requested by the paying pilot.",
      addressesUnknowns: ["Whether teams will enforce receipt policies in CI."],
      testsAssumption: "Teams will accept merge enforcement.",
      approvalRequired: true,
    }],
  };
  const journey = recordOutcomeJourney("Help developers trust agent-completed work.", [
    discoveryCheckpoint,
    customerCheckpoint,
  ]);
  assert.equal(journey.schemaVersion, 1);
  assert.deepEqual(journey.completedOutcomes.map(({ runId }) => runId), ["discovery-001", "customer-002"]);
  assert.equal("plannedOutcomes" in journey, false);
  assert.equal("pendingOutcome" in journey, false);
  assert.equal("runPrompt" in journey, false);

  const repeat = recordOutcomeJourney("Improve a product until it passes.", [
    discoveryCheckpoint,
    { ...structuredClone(discoveryCheckpoint), runId: "discovery-002", completedAt: "2026-07-23T11:00:00.000Z" },
  ]);
  assert.deepEqual(repeat.completedOutcomes.map(({ packSlug }) => packSlug), [discovery.slug, discovery.slug]);

  assert.throws(() => recordOutcomeJourney("Ambition", [discoveryCheckpoint, discoveryCheckpoint]), /duplicate run id/);
  assert.throws(() => recordOutcomeJourney(" ", [discoveryCheckpoint]), /original ambition/);
  assert.throws(() => recordOutcomeJourney("Ambition", []), /at least one completed outcome/);

  const unapproved = structuredClone(discoveryCheckpoint);
  unapproved.candidateNextOutcomes[0].approvalRequired = false;
  assert.throws(() => validateOutcomeCheckpoint(unapproved), /requires fresh approval/);
  const executable = structuredClone(discoveryCheckpoint);
  executable.candidateNextOutcomes[0].runPrompt = "Start now";
  assert.throws(() => validateOutcomeCheckpoint(executable), /cannot contain executable or approval state/);
  const unsupported = structuredClone(discoveryCheckpoint);
  unsupported.becameTrue[0].evidence = [];
  assert.throws(() => validateOutcomeCheckpoint(unsupported), /direct evidence/);
  const unsafe = structuredClone(discoveryCheckpoint);
  unsafe.receiptPath = "../receipt.json";
  assert.throws(() => validateOutcomeCheckpoint(unsafe), /safe repository-relative path/);
  const duplicateCandidate = structuredClone(discoveryCheckpoint);
  duplicateCandidate.candidateNextOutcomes.push(structuredClone(duplicateCandidate.candidateNextOutcomes[0]));
  assert.throws(() => validateOutcomeCheckpoint(duplicateCandidate), /duplicated/);
  const untetheredCandidate = structuredClone(discoveryCheckpoint);
  untetheredCandidate.candidateNextOutcomes[0].addressesUnknowns = ["A different unknown."];
  assert.throws(() => validateOutcomeCheckpoint(untetheredCandidate), /recorded remaining unknown/);
  const wrongAssumption = structuredClone(discoveryCheckpoint);
  wrongAssumption.candidateNextOutcomes[0].testsAssumption = "Building the browser app will prove demand.";
  assert.throws(() => validateOutcomeCheckpoint(wrongAssumption), /recorded riskiest assumption/);
});

test("deterministic stages remain inside one separately approved outcome", () => {
  const developer = publicPacks.find((candidate) => candidate.slug === "developer-project-launch");
  assert.deepEqual(compileWorkstreamWaves(developer).map((wave) => wave.map(({ id }) => id)), [
    ["positioning", "developer-experience"],
    ["creative-direction"],
    ["showcase"],
  ]);
  assert.match(compilePack(developer).runPrompt, /WORKSTREAM SEQUENCE/);
  assert.match(compilePack(developer).runPrompt, /Do not start a dependent workstream until every named dependency passes/i);
  assert.doesNotMatch(compilePack(developer).runPrompt, /Prepare this conditional Outcome Chain/i);
  assert.doesNotMatch(compilePack(developer).runPrompt, /\.possible\/chain\.json/);
  assert.doesNotMatch(compilePack(developer).runPrompt, /IF THIS PASSES \/ LATER/);
  assert.doesNotMatch(compilePack(developer).runPrompt, /hashed handoff/);
  assert.deepEqual(developer.prerequisites, [
    {
      id: "working-project",
      description: "A real project exists and its primary user flow can be reproduced before launch work begins.",
      requiredEvidence: ["immutable workspace revision", "documented local run command", "passing primary-flow smoke check"],
    },
    {
      id: "opportunity-alignment",
      description: "The working project corresponds to a specific user opportunity rather than only presenting a polished implementation.",
      requiredEvidence: ["intended user and problem reference", "project capability evidence", "recorded mismatches or unresolved assumptions"],
    },
  ]);
});

test("install commands group skills by upstream repository", () => {
  const bySlug = (slug) => compilePack(publicPacks.find((pack) => pack.slug === slug));
  const openSource = bySlug("open-source-release");
  assert.equal(openSource.installCommands.length, 1);
  assert.match(openSource.installCommands[0], /github\/awesome-copilot.+github-release.+create-readme.+documentation-writer.+github-actions-hardening.+security-review/);

  const game = bySlug("playable-web-game");
  assert.equal(game.installCommands.length, 3);
  assert.match(game.installCommands[0], /mrgoonie\/claudekit-skills.+threejs/);
  assert.match(game.installCommands[1], /dylantarre\/animation-principles.+game-designer.+mobile-touch/);
  assert.match(game.installCommands[2], /anthropics\/skills.+frontend-design.+webapp-testing/);

  const operations = bySlug("web-app-operations");
  assert.equal(operations.installCommands.length, 2);
  assert.match(operations.installCommands[0], /anthropics\/skills.+webapp-testing/);
  assert.match(operations.installCommands[1], /github\/awesome-copilot.+impediment-prioritization.+dependabot.+security-review.+devops-rollout-plan.+incident-postmortem/);
  assert.match(operations.runPrompt, /OPERATING LOOP/);
  assert.match(operations.runPrompt, /prior completion report/);
  assert.match(operations.runPrompt, /YYYY-MM-DDTHHMMSSZ\.md/);
  assert.match(operations.runPrompt, /First dated operations completion report/);
  assert.match(operations.runPrompt, /SCHEDULE GATE/);
  assert.match(operations.runPrompt, /invokes \$possible resume/);
  assert.match(operations.runPrompt, /isolated worktree/);
  assert.match(operations.runPrompt, /Request direct approval for that exact schedule/);
  assert.match(operations.runPrompt, /scheduling-ready prompt and a completion report with a no-go status/);

  const working = bySlug("working-web-app");
  assert.equal(working.installCommands.length, 2);
  assert.match(working.installCommands[0], /anthropics\/skills.+frontend-design.+webapp-testing/);
  assert.match(working.installCommands[1], /github\/awesome-copilot.+security-review/);
  assert.match(working.runPrompt, /^Build the Working Web App outcome/);

  const production = bySlug("production-web-release");
  assert.equal(production.installCommands.length, 3);
  assert.match(production.installCommands[0], /github\/awesome-copilot.+devops-rollout-plan.+github-actions-hardening.+security-review/);
  assert.match(production.installCommands[1], /anthropics\/skills.+webapp-testing/);
  assert.match(production.installCommands[2], /vercel-labs\/agent-skills.+deploy-to-vercel/);
  assert.match(production.runPrompt, /^Prepare and verify the Production Web Release outcome/);
  assert.match(production.runPrompt, /RELEASE GATE/);
  assert.match(production.runPrompt, /explicit approval for the exact candidate, target, method, and known risks/);
  assert.match(production.runPrompt, /lead agent invokes the selected deployment adapter: \$sites-hosting for OpenAI Sites or \$deploy-to-vercel for Vercel/);
  assert.equal(production.pack.plugins[0].invocation, "@sites");
  assert.deepEqual(production.pack.workstreams.find((stream) => stream.id === "delivery").skills, ["github-actions-hardening"]);

  const robot = bySlug("robot-prototype");
  assert.equal(robot.installCommands.length, 3);
  assert.match(robot.installCommands[0], /fraylabs\/possible.+mujoco-robotics/);
  assert.match(robot.installCommands[1], /earthtojake\/text-to-cad.+cad.+step-parts.+urdf.+srdf.+cad-viewer/);
  assert.match(robot.installCommands[2], /arpitg1304\/robotics-agent-skills.+robotics-design-patterns.+robotics-software-principles.+ros2-development.+robotics-testing/);
  assert.match(robot.runPrompt, /MuJoCo simulation and control baseline/);
  assert.match(robot.runPrompt, /Do not connect to, commission, or command physical hardware/i);

  const presentation = bySlug("web-presentation");
  assert.equal(presentation.installCommands.length, 4);
  assert.match(presentation.installCommands[0], /coreyhaines31\/marketingskills.+copywriting/);
  assert.match(presentation.installCommands[1], /zarazhangrui\/frontend-slides.+frontend-slides/);
  assert.match(presentation.installCommands[2], /pbakaus\/impeccable.+impeccable/);
  assert.match(presentation.installCommands[3], /anthropics\/skills.+webapp-testing/);
  assert.match(presentation.runPrompt, /Coded presentation and presenter experience/);
  assert.match(presentation.runPrompt, /Impeccable hooks.*separate inspection and approval/i);
  assert.equal(presentation.pack.plugins[0].invocation, "@sites");
});

test("Web Presentation produces a coded, evidence-backed deck instead of a PowerPoint file", () => {
  const presentation = publicPacks.find((pack) => pack.slug === "web-presentation");
  assert.ok(presentation);
  assert.equal(getCatalogNumber(presentation.slug), 11);
  assert.equal(presentation.lane, "create");
  assert.match(presentation.promise, /runs in the browser/i);
  assert.match(presentation.useWhen.join(" "), /HTML, CSS, and JavaScript instead of PowerPoint/i);
  assert.match(presentation.outputs.join(" "), /coded browser presentation.*presenter-note controls.*PDF export.*contact sheet/i);
  assert.deepEqual(presentation.reviewSkills, ["webapp-testing", "impeccable"]);
  assert.match(presentation.guardrails.join(" "), /Do not invent citations, evidence, metrics, testimonials/i);
  assert.match(presentation.verification.join(" "), /1920×1080.*contact sheet.*keyboard and touch.*reduced-motion.*rehearsal time/i);

  const skillIds = new Set(presentation.skills.map((skill) => skill.id));
  for (const required of ["copywriting", "frontend-slides", "impeccable", "webapp-testing"]) {
    assert.equal(skillIds.has(required), true, `missing ${required}`);
  }
});

test("Robot Prototype generalizes one verified digital-prototype contract across robot forms", () => {
  const robot = publicPacks.find((pack) => pack.slug === "robot-prototype");
  assert.ok(robot);
  assert.equal(getCatalogNumber(robot.slug), 10);
  assert.equal(robot.lane, "create");
  assert.match(robot.useWhen.join(" "), /robot hand.*gripper.*arm.*mobile robot.*quadruped.*full robot/i);
  assert.match(robot.outputs.join(" "), /STEP assembly.*robot-description.*MuJoCo.*controller.*simulation tests.*sim-to-real gap/i);
  assert.deepEqual(robot.reviewSkills, ["robotics-testing", "cad-viewer"]);

  const skillIds = new Set(robot.skills.map((skill) => skill.id));
  for (const required of ["mujoco-robotics", "cad", "step-parts", "urdf", "srdf", "cad-viewer", "robotics-design-patterns", "robotics-software-principles", "ros2-development", "robotics-testing"]) {
    assert.equal(skillIds.has(required), true, `missing ${required}`);
  }

  const owned = robot.workstreams.flatMap((stream) => stream.owns.map((path) => ({ stream: stream.id, path })));
  for (const left of owned) {
    for (const right of owned) {
      if (left.stream === right.stream) continue;
      assert.equal(left.path.startsWith(right.path) || right.path.startsWith(left.path), false, `${left.path} overlaps ${right.path}`);
    }
  }
});

test("Sites is exposed only on web deployment outcomes and never as a fake Skills CLI install", () => {
  const sitesPacks = publicPacks.filter((pack) => pack.plugins?.some((plugin) => plugin.id === "sites"));
  assert.deepEqual(sitesPacks.map((pack) => pack.slug), ["hardware-launch", "production-web-release", "web-presentation", "developer-project-launch", "developer-product-readiness"]);
  for (const pack of sitesPacks) {
    const compiled = compilePack(pack);
    assert.doesNotMatch(compiled.installCommands.join("\n"), /sites|openai-bundled/i);
    assert.match(compiled.runPrompt, /every Sites deployment URL as production/i);
    assert.match(compiled.runPrompt, /explicit approval/);
  }
});

test("Developer Project Launch turns a working developer project into an evidence-backed adoption path", () => {
  const developer = publicPacks.find((pack) => pack.slug === "developer-project-launch");
  const openSource = publicPacks.find((pack) => pack.slug === "open-source-release");
  assert.ok(developer);
  assert.equal(getCatalogNumber(developer.slug), 12);
  assert.equal(developer.lane, "launch");
  assert.match(developer.eyebrow, /EXPERIMENTAL/);
  assert.match(developer.useWhen.join(" "), /working CLI.*library.*API.*developer platform/i);
  assert.match(developer.notFor.join(" "), /core product.*Working Web App.*Launch Content Package/i);
  assert.match(developer.notFor.join(" "), /repository release engineering.*Open-Source Release/i);
  assert.match(openSource.notFor.join(" "), /Developer Product Readiness/i);

  const outputs = developer.outputs.join(" ");
  assert.match(outputs, /positioning.*claims register/i);
  assert.match(outputs, /responsive project launch site/i);
  assert.match(outputs, /demonstration/i);
  assert.match(outputs, /five-minute quickstart/i);
  assert.match(outputs, /smallest runnable example/i);
  assert.match(outputs, /launch receipt/i);

  const skillIds = new Set(developer.skills.map(({ id }) => id));
  for (const required of ["copywriting", "frontend-design", "impeccable", "create-readme", "documentation-writer", "webapp-testing", "web-design-guidelines"]) {
    assert.equal(skillIds.has(required), true, `missing ${required}`);
  }
  const owned = developer.workstreams.flatMap((stream) => stream.owns.map((path) => ({ stream: stream.id, path })));
  for (const item of owned) {
    assert.doesNotMatch(item.path, /^(?:\/|[A-Za-z]:)|\.\.|[*?]/, `unsafe ownership path: ${item.path}`);
    for (const other of owned) {
      if (item.stream === other.stream) continue;
      const left = item.path.replace(/\/+$/, "");
      const right = other.path.replace(/\/+$/, "");
      assert.equal(left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`), false, `${item.path} overlaps ${other.path}`);
    }
  }

  const compiled = compilePack(developer);
  assert.equal(compiled.installCommands.length, 5);
  assert.match(compiled.runPrompt, /LAUNCH GATE/);
  assert.match(compiled.runPrompt, /local preparation only/i);
  assert.match(compiled.runPrompt, /exact candidate and immutable source, account or target, method, risks, and rollback/i);
  assert.match(compiled.runPrompt, /prepared or no-go—never launched/i);
  assert.match(developer.guardrails.join(" "), /deploy.*publish.*push.*tag.*release.*DNS.*analytics/i);
  assert.match(developer.verification.join(" "), /launch-receipt\.json.*prepared.*no-go.*published.*verified/i);
  assert.match(developer.verification.join(" "), /explicit approval evidence.*public URLs.*immutable source.*clean-room quickstart.*rollback target/i);
  assert.doesNotMatch(developer.outputs.join(" "), /\bLive launch\b/i);
});

test("Developer Product Readiness activates only the interfaces one working capability needs", () => {
  const archived = publicPacks.find((pack) => pack.slug === "developer-adoption-readiness");
  const product = publicPacks.find((pack) => pack.slug === "developer-product-readiness");
  assert.ok(archived?.archived);
  assert.deepEqual(archived.archived.replacementSlugs, ["developer-product-readiness"]);
  assert.ok(product);
  assert.equal(getCatalogNumber(product.slug), 29);
  assert.equal(product.lane, "launch");
  assert.equal(product.name, "Developer Product Readiness");
  assert.equal(product.modularOutcome.minimumActiveModules, 0);
  assert.deepEqual(product.modularOutcome.modules.map(({ id }) => id), [
    "website",
    "agent-skill",
    "mcp-server",
    "cli-package",
    "sdk-api",
    "expanded-docs",
    "interactive-demo",
    "examples",
    "public-deployment",
  ]);
  assert.deepEqual(compileWorkstreamWaves(product).map((wave) => wave.map(({ id }) => id)), [
    ["contract"],
    ["surfaces"],
    ["review"],
  ]);

  const skillIds = new Set(product.skills.map(({ id }) => id));
  for (const required of ["copywriting", "frontend-design", "webapp-testing", "skill-creator", "mcp-builder", "create-readme", "documentation-writer"]) {
    assert.equal(skillIds.has(required), true, `missing ${required}`);
  }
  assert.equal(product.plugins[0].id, "sites");
  assert.match(product.promise, /working capability.*coherent developer product.*only the interfaces/i);
  assert.match(product.guardrails.join(" "), /Do not make every project imitate Possible/i);
  assert.match(product.guardrails.join(" "), /Inactive modules create no implementation.*placeholder/i);
  assert.match(product.verification.join(" "), /capability matrix/i);
  assert.match(product.verification.join(" "), /positive and negative trigger prompts/i);
  assert.match(product.verification.join(" "), /invalid input.*upstream failure.*unavailable-auth/i);

  const compiled = compilePack(product);
  assert.match(compiled.runPrompt, /DEVELOPER PRODUCT READINESS GATE/);
  assert.match(compiled.runPrompt, /inactive modules create no implementation or proof work/i);
  assert.match(compiled.installCommands.join("\n"), /anthropics\/skills@fa0fa64bdc967915dc8399e803be67759e1e62b8.*skill-creator.*mcp-builder/is);
  assert.match(compiled.runPrompt, /shared capability contract/i);
  assert.match(compiled.runPrompt, /exactly one decision: ready, repair-required, no-go/i);

  const coreResults = product.expectations
    .filter(({ moduleId }) => moduleId === undefined)
    .map(({ id }) => ({ expectationId: id, status: "passed", evidence: [`developer-product/review/${id}.json`] }));
  const skillResult = { expectationId: "agent-skill-output", status: "passed", evidence: ["developer-product/review/agent-skill.json"] };
  assert.equal(evaluateExpectationResults(product.expectations, coreResults), "passed");
  assert.equal(evaluateExpectationResults(product.expectations, [...coreResults, skillResult], ["agent-skill"]), "passed");
  assert.equal(evaluateExpectationResults(product.expectations, coreResults, ["agent-skill"]), "unproven");
});

test("Software Opportunity Discovery selects a thesis without claiming demand", () => {
  const discovery = publicPacks.find((pack) => pack.slug === "software-opportunity-discovery");
  const working = publicPacks.find((pack) => pack.slug === "working-web-app");
  assert.ok(discovery);
  assert.equal(getCatalogNumber(discovery.slug), 13);
  assert.equal(discovery.lane, "create");
  assert.equal(discovery.name, "Software Opportunity Discovery");
  assert.match(discovery.eyebrow, /OUTCOME PACK/);
  assert.match(discovery.promise, /Discover one software opportunity worth taking to a first customer/i);
  assert.match(discovery.useWhen.join(" "), /developer.*does not yet know which problem, user, or opportunity/i);
  assert.match(discovery.notFor.join(" "), /specific opportunity.*First Customer Sprint/i);
  assert.match(working.notFor.join(" "), /Software Opportunity Discovery.*First Customer Sprint/i);

  const skillIds = new Set(discovery.skills.map(({ id }) => id));
  assert.deepEqual([...skillIds], ["customer-research", "competitor-profiling", "product-marketing", "analytics"]);
  const compiled = compilePack(discovery);
  assert.equal(compiled.installCommands.length, 1);
  assert.match(compiled.installCommands[0], /coreyhaines31\/marketingskills@67264763cb107d61749f418d081c56e5bcbc0209/);
  for (const id of ["customer-research", "competitor-profiling", "product-marketing", "analytics"]) {
    assert.match(compiled.installCommands[0], new RegExp(`--skill ${id}`));
  }
  assert.match(compiled.runPrompt, /^Discover the Software Opportunity Discovery outcome/);
  assert.match(compiled.runPrompt, /OPPORTUNITY DISCOVERY GATE/);
  assert.match(compiled.runPrompt, /conservative baseline.*solo technical builder/is);
  assert.match(compiled.runPrompt, /what agents can cover.*remaining execution gap/is);
  assert.match(compiled.runPrompt, /exactly three to five traceable opportunities/i);
  assert.match(compiled.runPrompt, /exactly one discovery decision: select, broaden, or stop/i);
  assert.doesNotMatch(compiled.runPrompt, /FIRST CUSTOMER SPRINT/);
  assert.deepEqual(compileWorkstreamWaves(discovery).map((wave) => wave.map(({ id }) => id)), [
    ["operator-baseline", "problem-evidence", "market-system"],
    ["opportunity-selection"],
  ]);
  assert.deepEqual(discovery.opportunityDiscovery, {
    kind: "opportunity-discovery",
    candidateRange: [3, 5],
    opportunityBriefPath: "outcome-room/opportunity-brief.json",
    decisionReceiptPath: "outcome-room/discovery-receipt.json",
    decisions: ["select", "broaden", "stop"],
  });
  assert.equal(discovery.firstCustomerSprint, undefined);

  const outputs = discovery.outputs.join(" ");
  assert.match(outputs, /operator baseline.*execution-gap/i);
  assert.match(outputs, /Three to five.*software opportunities/i);
  assert.match(outputs, /provisional opportunity thesis.*broaden.*stop/i);
  assert.match(outputs, /first-customer approach.*unrun sales claims/i);
  const verification = discovery.verification.join(" ");
  assert.match(verification, /operator baseline separates demonstrated assets.*agent-covered capabilities/i);
  assert.match(verification, /Scores prioritize discovery.*do not prove demand/i);
  assert.match(verification, /sufficient input for First Customer Sprint/i);

  const wrongRange = structuredClone(discovery);
  wrongRange.opportunityDiscovery.candidateRange = [2, 5];
  assert.throws(() => compilePack(wrongRange), /must compare three to five candidates/);
  const unsafeBrief = structuredClone(discovery);
  unsafeBrief.opportunityDiscovery.opportunityBriefPath = "../brief.json";
  assert.throws(() => compilePack(unsafeBrief), /safe repository-relative path/);
  const invalidDecision = structuredClone(discovery);
  invalidDecision.opportunityDiscovery.decisions = ["select", "validate", "stop"];
  assert.throws(() => compilePack(invalidDecision), /decisions must be select, broaden, stop/);
});

test("First Customer Sprint pursues commercial commitment and remains resumable", () => {
  const sprint = publicPacks.find((pack) => pack.slug === "first-customer-sprint");
  assert.ok(sprint);
  assert.equal(getCatalogNumber(sprint.slug), 14);
  assert.equal(sprint.lane, "launch");
  assert.equal(sprint.name, "First Customer Sprint");
  assert.match(sprint.promise, /real customers.*strongest available commitment/i);
  assert.match(sprint.useWhen.join(" "), /nobody has yet made a credible commercial commitment/i);
  assert.match(sprint.notFor.join(" "), /rough ambition.*Software Opportunity Discovery/i);
  assert.deepEqual(sprint.prerequisites, [{
    id: "selected-opportunity",
    description: "One specific product, service, or software opportunity and customer segment have been selected for a first-customer attempt.",
    requiredEvidence: [
      "intended customer and painful job",
      "current alternatives and proposed difference",
      "offer and credible delivery hypotheses",
      "known evidence, contradictions, and unresolved assumptions",
      "for physical products, verified prototype status plus safety, claims, manufacturing, delivery, and refund boundaries",
    ],
  }]);
  const skillIds = new Set(sprint.skills.map(({ id }) => id));
  assert.deepEqual([...skillIds], ["customer-research", "competitor-profiling", "product-marketing", "analytics", "create-technical-spike"]);
  const compiled = compilePack(sprint);
  assert.equal(compiled.installCommands.length, 2);
  assert.match(compiled.runPrompt, /^Run the First Customer Sprint outcome/);
  assert.match(compiled.runPrompt, /OUTCOME PREREQUISITES/);
  assert.match(compiled.runPrompt, /FIRST CUSTOMER SPRINT/);
  assert.match(compiled.runPrompt, /reply → conversation → qualified problem → demo requested → pilot agreed → payment attempted → payment received → repeat use/i);
  assert.match(compiled.runPrompt, /Scheduling is coordination, not commercial evidence/i);
  assert.match(compiled.runPrompt, /convert silence into rejection/i);
  assert.match(compiled.runPrompt, /invoke \$possible resume/i);
  assert.match(compiled.runPrompt, /money requested and collected/i);
  assert.match(compiled.runPrompt, /does not claim product-market fit/i);
  assert.deepEqual(compileWorkstreamWaves(sprint).map((wave) => wave.map(({ id }) => id)), [
    ["sales-baseline"],
    ["prospect-access"],
    ["offer-system"],
    ["prospecting-conversations"],
    ["commitment-close", "objection-proof"],
  ]);
  assert.equal(sprint.workstreams.filter(({ activation }) => activation).length, 4);
  assert.deepEqual(sprint.firstCustomerSprint, {
    kind: "resumable-commercial-evidence",
    evidenceLadder: ["reply", "conversation", "qualified problem", "demo requested", "pilot agreed", "payment attempted", "payment received", "repeat use"],
    statePath: "sales/state.json",
    cycleRoot: "sales/cycles/",
    decisionReceiptPath: "outcome-room/first-customer-receipt.json",
    resumeCommand: "$possible resume",
    waitingStates: ["awaiting-approval", "awaiting-participants", "awaiting-observation"],
    decisions: ["continue", "revise", "stop"],
  });

  const outputs = sprint.outputs.join(" ");
  assert.match(outputs, /Prospect-access.*preflight/i);
  assert.match(outputs, /Durable sprint state.*dated sales-cycle records/i);
  assert.match(outputs, /replies, refusals, conversations, objections, commitments, payment attempts, payments, repeat use/i);
  assert.match(outputs, /money requested and collected/i);
  const guardrails = sprint.guardrails.join(" ");
  assert.match(guardrails, /Never invent prospects.*replies.*commitments.*revenue.*repeat use/i);
  assert.match(guardrails, /Do not contact people.*schedule calls.*accept payments.*promise delivery.*spend money/i);
  assert.match(guardrails, /waiting, revise, stop, no-sale, or evidence-incomplete state is valid/i);
  const verification = sprint.verification.join(" ");
  assert.match(verification, /prospect-access preflight occurred before sales activity/i);
  assert.match(verification, /Recompute the funnel.*qualified.*contacted.*replied.*paid.*returned/i);
  assert.match(verification, /money requested, attempted, collected, refunded, and retained/i);
  assert.match(verification, /doing nothing.*strongest current alternative.*different delivery form/i);
  assert.match(verification, /first-customer-receipt\.json.*continue.*revise.*stop/i);
  assert.match(verification, /Never claim that every product can be sold.*one customer proves a market/i);

  const owned = sprint.workstreams.flatMap((stream) => stream.owns.map((path) => ({ stream: stream.id, path })));
  for (const item of owned) {
    assert.doesNotMatch(item.path, /^(?:\/|[A-Za-z]:)|\.\.|[*?]/, `unsafe ownership path: ${item.path}`);
    for (const other of owned) {
      if (item.stream === other.stream) continue;
      const left = item.path.replace(/\/+$/, "");
      const right = other.path.replace(/\/+$/, "");
      assert.equal(left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`), false, `${item.path} overlaps ${other.path}`);
    }
  }

  const unsafeContract = structuredClone(sprint);
  unsafeContract.firstCustomerSprint.statePath = "../state.json";
  assert.throws(() => compilePack(unsafeContract), /safe repository-relative path/);
  const invalidLadder = structuredClone(sprint);
  invalidLadder.firstCustomerSprint.evidenceLadder[1] = "signup";
  assert.throws(() => compilePack(invalidLadder), /evidence ladder is invalid/);
  const invalidDecisions = structuredClone(sprint);
  invalidDecisions.firstCustomerSprint.decisions = ["continue", "investigate", "stop"];
  assert.throws(() => compilePack(invalidDecisions), /decisions must be continue, revise, stop/);
  const missingActivation = structuredClone(sprint);
  for (const stream of missingActivation.workstreams) delete stream.activation;
  assert.throws(() => compilePack(missingActivation), /first customer sprint requires at least one conditional workstream/);
  const emptyActivation = structuredClone(sprint);
  emptyActivation.workstreams.find(({ id }) => id === "offer-system").activation = " ";
  assert.throws(() => compilePack(emptyActivation), /activation must be non-empty/);
  const wrongResume = structuredClone(sprint);
  wrongResume.firstCustomerSprint.resumeCommand = "$possible";
  assert.throws(() => compilePack(wrongResume), /resumeCommand must be \$possible resume/);
});

test("Working Hardware Prototype requires a measured physical artifact and fresh review", () => {
  const prototype = publicPacks.find((pack) => pack.slug === "working-hardware-prototype");
  assert.ok(prototype);
  assert.equal(getCatalogNumber(prototype.slug), 15);
  assert.equal(prototype.lane, "create");
  assert.equal(prototype.name, "Working Hardware Prototype");
  assert.match(prototype.promise, /functional, measured, independently reviewed hardware prototype/i);
  assert.match(prototype.useWhen.join(" "), /consumer device.*real world/i);
  assert.match(prototype.notFor.join(" "), /safe for sale/i);
  assert.deepEqual(compileWorkstreamWaves(prototype).map((wave) => wave.map(({ id }) => id)), [
    ["product-truth"],
    ["system-safety"],
    ["physical-direction", "measurement-system"],
    ["mechanical", "electronics-control"],
    ["integration"],
  ]);
  assert.deepEqual(prototype.hardwarePrototype, {
    kind: "measured-functional-prototype",
    specificationPath: "prototype/specification.json",
    hazardPath: "prototype/safety/hazard-analysis.json",
    claimsPath: "prototype/claims/claims-register.json",
    measurementPath: "prototype/measurement/report.json",
    decisionReceiptPath: "outcome-room/hardware-prototype-receipt.json",
    measurementClasses: ["functional output", "control input", "power", "temperature", "noise", "duty cycle", "failure controls", "measurement uncertainty"],
    decisions: ["working", "repair-required", "no-go"],
  });
  assert.deepEqual(prototype.decisionRationale, {
    kind: "evidence-backed-product-decisions",
    rootPath: "prototype/decisions/",
    publicNarrativePath: "prototype/decisions/public-rationale.md",
    requiredFields: ["question", "options", "evidence", "selection", "rationale", "tradeoffs", "uncertainty", "reversal evidence", "public explanation"],
  });
  assert.deepEqual(prototype.remix, {
    kind: "physical-direction",
    workstreamId: "physical-direction",
    candidateCount: 3,
    previewRoot: "prototype/direction/previews/",
    decisionPath: "prototype/direction/decision.json",
    onNoChoice: "agent-select",
    preserves: ["intended use", "functional requirements", "confirmed components", "safety limits", "hardware interfaces", "claims boundary", "measurement contract"],
  });

  const compiled = compilePack(prototype);
  assert.equal(compiled.installCommands.length, 4);
  assert.match(compiled.runPrompt, /^Build and measure the Working Hardware Prototype outcome/);
  assert.match(compiled.runPrompt, /MEASURED HARDWARE PROTOTYPE GATE/);
  assert.match(compiled.runPrompt, /PRODUCT DECISION RECORD/);
  assert.match(compiled.runPrompt, /PHYSICAL REMIX GATE/);
  assert.match(compiled.runPrompt, /calibrate the measurement path/i);
  assert.match(compiled.runPrompt, /frequency, waveform, acceleration at the contact surface, coupling, duration, and position/i);
  assert.match(compiled.runPrompt, /CAD, firmware, a render.*working physical prototype/i);
  assert.match(compiled.runPrompt, /working, repair-required, or no-go/i);
  assert.match(compiled.runPrompt, /does not mean safe for sale, clinically effective, certified, manufacturable, or production-ready/i);

  const unsafeMeasurement = structuredClone(prototype);
  unsafeMeasurement.hardwarePrototype.measurementPath = "../measurement.json";
  assert.throws(() => compilePack(unsafeMeasurement), /safe repository-relative path/);
  const invalidMeasurements = structuredClone(prototype);
  invalidMeasurements.hardwarePrototype.measurementClasses[0] = "appearance";
  assert.throws(() => compilePack(invalidMeasurements), /measurement classes are invalid/);
  const invalidDecisions = structuredClone(prototype);
  invalidDecisions.hardwarePrototype.decisions = ["working", "maybe", "no-go"];
  assert.throws(() => compilePack(invalidDecisions), /decisions must be working, repair-required, no-go/);
  const invalidRemix = structuredClone(prototype);
  invalidRemix.remix.candidateCount = 2;
  assert.throws(() => compilePack(invalidRemix), /exactly three directions/);
  const unsafeDecisions = structuredClone(prototype);
  unsafeDecisions.decisionRationale.rootPath = "../decisions";
  assert.throws(() => compilePack(unsafeDecisions), /safe repository-relative path/);
  const invalidDecisionFields = structuredClone(prototype);
  invalidDecisionFields.decisionRationale.requiredFields[1] = "alternatives";
  assert.throws(() => compilePack(invalidDecisionFields), /decision record fields are invalid/);
});

test("Manufacturing Readiness requires production evidence before a production commitment", () => {
  const manufacturing = publicPacks.find((pack) => pack.slug === "manufacturing-readiness");
  assert.ok(manufacturing);
  assert.equal(getCatalogNumber(manufacturing.slug), 17);
  assert.equal(manufacturing.lane, "release");
  assert.equal(manufacturing.name, "Manufacturing Readiness");
  assert.match(manufacturing.promise, /measured hardware prototype.*production decision/i);
  assert.match(manufacturing.useWhen.join(" "), /quoted, piloted, manufactured, or promised/i);
  assert.match(manufacturing.notFor.join(" "), /first functional physical artifact.*Working Hardware Prototype/i);
  assert.deepEqual(manufacturing.prerequisites, [{
    id: "measured-prototype",
    description: "One immutable physical prototype revision has direct functional and safety-boundary evidence suitable for manufacturing review.",
    requiredEvidence: [
      "prototype revision, intended use, product configuration, and claims boundary",
      "mechanical, electrical, firmware, component, and assembly sources",
      "calibrated nominal, boundary, and failure measurements",
      "hazard analysis, known defects, unproven assumptions, and human-use boundary",
    ],
  }]);
  assert.deepEqual(compileWorkstreamWaves(manufacturing).map((wave) => wave.map(({ id }) => id)), [
    ["release-baseline"],
    ["dfm", "sourcing-economics", "compliance-quality"],
    ["pilot-build"],
    ["production-release"],
  ]);
  assert.deepEqual(manufacturing.manufacturingReadiness, {
    kind: "manufacturing-readiness",
    baselinePath: "manufacturing/baseline/product-configuration.json",
    rfqPath: "manufacturing/sourcing/rfq-package/",
    compliancePath: "manufacturing/compliance/readiness-plan.json",
    pilotPath: "manufacturing/pilot/report.json",
    decisionReceiptPath: "outcome-room/manufacturing-readiness-receipt.json",
    decisions: ["ready", "repair-required", "no-go"],
  });
  const compiled = compilePack(manufacturing);
  assert.equal(compiled.installCommands.length, 4);
  assert.match(compiled.runPrompt, /^Prepare and verify the Manufacturing Readiness outcome/);
  assert.match(compiled.runPrompt, /OUTCOME PREREQUISITES/);
  assert.match(compiled.runPrompt, /MANUFACTURING READINESS GATE/);
  assert.match(compiled.runPrompt, /supplier statements, written quotations, estimates, and agent assumptions/i);
  assert.match(compiled.runPrompt, /minimum, expected, and overfunded volume scenarios/i);
  assert.match(compiled.runPrompt, /ready, repair-required, or no-go/i);
  assert.match(compiled.runPrompt, /does not mean certified, clinically effective, risk-free, profitable, funded, purchased/i);
  assert.match(manufacturing.guardrails.join(" "), /Overfunding increases production and fulfillment obligations/i);
  assert.match(manufacturing.verification.join(" "), /first-pass yield.*final yield.*defect.*rework/i);

  const unsafeRfq = structuredClone(manufacturing);
  unsafeRfq.manufacturingReadiness.rfqPath = "../rfq";
  assert.throws(() => compilePack(unsafeRfq), /safe repository-relative path/);
  const invalidDecision = structuredClone(manufacturing);
  invalidDecision.manufacturingReadiness.decisions = ["ready", "maybe", "no-go"];
  assert.throws(() => compilePack(invalidDecision), /decisions must be ready, repair-required, no-go/);
});

test("Study Readiness stops at a protocol package for qualified review", () => {
  const study = publicPacks.find((pack) => pack.slug === "study-readiness");
  assert.ok(study);
  assert.equal(getCatalogNumber(study.slug), 18);
  assert.equal(study.lane, "create");
  assert.equal(study.name, "Study Readiness");
  assert.match(study.promise, /research hypothesis.*protocol package ready for qualified review/i);
  assert.match(study.useWhen.join(" "), /before recruitment or data collection/i);
  assert.match(study.notFor.join(" "), /Replacing a qualified investigator.*ethics.*regulator/i);
  assert.deepEqual(compileWorkstreamWaves(study).map((wave) => wave.map(({ id }) => id)), [
    ["evidence-question"],
    ["protocol", "ethics-governance", "analysis-reproducibility"],
    ["study-operations"],
    ["qualified-review-package"],
  ]);
  assert.deepEqual(study.studyReadiness, {
    kind: "study-readiness",
    researchQuestionPath: "study/question/research-question.json",
    protocolPath: "study/protocol/protocol.md",
    ethicsPath: "study/ethics/readiness-matrix.json",
    analysisPath: "study/analysis/statistical-analysis-plan.md",
    decisionReceiptPath: "outcome-room/study-readiness-receipt.json",
    decisions: ["ready-for-qualified-review", "repair-required", "no-go"],
  });
  const compiled = compilePack(study);
  assert.equal(compiled.installCommands.length, 2);
  assert.match(compiled.runPrompt, /^Prepare and verify the Study Readiness outcome/);
  assert.match(compiled.runPrompt, /STUDY READINESS GATE/);
  assert.match(compiled.runPrompt, /Do not optimize the protocol to produce a favorable result/i);
  assert.match(compiled.runPrompt, /An agent cannot act as investigator, clinician, ethics board, regulator, or legal adviser/i);
  assert.match(compiled.runPrompt, /before data collection/i);
  assert.match(compiled.runPrompt, /ready-for-qualified-review, repair-required, or no-go/i);
  assert.match(compiled.runPrompt, /never means approved, registered, recruited, safe, effective, clinically validated/i);
  assert.match(study.guardrails.join(" "), /Never fabricate citations.*participants.*data.*results/i);
  assert.match(study.verification.join(" "), /negative or inconclusive reporting/i);

  const unsafeProtocol = structuredClone(study);
  unsafeProtocol.studyReadiness.protocolPath = "../protocol.md";
  assert.throws(() => compilePack(unsafeProtocol), /safe repository-relative path/);
  const invalidDecision = structuredClone(study);
  invalidDecision.studyReadiness.decisions = ["ready", "repair-required", "no-go"];
  assert.throws(() => compilePack(invalidDecision), /decisions must be ready-for-qualified-review, repair-required, no-go/);
});

test("archived Launch Content Campaign preserves its original post-ready media contract", () => {
  const campaign = publicPacks.find((pack) => pack.slug === "launch-content-campaign");
  assert.ok(campaign);
  assert.ok(campaign.archived);
  assert.equal(getCatalogNumber(campaign.slug), 16);
  assert.equal(campaign.lane, "launch");
  assert.equal(campaign.name, "Launch Content Campaign");
  assert.match(campaign.promise, /post-ready.*campaign/i);
  assert.deepEqual(compileWorkstreamWaves(campaign).map((wave) => wave.map(({ id }) => id)), [
    ["campaign-truth"],
    ["creative-direction"],
    ["copy-production", "media-production"],
    ["campaign-package"],
  ]);
  assert.equal(campaign.remix?.kind, "visual-direction");
  assert.equal(campaign.decisionRationale?.rootPath, "launch-content/decisions/");
  assert.ok(campaign.skills.some(({ id, reviewedRevision }) => id === "humanizer" && reviewedRevision === "e081be4df826b7bd545e6b80406622f52d0bb49b"));

  const compiled = compilePack(campaign);
  assert.equal(compiled.installCommands.length, 3);
  assert.match(compiled.runPrompt, /^Build the Launch Content Campaign outcome/);
  assert.match(compiled.runPrompt, /\$humanizer/);
  assert.match(compiled.runPrompt, /PRODUCT DECISION RECORD/);
  assert.match(compiled.runPrompt, /REMIX GATE/);
  assert.match(campaign.outputs.join(" "), /Instagram carousel/i);
  assert.match(campaign.outputs.join(" "), /YouTube Short/i);
  assert.match(campaign.outputs.join(" "), /X announcement/i);
  assert.match(campaign.outputs.join(" "), /asset manifest/i);
  assert.match(campaign.guardrails.join(" "), /AI-detector evasion/i);
  assert.match(campaign.guardrails.join(" "), /authentic prototype footage.*generated atmosphere/i);
  assert.match(campaign.guardrails.join(" "), /separate exact approval/i);
  assert.match(campaign.verification.join(" "), /provider, model and version.*content hash/i);
  assert.match(campaign.verification.join(" "), /ready, repair-required, or no-go/i);
});

test("Launch Content Package activates only the requested final-export formats", () => {
  const content = publicPacks.find((pack) => pack.slug === "launch-content-package");
  assert.ok(content);
  assert.equal(getCatalogNumber(content.slug), 21);
  assert.equal(content.lane, "launch");
  assert.equal(content.name, "Launch Content Package");
  assert.equal(content.workstreams.length, 3);
  assert.equal(content.skills.length, 6);
  assert.equal(content.remix, undefined);
  assert.equal(content.decisionRationale, undefined);
  assert.equal(content.launchContentPackage.minimumActiveModules, 1);
  assert.deepEqual(content.launchContentPackage.modules.map(({ id }) => id), [
    "text-post",
    "static-visual",
    "carousel",
    "short-video",
    "long-video",
    "thread",
  ]);
  assert.deepEqual(compileWorkstreamWaves(content).map((wave) => wave.map(({ id }) => id)), [
    ["content-contract"],
    ["content-production"],
    ["content-verification"],
  ]);
  assert.doesNotMatch(content.skills.map(({ id }) => id).join(" "), /analytics/);
  assert.doesNotMatch(content.outputs.join(" "), /Instagram|TikTok|YouTube|X announcement|calendar/i);

  const compiled = compilePack(content);
  assert.equal(compiled.installCommands.length, 3);
  assert.match(compiled.runPrompt, /^Create and verify the Launch Content Package outcome/);
  assert.match(compiled.runPrompt, /LAUNCH CONTENT PACKAGE GATE/);
  assert.match(compiled.runPrompt, /CONDITIONAL CONTENT MODULES/);
  assert.match(compiled.runPrompt, /Activate at least one module/i);
  assert.match(compiled.runPrompt, /produce only active-module assets/i);
  assert.match(compiled.runPrompt, /inactive modules create no production, placeholder, or simulated-proof work/i);
  assert.doesNotMatch(compiled.runPrompt, /REMIX GATE|PRODUCT DECISION RECORD|three comparable campaign directions/i);

  const coreResults = content.expectations
    .filter(({ moduleId }) => moduleId === undefined)
    .map(({ id }) => ({ expectationId: id, status: "passed", evidence: [`launch-content-package/review/${id}.json`] }));
  const staticResult = {
    expectationId: "static-visual-output",
    status: "passed",
    evidence: ["launch-content-package/review/static-visual-output.json"],
  };
  assert.equal(evaluateExpectationResults(content.expectations, coreResults, ["static-visual"]), "unproven");
  assert.equal(evaluateExpectationResults(content.expectations, [...coreResults, staticResult], ["static-visual"]), "passed");
  assert.equal(evaluateExpectationResults(content.expectations, [...coreResults, staticResult], ["short-video"]), "unproven");
  assert.throws(
    () => evaluateExpectationResults(content.expectations, coreResults, ["podcast"]),
    /Unknown active expectation module podcast/,
  );

  const withRemix = structuredClone(content);
  withRemix.remix = {
    kind: "visual-direction",
    workstreamId: "content-production",
    candidateCount: 3,
    previewRoot: "launch-content-package/directions/",
    decisionPath: "launch-content-package/direction.json",
    onNoChoice: "agent-select",
    preserves: ["source truth"],
  };
  assert.throws(() => compilePack(withRemix), /must not require three creative directions/);
});

test("Marketing Operations compiles a manual-first, truthfully gated recurring schedule", () => {
  const marketing = publicPacks.find((pack) => pack.slug === "marketing-operations");
  assert.ok(marketing, "Marketing Operations is present in the catalog");
  assert.equal(getCatalogNumber(marketing.slug), 7);
  assert.equal(marketing.lane, "operate");
  assert.match(marketing.eyebrow, /^07 \/ /);
  assert.match(marketing.useWhen.join(" "), /schedule (?:recurring )?marketing operations/i);
  assert.match(marketing.promise, /repeatable|recurring/i);

  const compiled = compilePack(marketing);
  assert.match(compiled.installCommands[0], /coreyhaines31\/marketingskills@67264763cb107d61749f418d081c56e5bcbc0209/);
  assert.match(compiled.runPrompt, /^Establish and run the first cycle of the Marketing Operations outcome/);
  assert.match(compiled.runPrompt, /OPERATING LOOP/);
  assert.match(compiled.runPrompt, /marketing\/receipts\/YYYY-MM-DDTHHMMSSZ\.md/);
  assert.match(compiled.runPrompt, /SCHEDULE GATE/);
  assert.match(compiled.runPrompt, /manual first cycle/i);
  assert.match(compiled.runPrompt, /invokes \$possible resume/);
  assert.match(compiled.runPrompt, /isolated worktree and report-only behavior/);
  assert.match(compiled.runPrompt, /exact task name, cadence, timezone, project/);
  assert.match(compiled.runPrompt, /Request direct approval for that exact schedule/);
  assert.match(compiled.runPrompt, /\.possible\/schedule\.json/);
  assert.match(compiled.runPrompt, /scheduling-ready prompt and a completion report with a no-go status/);
  assert.match(compiled.runPrompt, /never gain unattended authority.*communication, spending, publishing/is);
  assert.equal(marketing.schedule.request, "I want to schedule marketing operations.");
  assert.match(marketing.schedule.safeDefault, /write-capable connectors/i);
  assert.match(marketing.notFor.join(" "), /application health checks|dependency maintenance/i);
  assert.match(marketing.notFor.join(" "), /one isolated post|landing page|email|campaign/i);

  const ownedPaths = marketing.workstreams.flatMap((stream) => stream.owns.map((path) => ({ stream: stream.id, path })));
  for (const left of ownedPaths) {
    for (const right of ownedPaths) {
      if (left.stream === right.stream) continue;
      assert.equal(left.path.startsWith(right.path) || right.path.startsWith(left.path), false, `${left.path} overlaps ${right.path}`);
    }
  }

  const guardrails = marketing.guardrails.join(" ");
  assert.match(guardrails, /publish|post|send|outreach/i);
  assert.match(guardrails, /spend|budget|paid (?:media|advertising)|ads?/i);
  assert.match(guardrails, /credential|private data|customer data/i);
  assert.match(guardrails, /invent|fabricate/i);
  assert.match(guardrails, /performance|attribution|engagement|conversion/i);
  assert.match(guardrails, /explicit approval/i);
  assert.match(marketing.verification.join(" "), /approved external schedule identifier.*completion report.*no-go/i);
  assert.match(marketing.verification.join(" "), /unsupported lift.*testimonial.*competitor-claim/i);
  assert.match(marketing.verification.join(" "), /publish.*email a list.*ad budget.*no external write/i);
  assert.doesNotMatch(compiled.runPrompt, /marketing on autopilot|always-on growth engine|set it and forget it|guaranteed leads/i);
});

test("the web-app lifecycle packs have non-overlapping entry conditions", () => {
  const pack = (slug) => publicPacks.find((candidate) => candidate.slug === slug);
  assert.match(pack("working-web-app").useWhen.join(" "), /first coherent|first complete|first.*usable/i);
  assert.match(pack("production-web-release").useWhen.join(" "), /existing tested web app/i);
  assert.match(pack("web-app-operations").useWhen.join(" "), /already live/i);
});

test("archived Kickstarter Funding preserves its original funding and payout contract", () => {
  const pack = (slug) => publicPacks.find((candidate) => candidate.slug === slug);
  const funding = pack("kickstarter-funding");

  assert.ok(funding);
  assert.ok(funding.archived);
  assert.equal(getCatalogNumber(funding.slug), 8);
  assert.equal(funding.lane, "launch");
  assert.match(funding.promise, /Kickstarter campaign system/i);
  assert.match(funding.outputs.join(" "), /deposited net payout/i);
  assert.match(funding.guardrails.join(" "), /Only privacy-safe evidence of the deposited platform payout/i);
  assert.match(funding.verification.join(" "), /unfunded and cancelled outcomes/i);
  const fundingPrompt = compilePack(funding).runPrompt;
  assert.match(fundingPrompt, /^Build the Kickstarter Funding outcome/);
  assert.match(fundingPrompt, /\$humanizer/);
  assert.match(fundingPrompt, /PRODUCT DECISION RECORD/);
});

test("Crowdfunding Campaign Readiness stops before platform or funding action", () => {
  const readiness = publicPacks.find((candidate) => candidate.slug === "crowdfunding-campaign-readiness");
  assert.ok(readiness);
  assert.equal(getCatalogNumber(readiness.slug), 22);
  assert.equal(readiness.lane, "launch");
  assert.equal(readiness.workstreams.length, 3);
  assert.equal(readiness.skills.length, 5);
  assert.equal(readiness.prerequisites.length, 2);
  assert.equal(readiness.crowdfundingCampaignReadiness.decisionReceiptPath, "outcome-room/crowdfunding-campaign-readiness-receipt.json");
  assert.deepEqual(compileWorkstreamWaves(readiness).map((wave) => wave.map(({ id }) => id)), [
    ["campaign-baseline"],
    ["campaign-package"],
    ["readiness-review"],
  ]);
  assert.doesNotMatch(readiness.skills.map(({ id }) => id).join(" "), /frontend-design|webapp-testing|remotion-best-practices|social|marketing-loops/);
  assert.doesNotMatch(readiness.outputs.join(" "), /film|calendar|audience system|deposited|payout/i);

  const prompt = compilePack(readiness).runPrompt;
  assert.match(prompt, /^Prepare and challenge the Crowdfunding Campaign Readiness outcome/);
  assert.match(prompt, /CROWDFUNDING CAMPAIGN READINESS GATE/);
  assert.match(prompt, /This outcome ends before platform entry or publication/i);
  assert.match(prompt, /Crowdfunding Funding Run is a separate Outcome Pack/i);
  assert.match(prompt, /ready-for-platform-review, repair-required, or no-go/i);
  assert.doesNotMatch(prompt, /LAUNCH GATE|PRODUCT DECISION RECORD|REMIX GATE|SCHEDULE GATE/);

  const results = readiness.expectations.map(({ id }) => ({
    expectationId: id,
    status: "passed",
    evidence: [`crowdfunding-readiness/review/${id}.json`],
  }));
  assert.equal(evaluateExpectationResults(readiness.expectations, results), "passed");
  assert.equal(evaluateExpectationResults(readiness.expectations, results.slice(1)), "unproven");

  const unsafePath = structuredClone(readiness);
  unsafePath.crowdfundingCampaignReadiness.economicsPath = "../economics.json";
  assert.throws(() => compilePack(unsafePath), /safe repository-relative path/);
  const liveSchedule = structuredClone(readiness);
  liveSchedule.schedule = {
    request: "schedule live campaign",
    title: "Live funding",
    description: "Operate the campaign",
    safeDefault: "report only",
  };
  assert.throws(() => compilePack(liveSchedule), /must not define live campaign operations/);
});

test("Kickstarter Fulfillment begins only after funding and preserves shipment evidence", () => {
  const fulfillment = publicPacks.find((candidate) => candidate.slug === "kickstarter-fulfillment");

  assert.ok(fulfillment);
  assert.equal(getCatalogNumber(fulfillment.slug), 9);
  assert.equal(fulfillment.lane, "operate");
  assert.match(fulfillment.promise, /95% shipped/i);
  assert.match(fulfillment.guardrails.join(" "), /personal names.*addresses.*version control/i);
  assert.match(fulfillment.verification.join(" "), /frozen denominator/i);
  assert.match(fulfillment.schedule.request, /schedule Kickstarter fulfillment operations/i);
  const fulfillmentPrompt = compilePack(fulfillment).runPrompt;
  assert.match(fulfillmentPrompt, /^Establish and run the first cycle of the Kickstarter Fulfillment outcome/);
  assert.match(fulfillmentPrompt, /SCHEDULE GATE/);
  assert.match(fulfillmentPrompt, /fulfillment\/receipts\/YYYY-MM-DDTHHMMSSZ\.md/);
  assert.match(fulfillment.notFor.join(" "), /Crowdfunding Campaign Readiness.*catalog gap for a live funding run/i);

  for (const candidate of [fulfillment]) {
    const owned = candidate.workstreams.flatMap((stream) => stream.owns.map((path) => ({ stream: stream.id, path })));
    for (const left of owned) {
      for (const right of owned) {
        if (left.stream === right.stream) continue;
        assert.equal(left.path.startsWith(right.path) || right.path.startsWith(left.path), false, `${candidate.slug}: ${left.path} overlaps ${right.path}`);
      }
    }
  }
});
