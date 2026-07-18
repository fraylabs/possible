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
  getBacklinks,
  getPage,
  getRelatedPages,
  loadWiki,
  searchPages,
  type PageSource,
  type WikiCorpus,
  type WikiPage,
} from "@possible/knowledge";

import { startHttpServer } from "../src/http.js";
import {
  createPossibleServer,
  POSSIBLE_SERVER_INSTRUCTIONS,
  POSSIBLE_TOOL_NAMES,
} from "../src/server.js";

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const missingSlug = "missing-page";

const fixtureWiki: WikiCorpus = {
  pages: [
    {
      slug: "build-an-accessible-site",
      title: "Build an accessible site",
      summary: "Publish an inclusive website with semantic HTML and keyboard support.",
      body: "Start with landmarks, headings, labels, and visible focus states.\n\nThen compare [hosting options](/wiki/choose-web-hosting).",
      tags: ["web", "accessibility"],
      aliases: ["inclusive web page", "accessible site", "accessible website"],
      reviewedAt: "2026-07-17",
      sources: [{ title: "Web accessibility guidance", url: "https://example.com/a11y" }],
      links: ["choose-web-hosting"],
    },
    {
      slug: "choose-web-hosting",
      title: "Choose web hosting",
      summary: "Compare hosting constraints for a website before publishing it.",
      body: "Check deployment inputs, custom domains, observability, and rollback options.",
      tags: ["web", "publishing"],
      reviewedAt: "2026-07-16",
      sources: [{ title: "Hosting reference", url: "https://example.com/hosting" }],
      links: [],
    },
    {
      slug: "document-a-project",
      title: "Document a project",
      summary: "Write down decisions and limitations so that work can be reviewed.",
      body: "Link the implementation guide and record verification evidence.\n\nReview [build an accessible site](/wiki/build-an-accessible-site).",
      tags: ["practice"],
      reviewedAt: "2026-07-15",
      sources: [{ title: "Documentation reference", url: "https://example.com/docs" }],
      links: ["build-an-accessible-site"],
    },
  ],
};

interface PageSummary {
  slug: string;
  title: string;
  summary: string;
}

interface SearchResponse {
  query: string;
  count: number;
  results: Array<PageSummary & {
    matchedTerms: string[];
    aliases: string[];
  }>;
}

interface ReadResponse {
  page: PageSummary & {
    tags: string[];
    aliases: string[];
    reviewedAt: string;
    markdown: string;
    links: string[];
    sources: PageSource[];
  };
  backlinks: PageSummary[];
  relatedPages: PageSummary[];
}

function toPageSummary(page: WikiPage): PageSummary {
  return {
    slug: page.slug,
    title: page.title,
    summary: page.summary,
  };
}

function renderMarkdown(page: WikiPage): string {
  const lines = [
    "---",
    `slug: ${JSON.stringify(page.slug)}`,
    `title: ${JSON.stringify(page.title)}`,
    `summary: ${JSON.stringify(page.summary)}`,
    `tags: [${page.tags.map((tag) => JSON.stringify(tag)).join(", ")}]`,
    ...(page.aliases ? [`aliases: [${page.aliases.map((alias) => JSON.stringify(alias)).join(", ")}]`] : []),
    `reviewedAt: ${JSON.stringify(page.reviewedAt)}`,
    "sources:",
  ];
  for (const source of page.sources) {
    lines.push(`  - title: ${JSON.stringify(source.title)}`);
    lines.push(`    url: ${JSON.stringify(source.url)}`);
  }
  lines.push("---", "", page.body);
  return lines.join("\n");
}

function expectedSearchResponse(corpus: WikiCorpus, query: string, limit: number): SearchResponse {
  const results = searchPages(corpus, query, { limit }).map((result) => ({
    ...toPageSummary(result.page),
    matchedTerms: result.matchedTerms,
    aliases: result.page.aliases ?? [],
  }));
  return {
    query,
    count: results.length,
    results,
  };
}

