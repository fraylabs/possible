import { describe, expect, it } from "vitest";
import {
  buildGraphSlice,
  buildPath,
  findAlternativeNodes,
  freshnessLabel,
  normalizeGraphModule,
  searchNodes,
  type DisplayGraph,
} from "./graph";

const graph: DisplayGraph = {
  nodes: [
    {
      id: "root",
      type: "topic",
      title: "Root",
      summary: "A top-level field",
      applicability: [],
      counterconditions: [],
      alternatives: [],
      capabilities: [],
      actions: [],
      sources: [],
      contributors: [],
      tags: [],
    },
    {
      id: "practice-a",
      type: "practice",
      title: "Fast workflow",
      summary: "A productive workflow for constrained projects",
      applicability: ["Fast iteration matters"],
      counterconditions: ["Offline operation is required"],
      alternatives: ["practice-b"],
      capabilities: [],
      actions: [],
      sources: [],
      contributors: [],
      reviewedAt: "2026-07-01",
      tags: ["workflow"],
    },
    {
      id: "practice-b",
      type: "practice",
      title: "Offline method",
      summary: "An alternative approach",
      applicability: [],
      counterconditions: [],
      alternatives: [],
      capabilities: [],
      actions: [],
      sources: [],
      contributors: [],
      tags: ["workflow"],
    },
  ],
  edges: [
    { id: "root-a", source: "root", target: "practice-a", type: "hierarchy", label: "Contains" },
    { id: "alt", source: "practice-a", target: "practice-b", type: "alternative", label: "Alternative" },
  ],
};

describe("knowledge graph adapter", () => {
  it("normalizes browser-safe graph data without inventing content", () => {
    const normalized = normalizeGraphModule({
      graph: {
        nodes: [{
          id: "sample",
          type: "provider",
          title: "Sample provider",
          summary: "Accepts a supported input.",
          applicability: ["The input matches"],
          counterconditions: ["The region is unsupported"],
          actions: [{ title: "Request access", requiresApproval: true, url: "https://example.com" }],
          reviewed_at: "2026-07-01",
        }],
        edges: [],
      },
    });

    expect(normalized.nodes).toHaveLength(1);
    expect(normalized.nodes[0]).toMatchObject({
      id: "sample",
      type: "provider",
      applicability: ["The input matches"],
      counterconditions: ["The region is unsupported"],
      reviewedAt: "2026-07-01",
    });
    expect(normalized.nodes[0]?.actions[0]?.mode).toBe("approval-required");
  });

  it("rejects a module that does not expose graph nodes", () => {
    expect(() => normalizeGraphModule({ content: [] })).toThrow(/nodes array/i);
  });
});

describe("exploration helpers", () => {
  it("searches titles before contextual fields", () => {
    const titleHits = searchNodes(graph, "workflow");
    expect(titleHits.map((hit) => hit.node.id)).toEqual(["practice-a", "practice-b"]);
    expect(titleHits[0]?.score).toBeGreaterThan(titleHits[1]?.score ?? 0);
  });

  it("builds a stable hierarchy path", () => {
    expect(buildPath(graph, "practice-a").map((node) => node.id)).toEqual(["root", "practice-a"]);
  });

  it("includes the selected node and its direct relationships in a graph slice", () => {
    const slice = buildGraphSlice(graph, "practice-a");
    expect(slice.nodes.find((item) => item.depth === 0)?.node.id).toBe("practice-a");
    expect(slice.nodes.map((item) => item.node.id)).toEqual(expect.arrayContaining(["root", "practice-b"]));
  });

  it("resolves alternatives from fields and typed relationships", () => {
    expect(findAlternativeNodes(graph, graph.nodes[1]!).map((node) => node.id)).toEqual(["practice-b"]);
  });

  it("makes freshness explicit instead of implying current knowledge", () => {
    expect(freshnessLabel("2026-07-01", new Date("2026-07-17T00:00:00Z"))).toEqual({
      label: "Reviewed 16d ago",
      state: "fresh",
    });
    expect(freshnessLabel(undefined).state).toBe("unknown");
  });
});
