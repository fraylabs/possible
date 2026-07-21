import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../src/styles.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://possible.sh"),
  title: {
    default: "Possible — Complete a possible outcome",
    template: "%s — Possible",
  },
  description: "Possible.sh is an open-source library of Outcome Packs. Each pack combines a reusable execution prompt and selected agent skills for dozens of coordinated tasks.",
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
    title: "Possible — Complete a possible outcome",
    description: "Possible.sh is an open-source library of Outcome Packs. Each pack combines a reusable execution prompt and selected agent skills for dozens of coordinated tasks.",
    url: "/",
    images: [{
      url: "/og.png",
      width: 1731,
      height: 909,
      alt: "Possible — Complete a possible outcome",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Possible — Complete a possible outcome",
    description: "Possible.sh is an open-source library of Outcome Packs. Each pack combines a reusable execution prompt and selected agent skills for dozens of coordinated tasks.",
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
