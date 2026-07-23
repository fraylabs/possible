import { compilePack, getPack, getPackStatus, outcomePacks, validateOutcomeCheckpoint, type OutcomeCheckpoint } from "@possible/packs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import { errorResult, successResult } from "./result.js";

export const POSSIBLE_TOOL_NAMES = ["list_packs", "compile_pack", "validate_checkpoint"] as const;
export const POSSIBLE_SERVER_INSTRUCTIONS = "Possible publishes inspectable outcome packs: selected external skills, workstream ownership, integration order, guardrails, and verification. Compile only one present Outcome Pack after fresh user approval. After it finishes, validate its new-reality checkpoint and recommend—but never preselect or execute—the next outcome. Review external sources before installation; pack approval does not authorize external actions.";
const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;
const candidateOutcomeSchema = z.object({
  outcome: z.string().trim().min(1),
  matchingPackSlug: z.string().trim().min(1).optional(),
  rationale: z.string().trim().min(1),
  addressesUnknowns: z.array(z.string().trim().min(1)).min(1),
  testsAssumption: z.string().trim().min(1),
  approvalRequired: z.literal(true),
}).passthrough();
const checkpointSchema = z.object({
  schemaVersion: z.literal(1),
  runId: z.string().trim().min(1),
  packSlug: z.string().trim().min(1),
  completedAt: z.string().trim().min(1),
  receiptPath: z.string().trim().min(1),
  verificationStatus: z.enum(["passed", "partial", "failed"]),
  becameTrue: z.array(z.object({
    statement: z.string().trim().min(1),
    evidence: z.array(z.string().trim().min(1)).min(1),
  })).min(1),
  remainingUnknowns: z.array(z.string().trim().min(1)),
  riskiestAssumption: z.string().trim().min(1),
  nextDecision: z.string().trim().min(1),
  candidateNextOutcomes: z.array(candidateOutcomeSchema),
});

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
  server.registerTool("validate_checkpoint", {
    title: "Validate a Possible outcome checkpoint",
    description: "Validate one completed outcome's changed reality and non-executable candidate recommendations.",
    inputSchema: { checkpoint: checkpointSchema },
    annotations: READ_ONLY,
  }, async ({ checkpoint }) => {
    try {
      return successResult({
        checkpoint: validateOutcomeCheckpoint(checkpoint as OutcomeCheckpoint),
        retrospectiveOnly: true,
        executableNextOutcome: false,
      });
    } catch (error) {
      return errorResult("CHECKPOINT_INVALID", error instanceof Error ? error.message : "Outcome checkpoint is invalid.");
    }
  });
  return server;
}
