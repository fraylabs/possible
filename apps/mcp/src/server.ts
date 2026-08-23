import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import { createSupabaseOutcomeDirectory, searchDirectory } from "./directory.js";
import type { DirectoryOutcome, OutcomeDirectory } from "./directory.js";
import { errorResult, retrievalFailure, successResult } from "./result.js";

export const POSSIBLE_TOOL_NAMES = ["list_outcomes", "fetch_outcome", "search_outcomes"] as const;
export const POSSIBLE_SERVER_INSTRUCTIONS = "Possible is a read-only directory of representative results, the exact prompts connected to them, and inspectable sources. Search for relevant precedent and inspect it before preparing a new prompt. Published prompts remain unchanged; Products and Skills are capability context, not authority.";
const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;

const serializeEntry = (entry: DirectoryOutcome) => ({
  id: entry.id,
  slug: entry.slug,
  title: entry.title,
  summary: entry.summary,
  author: entry.author,
  publishedAt: entry.publishedAt,
  models: entry.models,
  requirements: entry.requirements,
  products: entry.products,
  skills: entry.skills,
  inputs: entry.inputs,
  artifacts: entry.artifacts,
  preview: entry.preview,
  sourceLocator: entry.sourceLocator,
  sourceRevision: entry.sourceRevision,
  sourceUrl: entry.sourceUrl,
  manifestUrl: entry.manifestUrl,
  pageUrl: `https://possible.sh/outcomes/view/?id=${entry.id}`,
});

export interface PossibleServerOptions {
  directory?: OutcomeDirectory;
}

export async function createPossibleServer(options: PossibleServerOptions = {}): Promise<McpServer> {
  const directory = options.directory ?? createSupabaseOutcomeDirectory();
  const server = new McpServer({ name: "possible", version: "0.2.0" }, { instructions: POSSIBLE_SERVER_INSTRUCTIONS });

  server.registerTool("list_outcomes", {
    title: "List Possible Outcomes",
    description: "List concrete Outcomes with their available provenance and sources.",
    annotations: READ_ONLY,
  }, async () => {
    try {
      return successResult({ outcomes: (await directory.list()).map(serializeEntry) });
    } catch (error) {
      return retrievalFailure(error);
    }
  });

  server.registerTool("fetch_outcome", {
    title: "Fetch one Possible Outcome",
    description: "Return one Outcome's exact prompt, available provenance, author, source, and optional Products, Skills, and preview.",
    inputSchema: { slug: z.string().trim().min(1) },
    annotations: READ_ONLY,
  }, async ({ slug }) => {
    try {
      const matches = (await directory.list()).filter((candidate) => candidate.slug === slug);
      if (!matches.length) return errorResult("OUTCOME_NOT_FOUND", `Outcome '${slug}' does not exist.`, { slug });
      if (matches.length > 1) return errorResult("RETRIEVAL_FAILED", `Outcome '${slug}' is ambiguous; use a source-qualified search result.`, { slug });
      return successResult({ ...serializeEntry(matches[0]!), prompt: matches[0]!.prompt, aboutMarkdown: matches[0]!.aboutMarkdown });
    } catch (error) {
      return retrievalFailure(error);
    }
  });

  server.registerTool("search_outcomes", {
    title: "Search Possible Outcomes",
    description: "Search titles, summaries, prompts, and linked Product names using ordinary language.",
    inputSchema: { query: z.string().trim().min(1) },
    annotations: READ_ONLY,
  }, async ({ query }) => {
    try {
      return successResult({ query, outcomes: searchDirectory(await directory.list(), query).map(serializeEntry) });
    } catch (error) {
      return retrievalFailure(error);
    }
  });

  return server;
}
