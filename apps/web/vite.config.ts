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
        "Resolve every path below against the origin that served this file. Require schemaVersion 2; if another version is returned, stop because this guide-library candidate is not available at that origin.",
        "",
        "- Agent protocol (static; no backend or query-aware endpoint): /agent/protocol.json",
        "- Search index: /agent/search.json",
        "- Exact page read: /agent/read/{slug}.json",
        "- Derived related pages: /agent/related/{slug}.json",
        "",
        "- Guide index: /wiki/index.json",
        "- Individual guide JSON: /wiki/{slug}.json",
        "- Human guide: /wiki/{slug}",
        "- Source repository: https://github.com/fraylabs/possible",
        "",
        "Each guide includes contributor-authored prose, sources, a review date, authored aliases when available, directional links, backlinks, and related guides.",
        "The static search response is a downloadable index; apply its documented normalization and ranking locally. Query parameters are not evaluated.",
        "Search results are relevant reading, not project plans, recommendations, or validation. Authored links are related reading, not ordered steps.",
        "Read and related accept only slugs present in the bundled guide index. Unknown slugs have no JSON error contract on the static SPA deployment.",
        "Possible supplies source-backed context; the consuming agent remains responsible for project-specific reasoning, decisions, actions, and validation.",
        "",
      ].join("\n"),
    });

    this.emitFile({
      type: "asset",
      fileName: "robots.txt",
      source: [
        "User-agent: *",
        "Disallow: /",
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
