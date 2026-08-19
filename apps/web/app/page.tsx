import { OutcomesPage } from "../src/App";
import { pageMetadata } from "./_metadata";

export const metadata = pageMetadata({
  title: "Possible — Discover what agents can do",
  description: "Browse real outcomes, copy the exact prompts behind them, and discover what AI agents can do.",
  path: "/",
});

export default function HomePage() {
  return <OutcomesPage />;
}
