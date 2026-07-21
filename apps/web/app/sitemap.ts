import { featuredPacks } from "../src/public-content";
import type { MetadataRoute } from "next";

const baseUrl = "https://possible.sh";
export const dynamic = "force-static";
const staticPaths = [
  "",
  "/packs",
  "/docs",
  "/docs/how-to-use",
  "/judging",
  "/demo",
  "/demo/hardware",
  "/demo/game",
  "/demo/game/play",
  "/demo/robot-snake",
  "/demo/presentation",
  "/presentation",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticPaths.map((path) => ({ url: `${baseUrl}${path}`, changeFrequency: "weekly" as const })),
    ...featuredPacks.map((pack) => ({
      url: `${baseUrl}/packs/${pack.slug}`,
      lastModified: pack.reviewedAt,
      changeFrequency: "weekly" as const,
    })),
  ];
}
