import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const recipe = {
  agent: { name: "Codex", version: "1.2", url: "https://example.com/agent" },
  skills: [{ repository: "maker/skills", directory: "skills/film", lastReviewedCommit: "a".repeat(40) }],
  references: [{ kind: "document", label: "Brief", url: "https://example.com/brief", purpose: "Visual direction" }],
  tools: [{ name: "Renderer", purpose: "Render the film", url: "https://example.com/render" }],
  steps: [{ title: "Storyboard", instructions: "Plan three scenes", prompt: "Draft an opening scene." }],
};
const models = [
  { provider: "OpenAI", model: "GPT-6", agent: "Codex", role: "execution" },
  { provider: "Anthropic", model: "Claude", role: "review" },
];
function discovery(withRecipe: boolean, revision = "a".repeat(40)) {
  const base = `https://raw.githubusercontent.com/maker/outcomes/${revision}/outcomes/film/`;
  return {
    source: { type: "github", locator: "maker/outcomes", installUrl: "https://github.com/maker/outcomes", revision },
    publisherName: "Independent Maker",
    outcomes: [{
      slug: "film", title: "Launch film", summary: "A short launch film.", aboutMarkdown: "# Launch film\n\nA short launch film.", prompt: "Create a launch film.",
      contentHash: `${withRecipe ? "recipe" : "legacy"}-${revision}`,
      manifestUrl: `${base}outcome.json`, aboutUrl: `${base}outcome.md`, promptUrl: `${base}prompt.md`,
      manifest: {
        schemaVersion: 4, slug: "film", files: { about: "outcome.md", prompt: "prompt.md" }, authoredAt: null,
        author: { name: "Independent Maker", url: "https://maker.example" }, models, requirements: [], primary: { kind: "product", id: "maker/renderer" },
        ...(withRecipe ? { recipe } : {}),
      },
    }],
  };
}

describe("Recipe registration and directory compatibility", () => {
  it("preserves the recipe and every model through registration, list/get and HTTP fetch", async () => {
    const test = convexTest(schema, modules);
    const registered = await test.mutation(internal.registry.applyDiscovery, { discovery: discovery(true) });
    const id = registered.outcomes[0]!.id;
    const listed = await test.query(api.outcomes.listPublic, {});
    const detail = await test.query(api.outcomes.getPublic, { id });
    expect(listed).toHaveLength(1);
    for (const outcome of [listed[0], detail]) {
      expect(outcome?.recipe).toEqual(recipe);
      expect(outcome?.models).toEqual(models);
      expect(outcome?.prompt).toBe("Create a launch film.");
      expect(outcome?.author_name).toBe("Independent Maker");
    }
    const response = await test.fetch(`/api/outcomes?id=${id}`);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.outcome.recipe).toEqual(recipe);
    expect(body.outcome.models).toEqual(models);
    const directoryResponse = await test.fetch("/api/outcomes");
    expect((await directoryResponse.json()).outcomes[0].recipe).toEqual(recipe);
  });

  it("keeps legacy prompt-only snapshots intact when republishing a recipe under the same Outcome ID", async () => {
    const test = convexTest(schema, modules);
    const first = await test.mutation(internal.registry.applyDiscovery, { discovery: discovery(false) });
    const id = first.outcomes[0]!.id;
    expect((await test.query(api.outcomes.getPublic, { id }))?.recipe).toBeNull();
    expect((await test.query(api.outcomes.listPublic, {}))[0]?.recipe).toBeNull();
    const legacySnapshots = await test.run((ctx) => ctx.db.query("outcomeSnapshots").collect());
    const legacy = legacySnapshots[0]!;
    expect(legacy.manifest).not.toHaveProperty("recipe");

    const updatedDiscovery = discovery(true, "b".repeat(40));
    const updated = await test.mutation(internal.registry.applyDiscovery, { discovery: updatedDiscovery });
    expect(updated.outcomes[0]!.id).toBe(id);
    const current = await test.query(api.outcomes.getPublic, { id });
    expect(current?.recipe).toEqual(recipe);
    expect(current?.source_revision).toBe("b".repeat(40));
    expect(current?.prompt).toBe(legacy.prompt);
    expect(await test.run((ctx) => ctx.db.get(legacy._id))).toEqual(legacy);
    expect(await test.run((ctx) => ctx.db.query("outcomeSnapshots").collect())).toHaveLength(2);

    const repeated = await test.mutation(internal.registry.applyDiscovery, { discovery: updatedDiscovery });
    expect(repeated.outcomes[0]!.id).toBe(id);
    expect(await test.run((ctx) => ctx.db.query("outcomeSnapshots").collect())).toHaveLength(2);
    expect(await test.run((ctx) => ctx.db.query("outcomes").collect())).toHaveLength(1);
  });
});
