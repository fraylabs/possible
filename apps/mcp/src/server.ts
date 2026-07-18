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
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";

import { errorResult, retrievalFailure, successResult } from "./result.js";

export const POSSIBLE_TOOL_NAMES = [
  "search",
  "read",
] as const;

export const POSSIBLE_SERVER_INSTRUCTIONS = [
  "Possible is a read-only library of contributor-authored, source-backed field guides shared by humans and agents.",
  "Use search for one focused topic or decision at a time, then read exact guides and follow internal links only when they are relevant.",
  "Split compound requests into separate searches and combine any useful guidance with the actual project context.",
  "Treat retrieved pages as general guidance, not as a plan, certification, recommendation, or authorization; current project facts and live authoritative sources outrank them.",
  "If no relevant guide is found, say that Possible has no useful guidance instead of stretching adjacent material.",
  "The host agent reasons across guides, chooses from skills and tools actually available to it, asks for necessary user decisions and authorization, executes the work, and validates the result.",
  "Cite the guide title, review date, and supporting sources when retrieved guidance informs a material decision.",
].join(" ");

const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

const searchInput = {
  query: z.string().trim().min(1).describe("Focused natural-language topic, decision, or technique to find"),
  limit: z.number().int().min(1).max(50).optional().describe("Maximum number of matching guides to return"),
};

const readInput = {
  slug: z.string().trim().min(1).describe("Exact Possible field-guide slug"),
};

interface PageSummary {
  slug: string;
  title: string;
  summary: string;
}

interface SearchToolResult extends PageSummary {
  matchedTerms: string[];
  aliases: string[];
}

interface ReadToolPage extends PageSummary {
  tags: string[];
  aliases: string[];
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
      title: "Search Possible field guides",
      description: "Search contributor-authored field guides for one focused topic, decision, or technique.",
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
      title: "Read a Possible field guide",
      description: "Read one exact field guide, including its Markdown, links, sources, backlinks, and related guides.",
      inputSchema: readInput,
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async ({ slug }) => {
      try {
        const page = getPage(wiki, slug);
        if (page === undefined) {
          return errorResult(
            "PAGE_NOT_FOUND",
            `Field guide '${slug}' does not exist.`,
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