function expectedReadResponse(corpus: WikiCorpus, slug: string): ReadResponse {
  const page = getPage(corpus, slug);
  assert.ok(page, `expected field guide '${slug}' to exist`);
  return {
    page: {
      ...toPageSummary(page),
      tags: page.tags,
      aliases: page.aliases ?? [],
      reviewedAt: page.reviewedAt,
      markdown: renderMarkdown(page),
      links: page.links,
      sources: page.sources,
    },
    backlinks: getBacklinks(corpus, slug).map(toPageSummary),
    relatedPages: getRelatedPages(corpus, slug).map(toPageSummary),
  };
}

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
    server = await createPossibleServer({ wiki: fixtureWiki });
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

  it("exposes exactly two explicitly read-only field-guide retrieval tools", async () => {
    const activeClient = connectedClient(client);
    const response = await activeClient.listTools();
    const names = response.tools.map((tool) => tool.name).sort();

    assert.deepEqual(names, [...POSSIBLE_TOOL_NAMES].sort());
    assert.equal(response.tools.length, 2);
    for (const tool of response.tools) {
      assert.equal(tool.annotations?.readOnlyHint, true);
      assert.equal(tool.annotations?.destructiveHint, false);
      assert.equal(tool.annotations?.idempotentHint, true);
      assert.equal(tool.annotations?.openWorldHint, false);
      assert.doesNotMatch(tool.name, /create|update|delete|deploy|order|purchase|publish|write/i);
    }
    assert.doesNotMatch(
      names.join(" "),
      /search_knowledge|read_node|expand_node|find_capabilities/,
    );
    assert.equal(activeClient.getInstructions(), POSSIBLE_SERVER_INSTRUCTIONS);
    assert.match(POSSIBLE_SERVER_INSTRUCTIONS, /split compound requests into separate searches/i);
    assert.match(POSSIBLE_SERVER_INSTRUCTIONS, /host agent.+chooses.+skills and tools.+executes.+validates/i);
    assert.match(POSSIBLE_SERVER_INSTRUCTIONS, /no relevant guide.+no useful guidance/i);
    assert.doesNotMatch(
      `${POSSIBLE_SERVER_INSTRUCTIONS} ${JSON.stringify(response.tools)}`,
      /routeStatus|no-maintained-route|\bverified\b|\bpartial\b|\bcoverage\b|\bkind\b|outcome-first/i,
    );
  });

  it("searches maintained field guides with a focused natural-language query", async () => {
    const activeClient = connectedClient(client);
    const query = "I want to make an accessible website.";
    const response = await activeClient.callTool({
      name: "search",
      arguments: { query, limit: 5 },
    });

    const data = successData<SearchResponse>(response);
    assert.deepEqual(data, expectedSearchResponse(fixtureWiki, query, 5));
    assert.equal(data.results[0]?.slug, "build-an-accessible-site");
    assert.deepEqual(
      Object.keys(data.results[0] ?? {}).sort(),
      ["aliases", "matchedTerms", "slug", "summary", "title"],
    );
    assert.equal(Object.hasOwn(data, "assessment"), false);
  });

  it("returns an empty retrieval result without inventing guidance", async () => {
    const missing = await connectedClient(client).callTool({
      name: "search",
      arguments: { query: "rocket" },
    });
    assert.deepEqual(successData<SearchResponse>(missing), {
      query: "rocket",
      count: 0,
      results: [],
    });
  });

  it("reads one exact page with markdown, links, sources, backlinks, and related pages", async () => {
    const response = await connectedClient(client).callTool({
      name: "read",
      arguments: { slug: "build-an-accessible-site" },
    });

    const readData = successData<ReadResponse>(response);
    assert.deepEqual(readData, expectedReadResponse(fixtureWiki, "build-an-accessible-site"));
    assert.match(readData.page.markdown, /^---\nslug:/);
    assert.match(readData.page.markdown, /\[hosting options\]\(\/wiki\/choose-web-hosting\)/);
    assert.deepEqual(
      Object.keys(readData.page).sort(),
      ["aliases", "links", "markdown", "reviewedAt", "slug", "sources", "summary", "tags", "title"],
    );
    assert.doesNotMatch(readData.page.markdown, /^(?:kind|coverage|routeStatus):/m);
  });

  it("returns a stable structured error for missing pages", async () => {
    const response = await connectedClient(client).callTool({
      name: "read",
      arguments: { slug: missingSlug },
    });

    assert.equal(response.isError, true);
    assert.deepEqual(response.structuredContent, {
      ok: false,
      error: {
        code: "PAGE_NOT_FOUND",
        message: "Field guide 'missing-page' does not exist.",
        details: { slug: missingSlug },
      },
    });
  });

  it("serves canonical search and read over stateless Streamable HTTP", async () => {
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
      const wiki = await loadWiki();
      const query = wiki.pages[0]?.title ?? "nonexistent field guide";
      const limit = 5;

      const tools = await httpClient.listTools();
      assert.deepEqual(tools.tools.map((tool) => tool.name).sort(), [...POSSIBLE_TOOL_NAMES].sort());
      assert.equal(tools.tools.length, 2);

      const search = await httpClient.callTool({
        name: "search",
        arguments: { query, limit },
      });
      assert.deepEqual(
        successData<SearchResponse>(search),
        expectedSearchResponse(wiki, query, limit),
      );

      if (wiki.pages[0]) {
        const read = await httpClient.callTool({
          name: "read",
          arguments: { slug: wiki.pages[0].slug },
        });
        assert.deepEqual(
          successData<ReadResponse>(read),
          expectedReadResponse(wiki, wiki.pages[0].slug),
        );
      } else {
        const read = await httpClient.callTool({
          name: "read",
          arguments: { slug: missingSlug },
        });
        assert.equal(read.isError, true);
        assert.deepEqual(read.structuredContent, {
          ok: false,
          error: {
            code: "PAGE_NOT_FOUND",
            message: "Field guide 'missing-page' does not exist.",
            details: { slug: missingSlug },
          },
        });
      }
    } finally {
      await httpClient.close();
      await new Promise<void>((resolve, reject) => {
        httpServer.close((error) => error ? reject(error) : resolve());
      });
    }
  });

  it("rejects unsupported HTTP methods on the stateless endpoint", async () => {
    const httpServer = await startHttpServer({
      host: "127.0.0.1",
      port: 0,
      quiet: true,
      wiki: fixtureWiki,
    });
    const address = httpServer.address();
    assert.ok(address && typeof address === "object");

    try {
      const endpoint = new URL(`http://127.0.0.1:${address.port}/mcp`);
      const getResponse = await fetch(endpoint, { method: "GET" });
      assert.equal(getResponse.status, 405);
      assert.equal(getResponse.headers.get("allow"), "POST");
      assert.deepEqual(await getResponse.json(), {
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "This stateless endpoint accepts MCP requests over POST only.",
        },
        id: null,
      });

      const deleteResponse = await fetch(endpoint, { method: "DELETE" });
      assert.equal(deleteResponse.status, 405);
      assert.equal(deleteResponse.headers.get("allow"), "POST");
      assert.deepEqual(await deleteResponse.json(), {
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "This stateless endpoint has no sessions to terminate.",
        },
        id: null,
      });
    } finally {
      await new Promise<void>((resolve, reject) => {
        httpServer.close((error) => error ? reject(error) : resolve());
      });
    }
  });

  it("serves canonical search and read over local stdio", async () => {
    const stdioClient = new Client({ name: "possible-stdio-test", version: "0.0.1" });
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: ["--import", "tsx", "src/stdio.ts"],
      cwd: packageDirectory,
      stderr: "pipe",
    });

    try {
      await stdioClient.connect(transport);
      const wiki = await loadWiki();
      const query = wiki.pages[0]?.title ?? "nonexistent field guide";
      const limit = 5;

      const tools = await stdioClient.listTools();
      assert.deepEqual(tools.tools.map((tool) => tool.name).sort(), [...POSSIBLE_TOOL_NAMES].sort());
      assert.equal(tools.tools.length, 2);

      const search = await stdioClient.callTool({
        name: "search",
        arguments: { query, limit },
      });
      assert.deepEqual(
        successData<SearchResponse>(search),
        expectedSearchResponse(wiki, query, limit),
      );

      if (wiki.pages[0]) {
        const read = await stdioClient.callTool({
          name: "read",
          arguments: { slug: wiki.pages[0].slug },
        });
        assert.deepEqual(
          successData<ReadResponse>(read),
          expectedReadResponse(wiki, wiki.pages[0].slug),
        );
      } else {
        const read = await stdioClient.callTool({
          name: "read",
          arguments: { slug: missingSlug },
        });
        assert.equal(read.isError, true);
        assert.deepEqual(read.structuredContent, {
          ok: false,
          error: {
            code: "PAGE_NOT_FOUND",
            message: "Field guide 'missing-page' does not exist.",
            details: { slug: missingSlug },
          },
        });
      }
    } finally {
      await stdioClient.close();
    }
  });
});
