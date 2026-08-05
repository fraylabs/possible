import type { Metadata } from "next";

export const siteUrl = "https://possible.sh";
export const siteName = "Possible";
export const siteDescription = "Possible turns rough ideas into coordinated, independently verified outcomes with open-source Outcome Packs for Codex.";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  alternates?: Record<string, string>;
};

export function pageMetadata({ title, description, path, alternates = {} }: PageMetadataInput): Metadata {
  const canonical = path === "/" ? `${siteUrl}/` : `${siteUrl}${path}/`;
  const socialTitle = path === "/" ? title : `${title} — ${siteName}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      types: {
        "text/plain": `${siteUrl}/llms.txt`,
        "application/json": `${siteUrl}/evidence.json`,
        ...alternates,
      },
    },
    openGraph: {
      type: "website",
      siteName,
      title: socialTitle,
      description,
      url: canonical,
      images: [{
        url: `${siteUrl}/og.png`,
        width: 1731,
        height: 909,
        alt: socialTitle,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [`${siteUrl}/og.png`],
    },
  };
}
