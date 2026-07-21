import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../src/styles.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://possible.sh"),
  title: {
    default: "Possible — What outcome do you want to achieve today?",
    template: "%s — Possible",
  },
  description: "Possible is an outcome skill for Codex. Its packs compile dozens of coordinated tasks, specialist skills, and verification gates into one approved run.",
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
    title: "Possible — What outcome do you want to achieve today?",
    description: "Possible is an outcome skill for Codex. Its packs compile dozens of coordinated tasks, specialist skills, and verification gates into one approved run.",
    url: "/",
    images: [{
      url: "/og.png",
      width: 1731,
      height: 909,
      alt: "Possible — What outcome do you want to achieve today?",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Possible — What outcome do you want to achieve today?",
    description: "Possible is an outcome skill for Codex. Its packs compile dozens of coordinated tasks, specialist skills, and verification gates into one approved run.",
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
