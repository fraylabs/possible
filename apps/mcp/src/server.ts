import { compileChain, compilePack, getPack, getPackStatus, outcomePacks } from "@possible/packs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import { errorResult, successResult } from "./result.js";

export const POSSIBLE_TOOL_NAMES = ["list_packs", "compile_pack", "compile_chain"] as const;
export const POSSIBLE_SERVER_INSTRUCTIONS = "Possible publishes inspectable outcome packs: selected external skills, workstream ownership, integration order, guardrails, and verification. List packs first, then compile one exact pack or a conditional chain. Review external sources before installation; pack or chain approval does not authorize external actions.";
const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;

export async function createPossibleServer(): Promise<McpServer> {
  const server = new McpServer({ name: "possible", version: "0.1.0" }, { instructions: POSSIBLE_SERVER_INSTRUCTIONS });
  server.registerTool("list_packs", {
    title: "List Possible outcome packs",
    description: "List Possible outcome packs and whether each is stable or experimental.",
    annotations: READ_ONLY,
  }, async () => successResult({
    packs: outcomePacks.map(({ catalogNumber, slug, lane, name, promise, reviewedAt }) => ({ catalogNumber, slug, lane, name, promise, reviewedAt, status: getPackStatus(slug) })),
  }));
  server.registerTool("compile_pack", {
    title: "Compile a Possible outcome pack",
    description: "Return the manifest, install commands, and Codex run prompt for one exact pack.",
    inputSchema: { slug: z.string().trim().min(1) },
    annotations: READ_ONLY,
  }, async ({ slug }) => {
    const pack = getPack(slug);
    if (pack === undefined) return errorResult("PACK_NOT_FOUND", `Outcome pack '${slug}' does not exist.`, { slug });
    return successResult(compilePack(pack));
  });
  server.registerTool("compile_chain", {
    title: "Compile a Possible outcome chain",
    description: "Return a conditional, separately approved sequence of two or more exact outcome packs.",
    inputSchema: { slugs: z.array(z.string().trim().min(1)).min(2) },
    annotations: READ_ONLY,
  }, async ({ slugs }) => {
    const packs: NonNullable<ReturnType<typeof getPack>>[] = [];
    for (const slug of slugs) {
      const pack = getPack(slug);
      if (pack === undefined) return errorResult("PACK_NOT_FOUND", `Outcome pack '${slug}' does not exist.`, { slug });
      packs.push(pack);
    }
    try {
      return successResult(compileChain(packs));
    } catch (error) {
      return errorResult("CHAIN_INVALID", error instanceof Error ? error.message : "Outcome chain is invalid.", { slugs });
    }
  });
  return server;
}
