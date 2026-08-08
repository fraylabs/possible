import assert from "node:assert/strict";
import test from "node:test";
import {
  activeOutcomePacks,
  archivedOutcomePacks,
  compilePack,
  compileWorkstreamWaves,
  evaluateExpectationResults,
  publicOutcomePacks,
  recordOutcomeJourney,
  validateExpectationContract,
  validateOutcomeCheckpoint,
  validateOutcomeRecord,
} from "../dist/index.js";

const publicPacks = publicOutcomePacks;
const standardKeys = new Set([
  "schemaVersion", "packVersion", "visibility", "lifecycle", "lane", "slug", "name", "eyebrow", "promise", "summary",
  "useWhen", "notFor", "reviewedAt", "skills", "workstreams", "reviewSkills", "outputs", "guardrails", "verification", "expectations", "archived",
]);
const removedKeys = [
  "artifactRoot", "crowdfundingCampaignReadiness", "decisionRationale", "firstCustomerSprint", "functionalHardwarePrototype", "hardwarePrototype",
  "launchContentPackage", "manufacturingReadiness", "mechanicalCadReview", "modularOutcome", "opportunityDiscovery", "plugins", "prerequisites", "remix", "schedule", "studyReadiness",
];

test("all public packs use the standard prompt, skills, and expectations contract", () => {
  assert.equal(publicPacks.length, 33);
  assert.equal(new Set(publicPacks.map(({ slug }) => slug)).size, publicPacks.length);
  for (const pack of publicPacks) {
    for (const key of Object.keys(pack)) assert.ok(standardKeys.has(key), `${pack.slug} has non-standard key ${key}`);
    for (const key of removedKeys) assert.equal(key in pack, false, `${pack.slug} retains removed key ${key}`);
    assert.ok(pack.expectations?.length, `${pack.slug} must include a checklist`);
    assert.ok(pack.skills.length >= 1);
    assert.ok(pack.workstreams.length >= 1);
    assert.ok(pack.outputs.length >= 1);
    assert.ok(pack.guardrails.length >= 1);
    assert.ok(pack.verification.length >= 1);
    const compiled = compilePack(pack);
    assert.ok(compiled.installCommands.length >= 1);
    assert.match(compiled.runPrompt, /PRODUCT BRIEF/);
    assert.match(compiled.runPrompt, /SKILLS/);
    assert.match(compiled.runPrompt, /EXPECTATIONS CHECKLIST/);
    assert.match(compiled.runPrompt, /COMPLETION/);
    assert.match(compiled.runPrompt, /RUN EVIDENCE/);
    assert.match(compiled.runPrompt, /outcome-record\.json/);
    assert.doesNotMatch(compiled.runPrompt, /PACK EXPECTATION TEMPLATES|CONDITIONAL MODULES|REMIX GATE|MEASURED HARDWARE PROTOTYPE GATE|PRODUCT DECISION RECORD|OPENAI SITES MVP PATH/);
    for (const source of pack.skills) {
      assert.equal(source.reviewedRevision.length, 40);
      assert.match(source.reviewUrl, new RegExp(source.reviewedRevision));
      assert.ok(compiled.installCommands.some((command) => command.includes(`@${source.reviewedRevision}`) && command.includes(`--skill ${source.skill}`)));
    }
    for (const expectation of pack.expectations) {
      assert.equal("moduleId" in expectation, false);
      assert.ok(expectation.statement.trim());
      assert.ok(expectation.failureModes.length > 0);
      assert.ok(expectation.requiredEvidence.length > 0);
    }
    if (pack.archived) {
      assert.match(pack.archived.archivedAt, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(pack.archived.reason.trim());
      assert.ok(pack.archived.replacementSlugs.length > 0);
      for (const replacement of pack.archived.replacementSlugs) assert.ok(activeOutcomePacks.some(({ slug }) => slug === replacement));
    }
  }
  assert.equal(archivedOutcomePacks.length + activeOutcomePacks.length, publicPacks.length);
});

test("compileInstallCommands supports exact revisions and full-depth skills", () => {
  const pack = publicPacks.find(({ slug }) => slug === "html-css-animated-product-launch-film");
  assert.ok(pack);
  const compiled = compilePack(pack);
  assert.ok(compiled.installCommands.some((command) => command.includes("--full-depth") && command.includes("--skill hyperframes")));
  const drifted = structuredClone(pack);
  drifted.skills[0].installSource = `${drifted.skills[0].repository}@main`;
  assert.throws(() => compilePack(drifted), /must install the exact reviewed revision/);
});

test("workstreams compile into dependency waves and reject cycles", () => {
  const pack = structuredClone(publicPacks.find(({ slug }) => slug === "mechanical-cad-review"));
  assert.ok(pack);
  assert.deepEqual(compileWorkstreamWaves(pack).map((wave) => wave.map(({ id }) => id)), [["mechanical-design"], ["mechanical-review"]]);
  pack.workstreams[0].dependsOn = ["mechanical-review"];
  assert.throws(() => compileWorkstreamWaves(pack), /dependency cycle/);
});

test("expectations are a checklist: required failures block, preferred failures do not", () => {
  const expectations = [
    { id: "attached", statement: "The roof remains attached.", level: "required", failureModes: ["roof lifts"], requiredEvidence: ["assembled review"] },
    { id: "warm-color", statement: "The finish is warm.", level: "preferred", failureModes: ["finish clashes"], requiredEvidence: ["render"] },
  ];
  assert.equal(evaluateExpectationResults(expectations, [
    { expectationId: "attached", status: "passed", evidence: ["review.json"] },
    { expectationId: "warm-color", status: "failed", evidence: ["render.json"] },
  ]), "passed");
  assert.equal(evaluateExpectationResults(expectations, [{ expectationId: "attached", status: "failed", evidence: ["review.json"] }]), "failed");
  assert.equal(evaluateExpectationResults(expectations, []), "unproven");
  assert.throws(() => evaluateExpectationResults(expectations, [{ expectationId: "missing", status: "passed", evidence: ["x.json"] }]), /Unknown expectation/);
});

test("frozen expectation contracts and outcome records require direct evidence", () => {
  const contract = {
    schemaVersion: 1,
    runId: "cat-house-001",
    packSlug: "mechanical-cad-review",
    frozenAt: "2026-07-30T02:00:00.000Z",
    expectations: [{
      id: "roof-remains-attached", statement: "The roof remains mechanically restrained.", source: "user", level: "required", active: true,
      activationEvidence: [".possible/runs/cat-house-001/outcome-brief.md"], failureModes: ["roof lifts"], requiredEvidence: ["assembled section"],
    }],
  };
  assert.equal(validateExpectationContract(contract), contract);
  const record = {
    schemaVersion: 1, runId: contract.runId, packSlug: contract.packSlug, status: "passed", completedAt: "2026-07-30T03:00:00.000Z",
    outcomeBriefPath: ".possible/runs/cat-house-001/outcome-brief.md", expectationContractPath: ".possible/runs/cat-house-001/expectations.json",
    packSnapshotPath: ".possible/runs/cat-house-001/pack.json", skillLockPath: ".possible/runs/cat-house-001/skills-lock.json", workspaceRevision: "revision",
    artifacts: [{ path: "mechanical/cad/cat-house.step", description: "Cat house assembly", workstreamId: "mechanical-design", expectationIds: ["roof-remains-attached"], sha256: "c".repeat(64) }],
    expectationResults: [{ expectationId: "roof-remains-attached", status: "passed", evidence: ["mechanical/review/restraint.json"] }], decisions: [], repairs: [], approvals: [], externalActions: [], limitations: [],
    verification: { reviewer: "fresh-reviewer", independentFromImplementation: true, reportPath: "mechanical/review/final.json", status: "passed" }, checkpointPath: ".possible/checkpoints/cat-house-001.json",
  };
  assert.equal(validateOutcomeRecord(record, contract), record);
  const unsafe = structuredClone(record);
  unsafe.expectationResults[0].evidence = ["../outside.json"];
  assert.throws(() => validateOutcomeRecord(unsafe, contract), /safe repository-relative path/);
  const failed = structuredClone(record);
  failed.expectationResults[0].status = "failed";
  assert.throws(() => validateOutcomeRecord(failed, contract), /requires passed independent verification|requires every active required expectation to pass/);
});

test("outcome checkpoints and journeys retain only completed evidence", () => {
  const checkpoint = {
    schemaVersion: 1, runId: "run-001", packSlug: "mechanical-cad-review", completedAt: "2026-07-30T03:00:00.000Z",
    receiptPath: ".possible/runs/run-001/outcome-record.json", verificationStatus: "partial", becameTrue: [{ statement: "The CAD exports exist.", evidence: ["mechanical/cad/export.step"] }],
    remainingUnknowns: ["physical fit"], riskiestAssumption: "The roof restraint survives handling.", nextDecision: "Whether to print a fit coupon.", candidateNextOutcomes: [{ outcome: "Print fit coupon", rationale: "Tests restraint before fabrication.", addressesUnknowns: ["physical fit"], testsAssumption: "The roof restraint survives handling.", approvalRequired: true }],
  };
  assert.equal(validateOutcomeCheckpoint(checkpoint), checkpoint);
  assert.equal(recordOutcomeJourney("Make a cat house", [checkpoint]).completedOutcomes.length, 1);
});
