import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createConvexOutcomeDirectory } from "../src/directory.js";
import type { DirectoryOutcome, OutcomeDirectory } from "../src/directory.js";
import { createPossibleServer, POSSIBLE_SERVER_INSTRUCTIONS, POSSIBLE_TOOL_NAMES } from "../src/server.js";

const base: DirectoryOutcome = {
  id: "00000000-0000-0000-0000-000000000001",
  slug: "editable-powerpoint",
  title: "Editable PowerPoint",
  summary: "A polished editable PowerPoint deck.",
  aboutMarkdown: "# Editable PowerPoint\n\nA polished editable PowerPoint deck.",
  prompt: "Create an editable PowerPoint deck.",
  requirements: ["Presentation subject"],
  models: [{ provider: "OpenAI", model: "GPT-5.6", role: "execution" }],
  products: [],
  skills: [],
  primary: { kind: "skill", repository: "MiniMax-AI/skills", directory: "skills/pptx-generator", lastReviewedCommit: "0123456789012345678901234567890123456789" },
  secondary: [],
  inputs: [],
  artifacts: [],
  preview: null,
  author: { name: "Fixture", url: "https://example.com" },
  publishedAt: "2026-08-24T00:00:00Z",
  publicationKind: "community",
  sourceLocator: "fixture/outcomes",
  sourceUrl: "https://github.com/fixture/outcomes",
  sourceRevision: "0123456789012345678901234567890123456789",
  manifestUrl: "https://raw.githubusercontent.com/fixture/outcomes/0123456789012345678901234567890123456789/outcomes/editable-powerpoint/outcome.json",
  resultMediaUrl: null,
  posterUrl: null,
  provider: "OpenAI",
  model: "GPT-5.6",
  agent: "Codex",
  useCount: 0,
  likeCount: 0,
};

const recipe: NonNullable<DirectoryOutcome["recipe"]> = {
  agent: { name: "Codex", version: "1.2" },
  skills: [{ repository: "maker/skills", directory: "skills/pptx", lastReviewedCommit: "a".repeat(40) }],
  references: [{ kind: "document", label: "Brief", url: "https://example.com/brief", purpose: "Deck direction" }],
  tools: [{ name: "Renderer", purpose: "Render slides" }],
  steps: [{ title: "Outline", instructions: "Plan the slides", prompt: "Write an outline." }],
};

const outcomes: DirectoryOutcome[] = [
  { ...base, recipe },
  { ...base, id: "00000000-0000-0000-0000-000000000002", slug: "quiet-soundtrack", title: "Quiet Soundtrack", summary: "An original instrumental soundtrack.", prompt: "Compose a quiet original soundtrack." },
];

const directory: OutcomeDirectory = { async list() { return outcomes; } };

