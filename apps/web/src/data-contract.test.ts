import { describe, expect, it } from "vitest";
import { knowledgeGraphData } from "@possible/knowledge/data";
import { normalizeGraphModule } from "./graph";

describe("browser-safe shared graph contract", () => {
  it("projects every supported node type without app-owned knowledge", () => {
    const graph = normalizeGraphModule(knowledgeGraphData);
    const types = new Set(graph.nodes.map((node) => node.type));

    expect(graph.nodes.length).toBeGreaterThanOrEqual(8);
    expect([...types]).toEqual(expect.arrayContaining(["topic", "practice", "tool", "provider", "action"]));
    expect(graph.edges.length).toBeGreaterThan(0);
  });

  it("preserves trust fields and approval-gated handoffs", () => {
    const graph = normalizeGraphModule(knowledgeGraphData);
    const reviewed = graph.nodes.find((node) => node.reviewedAt && node.sources.length && node.contributors.length);
    const gatedProvider = graph.nodes.find((node) =>
      node.type === "provider" && node.actions.some((action) => action.mode === "approval-required"),
    );

    expect(reviewed).toBeDefined();
    expect(gatedProvider).toBeDefined();
    expect(gatedProvider?.capabilities.length).toBeGreaterThan(0);
  });
});
