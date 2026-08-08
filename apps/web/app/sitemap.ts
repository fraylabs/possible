import { packHref, routablePacks } from "../src/public-content";
import { exampleCatalog } from "../src/example-content";
import type { MetadataRoute } from "next";

const baseUrl = "https://possible.sh";
const siteUpdatedAt = "2026-07-29";
export const dynamic = "force-static";
const staticPaths = [
  "/",
  "/docs/",
  "/docs/how-to-use/",
  "/docs/outcome-packs/",
  "/docs/expectations/",
  "/docs/authoring/",
  "/docs/reference/",
  "/docs/glossary/",
  "/judging/",
  "/comparisons/robot-snake/",
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
    ...routablePacks.map((pack) => ({
      url: `${baseUrl}${packHref(pack)}/`,
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
