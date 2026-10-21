import { cache } from "react";
import type { DirectoryOutcomeDetail } from "./dynamic-outcome-detail";
import { outcomeApiUrl } from "./backend";

export type StaticOutcome = DirectoryOutcomeDetail & { slug: string | null };

// Fetch the public directory, never publisher credentials. Fail the build rather
// than deploy a successful-looking sitemap with missing outcomes.
export const publishedOutcomes = cache(async (): Promise<StaticOutcome[]> => {
  const endpoint = outcomeApiUrl() ?? "https://reminiscent-lark-333.convex.site/api/outcomes";
  const response = await fetch(`${endpoint}?limit=1000`, { cache: "force-cache" });
  if (!response.ok) throw new Error(`Cannot prerender outcomes: HTTP ${response.status}`);
  const body = await response.json() as { outcomes?: StaticOutcome[] };
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
