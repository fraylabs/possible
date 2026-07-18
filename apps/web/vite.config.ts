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

const pageReference = (page: WikiPage) => ({
  slug: page.slug,
  title: page.title,
  summary: page.summary,
  tags: page.tags,
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

    this.emitFile({
      type: "asset",
      fileName: "llms.txt",
      source: [
        "# Possible",
        "",
        "Possible is a sourced, linked wiki of what people and agents can make possible.",
        "",
        "- Corpus index: https://possible.sh/wiki/index.json",
        "- Individual page JSON: https://possible.sh/wiki/{slug}.json",
        "- Human page: https://possible.sh/wiki/{slug}",
        "- Source repository: https://github.com/fraylabs/possible",
        "",
        "Each page includes maintained prose, sources, a review date, directional links, backlinks, and related pages.",
        "Possible supplies knowledge; the consuming agent remains responsible for reasoning and execution.",
        "",
      ].join("\n"),
    });
  },
});

export default defineConfig(({ mode }) => ({
  plugins: [react(), wikiPublications()],
  ...(mode === "test" ? {
    resolve: {
      alias: {
        "@possible/knowledge": fileURLToPath(new URL("./src/test/knowledge-runtime.ts", import.meta.url)),
      },
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
