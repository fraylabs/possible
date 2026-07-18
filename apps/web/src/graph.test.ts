import { describe, expect, it } from "vitest";
import type { WikiCorpus } from "@possible/knowledge";
import { buildAtlasBranches, buildAtlasGraph } from "./atlas";
import { parseMarkdown } from "./markdown";
import { buildRelatedGraph, formatReviewedAt, hrefToSlug, routeSlug, wikiPath } from "./wiki";

const corpus: WikiCorpus = {
  pages: [
    {
      slug: "web",
      title: "Web",
      summary: "Browser-delivered outcomes.",
      body: "## Start\n\nContinue with [Browser applications](/wiki/browser-applications).",
      tags: ["browser"],
      reviewedAt: "2026-07-17",
      sources: [{ title: "React", url: "https://react.dev/" }],
      links: ["browser-applications", "custom-manufactured-parts"],
    },
    {
      slug: "browser-applications",
      title: "Browser applications",
      summary: "Interactive application work.",
      body: "Choose a stack.",
      tags: ["routing"],
      reviewedAt: "2026-07-17",
      sources: [{ title: "Vite", url: "https://vite.dev/" }],
      links: ["vite-react"],
    },
    {
      slug: "vite-react",
      title: "Vite with React",
      summary: "A lightweight client-rendered stack.",
      body: "Raw HTML stays literal: <span data-testid=\"unsafe-html\">unsafe html</span>.",
      tags: ["vite"],
      reviewedAt: "2026-07-17",
      sources: [{ title: "Vite", url: "https://vite.dev/" }],
      links: ["browser-applications"],
    },
    {
      slug: "manufacturing",
      title: "Manufacturing",
      summary: "Fabricated physical outcomes.",
      body: "Continue with [Custom manufactured parts](/wiki/custom-manufactured-parts).",
      tags: ["fabrication"],
      reviewedAt: "2026-07-17",
      sources: [{ title: "NIST", url: "https://example.com/nist" }],
      links: ["custom-manufactured-parts", "web"],
    },
    {
      slug: "custom-manufactured-parts",
      title: "Custom manufactured parts",
      summary: "Controlled fabrication work.",
      body: "Return to [Manufacturing](/wiki/manufacturing).",
      tags: ["fabrication"],
      reviewedAt: "2026-07-17",
      sources: [{ title: "Manufacturing", url: "https://example.com/manufacturing" }],
      links: ["manufacturing"],
    },
  ],
};

describe("wiki helpers", () => {
  it("builds stable wiki paths and reads route slugs", () => {
    expect(wikiPath("vite-react")).toBe("/wiki/vite-react");
    expect(routeSlug("/wiki/vite-react")).toBe("vite-react");
    expect(hrefToSlug("/wiki/browser-applications")).toBe("browser-applications");
    expect(hrefToSlug("https://example.com")).toBeUndefined();
  });

  it("formats review dates with explicit calendar dates", () => {
    expect(formatReviewedAt("2026-07-17")).toBe("July 17, 2026");
  });

  it("builds a page-only related graph from outgoing links and backlinks", () => {
    const graph = buildRelatedGraph(corpus, "browser-applications");
    expect(graph.selected?.slug).toBe("browser-applications");
    expect(graph.outgoingPages.map((page) => page.slug)).toEqual(["vite-react"]);
    expect(graph.backlinkPages.map((page) => page.slug)).toEqual(["vite-react", "web"]);
    expect(graph.relatedPages.map((page) => page.slug)).toEqual(["vite-react", "web"]);
    expect(graph.nodes.find((node) => node.page.slug === "browser-applications")?.relation).toBe("selected");
  });

  it("derives sibling atlas branches and keeps local graphs inside their field", () => {
    const branches = buildAtlasBranches(corpus);
    expect(branches.map((branch) => [branch.page.slug, branch.pageCount])).toEqual([
      ["manufacturing", 2],
      ["web", 3],
    ]);

    const webGraph = buildRelatedGraph(corpus, "web");
    expect(webGraph.relatedPages.map((page) => page.slug)).toEqual(["browser-applications"]);
    expect(webGraph.relatedPages.map((page) => page.slug)).not.toContain("manufacturing");
    expect(webGraph.relatedPages.map((page) => page.slug)).not.toContain("custom-manufactured-parts");
  });

  it("settles every sourced page into a deterministic global knowledge graph", () => {
    const atlasGraph = buildAtlasGraph(corpus);
    const repeatedGraph = buildAtlasGraph(corpus);

    expect(atlasGraph.nodes.map((node) => node.page.slug).sort()).toEqual(
      corpus.pages.map((page) => page.slug).sort(),
    );
    expect(atlasGraph.edges).toHaveLength(7);
    expect(new Set(atlasGraph.edges.map((edge) => `${edge.source}:${edge.target}`)).size).toBe(7);
    expect(atlasGraph.nodes.every((node) =>
      node.x >= 6 && node.x <= 94 && node.y >= 8 && node.y <= 92)).toBe(true);
    expect(atlasGraph.nodes.map(({ page, x, y }) => [page.slug, x, y])).toEqual(
      repeatedGraph.nodes.map(({ page, x, y }) => [page.slug, x, y]),
    );
  });
});

describe("safe markdown parsing", () => {
  it("supports the wiki subset without raw HTML execution", () => {
    expect(parseMarkdown("## Heading\n\nOne paragraph.\n\n- A list item")).toEqual([
      { type: "heading", level: 2, text: "Heading" },
      { type: "paragraph", text: "One paragraph." },
      { type: "list", ordered: false, items: ["A list item"] },
    ]);
  });
});
