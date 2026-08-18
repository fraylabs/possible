import { packHref, productHref, publishedProducts, routablePacks } from "../src/public-content";
import type { MetadataRoute } from "next";

const baseUrl = "https://possible.sh";
const siteUpdatedAt = "2026-08-12";
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
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticPaths.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: siteUpdatedAt,
      changeFrequency: "weekly" as const,
    })),
    ...routablePacks.map((entry) => ({
      url: `${baseUrl}${packHref(entry)}/`,
      lastModified: siteUpdatedAt,
      changeFrequency: "weekly" as const,
    })),
    ...publishedProducts.map((product) => ({
      url: `${baseUrl}${productHref(product)}/`,
      lastModified: siteUpdatedAt,
      changeFrequency: "weekly" as const,
    })),
  ];
}
