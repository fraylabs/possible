import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

async function publishedOutcome() {
  const test = convexTest(schema, modules);
  const outcomeId = await test.run(async (ctx) => {
    const now = Date.now();
    const sourceId = await ctx.db.insert("outcomeSources", {
      sourceType: "github",
      locator: "example/outcomes",
      installUrl: "https://github.com/example/outcomes",
      publisherName: "Example",
      currentRevision: "0123456789012345678901234567890123456789",
      createdAt: now,
      updatedAt: now,
    });
    return ctx.db.insert("outcomes", {
      sourceId,
      slug: "example-outcome",
      status: "published",
      publicationKind: "community",
      createdAt: now,
      updatedAt: now,
    });
  });
  return { test, outcomeId };
}

describe("Outcome reputation", () => {
  it("counts one anonymous use per Outcome, visitor, and day", async () => {
    const { test, outcomeId } = await publishedOutcome();
    const args = { outcomeId, visitorHash: "a".repeat(64), source: "web" as const, ci: false };
    expect(await test.mutation(api.usage.record, args)).toBe(true);
    expect(await test.mutation(api.usage.record, args)).toBe(false);
    expect(await test.run((ctx) => ctx.db.query("outcomeUses").collect())).toHaveLength(1);
  });

  it("does not count CI or malformed visitor identifiers", async () => {
    const { test, outcomeId } = await publishedOutcome();
    expect(await test.mutation(api.usage.record, { outcomeId, visitorHash: "a".repeat(64), source: "cli", ci: true })).toBe(false);
    expect(await test.mutation(api.usage.record, { outcomeId, visitorHash: "not-a-hash", source: "web", ci: false })).toBe(false);
    expect(await test.run((ctx) => ctx.db.query("outcomeUses").collect())).toHaveLength(0);
  });

  it("requires an account before likes or bookmarks can be changed", async () => {
    const { test, outcomeId } = await publishedOutcome();
    await expect(test.mutation(api.reactions.toggleLike, { outcomeId })).rejects.toThrow("Authentication is required");
    await expect(test.mutation(api.reactions.toggleBookmark, { outcomeId })).rejects.toThrow("Authentication is required");
  });
});
