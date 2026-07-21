import { outcomePacks } from "@possible/packs";

export const installCommand = "npx @fraylabs/possible@0.1.9 init";
export const githubUrl = "https://github.com/fraylabs/possible";

export const featuredPackSlugs = [
  "hardware-launch",
  "robot-prototype",
  "playable-web-game",
  "web-presentation",
] as const;

export const featuredPacks = featuredPackSlugs.map((slug) => {
  const pack = outcomePacks.find((candidate) => candidate.slug === slug);
  if (!pack) throw new Error(`Missing featured Outcome Pack: ${slug}`);
  return pack;
});

export function getFeaturedPack(slug: string) {
  return featuredPacks.find((pack) => pack.slug === slug);
}
