import { compilePack, hardwareLaunchPack } from "@possible/packs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import { errorResult, successResult } from "./result.js";

export const POSSIBLE_TOOL_NAMES = ["list_packs", "compile_pack"] as const;
export const POSSIBLE_SERVER_INSTRUCTIONS = "Possible publishes inspectable outcome packs: selected external skills, workstream ownership, integration order, guardrails, and verification. List packs first, then compile one exact pack. Review external sources before installation; a pack does not authorize external actions.";
const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;

export async function createPossibleServer(): Promise<McpServer> {
  const server = new McpServer({ name: "possible", version: "0.1.0" }, { instructions: POSSIBLE_SERVER_INSTRUCTIONS });
  server.registerTool("list_packs", {
    title: "List Possible outcome packs",
    description: "List the reviewed outcome packs currently published by Possible.",
    annotations: READ_ONLY,
  }, async () => successResult({
    packs: [{ slug: hardwareLaunchPack.slug, name: hardwareLaunchPack.name, promise: hardwareLaunchPack.promise, reviewedAt: hardwareLaunchPack.reviewedAt }],
  }));
  server.registerTool("compile_pack", {
    title: "Compile a Possible outcome pack",
    description: "Return the manifest, install commands, and Codex run prompt for one exact pack.",
    inputSchema: { slug: z.string().trim().min(1) },
    annotations: READ_ONLY,
  }, async ({ slug }) => {
    if (slug !== hardwareLaunchPack.slug) return errorResult("PACK_NOT_FOUND", `Outcome pack '${slug}' does not exist.`, { slug });
    return successResult(compilePack(hardwareLaunchPack));
  });
  return server;
}
