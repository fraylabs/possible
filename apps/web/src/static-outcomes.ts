import { cache } from "react";
import { get } from "node:https";
import type { DirectoryOutcomeDetail } from "./dynamic-outcome-detail";
import { outcomeApiUrl } from "./backend";

export type StaticOutcome = DirectoryOutcomeDetail & { slug: string | null };

// Fetch the public directory, never publisher credentials. Fail the build rather
// than deploy a successful-looking sitemap with missing outcomes.
export const publishedOutcomes = cache(async (): Promise<StaticOutcome[]> => {
  const endpoint = outcomeApiUrl() ?? "https://reminiscent-lark-333.convex.site/api/outcomes";
  // Use Node HTTP at build time so Next's persistent data cache cannot keep
  // an older directory snapshot across deployments of this static export.
  const body = await new Promise<{ outcomes?: StaticOutcome[] }>((resolve, reject) => {
    const request = get(`${endpoint}?limit=1000`, (response) => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Cannot prerender outcomes: HTTP ${response.statusCode}`));
        return;
      }
      let json = "";
      response.setEncoding("utf8");
      response.on("data", (chunk: string) => { json += chunk; });
      response.on("error", reject);
      response.on("end", () => {
        try { resolve(JSON.parse(json)); } catch (error) { reject(error); }
      });
    });
    request.setTimeout(30_000, () => request.destroy(new Error("Public directory request timed out")));
    request.on("error", reject);
  });
  if (!Array.isArray(body.outcomes)) throw new Error("Invalid public outcome directory");
  return body.outcomes;
});

export function outcomeRoutes(outcomes: StaticOutcome[]) {
  const base = (outcome: StaticOutcome) => outcome.slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(outcome.slug)
    ? outcome.slug : outcome.id;
  const counts = new Map<string, number>();
  for (const outcome of outcomes) counts.set(base(outcome), (counts.get(base(outcome)) ?? 0) + 1);
  return outcomes.map((outcome) => {
    const slug = counts.get(base(outcome))! > 1 || base(outcome) === "view" ? `${base(outcome)}--${outcome.id}` : base(outcome);
    return { slug, path: `/outcomes/${slug}/`, outcome };
  });
}
