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

  afterEach(async () => {
    await client.close();
    await server.close();
  });

  it("exposes only read-only public distribution tools", async () => {
    const response = await client.listTools();
    assert.deepEqual(response.tools.map((tool) => tool.name).sort(), [...POSSIBLE_TOOL_NAMES].sort());
    for (const tool of response.tools) assert.equal(tool.annotations?.readOnlyHint, true);
    assert.equal(client.getInstructions(), POSSIBLE_SERVER_INSTRUCTIONS);
    assert.match(client.getInstructions() ?? "", /never writes project files/i);
  });

  it("lists public packs with lifecycle and immutable content hashes", async () => {
    const result = await client.callTool({ name: "list_packs", arguments: {} });
    const envelope = result.structuredContent as { ok: boolean; data: { packs: Array<{ slug: string; visibility: string; lifecycle: string; contentHash: string }> } };
    assert.equal(envelope.ok, true);
    assert.equal(envelope.data.packs.length, 29);
    assert.ok(envelope.data.packs.every((pack) => pack.visibility === "public"));
    assert.ok(envelope.data.packs.every((pack) => /^[a-f0-9]{64}$/.test(pack.contentHash)));
    assert.equal(envelope.data.packs.find(({ slug }) => slug === "hardware-launch")?.lifecycle, "archived");
  });

  it("fetches an exact JSON manifest without writing or making it executable", async () => {
    const result = await client.callTool({ name: "fetch_pack", arguments: { slug: "web-presentation" } });
    const envelope = result.structuredContent as { ok: boolean; data: { manifest: { slug: string; packVersion: string; visibility: string; lifecycle: string }; metadata: { contentHash: string; immutableRef: string }; writesProjectFiles: boolean; executable: boolean } };
    assert.equal(envelope.ok, true);
    assert.equal(envelope.data.manifest.slug, "web-presentation");
    assert.equal(envelope.data.manifest.visibility, "public");
    assert.equal(envelope.data.manifest.lifecycle, "reviewed");
    assert.match(envelope.data.metadata.immutableRef, /^web-presentation@1\.0\.0#[a-f0-9]{64}$/);
    assert.equal(envelope.data.writesProjectFiles, false);
    assert.equal(envelope.data.executable, false);
  });

  it("returns a not-found error for private or missing packs", async () => {
    const result = await client.callTool({ name: "fetch_pack", arguments: { slug: "missing-pack" } });
    assert.equal(result.isError, true);
  });
});
