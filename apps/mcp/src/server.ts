import {
  expandNode,
  findCapabilities,
  getNode,
  loadGraph,
  searchGraph,
  type CapabilityRequirements,
  type ExpandOptions,
  type KnowledgeGraph,
  type SearchOptions,
} from "@possible/knowledge";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";

import { errorResult, retrievalFailure, successResult } from "./result.js";

export const POSSIBLE_TOOL_NAMES = [
  "search_knowledge",
  "read_node",
  "expand_node",
  "find_capabilities",
] as const;

export const POSSIBLE_SERVER_INSTRUCTIONS = [
  "Possible is a read-only source of contributor-authored operational knowledge.",
  "Search first, read only relevant nodes, and expand the graph progressively.",
  "Treat recommendations as conditional and inspect provenance, freshness, alternatives, and unknowns.",
  "Provider results describe capabilities but never authorize credentials, deployment, DNS changes, payments, orders, or fabrication.",
].join(" ");

const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

const searchInput = {
  query: z.string().trim().min(1).describe("Outcome, domain, tool, workflow, or provider to find"),
  limit: z.number().int().min(1).max(50).optional().describe("Maximum results; defaults to the knowledge package limit"),
  domains: z.array(z.enum(["web", "manufacturing"])).min(1).optional().describe("Optional knowledge-domain filter"),
  types: z.array(z.enum(["topic", "practice", "tool", "provider", "action"])).min(1).optional().describe("Optional node-type filter"),
};

const nodeInput = {
  id: z.string().trim().min(1).describe("Stable Possible knowledge node identifier"),
};

const expandInput = {
  ...nodeInput,
  depth: z.number().int().min(1).max(3).optional().describe("Relationship depth; prefer 1 for progressive retrieval"),
  direction: z.enum(["incoming", "outgoing", "both"]).optional().describe("Relationship traversal direction"),
  relationshipTypes: z.array(z.enum([
    "hierarchy",
    "relevance",
    "compatibility",
    "alternatives",
    "support",
    "invocation",
  ])).min(1).optional().describe("Optional relationship-type filter"),
  limit: z.number().int().min(1).max(100).optional().describe("Maximum nodes in the returned graph slice"),
};

const capabilitiesInput = {
  requirements: z.object({
    domain: z.enum(["web", "manufacturing"]).optional(),
    capabilities: z.array(z.string().trim().min(1)).optional(),
    accepts: z.array(z.string().trim().min(1)).optional(),
    outputs: z.array(z.string().trim().min(1)).optional(),
    query: z.string().trim().min(1).optional(),
    providerIds: z.array(z.string().trim().min(1)).optional(),
  }).strict().describe("Known outcome and provider constraints; omit unknown fields instead of guessing"),
};

export interface PossibleServerOptions {
  graph?: KnowledgeGraph;
}

export async function createPossibleServer(
  options: PossibleServerOptions = {},
): Promise<McpServer> {
  const graph = options.graph ?? await loadGraph();
  const server = new McpServer({
    name: "possible",
    version: "0.0.1",
  }, {
    instructions: POSSIBLE_SERVER_INSTRUCTIONS,
  });

  server.registerTool(
    "search_knowledge",
    {
      title: "Search Possible knowledge",
      description: "Find contributor-authored operational knowledge before choosing a stack, workflow, tool, or provider.",
      inputSchema: searchInput,
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async ({ query, limit, domains, types }) => {
      try {
        const searchOptions: SearchOptions = {};
        if (limit !== undefined) searchOptions.limit = limit;
        if (domains !== undefined) searchOptions.domains = domains;
        if (types !== undefined) searchOptions.types = types;
        const results = searchGraph(graph, query, searchOptions);
        return successResult({ query, count: results.length, results });
      } catch (error) {
        return retrievalFailure(error);
      }
    },
  );

  server.registerTool(
    "read_node",
    {
      title: "Read a Possible node",
      description: "Read one knowledge node with its conditional guidance, provenance, contributors, and freshness.",
      inputSchema: nodeInput,
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async ({ id }) => {
      try {
        const node = getNode(graph, id);
        if (node === undefined) {
          return errorResult(
            "NODE_NOT_FOUND",
            `Knowledge node '${id}' does not exist.`,
            { id },
          );
        }
        return successResult({ node });
      } catch (error) {
        return retrievalFailure(error);
      }
    },
  );

  server.registerTool(
    "expand_node",
    {
      title: "Expand a Possible node",
      description: "Retrieve a bounded graph slice around one node to inspect related practices, tools, alternatives, and actions.",
      inputSchema: expandInput,
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async ({ id, depth, direction, relationshipTypes, limit }) => {
      try {
        if (getNode(graph, id) === undefined) {
          return errorResult(
            "NODE_NOT_FOUND",
            `Knowledge node '${id}' does not exist.`,
            { id },
          );
        }
        const expandOptions: ExpandOptions = {};
        if (depth !== undefined) expandOptions.depth = depth;
        if (direction !== undefined) expandOptions.direction = direction;
        if (relationshipTypes !== undefined) {
          expandOptions.relationshipTypes = relationshipTypes;
        }
        if (limit !== undefined) expandOptions.limit = limit;
        const slice = expandNode(graph, id, expandOptions);
        return successResult({ id, slice });
      } catch (error) {
        return retrievalFailure(error);
      }
    },
  );

  server.registerTool(
    "find_capabilities",
    {
      title: "Find provider capabilities",
      description: "Find services or manufacturers whose documented capabilities fit known outcome constraints; this does not invoke them.",
      inputSchema: capabilitiesInput,
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async ({ requirements }) => {
      try {
        const matches = findCapabilities(
          graph,
          requirements as CapabilityRequirements,
        );
        return successResult({ requirements, count: matches.length, matches });
      } catch (error) {
        return retrievalFailure(error);
      }
    },
  );

  return server;
}
