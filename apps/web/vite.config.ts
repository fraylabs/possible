import react from "@vitejs/plugin-react";
import { compilePack, outcomePacks } from "@possible/packs";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
const cleanDemoDirectories = new Set([
  "/demo/still",
  "/demo/still/site",
  "/demo/still/film",
  "/demo/still/hardware",
  "/demo/still/evidence",
  "/demo/still/verification",
  "/demo/three/product",
  "/demo/three/site",
]);
const rewriteCleanDemoRoute = (url: string | undefined) => {
  if (!url) return url;
  const queryStart = url.indexOf("?");
  const pathname = queryStart === -1 ? url : url.slice(0, queryStart);
  const query = queryStart === -1 ? "" : url.slice(queryStart);
  const directory = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return cleanDemoDirectories.has(directory) ? `${directory}/index.html${query}` : url;
};
const cleanDemoRoute = (): Plugin => ({
  name: "possible-clean-demo-route",
  configureServer(server) {
    server.middlewares.use((request, _response, next) => {
      request.url = rewriteCleanDemoRoute(request.url);
      next();
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use((request, _response, next) => {
      request.url = rewriteCleanDemoRoute(request.url);
      next();
    });
  },
});
const packPublications = (): Plugin => ({
  name: "possible-pack-publications",
  apply: "build",
  generateBundle() {
    for (const pack of outcomePacks) {
      const compiled = compilePack(pack);
      this.emitFile({ type: "asset", fileName: `packs/${pack.slug}.json`, source: json(compiled) });
      this.emitFile({ type: "asset", fileName: `packs/${pack.slug}/install.txt`, source: `${compiled.installCommands.join("\n")}\n` });
      this.emitFile({ type: "asset", fileName: `packs/${pack.slug}/run.txt`, source: `${compiled.runPrompt}\n` });
    }
    this.emitFile({ type: "asset", fileName: "packs/index.json", source: json({
      schemaVersion: 1,
      packs: outcomePacks.map(({ slug, name, promise, summary, reviewedAt }) => ({ slug, name, promise, summary, reviewedAt })),
    }) });
    this.emitFile({ type: "asset", fileName: "llms.txt", source: [
      "# Possible", "", "Skills are ingredients. Possible compiles the outcome.", "",
      "- Pack index: /packs/index.json",
      ...outcomePacks.flatMap((pack) => [
        `- ${pack.name}: /packs/${pack.slug}.json`,
        `  - Install commands: /packs/${pack.slug}/install.txt`,
        `  - Compiled run prompt: /packs/${pack.slug}/run.txt`,
      ]),
      "- Source: https://github.com/fraylabs/possible", "",
      "Review every external skill source before installation. A Possible pack does not authorize deployment, spending, outreach, fabrication, publishing, or unsupported real-world claims.", "",
    ].join("\n") });
    this.emitFile({ type: "asset", fileName: "robots.txt", source: "User-agent: *\nAllow: /\n" });
  },
});

export default defineConfig({
  plugins: [cleanDemoRoute(), react(), packPublications()],
  build: { target: "es2022", sourcemap: false },
  test: { environment: "jsdom", setupFiles: "./src/test/setup.ts", css: true },
});
