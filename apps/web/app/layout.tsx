import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../src/styles.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://possible.sh"),
  title: {
    default: "Possible — What do you want to build today?",
    template: "%s — Possible",
  },
  description: "Bring an idea or a live app. Possible helps Codex build, ship, operate, and safely schedule complete outcomes.",
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
    title: "Possible — What do you want to build today?",
    description: "Bring an idea or a live app. Possible helps Codex build, ship, operate, and safely schedule complete outcomes.",
    url: "/",
    images: [{
      url: "/og.png",
      width: 1731,
      height: 909,
      alt: "Possible — What do you want to build today?",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Possible — What do you want to build today?",
    description: "Bring an idea or a live app. Possible helps Codex build, ship, operate, and safely schedule complete outcomes.",
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
