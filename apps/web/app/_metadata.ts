import type { Metadata } from "next";

export const siteUrl = "https://possible.sh";
export const siteName = "Possible";
export const siteDescription = "Skills for your AI agent, shown by the results they make. US$19 each, or US$49 for all.";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  alternates?: Record<string, string>;
  socialImage?: { url: string; width?: number; height?: number; alt: string } | null;
};

/** The first sentence of a longer summary, for a share card's one line. */
export function oneLine(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^.*?[.!?](?=\s|$)/);
  return match ? match[0] : trimmed;
}

export function pageMetadata({ title, description, path, noIndex = false, alternates = {}, socialImage }: PageMetadataInput): Metadata {
  const canonical = path === "/" ? `${siteUrl}/` : `${siteUrl}${path}/`;
  const socialTitle = path === "/" ? title : `${title} — ${siteName}`;
  const socialImages = socialImage === null
    ? []
    : [socialImage ?? { url: `${siteUrl}/og.png`, width: 1731, height: 909, alt: socialTitle }];

  return {
    title,
    description,
    robots: noIndex ? { index: false, follow: false } : undefined,
    alternates: {
      canonical,
      types: alternates,
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
