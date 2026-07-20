import { outcomePacks } from "@possible/packs";
import type { MetadataRoute } from "next";

const baseUrl = "https://possible.sh";
export const dynamic = "force-static";
const staticPaths = [
  "",
  "/blogs",
  "/blogs/what-is-possible",
  "/blogs/why-possible",
  "/benchmarks",
  "/packs",
  "/docs",
  "/docs/how-to-use",
  "/demo",
  "/demo/hardware",
  "/demo/software",
  "/demo/open-source",
  "/demo/game",
  "/demo/game/play",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticPaths.map((path) => ({ url: `${baseUrl}${path}`, changeFrequency: "weekly" as const })),
    ...outcomePacks.map((pack) => ({
      url: `${baseUrl}/packs/${pack.slug}`,
      lastModified: pack.reviewedAt,
      changeFrequency: "weekly" as const,
    })),
  ];
}
