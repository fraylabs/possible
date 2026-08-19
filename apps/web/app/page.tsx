import { OutcomesPage } from "../src/App";
import { pageMetadata } from "./_metadata";

export const metadata = pageMetadata({
  title: "Possible — Discover what agents can do",
  description: "Browse real outcomes, compare rough requests with full execution prompts, and discover what AI agents can do.",
  path: "/",
});

export default function HomePage() {
  return <OutcomesPage />;
}
