import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { buildPackCatalog, formatPackIdentity, publicCatalog } from "@possible/packs";
import type {
  AcceptedPackSnapshot,
  OutcomePack,
  PackCatalogEntry,
  PackTrustRecord,
  PackTrustStatus,
  Sha256Digest,
} from "@possible/packs";
import { createPossibleServer, POSSIBLE_SERVER_INSTRUCTIONS, POSSIBLE_TOOL_NAMES } from "../src/server.js";

const sha256 = (character: string): Sha256Digest => `sha256:${character.repeat(64)}` as Sha256Digest;

function federatedEntry({
  owner,
  repository,
  slug,
  status,
  hashCharacter,
}: {
  owner: string;
  repository: string;
  slug: string;
  status: PackTrustStatus;
  hashCharacter: string;
}): PackCatalogEntry {
  const base = publicCatalog.find(({ pack }) => pack.slug === "web-presentation")?.pack;
  assert.ok(base);
  const id = formatPackIdentity(owner, repository, slug);
  const pack: OutcomePack = {
    ...structuredClone(base),
    slug,
    name: "Federated Observability Handbook",
    promise: "Turn operational notes into a federated observability handbook.",
    summary: "A searchable operational handbook with observable checks and a clear audience.",
    useWhen: ["A team needs a federated observability handbook from rough operational notes."],
    notFor: ["A PPTX-first sales deck."],
  };
  const contentHash = sha256(hashCharacter);
  const snapshot: AcceptedPackSnapshot = {
    schemaVersion: 1,
    id,
    source: `https://github.com/${owner}/${repository}`,
    revision: hashCharacter.repeat(40),
    path: `packs/${slug}.json`,
    contentHash,
    pack,
  };
  const evidence = status === "verified" ? [{
    id: "accepted-run",
    kind: "run" as const,
    uri: `https://github.com/${owner}/${repository}/blob/${hashCharacter.repeat(40)}/evidence/run.json`,
    contentHash: sha256("e"),
    acceptedAt: "2026-08-09",
    acceptedBy: "possible-maintainers",
    summary: "An accepted outside-author run completed every required expectation.",
  }] : [];
  const trust: PackTrustRecord = {
    schemaVersion: 1,
    id,
    status,
    evidence,
    updatedAt: "2026-08-09",
    reason: status === "verified" ? "Accepted run evidence." : "Valid community submission.",
  };
  const entry = buildPackCatalog({ acceptedSnapshots: [snapshot], trustRecords: [trust] })[0];
  assert.ok(entry);
  return entry;
}

