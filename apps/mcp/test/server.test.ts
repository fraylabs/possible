import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
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
  afterEach(async () => { await client.close(); await server.close(); });

  it("exposes two read-only pack tools", async () => {
    const response = await client.listTools();
    assert.deepEqual(response.tools.map((tool) => tool.name).sort(), [...POSSIBLE_TOOL_NAMES].sort());
    for (const tool of response.tools) assert.equal(tool.annotations?.readOnlyHint, true);
    assert.equal(client.getInstructions(), POSSIBLE_SERVER_INSTRUCTIONS);
  });

  it("compiles Hardware Launch", async () => {
    const result = await client.callTool({ name: "compile_pack", arguments: { slug: "hardware-launch" } });
    assert.equal(result.isError, undefined);
    const envelope = result.structuredContent as { ok: boolean; data: { installCommands: string[]; runPrompt: string } };
    assert.equal(envelope.ok, true);
    assert.equal(envelope.data.installCommands.length, 4);
    assert.match(envelope.data.runPrompt, /CAPTAIN WORKFLOW/);
  });
});
