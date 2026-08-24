import type { MetadataRoute } from "next";

const baseUrl = "https://possible.sh";
const siteUpdatedAt = "2026-08-21";
export const dynamic = "force-static";
const staticPaths = [
  "/",
  "/publish/",
  "/docs/",
  "/docs/how-to-use/",
  "/docs/authoring/",
  "/docs/reference/",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return staticPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: siteUpdatedAt,
    changeFrequency: "weekly" as const,
  }));
}
