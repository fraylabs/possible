import type { MetadataRoute } from "next";
import { outcomeRoutes, publishedOutcomes } from "../src/static-outcomes";
import { agentProfiles } from "../src/agents-data";

const baseUrl = "https://possible.sh";
const siteUpdatedAt = "2026-08-21";
export const dynamic = "force-static";
const staticPaths = [
  "/",
  "/agents/",
  ...agentProfiles.map((agent) => `/agents/${agent.slug}/`),
  "/publish/",
  "/docs/",
  "/docs/how-to-use/",
  "/docs/authoring/",
  "/docs/reference/",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const outcomes = outcomeRoutes(await publishedOutcomes());
  return [...staticPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: siteUpdatedAt,
    changeFrequency: "weekly" as const,
  })), ...outcomes.map(({ path, outcome }) => ({
    url: `${baseUrl}${path}`,
    lastModified: outcome.published_at,
    changeFrequency: "monthly" as const,
  }))];
}
