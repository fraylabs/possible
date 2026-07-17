import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  expandNode,
  findCapabilities,
  getNode,
  loadGraph,
  searchGraph,
} from "../dist/index.js";
import { knowledgeGraphData } from "../dist/data.js";

test("compiled graph carries both branches and every minimum node semantic", async () => {
  const graph = await loadGraph();
  assert.ok(graph.nodes.length >= 24);
  assert.ok(graph.nodes.filter((node) => node.domain === "web").length >= 10);
  assert.ok(graph.nodes.filter((node) => node.domain === "manufacturing").length >= 10);
  assert.deepEqual(
    [...new Set(graph.nodes.map((node) => node.type))].sort(),
    ["action", "practice", "provider", "tool", "topic"],
  );
  assert.deepEqual(
    [...new Set(graph.edges.map((edge) => edge.type))].sort(),
    ["alternatives", "compatibility", "hierarchy", "invocation", "relevance", "support"],
  );
});

test("loadGraph isolates callers from the browser-safe canonical export", async () => {
  const graph = await loadGraph();
  graph.nodes[0].title = "mutated by caller";
  assert.notEqual(knowledgeGraphData.nodes[0].title, "mutated by caller");
});

test("search is deterministic, conditional, and filterable", async () => {
  const graph = await loadGraph();
  const first = searchGraph(graph, "inventory dashboard", { domains: ["web"] });
  const second = searchGraph(graph, "inventory dashboard", { domains: ["web"] });
  assert.ok(first.length > 0);
  assert.equal(first[0].node.id, "web/outcomes/dashboards");
  assert.deepEqual(first, second);
  assert.equal(searchGraph(graph, "inventory dashboard", { domains: ["manufacturing"] }).length, 0);
  assert.equal(
    searchGraph(graph, "robotic arm", { domains: ["manufacturing"] })[0]?.node.id,
    "manufacturing/outcomes/robot-arms",
  );
  assert.deepEqual(searchGraph(graph, "   "), []);
});

test("read and graph expansion expose exact nodes and typed neighbors", async () => {
  const graph = await loadGraph();
  assert.equal(getNode(graph, "web/tools/nextjs")?.title, "Next.js");
  assert.equal(getNode(graph, "missing/node"), undefined);
  const slice = expandNode(graph, "web/tools/nextjs", { depth: 1, direction: "both" });
  assert.ok(slice.nodes.some((node) => node.id === "web/outcomes/dashboards"));
  assert.ok(slice.edges.some((edge) => edge.type === "compatibility" || edge.type === "relevance"));
  assert.deepEqual(expandNode(graph, "missing/node"), {
    centerId: "missing/node",
    nodes: [],
    edges: [],
  });
});

test("capability discovery applies structured requirements and returns approval gates", async () => {
  const graph = await loadGraph();
  const webMatches = findCapabilities(graph, {
    domain: "web",
    capabilities: ["Git deployment"],
    accepts: ["Git repository"],
  });
  assert.ok(webMatches.some((match) => match.provider.id === "web/providers/vercel"));
  assert.ok(
    webMatches
      .flatMap((match) => match.actions)
      .every((action) => action.action.access === "external-approval" && action.action.requiresApproval),
  );

  const manufacturingMatches = findCapabilities(graph, {
    domain: "manufacturing",
    capabilities: ["CNC machining"],
    accepts: ["STEP"],
  });
  assert.ok(manufacturingMatches.some((match) => match.provider.id === "manufacturing/providers/protolabs"));
  assert.ok(manufacturingMatches.every((match) => match.unknowns.length >= 2));
  assert.equal(
    findCapabilities(graph, { domain: "manufacturing", accepts: ["imaginary-format"] }).length,
    0,
  );
});

test("browser-safe data projection contains no Node-only runtime imports", async () => {
  const source = await readFile(new URL("../dist/data.js", import.meta.url), "utf8");
  const generated = await readFile(new URL("../dist/generated-data.js", import.meta.url), "utf8");
  assert.doesNotMatch(source + generated, /node:/);
  assert.equal(knowledgeGraphData.nodes.length, (await loadGraph()).nodes.length);
});
