import type { Metadata } from "next";

export const siteUrl = "https://possible.sh";
export const siteName = "Possible";
export const siteDescription = "Possible helps you discover what agents can do and gives each outcome a structured prompt, a checklist for what finished means, and optional specialized Skills.";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  alternates?: Record<string, string>;
  socialImage?: { url: string; width?: number; height?: number; alt: string } | null;
};

export function pageMetadata({ title, description, path, alternates = {}, socialImage }: PageMetadataInput): Metadata {
  const canonical = path === "/" ? `${siteUrl}/` : `${siteUrl}${path}/`;
  const socialTitle = path === "/" ? title : `${title} — ${siteName}`;
  const socialImages = socialImage === null
    ? []
    : [socialImage ?? { url: `${siteUrl}/og.png`, width: 1731, height: 909, alt: socialTitle }];

  return {
    title,
    description,
    alternates: {
      canonical,
      types: {
        "text/plain": `${siteUrl}/llms.txt`,
        "application/json": `${siteUrl}/packs/index.json`,
        ...alternates,
      },
    },
    openGraph: {
      type: "website",
      siteName,
      title: socialTitle,
      description,
      url: canonical,
      images: socialImages,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: socialImages.map(({ url }) => url),
    },
  };
}
