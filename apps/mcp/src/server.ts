import { createHash } from "node:crypto";
import { getCatalogNumber, getPack, getPackStatus, publicOutcomePacks } from "@possible/packs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import { errorResult, successResult } from "./result.js";

export const POSSIBLE_TOOL_NAMES = ["list_packs", "fetch_pack"] as const;
export const POSSIBLE_SERVER_INSTRUCTIONS = "Possible MCP is a read-only public Outcome Pack distributor. It lists and fetches exact reviewed JSON manifests with provenance and content hashes. It never writes project files, discovers private packs, compiles or executes packs, approves work, validates checkpoints, or grants authority. The Possible skill and local CLI own project-local pack handling and execution.";
const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;

const canonicalJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`).join(",")}}`;
  }
  return JSON.stringify(value);
};

const contentHash = (pack: unknown): string => createHash("sha256").update(canonicalJson(pack)).digest("hex");
const sourceUrl = (slug: string): string => `https://github.com/fraylabs/possible/blob/main/packages/packs/src/manifests/${slug}.json`;
const reviewUrl = (slug: string): string => `https://possible.sh/packs/${slug}`;

export async function createPossibleServer(): Promise<McpServer> {
  const server = new McpServer({ name: "possible", version: "0.1.0" }, { instructions: POSSIBLE_SERVER_INSTRUCTIONS });
  server.registerTool("list_packs", {
    title: "List public Possible outcome packs",
    description: "List public Outcome Pack metadata. Private project-local packs are never exposed by this server.",
    annotations: READ_ONLY,
  }, async () => successResult({
    packs: publicOutcomePacks.map((pack) => ({
      catalogNumber: getCatalogNumber(pack.slug),
      slug: pack.slug,
      packVersion: pack.packVersion,
      visibility: pack.visibility,
      lifecycle: pack.lifecycle,
      lane: pack.lane,
      name: pack.name,
      promise: pack.promise,
      reviewedAt: pack.reviewedAt,
      status: getPackStatus(pack.slug),
      contentHash: contentHash(pack),
      sourceUrl: sourceUrl(pack.slug),
      reviewUrl: reviewUrl(pack.slug),
    })),
  }));
  server.registerTool("fetch_pack", {
    title: "Fetch a public Possible outcome pack",
    description: "Return one exact public JSON manifest with its immutable content hash and review provenance. The server never writes it to disk.",
    inputSchema: { slug: z.string().trim().min(1) },
    annotations: READ_ONLY,
  }, async ({ slug }) => {
    const pack = getPack(slug);
    if (pack === undefined || pack.visibility !== "public") return errorResult("PACK_NOT_FOUND", `Public outcome pack '${slug}' does not exist.`, { slug });
    const hash = contentHash(pack);
    return successResult({
      manifest: pack,
      metadata: {
        slug: pack.slug,
        packVersion: pack.packVersion,
        visibility: pack.visibility,
        lifecycle: pack.lifecycle,
        status: getPackStatus(pack.slug),
        reviewedAt: pack.reviewedAt ?? null,
        contentHash: hash,
        immutableRef: `${pack.slug}@${pack.packVersion}#${hash}`,
        sourceUrl: sourceUrl(pack.slug),
        reviewUrl: reviewUrl(pack.slug),
      },
      writesProjectFiles: false,
      executable: false,
    });
  });
  return server;
}
