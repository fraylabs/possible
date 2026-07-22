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

  it("lists four stable and ten experimental outcome packs", async () => {
    const result = await client.callTool({ name: "list_packs", arguments: {} });
    const envelope = result.structuredContent as { ok: boolean; data: { packs: Array<{ slug: string; lane: string; status: string }> } };
    assert.equal(envelope.ok, true);
    assert.deepEqual(envelope.data.packs.map(({ slug, lane }) => [slug, lane]), [
      ["hardware-launch", "launch"],
      ["software-launch", "launch"],
      ["open-source-release", "release"],
      ["playable-web-game", "create"],
      ["web-app-operations", "operate"],
      ["working-web-app", "create"],
      ["production-web-release", "release"],
      ["marketing-operations", "operate"],
      ["billion-dollar-saas", "create"],
      ["kickstarter-funding", "launch"],
      ["kickstarter-fulfillment", "operate"],
      ["robot-prototype", "create"],
      ["web-presentation", "create"],
      ["developer-project-launch", "launch"],
    ]);
    assert.equal(envelope.data.packs.filter(({ status }) => status === "stable").length, 4);
    assert.equal(envelope.data.packs.filter(({ status }) => status === "experimental").length, 10);
  });

  it("compiles Web Presentation as a coded browser-deck outcome", async () => {
    const result = await client.callTool({ name: "compile_pack", arguments: { slug: "web-presentation" } });
    const envelope = result.structuredContent as { ok: boolean; data: { pack: { catalogNumber: number; lane: string; plugins: Array<{ invocation: string }> }; installCommands: string[]; runPrompt: string } };
    assert.equal(envelope.ok, true);
    assert.equal(envelope.data.pack.catalogNumber, 13);
    assert.equal(envelope.data.pack.lane, "create");
    assert.equal(envelope.data.installCommands.length, 4);
    assert.equal(envelope.data.pack.plugins.at(0)?.invocation, "@sites");
    assert.match(envelope.data.runPrompt, /\$frontend-slides/);
    assert.match(envelope.data.runPrompt, /\$impeccable/);
    assert.match(envelope.data.runPrompt, /Editable coded browser presentation/);
  });

  it("compiles Robot Prototype", async () => {
    const result = await client.callTool({ name: "compile_pack", arguments: { slug: "robot-prototype" } });
    const envelope = result.structuredContent as { ok: boolean; data: { installCommands: string[]; runPrompt: string } };
    assert.equal(envelope.ok, true);
    assert.equal(envelope.data.installCommands.length, 3);
    assert.match(envelope.data.runPrompt, /\$mujoco-robotics/);
    assert.match(envelope.data.runPrompt, /Parametric STEP assembly/);
    assert.match(envelope.data.runPrompt, /sim-to-real gap completion report/);
  });

  it("compiles Hardware Launch", async () => {
    const result = await client.callTool({ name: "compile_pack", arguments: { slug: "hardware-launch" } });
    assert.equal(result.isError, undefined);
    const envelope = result.structuredContent as { ok: boolean; data: { pack: { lane: string; plugins: Array<{ invocation: string }> }; installCommands: string[]; runPrompt: string } };
    assert.equal(envelope.ok, true);
    assert.equal(envelope.data.pack.lane, "launch");
    assert.equal(envelope.data.installCommands.length, 4);
    assert.equal(envelope.data.pack.plugins.at(0)?.invocation, "@sites");
    assert.match(envelope.data.runPrompt, /LEAD AGENT WORKFLOW/);
    assert.match(envelope.data.runPrompt, /OPENAI SITES MVP PATH/);
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
    assert.match(envelope.data.runPrompt, /First dated operations completion report/);
    assert.match(envelope.data.runPrompt, /OPERATING LOOP/);
    assert.match(envelope.data.runPrompt, /YYYY-MM-DDTHHMMSSZ\.md/);
  });

  it("compiles Working Web App", async () => {
    const result = await client.callTool({ name: "compile_pack", arguments: { slug: "working-web-app" } });
    const envelope = result.structuredContent as { ok: boolean; data: { pack: { catalogNumber: number; lane: string }; installCommands: string[]; runPrompt: string } };
    assert.equal(envelope.ok, true);
    assert.equal(envelope.data.pack.catalogNumber, 6);
    assert.equal(envelope.data.pack.lane, "create");
    assert.equal(envelope.data.installCommands.length, 2);
    assert.match(envelope.data.runPrompt, /^Build the Working Web App outcome/);
  });

  it("compiles Production Web Release with its second approval gate", async () => {
    const result = await client.callTool({ name: "compile_pack", arguments: { slug: "production-web-release" } });
    const envelope = result.structuredContent as { ok: boolean; data: { pack: { catalogNumber: number; lane: string }; installCommands: string[]; runPrompt: string } };
    assert.equal(envelope.ok, true);
    assert.equal(envelope.data.pack.catalogNumber, 7);
    assert.equal(envelope.data.pack.lane, "release");
    assert.equal(envelope.data.installCommands.length, 3);
    assert.match(envelope.data.runPrompt, /^Prepare and verify the Production Web Release outcome/);
    assert.match(envelope.data.runPrompt, /RELEASE GATE/);
  });

  it("compiles Marketing Operations as a safely schedulable loop", async () => {
    const result = await client.callTool({ name: "compile_pack", arguments: { slug: "marketing-operations" } });
    const envelope = result.structuredContent as { ok: boolean; data: { pack: { catalogNumber: number; lane: string; artifactRoot: string }; installCommands: string[]; runPrompt: string } };
    assert.equal(envelope.ok, true);
    assert.equal(envelope.data.pack.catalogNumber, 8);
    assert.equal(envelope.data.pack.lane, "operate");
    assert.equal(envelope.data.pack.artifactRoot, "marketing");
    assert.equal(envelope.data.installCommands.length, 1);
    assert.match(envelope.data.runPrompt, /\$marketing-loops/);
    assert.match(envelope.data.runPrompt, /marketing\/receipts\/YYYY-MM-DDTHHMMSSZ\.md/);
    assert.match(envelope.data.runPrompt, /SCHEDULE GATE/);
    assert.match(envelope.data.runPrompt, /must never publish, post, send email or messages/);
  });
});