describe("Possible MCP", () => {
  let client: Client;
  let server: McpServer;

  beforeEach(async () => {
    server = await createPossibleServer({ directory });
    client = new Client({ name: "possible-test", version: "0.2.0" });
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
    assert.doesNotMatch(client.getInstructions() ?? "", /verification|execution framework/i);
  });

  it("lists Outcomes from the directory", async () => {
    const result = await client.callTool({ name: "list_outcomes", arguments: {} });
    const envelope = result.structuredContent as { ok: boolean; data: { outcomes: Array<{ slug: string; sourceRevision: string }> } };
    assert.equal(envelope.ok, true);
    assert.deepEqual(envelope.data.outcomes.map(({ slug }) => slug), outcomes.map(({ slug }) => slug));
    assert.equal(envelope.data.outcomes[0]?.sourceRevision, base.sourceRevision);
  });

  it("fetches the exact prompt and inspectable source", async () => {
    const result = await client.callTool({ name: "fetch_outcome", arguments: { slug: "editable-powerpoint" } });
    const envelope = result.structuredContent as { data: { prompt: string; manifestUrl: string; author: { name: string } } };
    assert.equal(envelope.data.prompt, base.prompt);
    assert.equal(envelope.data.manifestUrl, base.manifestUrl);
    assert.equal(envelope.data.author.name, "Fixture");
  });

  it("retains the complete optional recipe through MCP list, search, and fetch", async () => {
    const fetched = await client.callTool({ name: "fetch_outcome", arguments: { slug: base.slug } });
    const detail = (fetched.structuredContent as { data: DirectoryOutcome }).data;
    assert.deepEqual(detail.recipe, recipe);
    assert.equal(detail.prompt, base.prompt);
    assert.deepEqual(detail.models, base.models);
    for (const request of [
      { name: "list_outcomes", arguments: {} },
      { name: "search_outcomes", arguments: { query: "editable PowerPoint" } },
    ]) {
      const result = await client.callTool(request);
      const entries = (result.structuredContent as { data: { outcomes: DirectoryOutcome[] } }).data.outcomes;
      assert.deepEqual(entries.find((entry) => entry.id === base.id)?.recipe, recipe);
    }
    const legacy = await client.callTool({ name: "fetch_outcome", arguments: { slug: "quiet-soundtrack" } });
    const legacyDetail = (legacy.structuredContent as { data: DirectoryOutcome }).data;
    assert.ok(legacyDetail.recipe == null);
    assert.equal(legacyDetail.prompt, "Compose a quiet original soundtrack.");
  });

  it("searches ordinary language and returns no invented candidate", async () => {
    const result = await client.callTool({ name: "search_outcomes", arguments: { query: "editable PowerPoint deck" } });
    const envelope = result.structuredContent as { data: { outcomes: Array<{ slug: string }> } };
    assert.equal(envelope.data.outcomes[0]?.slug, "editable-powerpoint");
    const missing = await client.callTool({ name: "search_outcomes", arguments: { query: "zyxquux" } });
    assert.deepEqual((missing.structuredContent as { data: { outcomes: unknown[] } }).data.outcomes, []);
  });

  it("returns a typed not-found error", async () => {
    const result = await client.callTool({ name: "fetch_outcome", arguments: { slug: "missing" } });
    assert.equal(result.isError, true);
    assert.equal((result.structuredContent as { error: { code: string } }).error.code, "OUTCOME_NOT_FOUND");
  });
});


it("maps recipe and legacy HTTP directory rows without losing published ingredients", async () => {
  const row = {
    id: base.id, slug: base.slug, title: base.title, summary: base.summary,
    about_markdown: base.aboutMarkdown, prompt: base.prompt, requirements: base.requirements,
    models: base.models, products: [], skills: [], primary_attribution: base.primary,
    inputs: [], artifacts: [], preview: null, author_name: base.author.name, author_url: base.author.url,
    published_at: base.publishedAt, publication_kind: base.publicationKind,
    source_locator: base.sourceLocator, source_url: base.sourceUrl, source_revision: base.sourceRevision,
    manifest_url: base.manifestUrl, result_media_url: null, poster_url: null,
    provider: base.provider, model: base.model, agent: base.agent, use_count: 0, like_count: 0,
  };
  const directory = createConvexOutcomeDirectory({
    endpoint: "https://directory.example/api/outcomes",
    fetch: async (input, init) => {
      assert.equal(input, "https://directory.example/api/outcomes");
      assert.deepEqual(init?.headers, { accept: "application/json" });
      return new Response(JSON.stringify({ outcomes: [{ ...row, recipe }, { ...row, id: "legacy" }] }), { status: 200 });
    },
  });
  const entries = await directory.list();
  assert.deepEqual(entries[0]?.recipe, recipe);
  assert.deepEqual(entries[0]?.models, base.models);
  assert.equal(entries[0]?.prompt, base.prompt);
  assert.equal(entries[0]?.author.name, base.author.name);
  assert.equal(entries[1]?.recipe, null);
});
