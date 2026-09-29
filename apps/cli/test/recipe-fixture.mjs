export const recipe = {
  agent: { name: "Codex", version: "recorded-version", url: "https://example.com/agent" },
  skills: [
    { repository: "example/skills", lastReviewedCommit: "a".repeat(40), directory: "skills/film" },
    { repository: "example/skills", lastReviewedCommit: "b".repeat(64), directory: "skills/audio" },
  ],
  references: [
    { kind: "document", label: "Creative brief", url: "https://example.com/brief", purpose: "Use the supplied constraints." },
    { kind: "image", label: "Moodboard", url: "https://example.com/image.png" },
  ],
  tools: [{ name: "Renderer", purpose: "Render the editable source.", url: "https://example.com/render" }],
  steps: [
    { title: "Build", instructions: "Build the scene from the brief.", prompt: "Keep the orange accent.\nPreserve space for the title." },
    { title: "Review", instructions: "Watch the complete export and inspect its legibility." },
  ],
};

export const manifest = {
  schemaVersion: 4,
  slug: "quiet-launch-film",
  files: { about: "outcome.md", prompt: "prompt.md" },
  authoredAt: null,
  author: { name: "Example Studio", url: "https://example.com" },
  models: [{ provider: "OpenAI", model: "Recorded model", role: "execution" }],
  requirements: [],
  primary: { kind: "product", id: "example/film-maker" },
};
