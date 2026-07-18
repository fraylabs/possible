import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import {
  getGuideBacklinks,
  getRelatedGuides,
  wikiCorpusData,
  type Guide,
} from "@possible/knowledge";
import type { Plugin } from "vite";
import { fileURLToPath } from "node:url";
import { buildAgentPublications } from "./src/agent-publications";

const guideReference = (guide: Guide) => ({
  slug: guide.slug,
  title: guide.title,
  summary: guide.summary,
  tags: guide.tags,
  aliases: guide.aliases ?? [],
  reviewedAt: guide.reviewedAt,
  sources: guide.sources,
  links: guide.links,
  humanUrl: `/wiki/${guide.slug}`,
  jsonUrl: `/wiki/${guide.slug}.json`,
});

const json = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;

export const wikiPublications = (): Plugin => ({
  name: "possible-wiki-publications",
  apply: "build",
  generateBundle() {
    const guides = wikiCorpusData.pages.map(guideReference);

    this.emitFile({
      type: "asset",
      fileName: "wiki/index.json",
      source: json({
        schemaVersion: 2,
        title: "Possible field guides",
        guideCount: guides.length,
        pageCount: guides.length,
        pages: guides,
      }),
    });

    for (const page of wikiCorpusData.pages) {
      this.emitFile({
        type: "asset",
        fileName: `wiki/${page.slug}.json`,
        source: json({
          schemaVersion: 2,
          humanUrl: `/wiki/${page.slug}`,
          page,
          backlinks: getGuideBacklinks(wikiCorpusData, page.slug).map(guideReference),
          relatedPages: getRelatedGuides(wikiCorpusData, page.slug).map(guideReference),
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
        "Source-backed field guides for people and agents.",
        "",
        "- Agent protocol (static; no backend or query-aware endpoint): https://possible.sh/agent/protocol.json",
        "- Search index: https://possible.sh/agent/search.json",
        "- Exact page read: https://possible.sh/agent/read/{slug}.json",
        "- Derived related pages: https://possible.sh/agent/related/{slug}.json",
        "",
        "- Guide index: https://possible.sh/wiki/index.json",
        "- Individual guide JSON: https://possible.sh/wiki/{slug}.json",
        "- Human guide: https://possible.sh/wiki/{slug}",
        "- Source repository: https://github.com/fraylabs/possible",
        "",
        "Each guide includes contributor-authored prose, sources, a review date, authored aliases when available, directional links, backlinks, and related guides.",
        "The static search response is a downloadable index; apply its documented normalization and ranking locally. Query parameters are not evaluated.",
        "Search results are relevant reading, not project plans, recommendations, or validation. Authored links are related reading, not ordered steps.",
        "Read and related accept only slugs present in the published guide index. Unknown slugs have no JSON error contract on the static SPA deployment.",
        "Possible supplies source-backed context; the consuming agent remains responsible for project-specific reasoning, decisions, actions, and validation.",
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
