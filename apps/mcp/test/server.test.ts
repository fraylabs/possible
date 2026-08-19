import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { outcomeCatalog } from "@possible/catalog";
import { createPossibleServer, POSSIBLE_SERVER_INSTRUCTIONS, POSSIBLE_TOOL_NAMES } from "../src/server.js";

describe("Possible MCP", () => {
  let client: Client;
  let server: McpServer;

  beforeEach(async () => {
    server = await createPossibleServer();
    client = new Client({ name: "possible-test", version: "0.1.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  });

  afterEach(async () => {
    await client.close();
    await server.close();
  });

  it("exposes only read-only Outcome discovery tools", async () => {
    const response = await client.listTools();
    assert.deepEqual(response.tools.map(({ name }) => name).sort(), [...POSSIBLE_TOOL_NAMES].sort());
    assert.ok(response.tools.every((tool) => tool.annotations?.readOnlyHint));
    assert.equal(client.getInstructions(), POSSIBLE_SERVER_INSTRUCTIONS);
    assert.doesNotMatch(client.getInstructions() ?? "", /trust|verification|execution framework/i);
  });

  it("lists the same Outcomes as the generated catalog", async () => {
    const result = await client.callTool({ name: "list_outcomes", arguments: {} });
    const envelope = result.structuredContent as { ok: boolean; data: { outcomes: Array<{ slug: string; title: string }> } };
    assert.equal(envelope.ok, true);
    assert.deepEqual(envelope.data.outcomes.map(({ slug }) => slug), outcomeCatalog.map(({ slug }) => slug));
  });

  it("fetches the prior request and exact prompt when both exist", async () => {
    const result = await client.callTool({ name: "fetch_outcome", arguments: { slug: "robot-digital-prototype" } });
    const envelope = result.structuredContent as { ok: boolean; data: { originalPrompt: string; prompt: string; execution: { model: string }; author: { name: string } } };
    const source = outcomeCatalog.find(({ slug }) => slug === "robot-digital-prototype");
    assert.ok(source);
    assert.equal(envelope.data.originalPrompt, source.outcome.originalPrompt);
    assert.equal(envelope.data.prompt, source.outcome.executionPrompt);
    assert.equal(envelope.data.execution.model, source.outcome.execution.model);
    assert.equal(envelope.data.author.name, source.outcome.author.name);
  });

  it("preserves an official example without inventing a prior request", async () => {
    const result = await client.callTool({ name: "fetch_outcome", arguments: { slug: "architectural-drawing-rises-from-paper" } });
    const data = (result.structuredContent as { data: { originalPrompt?: string; prompt: string; source: { type: string; url: string }; execution: { model: string; agent?: string } } }).data;
    assert.equal(data.originalPrompt, undefined);
    assert.match(data.prompt, /^A blank sheet of paper/);
    assert.equal(data.source.type, "official-example");
    assert.equal(data.execution.model, "MiniMax-Hailuo-02");
    assert.equal(data.execution.agent, undefined);
  });

  it("searches ordinary language and returns no invented candidate", async () => {
    const result = await client.callTool({ name: "search_outcomes", arguments: { query: "editable PowerPoint deck" } });
    const envelope = result.structuredContent as { data: { outcomes: Array<{ slug: string }> } };
    assert.equal(envelope.data.outcomes[0]?.slug, "polished-editable-powerpoint-presentation");
    const missing = await client.callTool({ name: "search_outcomes", arguments: { query: "zyxquux" } });
    assert.deepEqual((missing.structuredContent as { data: { outcomes: unknown[] } }).data.outcomes, []);
  });

  it("returns a typed not-found error", async () => {
    const result = await client.callTool({ name: "fetch_outcome", arguments: { slug: "missing" } });
    assert.equal(result.isError, true);
    assert.equal((result.structuredContent as { error: { code: string } }).error.code, "OUTCOME_NOT_FOUND");
  });
});
