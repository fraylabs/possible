import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../src/styles.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://possible.sh"),
  title: {
    default: "Possible — What do you want to achieve today?",
    template: "%s — Possible",
  },
  description: "Possible gives non-experts the operational judgment to turn rough ambitions into expert-shaped, verified outcomes with Codex.",
  applicationName: "Possible",
  alternates: {
    types: {
      "text/plain": "/llms.txt",
      "application/json": "/packs/index.json",
    },
  },
  openGraph: {
    type: "website",
    siteName: "Possible",
    title: "Possible — What do you want to achieve today?",
    description: "Possible gives non-experts the operational judgment to turn rough ambitions into expert-shaped, verified outcomes with Codex.",
    url: "/",
    images: [{
      url: "/og.png",
      width: 1731,
      height: 909,
      alt: "Possible — What do you want to achieve today?",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Possible — What do you want to achieve today?",
    description: "Possible gives non-experts the operational judgment to turn rough ambitions into expert-shaped, verified outcomes with Codex.",
    images: ["/og.png"],
  },
  other: {
    "theme-color": "#f1eee7",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
