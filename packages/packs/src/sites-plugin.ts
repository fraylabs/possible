import type { PluginCapability } from "./types.js";

export const openAISitesPlugin: PluginCapability = {
  id: "sites",
  name: "OpenAI Sites",
  role: "Build, version, deploy, and inspect an MVP website without a separate hosting-provider signup",
  provider: "OpenAI",
  invocation: "@sites",
  skills: ["sites-building", "sites-hosting"],
  reviewedVersion: "0.1.30",
  docsUrl: "https://developers.openai.com/codex/plugins",
  availability: "Optional: use only when the Sites plugin is available in the current Codex workspace.",
};