describe("Possible MCP", () => {
  let client: Client;
  let server: McpServer;

  async function connect(catalog?: readonly PackCatalogEntry[]): Promise<void> {
    server = await createPossibleServer(catalog === undefined ? {} : { catalog });
    client = new Client({ name: "possible-test", version: "0.1.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  }

  async function reconnect(catalog: readonly PackCatalogEntry[]): Promise<void> {
    await client.close();
    await server.close();
    await connect(catalog);
  }

  beforeEach(async () => {
    await connect();
  });

  afterEach(async () => {
    await client.close();
    await server.close();
  });

  it("exposes only read-only public distribution tools", async () => {
    const response = await client.listTools();
    assert.deepEqual(response.tools.map((tool) => tool.name).sort(), [...POSSIBLE_TOOL_NAMES].sort());
    for (const tool of response.tools) assert.equal(tool.annotations?.readOnlyHint, true);
    assert.equal(client.getInstructions(), POSSIBLE_SERVER_INSTRUCTIONS);
    assert.match(client.getInstructions() ?? "", /never writes project files/i);
    assert.match(client.getInstructions() ?? "", /not an automatic recommendation/i);
    assert.match(client.getInstructions() ?? "", /listed pack is a valid source submission, not a Possible-maintainer endorsement or verification/i);
    assert.match(response.tools.find(({ name }) => name === "search_packs")?.description ?? "", /agent judgment/i);
  });

  it("lists public packs with lifecycle and immutable content hashes", async () => {
    const result = await client.callTool({ name: "list_packs", arguments: {} });
    const envelope = result.structuredContent as { ok: boolean; data: { packs: Array<{ id: string; slug: string; visibility: string; lifecycle: string; contentHash: string; source: { contentHash: string }; trust: { status: string }; evidence: { acceptedCount: number; summaries: string[] } }> } };
    assert.equal(envelope.ok, true);
    assert.equal(envelope.data.packs.length, publicCatalog.length);
    assert.ok(envelope.data.packs.every((pack) => pack.visibility === "public"));
    assert.ok(envelope.data.packs.every((pack) => /^[a-f0-9]{64}$/.test(pack.contentHash)));
    assert.ok(envelope.data.packs.every((pack) => pack.id.endsWith(`/${pack.slug}`)));
    assert.ok(envelope.data.packs.every((pack) => /^sha256:[a-f0-9]{64}$/.test(pack.source.contentHash)));
    assert.equal(envelope.data.packs.find(({ slug }) => slug === "hardware-launch")?.lifecycle, "archived");
  });

  it("fetches an exact JSON manifest without writing or making it executable", async () => {
    const result = await client.callTool({ name: "fetch_pack", arguments: { slug: "web-presentation" } });
    const envelope = result.structuredContent as { ok: boolean; data: { manifest: { slug: string; packVersion: string; visibility: string; lifecycle: string }; metadata: { id: string; contentHash: string; immutableRef: string; catalogRef: string; source: { origin: string; snapshotRef: string }; trust: { status: string }; evidence: { acceptedCount: number } }; writesProjectFiles: boolean; executable: boolean } };
    assert.equal(envelope.ok, true);
    assert.equal(envelope.data.manifest.slug, "web-presentation");
    assert.equal(envelope.data.manifest.visibility, "public");
    assert.equal(envelope.data.manifest.lifecycle, "reviewed");
    assert.match(envelope.data.metadata.immutableRef, /^web-presentation@1\.0\.0#[a-f0-9]{64}$/);
    assert.equal(envelope.data.metadata.id, "fraylabs/possible/web-presentation");
    assert.match(envelope.data.metadata.catalogRef, /^fraylabs\/possible\/web-presentation@pack:1\.0\.0#sha256:[a-f0-9]{64}$/);
    assert.equal(envelope.data.metadata.source.origin, "bundled");
    assert.equal(envelope.data.writesProjectFiles, false);
    assert.equal(envelope.data.executable, false);
  });

  it("returns a not-found error for private or missing packs", async () => {
    const result = await client.callTool({ name: "fetch_pack", arguments: { slug: "missing-pack" } });
    assert.equal(result.isError, true);
  });

  it("finds plausible active packs with transparent matching reasons", async () => {
    const result = await client.callTool({
      name: "search_packs",
      arguments: {
        outcome: "Create an editable browser presentation for an internal talk",
        currentReality: "We have rough material and source evidence",
        constraints: "The result needs keyboard controls and PDF export",
      },
    });
    const envelope = result.structuredContent as {
      ok: boolean;
      data: {
        agentJudgmentRequired: boolean;
        method: { type: string; semanticRanking: boolean; embeddings: boolean; automaticRecommendation: boolean };
        candidates: Array<{
          slug: string;
          status: string;
          matchingTerms: string[];
          matchReasons: string[];
          source: { contentHash: string; manifestUrl: string };
          trust: { status: string };
          evidence: { acceptedCount: number; summaries: string[] };
          agentJudgmentRequired: boolean;
        }>;
      };
    };

    assert.equal(envelope.ok, true);
    assert.equal(envelope.data.agentJudgmentRequired, true);
    assert.deepEqual(envelope.data.method, {
      type: "deterministic-text-overlap",
      searchedFields: ["name", "promise", "summary", "useWhen", "notFor", "expectations.statement"],
      semanticRanking: false,
      embeddings: false,
      automaticRecommendation: false,
    });
    const candidate = envelope.data.candidates.find(({ slug }) => slug === "web-presentation");
    assert.ok(candidate);
    assert.notEqual(candidate.status, "archived");
    assert.ok(candidate.matchingTerms.includes("presentation"));
    assert.ok(candidate.matchReasons.some((reason) => reason.startsWith("name matched:")));
    assert.match(candidate.source.contentHash, /^sha256:[a-f0-9]{64}$/);
    assert.match(candidate.source.manifestUrl, /web-presentation\.json$/);
    assert.equal(candidate.trust.status, candidate.status);
    assert.equal(candidate.evidence.acceptedCount, candidate.evidence.summaries.length);
    assert.equal(candidate.agentJudgmentRequired, true);
  });

  it("reports notFor conflicts and never returns archived packs", async () => {
    const result = await client.callTool({
      name: "search_packs",
      arguments: {
        outcome: "Create an editable browser presentation",
        constraints: "The required deliverable is PPTX-first",
      },
    });
    const envelope = result.structuredContent as {
      ok: boolean;
      data: {
        candidates: Array<{
          slug: string;
          conflictingNotForSignals: Array<{ statement: string; matchingTerms: string[] }>;
        }>;
      };
    };

    assert.equal(envelope.ok, true);
    assert.ok(envelope.data.candidates.every(({ slug }) => slug !== "hardware-launch"));
    const candidate = envelope.data.candidates.find(({ slug }) => slug === "web-presentation");
    assert.ok(candidate);
    assert.ok(candidate.conflictingNotForSignals.some(({ matchingTerms }) => matchingTerms.includes("pptx")));
  });

  it("requires a non-empty outcome search input", async () => {
    const result = await client.callTool({ name: "search_packs", arguments: { outcome: "" } });
    assert.equal(result.isError, true);
  });

  it("lists, searches, and fetches federated entries by namespaced id while rejecting ambiguous slugs", async () => {
    const verified = federatedEntry({
      owner: "outside-author",
      repository: "outcome-library",
      slug: "observability-handbook",
      status: "verified",
      hashCharacter: "a",
    });
    const listed = federatedEntry({
      owner: "another-author",
      repository: "field-guides",
      slug: "observability-handbook",
      status: "listed",
      hashCharacter: "b",
    });
    await reconnect([verified, listed]);

    const listedResult = await client.callTool({ name: "list_packs", arguments: {} });
    const listEnvelope = listedResult.structuredContent as {
      ok: boolean;
      data: { packs: Array<{ id: string; source: { origin: string; locator: string }; trust: { status: string }; evidence: { acceptedCount: number; summaries: string[] } }> };
    };
    assert.deepEqual(listEnvelope.data.packs.map(({ id }) => id), [verified.id, listed.id]);
    assert.ok(listEnvelope.data.packs.every(({ source }) => source.origin === "federated" && source.locator.startsWith("https://github.com/")));
    assert.deepEqual(listEnvelope.data.packs[0]?.evidence, {
      acceptedCount: 1,
      summaries: ["An accepted outside-author run completed every required expectation."],
    });

    const ambiguous = await client.callTool({ name: "fetch_pack", arguments: { slug: "observability-handbook" } });
    const ambiguousEnvelope = ambiguous.structuredContent as { ok: false; error: { code: string; details: { matchingIds: string[] } } };
    assert.equal(ambiguous.isError, true);
    assert.equal(ambiguousEnvelope.error.code, "PACK_AMBIGUOUS");
    assert.deepEqual(ambiguousEnvelope.error.details.matchingIds, [listed.id, verified.id].sort());

    const fetched = await client.callTool({ name: "fetch_pack", arguments: { id: verified.id } });
    const fetchEnvelope = fetched.structuredContent as {
      ok: boolean;
      data: { metadata: { id: string; source: { origin: string; revision: string; contentHash: string; snapshotRef: string; manifestUrl: string }; trust: { status: string }; evidence: { acceptedCount: number; summaries: string[] } } };
    };
    assert.equal(fetchEnvelope.ok, true);
    assert.equal(fetchEnvelope.data.metadata.id, verified.id);
    assert.equal(fetchEnvelope.data.metadata.source.origin, "federated");
    assert.equal(fetchEnvelope.data.metadata.trust.status, "verified");
    assert.equal(fetchEnvelope.data.metadata.evidence.acceptedCount, 1);
    assert.match(fetchEnvelope.data.metadata.source.manifestUrl, /\/blob\/a{40}\/packs\/observability-handbook\.json$/);

    const searched = await client.callTool({ name: "search_packs", arguments: { outcome: "Create a federated observability handbook" } });
    const searchEnvelope = searched.structuredContent as {
      ok: boolean;
      data: { candidates: Array<{ id: string; source: { origin: string }; trust: { status: string }; evidence: { acceptedCount: number } }> };
    };
    assert.equal(searchEnvelope.ok, true);
    assert.deepEqual(new Set(searchEnvelope.data.candidates.map(({ id }) => id)), new Set([verified.id, listed.id]));
    assert.equal(searchEnvelope.data.candidates.find(({ id }) => id === verified.id)?.source.origin, "federated");
    assert.equal(searchEnvelope.data.candidates.find(({ id }) => id === verified.id)?.evidence.acceptedCount, 1);
  });
});
