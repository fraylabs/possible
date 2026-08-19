import type { Metadata } from "next";
import type { ReactNode } from "react";
import { siteDescription, siteUrl } from "./_metadata";
import { possibleVersion } from "../src/public-content";
import "../src/styles.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Possible — Discover what agents can do",
    template: "%s — Possible",
  },
  description: siteDescription,
  applicationName: "Possible",
  creator: "Fray Labs",
  publisher: "Fray Labs",
  category: "developer tools",
  keywords: ["Codex", "AI agents", "prompts", "AI outcomes", "agent skills", "developer tools"],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "theme-color": "#f1eee7",
  },
};

const discoveryGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "Possible",
      alternateName: "Possible.sh",
      url: `${siteUrl}/`,
      description: siteDescription,
      inLanguage: "en",
    },
    {
      "@type": "SoftwareSourceCode",
      "@id": `${siteUrl}/#software`,
      name: "Possible",
      alternateName: "Possible.sh",
      description: siteDescription,
      url: `${siteUrl}/`,
      codeRepository: "https://github.com/fraylabs/possible",
      downloadUrl: "https://www.npmjs.com/package/@fraylabs/possible",
      programmingLanguage: ["TypeScript", "JavaScript"],
      runtimePlatform: "Codex",
      softwareVersion: possibleVersion,
      license: "https://spdx.org/licenses/MIT.html",
      isAccessibleForFree: true,
      sameAs: [
        "https://github.com/fraylabs/possible",
        "https://www.npmjs.com/package/@fraylabs/possible",
        "https://youtu.be/s35aGhVI2Eo",
      ],
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(discoveryGraph) }} />
      </body>
    </html>
  );
}
