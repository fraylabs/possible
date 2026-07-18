import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import {
  getBacklinks,
  getRelatedPages,
  wikiCorpusData,
  type WikiPage,
} from "@possible/knowledge";
import type { Plugin } from "vite";
import { fileURLToPath } from "node:url";
import { buildAgentPublications } from "./src/agent-publications";

const pageReference = (page: WikiPage) => ({
  slug: page.slug,
  title: page.title,
  summary: page.summary,
  tags: page.tags,
  aliases: page.aliases ?? [],
  ...(page.kind ? { kind: page.kind } : {}),
  coverage: page.coverage ?? [],
  ...(page.routeStatus ? { routeStatus: page.routeStatus } : {}),
  reviewedAt: page.reviewedAt,
  sources: page.sources,
  links: page.links,
  humanUrl: `/wiki/${page.slug}`,
  jsonUrl: `/wiki/${page.slug}.json`,
});

const json = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;

export const wikiPublications = (): Plugin => ({
  name: "possible-wiki-publications",
  apply: "build",
  generateBundle() {
    const pages = wikiCorpusData.pages.map(pageReference);

    this.emitFile({
      type: "asset",
      fileName: "wiki/index.json",
      source: json({
        schemaVersion: 1,
        title: "Possible wiki",
        pageCount: pages.length,
        pages,
      }),
    });

    for (const page of wikiCorpusData.pages) {
      this.emitFile({
        type: "asset",
        fileName: `wiki/${page.slug}.json`,
        source: json({
          schemaVersion: 1,
          humanUrl: `/wiki/${page.slug}`,
          page,
          backlinks: getBacklinks(wikiCorpusData, page.slug).map(pageReference),
          relatedPages: getRelatedPages(wikiCorpusData, page.slug).map(pageReference),
        }),
      });
    }

    for (const publication of buildAgentPublications(wikiCorpusData)) {
      this.emitFile({
        type: "asset",
        fileName: publication.path,
        source: json(publication.value),
      });
    }

    this.emitFile({
      type: "asset",
      fileName: "llms.txt",
      source: [
        "# Possible",
        "",
        "A sourced wiki of what people and agents can make possible.",
        "",
        "- Agent protocol (static; no backend or query-aware endpoint): https://possible.sh/agent/protocol.json",
        "- Search index: https://possible.sh/agent/search.json",
        "- Exact page read: https://possible.sh/agent/read/{slug}.json",
        "- Derived related pages: https://possible.sh/agent/related/{slug}.json",
        "",
        "- Corpus index: https://possible.sh/wiki/index.json",
        "- Individual page JSON: https://possible.sh/wiki/{slug}.json",
        "- Human page: https://possible.sh/wiki/{slug}",
        "- Source repository: https://github.com/fraylabs/possible",
        "",
        "Each page includes maintained prose, sources, a review date, authored aliases when available, directional links, backlinks, and related pages.",
        "The static search response is a downloadable index; apply its documented normalization and ranking locally. Query parameters are not evaluated.",
        "Search consumers must distinguish a verified route, a partial route, and no maintained route. Similarity alone is not evidence of a solution.",
        "Read and related accept only slugs present in the published index. Unknown slugs have no JSON error contract on the static SPA deployment.",
        "Possible supplies knowledge; the consuming agent remains responsible for reasoning and execution.",
        "",
      ].join("\n"),
    });

    this.emitFile({
      type: "asset",
      fileName: "robots.txt",
      source: [
        "User-agent: *",
        "Allow: /",
        "Sitemap: https://possible.sh/sitemap.xml",
        "",
      ].join("\n"),
    });

    const sitemapUrls = [
      "https://possible.sh/",
      "https://possible.sh/how-it-works",
      "https://possible.sh/demo",
      "https://possible.sh/proof",
      ...wikiCorpusData.pages.map((page) => `https://possible.sh/wiki/${page.slug}`),
    ];
    this.emitFile({
      type: "asset",
      fileName: "sitemap.xml",
      source: [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...sitemapUrls.map((url) => `  <url><loc>${url}</loc></url>`),
        "</urlset>",
        "",
      ].join("\n"),
    });
  },
});

export default defineConfig(({ mode }) => ({
  plugins: [react(), wikiPublications()],
  ...(mode === "test" ? {
    resolve: {
      alias: [{
        find: /^@possible\/knowledge$/,
        replacement: fileURLToPath(new URL("./src/test/knowledge-runtime.ts", import.meta.url)),
      }],
    },
  } : {}),
  build: {
    target: "es2022",
    sourcemap: false,
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
  },
}));
