const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type",
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const selectedColumns = [
  "id",
  "slug",
  "title",
  "summary",
  "prompt",
  "publication_kind",
  "source_locator",
  "source_url",
  "provider",
  "model",
  "requirements",
  "published_at",
].join(",");

type Outcome = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  prompt: string;
  publication_kind: string;
  source_locator: string;
  source_url: string;
  provider: string | null;
  model: string | null;
  requirements: string[];
  published_at: string;
};

function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors,
      "cache-control": status === 200 ? "public, max-age=60" : "no-store",
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function terms(value: string) {
  return [...new Set(value.toLowerCase().match(/[a-z0-9]+/g) ?? [])];
}

function rank(outcome: Outcome, query: string) {
  const title = outcome.title.toLowerCase();
  const summary = outcome.summary.toLowerCase();
  const prompt = outcome.prompt.toLowerCase();
  const source = `${outcome.source_locator} ${outcome.provider ?? ""} ${outcome.model ?? ""}`.toLowerCase();
  return terms(query).reduce((score, term) => score
    + (title.includes(term) ? 10 : 0)
    + (summary.includes(term) ? 5 : 0)
    + (source.includes(term) ? 3 : 0)
    + (prompt.includes(term) ? 1 : 0), 0);
}

async function readDirectory(id?: string) {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !key) throw new Error("Directory is not configured");

  const endpoint = new URL("/rest/v1/outcome_directory", url);
  endpoint.searchParams.set("select", selectedColumns);
  endpoint.searchParams.set("order", "published_at.desc,id.asc");
  endpoint.searchParams.set("limit", id ? "1" : "1000");
  if (id) endpoint.searchParams.set("id", `eq.${id}`);

  const response = await fetch(endpoint, {
    headers: { apikey: key, authorization: `Bearer ${key}`, accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Directory returned HTTP ${response.status}`);
  return await response.json() as Outcome[];
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "GET") return reply({ error: "Method not allowed" }, 405);

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id")?.trim();
    if (id) {
      if (!uuidPattern.test(id)) return reply({ error: "id must be an Outcome UUID" }, 400);
      const [outcome] = await readDirectory(id);
      return outcome ? reply({ outcome }) : reply({ error: "Outcome not found" }, 404);
    }

    const query = url.searchParams.get("q")?.trim() ?? "";
    if (!query) return reply({ error: "q is required" }, 400);
    if (query.length > 200) return reply({ error: "q must be at most 200 characters" }, 400);
    const requestedLimit = Number(url.searchParams.get("limit") ?? 5);
    const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 20) : 5;
    const outcomes = (await readDirectory())
      .map((outcome) => ({ outcome, score: rank(outcome, query) }))
      .filter(({ score }) => score > 0)
      .sort((left, right) => right.score - left.score || right.outcome.published_at.localeCompare(left.outcome.published_at))
      .slice(0, limit)
      .map(({ outcome }) => outcome);
    return reply({ outcomes });
  } catch {
    return reply({ error: "Outcome directory is temporarily unavailable" }, 503);
  }
});
