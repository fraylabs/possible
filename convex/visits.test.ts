import { convexTest } from "convex-test";
import { afterEach, describe, expect, it, vi } from "vitest";
import { internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const visit = { path: "/", referrerHost: "example.com", utmSource: "test", utmMedium: "social", utmCampaign: "oct-4" };
afterEach(() => vi.useRealTimers());

describe("Page visits", () => {
  it("aggregates identical visits and separates paths, referrers, UTMs and UTC dates", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-04T23:59:00Z"));
    const t = convexTest(schema, modules);
    expect(await t.mutation(internal.visits.record, visit)).toBe(true);
    expect(await t.mutation(internal.visits.record, visit)).toBe(true);
    await t.mutation(internal.visits.record, { ...visit, path: "/docs" });
    await t.mutation(internal.visits.record, { ...visit, referrerHost: "" });
    await t.mutation(internal.visits.record, { ...visit, utmSource: "other" });
    vi.setSystemTime(new Date("2026-10-05T00:00:00Z"));
    await t.mutation(internal.visits.record, visit);
    const rows = await t.query(internal.visits.daily, { days: 2 });
    expect(rows).toHaveLength(5);
    expect(rows.find((row) => row.date === "2026-10-04" && row.path === "/" && row.referrerHost === "example.com" && row.utmSource === "test")?.count).toBe(2);
    expect(rows.find((row) => row.date === "2026-10-05")?.count).toBe(1);
    expect(await t.query(internal.visits.daily, { days: 1 })).toHaveLength(1);
    expect(Object.keys(rows[0]).sort()).toEqual(["count", "date", "path", "referrerHost", "utmCampaign", "utmMedium", "utmSource"]);
  });

  it("rejects junk without writes", async () => {
    const t = convexTest(schema, modules);
    for (const invalid of [
      { path: "/unknown" }, { path: "/?email=private" }, { path: "/docs/../saved" }, { path: "x".repeat(100) },
      { referrerHost: "https://example.com/private?q=secret" }, { referrerHost: "127.0.0.1" }, { referrerHost: "localhost" },
      { referrerHost: "x".repeat(254) }, { utmSource: "x".repeat(65) }, { utmMedium: "person@example.com" }, { utmCampaign: "campaign\nsecret" },
    ]) expect(await t.mutation(internal.visits.record, { ...visit, ...invalid })).toBe(false);
    expect(await t.run((ctx) => ctx.db.query("pageVisits").collect())).toHaveLength(0);
    expect(await t.run((ctx) => ctx.db.query("pageVisitBudgets").collect())).toHaveLength(0);
  });

  it("caps minute volume, resets it and caps daily totals and new buckets", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-04T12:00:00Z"));
    const t = convexTest(schema, modules);
    await t.mutation(internal.visits.record, visit);
    const budget = await t.run((ctx) => ctx.db.query("pageVisitBudgets").unique());
    await t.run((ctx) => ctx.db.patch(budget!._id, { minuteCount: 120 }));
    expect(await t.mutation(internal.visits.record, visit)).toBe(false);
    vi.setSystemTime(new Date("2026-10-04T12:01:00Z"));
    expect(await t.mutation(internal.visits.record, visit)).toBe(true);
    await t.run((ctx) => ctx.db.patch(budget!._id, { buckets: 1000 }));
    expect(await t.mutation(internal.visits.record, { ...visit, utmSource: "new" })).toBe(false);
    expect(await t.mutation(internal.visits.record, visit)).toBe(true);
    await t.run((ctx) => ctx.db.patch(budget!._id, { count: 100_000 }));
    expect(await t.mutation(internal.visits.record, visit)).toBe(false);
    expect((await t.query(internal.visits.daily, {}))[0].count).toBe(3);
  });

  it("bounds the read window", async () => {
    const t = convexTest(schema, modules);
    for (const days of [0, -1, 32, 1.5]) await expect(t.query(internal.visits.daily, { days })).rejects.toThrow("days must be");
  });

  it("restricts HTTP origins, honors privacy headers and bounds actual request bodies", async () => {
    const t = convexTest(schema, modules);
    const send = (body: string, extra: Record<string, string> = {}) => t.fetch("/api/visits", { method: "POST", headers: { origin: "https://possible.sh", "content-type": "application/json", ...extra }, body });
    expect((await send(JSON.stringify(visit), { origin: "https://preview.pages.dev" })).status).toBe(403);
    for (const header of ["dnt", "sec-gpc"]) expect((await send(JSON.stringify(visit), { [header]: "1" })).status).toBe(204);
    expect((await send("x".repeat(1025))).status).toBe(413);
    expect((await send(JSON.stringify({ ...visit, userAgent: "private" }))).status).toBe(400);
    expect((await send(JSON.stringify(visit), { "content-type": "text/plain" })).status).toBe(415);
    expect(await t.query(internal.visits.daily, {})).toHaveLength(0);
    expect(await (await send(JSON.stringify(visit))).json()).toEqual({ counted: true });
    expect((await t.query(internal.visits.daily, {}))[0].count).toBe(1);
  });
});
