import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";

async function requireUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Authentication is required");
  return userId;
}

async function requirePublishedOutcome(ctx: MutationCtx, outcomeId: Id<"outcomes">) {
  const outcome = await ctx.db.get(outcomeId);
  if (!outcome || outcome.status !== "published") throw new Error("A published Outcome is required");
}

export const viewerState = query({
  args: { outcomeId: v.id("outcomes") },
  handler: async (ctx, { outcomeId }) => {
    const likes = await ctx.db.query("outcomeLikes").withIndex("by_outcome", (index) => index.eq("outcomeId", outcomeId)).collect();
    const userId = await getAuthUserId(ctx);
    if (!userId) return { liked: false, bookmarked: false, likeCount: likes.length };
    const [like, bookmark] = await Promise.all([
      ctx.db.query("outcomeLikes").withIndex("by_user_outcome", (index) => index.eq("userId", userId).eq("outcomeId", outcomeId)).unique(),
      ctx.db.query("outcomeBookmarks").withIndex("by_user_outcome", (index) => index.eq("userId", userId).eq("outcomeId", outcomeId)).unique(),
    ]);
    return { liked: Boolean(like), bookmarked: Boolean(bookmark), likeCount: likes.length };
  },
});

export const toggleLike = mutation({
  args: { outcomeId: v.id("outcomes") },
  handler: async (ctx, { outcomeId }) => {
    const userId = await requireUser(ctx);
    await requirePublishedOutcome(ctx, outcomeId);
    const current = await ctx.db.query("outcomeLikes").withIndex("by_user_outcome", (index) => index.eq("userId", userId).eq("outcomeId", outcomeId)).unique();
    if (current) {
      await ctx.db.delete(current._id);
      return false;
    }
    await ctx.db.insert("outcomeLikes", { outcomeId, userId, createdAt: Date.now() });
    return true;
  },
});

export const toggleBookmark = mutation({
  args: { outcomeId: v.id("outcomes") },
  handler: async (ctx, { outcomeId }) => {
    const userId = await requireUser(ctx);
    await requirePublishedOutcome(ctx, outcomeId);
    const current = await ctx.db.query("outcomeBookmarks").withIndex("by_user_outcome", (index) => index.eq("userId", userId).eq("outcomeId", outcomeId)).unique();
    if (current) {
      await ctx.db.delete(current._id);
      return false;
    }
    await ctx.db.insert("outcomeBookmarks", { outcomeId, userId, createdAt: Date.now() });
    return true;
  },
});

export const bookmarks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const records = await ctx.db.query("outcomeBookmarks").withIndex("by_user", (index) => index.eq("userId", userId)).collect();
    return records.map((record) => record.outcomeId);
  },
});
