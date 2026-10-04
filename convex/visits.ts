import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { validReferrerHost, validUtm, validVisitPath } from "./visitValidation";

// Global budgets bound both writes and arbitrary referrer/UTM cardinality.
// These are abuse guards, not unique-visitor or bot detection.
export const record = internalMutation({
  args: { path: v.string(), referrerHost: v.string(), utmSource: v.string(), utmMedium: v.string(), utmCampaign: v.string() },
  handler: async (ctx, args) => {
    if (!validVisitPath(args.path) || !validReferrerHost(args.referrerHost)
      || ![args.utmSource, args.utmMedium, args.utmCampaign].every(validUtm)) return false;
    const now = Date.now();
    const date = new Date(now).toISOString().slice(0, 10);
    const minute = Math.floor(now / 60_000);
    const budget = await ctx.db.query("pageVisitBudgets").withIndex("by_date", (q) => q.eq("date", date)).unique();
    const minuteCount = budget?.minute === minute ? budget.minuteCount : 0;
    if (minuteCount >= 120 || (budget?.count ?? 0) >= 100_000) return false;
    const bucket = await ctx.db.query("pageVisits").withIndex("by_bucket", (q) => q.eq("date", date)
      .eq("path", args.path).eq("referrerHost", args.referrerHost).eq("utmSource", args.utmSource)
      .eq("utmMedium", args.utmMedium).eq("utmCampaign", args.utmCampaign)).unique();
    if (!bucket && (budget?.buckets ?? 0) >= 1000) return false;
    if (bucket) await ctx.db.patch(bucket._id, { count: bucket.count + 1 });
    else await ctx.db.insert("pageVisits", { date, ...args, count: 1 });
    const totals = { date, minute, minuteCount: minuteCount + 1, count: (budget?.count ?? 0) + 1, buckets: (budget?.buckets ?? 0) + (bucket ? 0 : 1) };
    if (budget) await ctx.db.patch(budget._id, totals);
    else await ctx.db.insert("pageVisitBudgets", totals);
    return true;
  },
});

export const daily = internalQuery({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days = 7 }) => {
    if (!Number.isInteger(days) || days < 1 || days > 31) throw new Error("days must be an integer from 1 to 31");
    const today = new Date().toISOString().slice(0, 10);
    const since = new Date(Date.parse(today) - (days - 1) * 86_400_000).toISOString().slice(0, 10);
    const rows = await ctx.db.query("pageVisits").withIndex("by_bucket", (q) => q.gte("date", since).lte("date", today)).take(31_000);
    return rows.map(({ date, path, referrerHost, utmSource, utmMedium, utmCampaign, count }) => ({ date, path, referrerHost, utmSource, utmMedium, utmCampaign, count }));
  },
});
