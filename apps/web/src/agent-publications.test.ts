import { describe, expect, it } from "vitest";
import type { WikiCorpus } from "@possible/knowledge";
import { testWikiCorpus } from "./test/knowledge-data";
import {
  buildAgentPublications,
  buildAgentReadDocument,
  buildAgentRelatedDocument,
  buildAgentSearchIndex,
  buildAgentProtocol,
} from "./agent-publications";

const corpus = testWikiCorpus as WikiCorpus;

describe("static agent publication", () => {
  it("publishes a concrete static read/search/related surface", () => {
    const publications = buildAgentPublications(corpus);
    const paths = publications.map(({ path }) => path);

    expect(paths).toHaveLength(2 + corpus.pages.length * 2);
    expect(paths).toContain("agent/protocol.json");
    expect(paths).toContain("agent/search.json");
    expect(new Set(paths).size).toBe(paths.length);
    for (const page of corpus.pages) {
      expect(paths).toContain(`agent/read/${page.slug}.json`);
      expect(paths).toContain(`agent/related/${page.slug}.json`);
    }
  });

  it("makes static search honest and reproducible from corpus fields", () => {
    const search = buildAgentSearchIndex(corpus);

    expect(search).toMatchObject({
      schemaVersion: 2,
      operation: "search",
      static: true,
      request: {
        method: "GET",
        path: "/agent/search.json",
        query: null,
        body: null,
      },
      corpus: { pageCount: corpus.pages.length, sourceIndexUrl: "/wiki/index.json" },
    });
    expect(search.search.match).toBe("all query terms");
    expect(search.search.interpretation).toEqual({
      results: "relevant-field-guides",
      links: "related-reading-not-ordered-steps",
      boundary: "consumer-owns-project-decisions-and-actions",
    });
    expect(search.search.ranking).toEqual([
      { field: "title", weight: 16 },
      { field: "slug", weight: 12 },
      { field: "aliases", weight: 14 },
      { field: "tags", weight: 10 },
      { field: "summary", weight: 8 },
      { field: "body", weight: 2 },
      { field: "sourceTitles", weight: 1 },
    ]);
    const page = corpus.pages[0]!;
    const indexedPage = search.pages.find((candidate) => candidate.slug === page.slug)!;
    expect(indexedPage.searchFields).toEqual({
      title: page.title,
      slug: page.slug,
      aliases: (page.aliases ?? []).join(" "),
      tags: page.tags.join(" "),
      summary: page.summary,
      body: page.body,
      sourceTitles: page.sources.map((source) => source.title).join(" "),
    });
    expect(indexedPage.sources).toEqual(page.sources);
    expect(indexedPage.aliases).toEqual(page.aliases ?? []);
    expect(indexedPage).not.toHaveProperty("kind");
    expect(indexedPage).not.toHaveProperty("coverage");
    expect(indexedPage).not.toHaveProperty("routeStatus");
    expect(indexedPage.reviewedAt).toBe(page.reviewedAt);
  });

  it("keeps read and related documents source-backed and derived", () => {
    const page = corpus.pages.find((candidate) => candidate.slug === "browser-applications")!;
    const read = buildAgentReadDocument(corpus, page);
    const related = buildAgentRelatedDocument(corpus, page);

    expect(read).toMatchObject({
      schemaVersion: 2,
      operation: "read",
      humanUrl: "/wiki/browser-applications",
      page,
    });
    expect(read.relatedPages.map((candidate) => candidate.slug)).toEqual([
      "web",
      "vite-react",
    ]);
    expect(read.relatedPages.every((candidate) => candidate.sources.length > 0)).toBe(true);

    expect(related).toMatchObject({
      schemaVersion: 2,
      operation: "related",
      slug: "browser-applications",
      humanUrl: "/wiki/browser-applications",
      page: expect.objectContaining({ slug: "browser-applications" }),
    });
    expect(related.relatedPages.map((candidate) => candidate.slug)).toEqual([
      "web",
      "vite-react",
    ]);
  });

  it("describes the same three operations without implying a dynamic backend", () => {
    const protocol = buildAgentProtocol();

    expect(protocol.static).toBe(true);
    expect(Object.keys(protocol.operations)).toEqual(["search", "read", "related"]);
    expect(protocol.operations.search.notes[0]).toMatch(/static search index/);
    expect(protocol.operations.search.notes).toContain(
      "Search results are relevant field guides, not project plans, recommendations, or validation.",
    );
    expect(protocol.operations.search.request).toEqual({ query: null, body: null });
    expect(protocol.operations.read.path).toBe("/agent/read/{slug}.json");
    expect(protocol.operations.read.notes).toContain(
      "The guide body, review date, sources, links, backlinks, and related guides come from the generated corpus bundled with this site.",
    );
    expect(protocol.operations.read.notes.join(" ")).not.toMatch(/\bpublished\b/i);
    expect(protocol.operations.related.path).toBe("/agent/related/{slug}.json");
  });
});
