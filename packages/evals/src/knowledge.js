import { fail } from "./errors.js";
import { sha256, stableJson } from "./hash.js";

export async function loadSharedKnowledgeGraph() {
  let knowledgePackage;
  try {
    knowledgePackage = await import("@possible/knowledge");
  } catch (error) {
    fail(
      "KNOWLEDGE_PACKAGE_UNAVAILABLE",
      `build @possible/knowledge before production evaluation: ${error.message}`,
    );
  }
  return knowledgePackage.loadGraph();
}

export function nodeRevision(node) {
  return sha256(stableJson(node));
}

export function validateScenarioKnowledgeReferences(locked, graph) {
  if (!graph || !Array.isArray(graph.nodes)) {
    fail("KNOWLEDGE_GRAPH_INVALID", "shared knowledge graph must contain nodes");
  }
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
  const missing = [];
  for (const scenario of locked.scenarios.values()) {
    for (const requirement of scenario.knowledgeRequirements) {
      for (const nodeId of requirement.acceptableNodeIds) {
        if (!nodesById.has(nodeId)) {
          missing.push({ scenarioId: scenario.id, requirementId: requirement.id, nodeId });
        }
      }
    }
  }
  if (missing.length > 0) {
    fail(
      "KNOWLEDGE_NODE_MISSING",
      `locked evaluation references ${missing.length} missing knowledge node(s)`,
      missing,
    );
  }
  return true;
}

export function validateRunKnowledgeAgainstGraph(run, graph) {
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
  for (const event of run.transcript.events) {
    if (event.knowledge?.source !== "possible-node") continue;
    const node = nodesById.get(event.knowledge.nodeId);
    if (!node) {
      fail(
        "KNOWLEDGE_NODE_MISSING",
        `${run.transcript.transcriptId} retrieved unknown node ${event.knowledge.nodeId}`,
      );
    }
    if (
      run.transcript.runKind === "real-agent-run" &&
      event.knowledge.revision !== nodeRevision(node)
    ) {
      fail(
        "KNOWLEDGE_REVISION_MISMATCH",
        `${event.id} does not identify the exact contributor node revision used`,
        {
          nodeId: event.knowledge.nodeId,
          expected: nodeRevision(node),
          actual: event.knowledge.revision,
        },
      );
    }
  }
  return true;
}
