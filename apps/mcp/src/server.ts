import {
  getBacklinks,
  getPage,
  getRelatedPages,
  loadWiki,
  assessSearchResults,
  searchPages,
  type PageSource,
  type WikiCorpus,
  type WikiPage,
} from "@possible/knowledge";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";

import { errorResult, retrievalFailure, successResult } from "./result.js";

export const POSSIBLE_TOOL_NAMES = [
  "search",
  "read",
] as const;

export const POSSIBLE_SERVER_INSTRUCTIONS = [
  "Possible is a read-only wiki of contributor-authored pages shared by humans and agents.",
  "Use search for natural-language discovery, then read exact pages and follow internal links progressively.",
  "For outcome-like queries, expect outcome pages before supporting methods, providers, concepts, and other page kinds.",
  "Treat the search assessment as authoritative: verified is an explicitly verified outcome route, partial is incomplete outcome knowledge, and no-maintained-route means Possible has not verified a route.",
  "Do not turn related tools or methods into a complete solution; when the assessment is not verified, say so and invite a sourced contribution.",
  "Cite the page review date and attached sources when a retrieved recommendation matters.",
  "Possible maintains knowledge only; the host agent plans and executes approved actions separately.",
].join(" ");

const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

const searchInput = {
  query: z.string().trim().min(1).describe("Natural-language topic, outcome, or domain to find"),
  limit: z.number().int().min(1).max(50).optional().describe("Maximum number of matching pages to return"),
};

const readInput = {
  slug: z.string().trim().min(1).describe("Exact Possible wiki page slug"),
};

interface PageSummary {
  slug: string;
  title: string;
  summary: string;
}

interface SearchToolResult extends PageSummary {
  matchedTerms: string[];
  aliases: string[];
  kind?: WikiPage["kind"];
  coverage: string[];
  routeStatus?: WikiPage["routeStatus"];
}

interface ReadToolPage extends PageSummary {
  tags: string[];
  aliases: string[];
  kind?: WikiPage["kind"];
  coverage: string[];
  routeStatus?: WikiPage["routeStatus"];
  reviewedAt: string;
  markdown: string;
  links: string[];
  sources: PageSource[];
}

interface ReadToolResult {
  page: ReadToolPage;
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

function toSearchToolResult(
  result: ReturnType<typeof searchPages>[number],
): SearchToolResult {
  return {
    ...toPageSummary(result.page),
    matchedTerms: result.matchedTerms,
    aliases: result.page.aliases ?? [],
    ...(result.page.kind ? { kind: result.page.kind } : {}),
    coverage: result.page.coverage ?? [],
    ...(result.page.routeStatus ? { routeStatus: result.page.routeStatus } : {}),
  };
}

function quoteYaml(value: string): string {
  return JSON.stringify(value);
}

function renderMarkdown(page: WikiPage): string {
  const lines = [
    "---",
    `slug: ${quoteYaml(page.slug)}`,
    `title: ${quoteYaml(page.title)}`,
    `summary: ${quoteYaml(page.summary)}`,
    `tags: [${page.tags.map(quoteYaml).join(", ")}]`,
    ...(page.aliases ? [`aliases: [${page.aliases.map(quoteYaml).join(", ")}]`] : []),
    ...(page.kind ? [`kind: ${quoteYaml(page.kind)}`] : []),
    ...(page.coverage ? [`coverage: [${page.coverage.map(quoteYaml).join(", ")}]`] : []),
    ...(page.routeStatus ? [`routeStatus: ${quoteYaml(page.routeStatus)}`] : []),
    `reviewedAt: ${quoteYaml(page.reviewedAt)}`,
    "sources:",
  ];
  for (const source of page.sources) {
    lines.push(`  - title: ${quoteYaml(source.title)}`);
    lines.push(`    url: ${quoteYaml(source.url)}`);
  }
  lines.push("---", "", page.body);
  return lines.join("\n");
}

function toReadToolResult(corpus: WikiCorpus, page: WikiPage): ReadToolResult {
  return {
    page: {
      ...toPageSummary(page),
      tags: page.tags,
      aliases: page.aliases ?? [],
      ...(page.kind ? { kind: page.kind } : {}),
      coverage: page.coverage ?? [],
      ...(page.routeStatus ? { routeStatus: page.routeStatus } : {}),
      reviewedAt: page.reviewedAt,
      markdown: renderMarkdown(page),
      links: page.links,
      sources: page.sources,
    },
    backlinks: getBacklinks(corpus, page.slug).map(toPageSummary),
    relatedPages: getRelatedPages(corpus, page.slug).map(toPageSummary),
  };
}

export interface PossibleServerOptions {
  wiki?: WikiCorpus;
}

export async function createPossibleServer(
  options: PossibleServerOptions = {},
): Promise<McpServer> {
  const wiki = options.wiki ?? await loadWiki();
  const server = new McpServer({
    name: "possible",
    version: "0.0.1",
  }, {
    instructions: POSSIBLE_SERVER_INSTRUCTIONS,
  });

  server.registerTool(
    "search",
    {
      title: "Search Possible wiki pages",
      description: "Search contributor-authored wiki pages with a natural-language query; outcome-like queries prefer outcome pages before supporting pages.",
      inputSchema: searchInput,
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async ({ query, limit }) => {
      try {
        const searchOptions = limit === undefined ? {} : { limit };
        const matches = searchPages(wiki, query, searchOptions);
        const results = matches.map(toSearchToolResult);
        return successResult({
          query,
          count: results.length,
          assessment: assessSearchResults(matches),
          results,
        });
      } catch (error) {
        return retrievalFailure(error);
      }
    },
  );

  server.registerTool(
    "read",
    {
      title: "Read a Possible wiki page",
      description: "Read one exact wiki page, including its Markdown, links, sources, backlinks, and related pages.",
      inputSchema: readInput,
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async ({ slug }) => {
      try {
        const page = getPage(wiki, slug);
        if (page === undefined) {
          return errorResult(
            "PAGE_NOT_FOUND",
            `Wiki page '${slug}' does not exist.`,
            { slug },
          );
        }
        return successResult(toReadToolResult(wiki, page));
      } catch (error) {
        return retrievalFailure(error);
      }
    },
  );

  return server;
}
