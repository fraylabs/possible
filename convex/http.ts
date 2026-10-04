import { httpRouter } from "convex/server";
import type { Id } from "./_generated/dataModel";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();
auth.addHttpRoutes(http);

const visitCors = {
  "access-control-allow-origin": "https://possible.sh",
  "access-control-allow-headers": "content-type",
  "access-control-allow-methods": "POST,OPTIONS",
  "cache-control": "no-store",
  "vary": "Origin",
};
http.route({ path: "/api/visits", method: "OPTIONS", handler: httpAction(async () => new Response(null, { status: 204, headers: visitCors })) });
http.route({
  path: "/api/visits", method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (request.headers.get("origin") !== "https://possible.sh") return new Response(null, { status: 403 });
    if (request.headers.get("dnt") === "1" || request.headers.get("sec-gpc") === "1") return new Response(null, { status: 204, headers: visitCors });
    if (!request.headers.get("content-type")?.startsWith("application/json")) return new Response(null, { status: 415, headers: visitCors });
    // Bound the actual stream, even when content-length is missing or forged.
    const reader = request.body?.getReader();
    if (!reader) return new Response(null, { status: 400, headers: visitCors });
    let text = "";
    let bytes = 0;
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > 1024) {
          await reader.cancel();
          return new Response(null, { status: 413, headers: visitCors });
        }
        text += decoder.decode(value, { stream: true });
      }
      text += decoder.decode();
      const body = JSON.parse(text);
      const keys = ["path", "referrerHost", "utmSource", "utmMedium", "utmCampaign"];
      if (!body || typeof body !== "object" || Object.keys(body).length !== keys.length || !keys.every((key) => typeof body[key] === "string")) return new Response(null, { status: 400, headers: visitCors });
      const counted = await ctx.runMutation(internal.visits.record, {
        path: body.path, referrerHost: body.referrerHost, utmSource: body.utmSource, utmMedium: body.utmMedium, utmCampaign: body.utmCampaign,
      });
      return new Response(JSON.stringify({ counted }), { headers: { ...visitCors, "content-type": "application/json" } });
    } catch {
      return new Response(null, { status: 400, headers: visitCors });
    }
  }),
});

type PublicOutcome = {
  id: string;
  title: string;
  summary: string;
  prompt: string;
  primary_attribution: unknown;
  secondary_attributions: unknown[];
  models: unknown[];
  use_count: number;
  like_count: number;
};

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type",
  "access-control-allow-methods": "GET,POST,OPTIONS",
};

function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { ...cors, "content-type": "application/json", "cache-control": "no-store" } });
}

http.route({ path: "/api/outcomes", method: "OPTIONS", handler: httpAction(async () => new Response(null, { status: 204, headers: cors })) });
http.route({
  path: "/api/outcomes",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const entries = await ctx.runQuery(api.outcomes.listPublic, {}) as PublicOutcome[];
    if (id) return json({ outcome: entries.find((entry) => entry.id === id) ?? null }, entries.some((entry) => entry.id === id) ? 200 : 404);
    const query = (url.searchParams.get("q") ?? "").trim().toLowerCase();
    const limit = Math.min(Math.max(Number.parseInt(url.searchParams.get("limit") ?? "1000", 10) || 1000, 1), 1000);
    const terms = [...new Set(query.match(/[a-z0-9]+/g) ?? [])];
    const ranked = entries.map((entry) => {
      if (!terms.length) return { entry, score: 0 };
      const title = entry.title.toLowerCase();
      const summary = entry.summary.toLowerCase();
      const prompt = entry.prompt.toLowerCase();
      const context = JSON.stringify([entry.primary_attribution, entry.secondary_attributions, entry.models]).toLowerCase();
      const score = terms.reduce((total, term) => total + (title.includes(term) ? 10 : 0) + (summary.includes(term) ? 5 : 0) + (context.includes(term) ? 3 : 0) + (prompt.includes(term) ? 1 : 0), 0);
      return { entry, score };
    }).filter(({ score }) => !terms.length || score > 0)
      .sort((left, right) => right.score - left.score || right.entry.use_count - left.entry.use_count || right.entry.like_count - left.entry.like_count);
    return json({ outcomes: ranked.slice(0, limit).map(({ entry }) => entry) });
  }),
});

http.route({ path: "/api/outcomes/register", method: "OPTIONS", handler: httpAction(async () => new Response(null, { status: 204, headers: cors })) });
http.route({
  path: "/api/outcomes/register",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (Number(request.headers.get("content-length") ?? 0) > 4096) return json({ error: "Request is too large" }, 413);
    try {
      const body = await request.json() as { source?: unknown };
      if (typeof body.source !== "string") return json({ error: "A source is required" }, 400);
      return json(await ctx.runAction(internal.sourceRegistration.register, { source: body.source }));
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  }),
});

http.route({ path: "/api/outcomes/use", method: "OPTIONS", handler: httpAction(async () => new Response(null, { status: 204, headers: cors })) });
http.route({
  path: "/api/outcomes/use",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json() as { outcomeId?: unknown; visitorHash?: unknown; source?: unknown; ci?: unknown };
      if (typeof body.outcomeId !== "string" || typeof body.visitorHash !== "string" || !["web", "cli"].includes(String(body.source))) return json({ error: "Invalid usage event" }, 400);
      const counted = await ctx.runMutation(api.usage.record, { outcomeId: body.outcomeId as Id<"outcomes">, visitorHash: body.visitorHash, source: body.source as "web" | "cli", ci: body.ci === true });
      return json({ counted });
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  }),
});

export default http;
