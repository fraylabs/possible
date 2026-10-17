import { convexTest } from "convex-test";
import { afterEach, describe, expect, it, vi } from "vitest";
import { internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const signup = { email: "  Person@Example.com ", agent: "launch-marketer", source: "x" };
afterEach(() => vi.useRealTimers());

describe("Waitlist", () => {
  it("normalizes emails and stays idempotent per email", async () => {
    const t = convexTest(schema, modules);
    expect(await t.mutation(internal.waitlist.join, signup)).toBe("ok");
    expect(await t.mutation(internal.waitlist.join, { ...signup, email: "person@example.com", agent: "" })).toBe("ok");
    expect(await t.mutation(internal.waitlist.join, { email: "other@example.org", agent: "", source: "" })).toBe("ok");
    expect(await t.query(internal.waitlist.count, {})).toBe(2);
    const rows = await t.query(internal.waitlist.list, { limit: 10 });
    expect(rows.find((row) => row.email === "person@example.com")).toMatchObject({ agent: "launch-marketer", source: "x" });
    expect(await t.query(internal.waitlist.list, { limit: 1 })).toHaveLength(1);
    for (const limit of [0, 1001, 1.5]) await expect(t.query(internal.waitlist.list, { limit })).rejects.toThrow("limit must be");
  });

  it("rejects junk without writes", async () => {
    const t = convexTest(schema, modules);
    for (const invalid of [
      { email: "" }, { email: "no-at-sign" }, { email: "a@b" }, { email: "a b@example.com" }, { email: `${"x".repeat(250)}@example.com` },
      { agent: "../secret" }, { agent: "Upper" }, { source: "person@example.com" }, { source: "x".repeat(65) },
    ]) expect(await t.mutation(internal.waitlist.join, { ...signup, ...invalid })).toBe("invalid");
    expect(await t.query(internal.waitlist.count, {})).toBe(0);
    expect(await t.run((ctx) => ctx.db.query("waitlistBudgets").collect())).toHaveLength(0);
  });

  it("caps minute and daily volume", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-17T12:00:00Z"));
    const t = convexTest(schema, modules);
    await t.mutation(internal.waitlist.join, signup);
    const budget = await t.run((ctx) => ctx.db.query("waitlistBudgets").unique());
    await t.run((ctx) => ctx.db.patch(budget!._id, { minuteCount: 60 }));
    expect(await t.mutation(internal.waitlist.join, { ...signup, email: "b@example.com" })).toBe("busy");
    vi.setSystemTime(new Date("2026-10-17T12:01:00Z"));
    expect(await t.mutation(internal.waitlist.join, { ...signup, email: "b@example.com" })).toBe("ok");
    await t.run((ctx) => ctx.db.patch(budget!._id, { count: 5_000 }));
    expect(await t.mutation(internal.waitlist.join, { ...signup, email: "c@example.com" })).toBe("busy");
    expect(await t.query(internal.waitlist.count, {})).toBe(2);
  });

  it("restricts HTTP origins, content type and body size", async () => {
    const t = convexTest(schema, modules);
    const body = JSON.stringify(signup);
    const send = (text: string, extra: Record<string, string> = {}) => t.fetch("/api/waitlist", { method: "POST", headers: { origin: "https://possible.sh", "content-type": "application/json", ...extra }, body: text });
    expect((await send(body, { origin: "https://preview.pages.dev" })).status).toBe(403);
    expect((await send(body, { "content-type": "text/plain" })).status).toBe(415);
    expect((await send("x".repeat(1025))).status).toBe(413);
    expect((await send(JSON.stringify({ ...signup, name: "extra" }))).status).toBe(400);
    expect((await send(JSON.stringify({ ...signup, email: "bad" }))).status).toBe(400);
    expect((await t.fetch("/api/waitlist", { method: "OPTIONS" })).headers.get("access-control-allow-origin")).toBe("https://possible.sh");
    expect(await t.query(internal.waitlist.count, {})).toBe(0);
    const response = await send(body);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(await t.query(internal.waitlist.count, {})).toBe(1);
  });
});
