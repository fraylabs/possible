import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadLockedScenarios } from "../src/load.js";
import {
  nodeRevision,
  validateRunKnowledgeAgainstGraph,
  validateScenarioKnowledgeReferences,
} from "../src/knowledge.js";
import { createFixturePair } from "./fixtures/receipt-fixtures.js";

const scenarioDirectory = fileURLToPath(
  new URL("../../../evals/scenarios/v1/", import.meta.url),
);

function graphFor(locked) {
  const ids = new Set(
    [...locked.scenarios.values()].flatMap((scenario) =>
      scenario.knowledgeRequirements.flatMap(
        (requirement) => requirement.acceptableNodeIds,
      ),
    ),
  );
  return {
    nodes: [...ids].sort().map((id) => ({ id, title: `Fixture ${id}` })),
    edges: [],
  };
}

test("locked knowledge requirements must reference nodes in the shared graph", async () => {
  const locked = await loadLockedScenarios(scenarioDirectory);
  const graph = graphFor(locked);
  assert.equal(validateScenarioKnowledgeReferences(locked, graph), true);
  graph.nodes = graph.nodes.filter((node) => node.id !== "web/tools/nextjs");
  assert.throws(
    () => validateScenarioKnowledgeReferences(locked, graph),
    (error) => error.code === "KNOWLEDGE_NODE_MISSING",
  );
});

test("real run retrievals identify the exact contributor-node revision", async () => {
  const locked = await loadLockedScenarios(scenarioDirectory);
  const scenario = locked.scenarios.get("inventory-dashboard");
  const graph = graphFor(locked);
  const run = createFixturePair(scenario).possible;
  run.transcript.runKind = "real-agent-run";
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  for (const event of run.transcript.events.filter((candidate) => candidate.knowledge)) {
    event.knowledge.revision = nodeRevision(byId.get(event.knowledge.nodeId));
  }
  assert.equal(validateRunKnowledgeAgainstGraph(run, graph), true);
  run.transcript.events[7].knowledge.revision = "stale-revision";
  assert.throws(
    () => validateRunKnowledgeAgainstGraph(run, graph),
    (error) => error.code === "KNOWLEDGE_REVISION_MISMATCH",
  );
});

test("node revisions are deterministic across object key order", () => {
  assert.equal(
    nodeRevision({ id: "web/example", title: "Example" }),
    nodeRevision({ title: "Example", id: "web/example" }),
  );
});
