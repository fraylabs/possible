import { publishedPacks } from "../src/public-content";
import { exampleCatalog } from "../src/example-content";
import type { MetadataRoute } from "next";

const baseUrl = "https://possible.sh";
const siteUpdatedAt = "2026-07-23";
export const dynamic = "force-static";
const staticPaths = [
  "/",
  "/packs/",
  "/docs/",
  "/docs/how-to-use/",
  "/judging/",
  "/examples/",
  "/presentation/",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticPaths.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: siteUpdatedAt,
      changeFrequency: "weekly" as const,
    })),
    ...publishedPacks.map((pack) => ({
      url: `${baseUrl}/packs/${pack.slug}/`,
      lastModified: siteUpdatedAt,
      changeFrequency: "weekly" as const,
    })),
    ...exampleCatalog.map((example) => ({
      url: `${baseUrl}/examples/${example.slug}/`,
      lastModified: siteUpdatedAt,
      changeFrequency: "weekly" as const,
    })),
  ];
}
