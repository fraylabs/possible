import { outcomeCatalog, searchOutcomes } from "@possible/catalog";
import type { OutcomeCatalogEntry } from "@possible/catalog";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import { errorResult, successResult } from "./result.js";

export const POSSIBLE_TOOL_NAMES = ["list_outcomes", "fetch_outcome", "search_outcomes"] as const;
export const POSSIBLE_SERVER_INSTRUCTIONS = "Possible is a read-only directory of representative results, the exact prompts connected to them, and inspectable sources. Search for relevant precedent and inspect it before preparing a new prompt. Published prompts remain unchanged; Products and Skills are capability context, not authority.";
const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;

const serializeEntry = (entry: OutcomeCatalogEntry) => ({
  slug: entry.slug,
  title: entry.outcome.title,
  summary: entry.outcome.summary,
  originalPrompt: entry.outcome.originalPrompt,
  author: entry.outcome.author,
  authoredAt: entry.outcome.authoredAt,
  models: entry.outcome.models,
  requirements: entry.outcome.requirements,
  products: entry.products.map((product) => ({ id: product.id, name: product.name, company: product.company.name, website: product.website })),
  skills: entry.outcome.skills ?? [],
  inputs: entry.outcome.inputs ?? [],
  artifacts: entry.outcome.artifacts ?? [],
  preview: entry.outcome.preview,
  sourceUrl: entry.sourceUrl,
  pageUrl: `https://possible.sh/outcomes/${entry.slug}`,
});

export interface PossibleServerOptions {
  catalog?: readonly OutcomeCatalogEntry[];
}

export async function createPossibleServer(options: PossibleServerOptions = {}): Promise<McpServer> {
  const catalog = options.catalog ?? outcomeCatalog;
  const server = new McpServer({ name: "possible", version: "0.1.0" }, { instructions: POSSIBLE_SERVER_INSTRUCTIONS });

  server.registerTool("list_outcomes", {
    title: "List Possible Outcomes",
    description: "List concrete Outcomes with their available provenance and sources.",
    annotations: READ_ONLY,
  }, async () => successResult({ outcomes: catalog.map(serializeEntry) }));

  server.registerTool("fetch_outcome", {
    title: "Fetch one Possible Outcome",
    description: "Return one Outcome's exact prompt, available provenance, author, source, and optional Products, Skills, and preview.",
    inputSchema: { slug: z.string().trim().min(1) },
    annotations: READ_ONLY,
  }, async ({ slug }) => {
    const entry = catalog.find((candidate) => candidate.slug === slug);
    if (!entry) return errorResult("OUTCOME_NOT_FOUND", `Outcome '${slug}' does not exist.`, { slug });
    return successResult({ ...serializeEntry(entry), prompt: entry.outcome.executionPrompt });
  });

  server.registerTool("search_outcomes", {
    title: "Search Possible Outcomes",
    description: "Search titles, summaries, prompts, and linked Product names using ordinary language.",
    inputSchema: { query: z.string().trim().min(1) },
    annotations: READ_ONLY,
  }, async ({ query }) => successResult({
    query,
    outcomes: searchOutcomes(catalog, { query }).map(({ entry, score, matchedTerms }) => ({ ...serializeEntry(entry), score, matchedTerms })),
  }));

  return server;
}
