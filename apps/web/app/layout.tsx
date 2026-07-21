import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../src/styles.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://possible.sh"),
  title: {
    default: "Possible — What do you want to achieve today?",
    template: "%s — Possible",
  },
  description: "Possible gives Codex the operational judgment to turn a rough request into a verified outcome.",
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
    description: "Possible gives Codex the operational judgment to turn a rough request into a verified outcome.",
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
    description: "Possible gives Codex the operational judgment to turn a rough request into a verified outcome.",
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
