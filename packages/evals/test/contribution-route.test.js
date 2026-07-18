import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadLockedScenarios } from "../src/load.js";
import {
  nodeRevision,
  validateRunKnowledgeAgainstGraph,
} from "../src/knowledge.js";
import { scoreRun } from "../src/score.js";
import { createFixturePair } from "./fixtures/receipt-fixtures.js";

const scenarioDirectory = fileURLToPath(
  new URL("../../../evals/scenarios/v1/", import.meta.url),
);

async function inventoryScenario() {
  return (await loadLockedScenarios(scenarioDirectory)).scenarios.get(
    "inventory-dashboard",
  );
}

function graphFor(run) {
  const ids = run.transcript.events
    .filter((event) => event.knowledge?.source === "possible-node")
    .map((event) => event.knowledge.nodeId);
  return {
    nodes: [...new Set(ids)].sort().map((id) => ({ id, title: `Maintained ${id}` })),
    edges: [],
  };
}

function addContributionInvitation(transcript) {
  transcript.events.push({
    id: "event-20",
    index: 20,
    at: "2026-07-17T00:00:20Z",
    actor: "agent",
    type: "message",
    content:
      "I do not have a maintained route for barcode scanning here. If you have a specific, sourced route, you can contribute a page; I will not fill the gap with a guessed solution.",
    claimIds: [],
  });
}

test("distinguishes maintained, missing, and partial routes without inventing a contribution solution", async () => {
  const scenario = await inventoryScenario();

  const maintained = createFixturePair(scenario).possible;
  maintained.transcript.runKind = "real-agent-run";
  const graph = graphFor(maintained);
  for (const event of maintained.transcript.events.filter((candidate) => candidate.knowledge)) {
    event.knowledge.revision = nodeRevision(
      graph.nodes.find((node) => node.id === event.knowledge.nodeId),
    );
  }
  assert.equal(validateRunKnowledgeAgainstGraph(maintained, graph), true);

  const missing = structuredClone(maintained);
  missing.transcript.events[7].knowledge.nodeId = "web/routes/barcode-scanning";
  assert.throws(
    () => validateRunKnowledgeAgainstGraph(missing, graph),
    (error) => error.code === "KNOWLEDGE_NODE_MISSING",
  );

  const partial = createFixturePair(scenario).possible;
  partial.receipt.adjudication.knowledgeUses =
    partial.receipt.adjudication.knowledgeUses.filter(
      (use) => use.requirementId !== "productive-web-stack",
    );
  const partialScore = scoreRun(partial);
  assert.ok(partialScore.metrics.contributorKnowledgeCoverage < 1);
  assert.deepEqual(partialScore.metrics.missingKnowledgeRequirementIds, [
    "productive-web-stack",
  ]);

  const honest = createFixturePair(scenario).possible;
  addContributionInvitation(honest.transcript);
  const honestScore = scoreRun(honest);
  assert.equal(honestScore.metrics.unsupportedClaimCount, 0);

  const fabricated = structuredClone(honest);
  fabricated.transcript.events.at(-1).claimIds = ["invented-barcode-route"];
  fabricated.receipt.adjudication.claims.push({
    id: "invented-barcode-route",
    eventId: "event-20",
    text: "A complete barcode-scanning workflow is already maintained here.",
    category: "recommendation",
    material: true,
    constraintIds: ["inventory-workflow-fit"],
    evidenceEventIds: [],
  });
  const fabricatedScore = scoreRun(fabricated);
  assert.equal(fabricatedScore.metrics.unsupportedClaimCount, 1);
  assert.equal(fabricatedScore.metrics.unsupportedClaims[0].reason, "no-evidence");
});
