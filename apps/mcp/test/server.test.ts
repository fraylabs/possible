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

  it("lists all five outcome packs", async () => {
    const result = await client.callTool({ name: "list_packs", arguments: {} });
    const envelope = result.structuredContent as { ok: boolean; data: { packs: Array<{ slug: string; lane: string }> } };
    assert.equal(envelope.ok, true);
    assert.deepEqual(envelope.data.packs.map(({ slug, lane }) => [slug, lane]), [
      ["hardware-launch", "launch"],
      ["software-launch", "launch"],
      ["open-source-release", "release"],
      ["playable-web-game", "create"],
      ["web-app-operations", "operate"],
    ]);
  });

  it("compiles Hardware Launch", async () => {
    const result = await client.callTool({ name: "compile_pack", arguments: { slug: "hardware-launch" } });
    assert.equal(result.isError, undefined);
    const envelope = result.structuredContent as { ok: boolean; data: { pack: { lane: string }; installCommands: string[]; runPrompt: string } };
    assert.equal(envelope.ok, true);
    assert.equal(envelope.data.pack.lane, "launch");
    assert.equal(envelope.data.installCommands.length, 4);
    assert.match(envelope.data.runPrompt, /CAPTAIN WORKFLOW/);
  });

  it("compiles Open-Source Release", async () => {
    const result = await client.callTool({ name: "compile_pack", arguments: { slug: "open-source-release" } });
    const envelope = result.structuredContent as { ok: boolean; data: { installCommands: string[]; runPrompt: string } };
    assert.equal(envelope.ok, true);
    assert.equal(envelope.data.installCommands.length, 1);
    assert.match(envelope.data.runPrompt, /\$github-release/);
  });

  it("compiles Playable Web Game", async () => {
    const result = await client.callTool({ name: "compile_pack", arguments: { slug: "playable-web-game" } });
    const envelope = result.structuredContent as { ok: boolean; data: { installCommands: string[]; runPrompt: string } };
    assert.equal(envelope.ok, true);
    assert.equal(envelope.data.installCommands.length, 3);
    assert.match(envelope.data.runPrompt, /\$threejs/);
    assert.match(envelope.data.runPrompt, /Playable browser game/);
  });

  it("compiles Web App Operations", async () => {
    const result = await client.callTool({ name: "compile_pack", arguments: { slug: "web-app-operations" } });
    const envelope = result.structuredContent as { ok: boolean; data: { pack: { lane: string }; installCommands: string[]; runPrompt: string } };
    assert.equal(envelope.ok, true);
    assert.equal(envelope.data.pack.lane, "operate");
    assert.equal(envelope.data.installCommands.length, 2);
    assert.match(envelope.data.runPrompt, /\$impediment-prioritization/);
    assert.match(envelope.data.runPrompt, /First dated operations receipt/);
    assert.match(envelope.data.runPrompt, /OPERATING LOOP/);
    assert.match(envelope.data.runPrompt, /YYYY-MM-DDTHHMMSSZ\.md/);
  });
});
