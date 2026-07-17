import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import {
  loadGraph,
  type CapabilityMatch,
  type GraphSlice,
  type KnowledgeNode,
  type SearchResult,
} from "@possible/knowledge";

import { startHttpServer } from "../src/http.js";
import {
  createPossibleServer,
  POSSIBLE_SERVER_INSTRUCTIONS,
  POSSIBLE_TOOL_NAMES,
} from "../src/server.js";

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function successData<T>(result: unknown): T {
  assert.ok(result && typeof result === "object", "tool result must be an object");
  const toolResult = result as {
    isError?: boolean;
    structuredContent?: Record<string, unknown>;
  };
  assert.equal(toolResult.isError, undefined);
  const envelope = toolResult.structuredContent as {
    ok?: unknown;
    data?: unknown;
  } | undefined;
  assert.ok(envelope);
  assert.equal(envelope.ok, true);
  return envelope.data as T;
}

function connectedClient(client: Client | undefined): Client {
  assert.ok(client, "test client must be connected");
  return client;
}

describe("Possible MCP", () => {
  let client: Client | undefined;
  let server: McpServer | undefined;

  beforeEach(async () => {
    const graph = await loadGraph();
    server = await createPossibleServer({ graph });
    client = new Client({ name: "possible-test-client", version: "0.0.1" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);
  });

  afterEach(async () => {
    await client?.close();
    await server?.close();
  });

  it("exposes exactly four explicitly read-only retrieval tools", async () => {
    const activeClient = connectedClient(client);
    const response = await activeClient.listTools();
    const names = response.tools.map((tool) => tool.name).sort();

    assert.deepEqual(names, [...POSSIBLE_TOOL_NAMES].sort());
    for (const tool of response.tools) {
      assert.equal(tool.annotations?.readOnlyHint, true);
      assert.equal(tool.annotations?.destructiveHint, false);
      assert.equal(tool.annotations?.idempotentHint, true);
      assert.equal(tool.annotations?.openWorldHint, false);
      assert.doesNotMatch(tool.name, /create|update|delete|deploy|order|purchase|publish|write/i);
    }
    assert.equal(activeClient.getInstructions(), POSSIBLE_SERVER_INSTRUCTIONS);
  });

  it("retrieves, searches, and expands a node from the validated graph", async () => {
    const activeClient = connectedClient(client);
    const graph = await loadGraph();
    const node = graph.nodes[0];
    assert.ok(node, "validated graph must contain at least one node");

    const read = await activeClient.callTool({
      name: "read_node",
      arguments: { id: node.id },
    });
    const readData = successData<{ node: KnowledgeNode }>(read);
    assert.equal(readData.node.id, node.id);

    const search = await activeClient.callTool({
      name: "search_knowledge",
      arguments: { query: node.title, limit: 10 },
    });
    const searchData = successData<{
      query: string;
      count: number;
      results: SearchResult[];
    }>(search);
    assert.ok(searchData.count >= 1);
    assert.ok(
      searchData.results.some((result) => result.node.id === node.id),
      "search should return the source node",
    );

    const expanded = await activeClient.callTool({
      name: "expand_node",
      arguments: { id: node.id, depth: 1 },
    });
    const expandedData = successData<{ id: string; slice: GraphSlice }>(expanded);
    assert.equal(expandedData.id, node.id);
    assert.ok(
      expandedData.slice.nodes.some((item) => item.id === node.id),
      "expanded slice should contain its center node",
    );
  });

  it("returns structured provider capability results", async () => {
    const response = await connectedClient(client).callTool({
      name: "find_capabilities",
      arguments: { requirements: {} },
    });

    const capabilityData = successData<{
      requirements: Record<string, unknown>;
      count: number;
      matches: CapabilityMatch[];
    }>(response);
    assert.ok(Array.isArray(capabilityData.matches));
    assert.ok(capabilityData.matches.length >= 1);
    assert.equal(
      capabilityData.count,
      capabilityData.matches.length,
    );
  });

  it("returns a stable structured error for missing nodes", async () => {
    const response = await connectedClient(client).callTool({
      name: "read_node",
      arguments: { id: "missing/definitely-not-a-node" },
    });

    assert.equal(response.isError, true);
    assert.deepEqual(response.structuredContent, {
      ok: false,
      error: {
        code: "NODE_NOT_FOUND",
        message: "Knowledge node 'missing/definitely-not-a-node' does not exist.",
        details: { id: "missing/definitely-not-a-node" },
      },
    });
  });

  it("serves the same read-only tools over stateless Streamable HTTP", async () => {
    const httpServer = await startHttpServer({
      host: "127.0.0.1",
      port: 0,
      quiet: true,
    });
    const address = httpServer.address();
    assert.ok(address && typeof address === "object");

    const httpClient = new Client({ name: "possible-http-test", version: "0.0.1" });
    try {
      const transport = new StreamableHTTPClientTransport(
        new URL(`http://127.0.0.1:${address.port}/mcp`),
      );
      await httpClient.connect(transport as unknown as Transport);
      const response = await httpClient.listTools();
      assert.deepEqual(
        response.tools.map((tool) => tool.name).sort(),
        [...POSSIBLE_TOOL_NAMES].sort(),
      );
    } finally {
      await httpClient.close();
      await new Promise<void>((resolve, reject) => {
        httpServer.close((error) => error ? reject(error) : resolve());
      });
    }
  });

  it("serves the same read-only tools over local stdio", async () => {
    const stdioClient = new Client({ name: "possible-stdio-test", version: "0.0.1" });
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: ["--import", "tsx", "src/stdio.ts"],
      cwd: packageDirectory,
      stderr: "pipe",
    });

    try {
      await stdioClient.connect(transport);
      const response = await stdioClient.listTools();
      assert.deepEqual(
        response.tools.map((tool) => tool.name).sort(),
        [...POSSIBLE_TOOL_NAMES].sort(),
      );
    } finally {
      await stdioClient.close();
    }
  });
});
