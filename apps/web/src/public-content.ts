import { outcomePacks } from "@possible/packs";

export const installCommand = "npx @fraylabs/possible@0.1.11 init";
export const githubUrl = "https://github.com/fraylabs/possible";

export const featuredPackSlugs = [
  "robot-prototype",
  "playable-web-game",
  "web-presentation",
  "software-opportunity-discovery",
] as const;

export const featuredPacks = featuredPackSlugs.map((slug) => {
  const pack = outcomePacks.find((candidate) => candidate.slug === slug);
  if (!pack) throw new Error(`Missing featured Outcome Pack: ${slug}`);
  return pack;
});

export const publishedPackSlugs = [...featuredPackSlugs, "first-customer-sprint", "developer-project-launch"] as const;
export const publishedPacks = publishedPackSlugs.map((slug) => {
  const pack = outcomePacks.find((candidate) => candidate.slug === slug);
  if (!pack) throw new Error(`Missing published Outcome Pack: ${slug}`);
  return pack;
});

export const archivedPublishedPackSlugs = ["hardware-launch", "working-hardware-prototype", "launch-content-campaign", "kickstarter-funding"] as const;
export const archivedPublishedPacks = archivedPublishedPackSlugs.map((slug) => {
  const pack = outcomePacks.find((candidate) => candidate.slug === slug);
  if (!pack?.archived) throw new Error(`Missing archived published Outcome Pack: ${slug}`);
  return pack;
});

export const routablePacks = [...publishedPacks, ...archivedPublishedPacks];

export function getFeaturedPack(slug: string) {
  return featuredPacks.find((pack) => pack.slug === slug);
}

export function getPublishedPack(slug: string) {
  return publishedPacks.find((pack) => pack.slug === slug);
}

export function getRoutablePack(slug: string) {
  return routablePacks.find((pack) => pack.slug === slug);
}
