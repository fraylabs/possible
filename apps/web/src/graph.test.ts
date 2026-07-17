import { describe, expect, it } from "vitest";
import type { WikiCorpus } from "@possible/knowledge";
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
      links: ["browser-applications"],
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
