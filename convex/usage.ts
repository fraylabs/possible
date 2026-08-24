import { mutation } from "./_generated/server";
import { v } from "convex/values";

const visitorPattern = /^[0-9a-f]{64}$/;

export const record = mutation({
  args: {
    outcomeId: v.id("outcomes"),
    visitorHash: v.string(),
    source: v.union(v.literal("web"), v.literal("cli")),
    ci: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (args.ci || !visitorPattern.test(args.visitorHash)) return false;
    const outcome = await ctx.db.get(args.outcomeId);
    if (!outcome || outcome.status !== "published") return false;
    const now = Date.now();
    const day = new Date(now).toISOString().slice(0, 10);
    const duplicate = await ctx.db.query("outcomeUses")
      .withIndex("by_outcome_visitor_day", (index) => index.eq("outcomeId", args.outcomeId).eq("visitorHash", args.visitorHash).eq("day", day))
      .unique();
    if (duplicate) return false;
    const activity = await ctx.db.query("outcomeUses")
      .withIndex("by_visitor_day", (index) => index.eq("visitorHash", args.visitorHash).eq("day", day))
      .take(100);
    if (activity.length >= 100) return false;
    await ctx.db.insert("outcomeUses", { outcomeId: args.outcomeId, visitorHash: args.visitorHash, day, source: args.source, createdAt: now });
    return true;
  },
});
