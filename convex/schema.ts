import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  outcomeSources: defineTable({
    sourceType: v.union(v.literal("github"), v.literal("well-known")),
    locator: v.string(),
    installUrl: v.string(),
    publisherName: v.string(),
    currentRevision: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_type_locator", ["sourceType", "locator"]),
  outcomes: defineTable({
    sourceId: v.id("outcomeSources"),
    slug: v.string(),
    currentSnapshotId: v.optional(v.id("outcomeSnapshots")),
    status: v.union(v.literal("published"), v.literal("hidden")),
    publicationKind: v.union(v.literal("official"), v.literal("community")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_source_slug", ["sourceId", "slug"])
    .index("by_status", ["status"])
    .index("by_status_created", ["status", "createdAt"]),
  outcomeSnapshots: defineTable({
    outcomeId: v.id("outcomes"),
    sourceRevision: v.string(),
    contentHash: v.string(),
    manifest: v.any(),
    aboutMarkdown: v.string(),
    prompt: v.string(),
    title: v.string(),
    summary: v.string(),
    requirements: v.array(v.string()),
    models: v.array(v.any()),
    products: v.array(v.string()),
    skills: v.array(v.any()),
    primary: v.optional(v.any()),
    secondary: v.array(v.any()),
    preview: v.optional(v.any()),
    inputs: v.array(v.any()),
    artifacts: v.array(v.any()),
    resultMediaUrl: v.optional(v.string()),
    posterUrl: v.optional(v.string()),
    manifestUrl: v.string(),
    aboutUrl: v.string(),
    promptUrl: v.string(),
    createdAt: v.number(),
  })
    .index("by_outcome_hash", ["outcomeId", "contentHash"])
    .index("by_outcome_created", ["outcomeId", "createdAt"]),
  outcomeUses: defineTable({
    outcomeId: v.id("outcomes"),
    visitorHash: v.string(),
    day: v.string(),
    source: v.union(v.literal("web"), v.literal("cli")),
    createdAt: v.number(),
  })
    .index("by_outcome", ["outcomeId"])
    .index("by_outcome_visitor_day", ["outcomeId", "visitorHash", "day"])
    .index("by_visitor_day", ["visitorHash", "day"]),
  outcomeLikes: defineTable({
    outcomeId: v.id("outcomes"),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_outcome", ["outcomeId"])
    .index("by_user", ["userId"])
    .index("by_user_outcome", ["userId", "outcomeId"]),
  outcomeBookmarks: defineTable({
    outcomeId: v.id("outcomes"),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_outcome", ["userId", "outcomeId"]),
});
