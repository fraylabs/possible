import { PacksPage } from "../src/App";
import { pageMetadata } from "./_metadata";

export const metadata = pageMetadata({
  title: "Possible — Browse Outcome Packs",
  description: "Anything is possible: discover complete outcomes agents can achieve with focused prompts, clear expectations, and specialized Skills when needed.",
  path: "/",
});

export default function HomePage() {
  return <PacksPage />;
}
