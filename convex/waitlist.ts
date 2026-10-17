import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { validUtm } from "./visitValidation";

const emailPattern = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
const agentPattern = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

// Global budgets bound writes; they are abuse guards, not per-person limits.
export const join = internalMutation({
  args: { email: v.string(), agent: v.string(), source: v.string() },
  handler: async (ctx, args): Promise<"ok" | "invalid" | "busy"> => {
    const email = args.email.trim().toLowerCase();
    if (email.length > 254 || !emailPattern.test(email)
      || (args.agent !== "" && !agentPattern.test(args.agent)) || !validUtm(args.source)) return "invalid";
    const now = Date.now();
    const date = new Date(now).toISOString().slice(0, 10);
    const minute = Math.floor(now / 60_000);
    const budget = await ctx.db.query("waitlistBudgets").withIndex("by_date", (q) => q.eq("date", date)).unique();
    const minuteCount = budget?.minute === minute ? budget.minuteCount : 0;
    if (minuteCount >= 60 || (budget?.count ?? 0) >= 5_000) return "busy";
    const totals = { date, minute, minuteCount: minuteCount + 1, count: (budget?.count ?? 0) + 1 };
    if (budget) await ctx.db.patch(budget._id, totals);
    else await ctx.db.insert("waitlistBudgets", totals);
    const existing = await ctx.db.query("waitlist").withIndex("by_email", (q) => q.eq("email", email)).first();
    if (!existing) await ctx.db.insert("waitlist", { email, agent: args.agent, source: args.source, createdAt: now });
    return "ok";
  },
});

export const count = internalQuery({
  args: {},
  handler: async (ctx) => (await ctx.db.query("waitlist").collect()).length,
});

export const list = internalQuery({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 100 }) => {
    if (!Number.isInteger(limit) || limit < 1 || limit > 1000) throw new Error("limit must be an integer from 1 to 1000");
    const rows = await ctx.db.query("waitlist").order("desc").take(limit);
    return rows.map(({ email, agent, source, createdAt }) => ({ email, agent, source, createdAt: new Date(createdAt).toISOString() }));
  },
});
