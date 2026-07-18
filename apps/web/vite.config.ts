import react from "@vitejs/plugin-react";
import { compilePack, hardwareLaunchPack } from "@possible/packs";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
const packPublications = (): Plugin => ({
  name: "possible-pack-publications",
  apply: "build",
  generateBundle() {
    const compiled = compilePack(hardwareLaunchPack);
    this.emitFile({ type: "asset", fileName: "packs/hardware-launch.json", source: json(compiled) });
    this.emitFile({ type: "asset", fileName: "packs/hardware-launch/install.txt", source: `${compiled.installCommands.join("\n")}\n` });
    this.emitFile({ type: "asset", fileName: "packs/hardware-launch/run.txt", source: `${compiled.runPrompt}\n` });
    this.emitFile({ type: "asset", fileName: "llms.txt", source: [
      "# Possible", "", "Skills are ingredients. Possible compiles the outcome.", "",
      "- Hardware Launch pack: /packs/hardware-launch.json",
      "- Install commands: /packs/hardware-launch/install.txt",
      "- Compiled run prompt: /packs/hardware-launch/run.txt",
      "- Source: https://github.com/fraylabs/possible", "",
      "Review every external skill source before installation. A Possible pack does not authorize deployment, spending, outreach, fabrication, or unsupported real-world claims.", "",
    ].join("\n") });
    this.emitFile({ type: "asset", fileName: "robots.txt", source: "User-agent: *\nAllow: /\n" });
  },
});

export default defineConfig({
  plugins: [react(), packPublications()],
  build: { target: "es2022", sourcemap: false },
  test: { environment: "jsdom", setupFiles: "./src/test/setup.ts", css: true },
});
