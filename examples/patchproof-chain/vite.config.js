import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        product: resolve(root, "index.html"),
        launch: resolve(root, "launch/site/index.html"),
      },
    },
  },
});
