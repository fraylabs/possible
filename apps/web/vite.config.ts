import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  ...(mode === "test" ? {
    resolve: {
      alias: {
        "@possible/knowledge/data": fileURLToPath(new URL("./src/test/knowledge-data.ts", import.meta.url)),
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
