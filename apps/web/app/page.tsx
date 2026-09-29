import { OutcomesPage } from "../src/App";
import { pageMetadata } from "./_metadata";

export const metadata = pageMetadata({
  title: "Possible — Discover what agents can do",
  description: "See what AI can make, inspect the recipe, and hand it to your agent.",
  path: "/",
});

export default function HomePage() {
  return <OutcomesPage />;
}
