import { publicCatalog } from "@possible/packs";
import type { PackCatalogEntry } from "@possible/packs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import { errorResult, successResult } from "./result.js";
import {
  lookupCatalogEntry,
  type McpCatalogEntry,
  normalizeCatalogMetadata,
  unprefixedSha256,
} from "./catalog.js";
import { searchPublicPacks, type PackSearchInput } from "./search.js";

export const POSSIBLE_TOOL_NAMES = ["list_packs", "fetch_pack", "search_packs"] as const;
export const POSSIBLE_SERVER_INSTRUCTIONS = "Possible MCP is a read-only public Outcome Pack distributor. It lists, searches, and fetches exact public catalog snapshots with source, maintainer-owned trust, accepted-evidence summaries, and content hashes. A listed pack is a valid source submission, not a Possible-maintainer endorsement or verification. Search returns the complete active catalog with transparent lexical hints; lexical order is not semantic rank or an automatic recommendation. An agent must judge promise, fit, notFor, expectations, trust, and evidence across the returned catalog. It never writes project files, discovers private packs, compiles or executes packs, approves work, validates checkpoints, or grants authority. The Possible skill and local CLI own project-local pack handling and execution.";
const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;

const reviewUrl = (entry: McpCatalogEntry): string => `https://possible.sh/packs/${entry.origin.kind === "bundled" ? entry.slug : entry.id}`;

export interface PossibleServerOptions {
  catalog?: readonly PackCatalogEntry[];
}

export async function createPossibleServer(options: PossibleServerOptions = {}): Promise<McpServer> {
  const catalog: readonly McpCatalogEntry[] = options.catalog ?? publicCatalog;
  const server = new McpServer({ name: "possible", version: "0.1.0" }, { instructions: POSSIBLE_SERVER_INSTRUCTIONS });
  server.registerTool("list_packs", {
    title: "List public Possible outcome packs",
    description: "List public Outcome Pack metadata. Private project-local packs are never exposed by this server.",
    annotations: READ_ONLY,
  }, async () => successResult({
    packs: catalog.map((entry, index) => {
      const { pack } = entry;
      const metadata = normalizeCatalogMetadata(entry);
      const digest = unprefixedSha256(metadata.source.contentHash);
      return {
        catalogNumber: entry.catalogNumber ?? index + 1,
        id: entry.id,
        slug: entry.slug,
        name: pack.name,
        promise: pack.promise,
        status: metadata.trust.status,
        contentHash: digest,
        sourceUrl: metadata.source.manifestUrl,
        reviewUrl: reviewUrl(entry),
        source: metadata.source,
        trust: metadata.trust,
        evidence: metadata.evidence,
      };
    }),
  }));
  server.registerTool("fetch_pack", {
    title: "Fetch a public Possible outcome pack",
    description: "Return one exact public catalog snapshot by namespaced id or unique slug, with source, maintainer trust, evidence summary, and content hash. The server never writes it to disk.",
    inputSchema: {
      id: z.string().trim().min(1).optional(),
      slug: z.string().trim().min(1).optional(),
    },
    annotations: READ_ONLY,
  }, async ({ id, slug }) => {
    if (id === undefined && slug === undefined) return errorResult("PACK_LOOKUP_INVALID", "fetch_pack requires a namespaced id or unique slug.");
    if (id !== undefined && slug !== undefined && id !== slug) return errorResult("PACK_LOOKUP_INVALID", "fetch_pack accepts either id or slug, not two different values.", { id, slug });
    const idOrSlug = id ?? slug!;
    const lookup = lookupCatalogEntry(catalog, idOrSlug);
    if (lookup.kind === "ambiguous") return errorResult("PACK_AMBIGUOUS", `Pack slug '${idOrSlug}' is ambiguous; use a namespaced id.`, { slug: idOrSlug, matchingIds: lookup.matchingIds });
    if (lookup.kind === "missing") return errorResult("PACK_NOT_FOUND", `Public outcome pack '${idOrSlug}' does not exist.`, { idOrSlug });
    const { entry } = lookup;
    const { pack } = entry;
    const metadata = normalizeCatalogMetadata(entry);
    const digest = unprefixedSha256(metadata.source.contentHash);
    return successResult({
      manifest: pack,
      metadata: {
        id: entry.id,
        slug: entry.slug,
        status: metadata.trust.status,
        contentHash: digest,
        immutableRef: `${entry.id}@${metadata.source.revision}#${digest}`,
        catalogRef: `${entry.id}@${metadata.source.revision}#${metadata.source.contentHash}`,
        sourceUrl: metadata.source.manifestUrl,
        reviewUrl: reviewUrl(entry),
        source: metadata.source,
        trust: metadata.trust,
        evidence: metadata.evidence,
      },
      writesProjectFiles: false,
      executable: false,
    });
  });
  server.registerTool("search_packs", {
    title: "Search public Possible outcome packs",
    description: "Return the complete active catalog with transparent lexical hints across each pack's name, promise, concise opening summary, and publisher. Every candidate includes its full notFor boundary and requires semantic agent judgment; lexical order is not an automatic recommendation.",
    inputSchema: {
      outcome: z.string().trim().min(1),
      currentReality: z.string().trim().min(1).optional(),
      constraints: z.string().trim().min(1).optional(),
    },
    annotations: READ_ONLY,
  }, async ({ outcome, currentReality, constraints }) => {
    const query: PackSearchInput = { outcome };
    if (currentReality !== undefined) query.currentReality = currentReality;
    if (constraints !== undefined) query.constraints = constraints;
    return successResult({
      query,
      candidates: searchPublicPacks(query, { catalog }),
      method: {
        type: "complete-active-catalog-with-lexical-hints",
        searchedFields: ["name", "promise", "summary", "publisher"],
        completeCatalog: true,
        lexicalHints: true,
        semanticRanking: false,
        embeddings: false,
        automaticRecommendation: false,
      },
      agentJudgmentRequired: true,
    });
  });
  return server;
}
