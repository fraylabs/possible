import { OutcomesPage } from "../src/App";
import { pageMetadata } from "./_metadata";
import { portfolioPreviews, publishedOutcomes } from "../src/static-outcomes";

export const metadata = pageMetadata({
  title: "Skills our agents run. Yours can too.",
  description: "Skills for Claude Code and Codex, each shown by what it made. US$19 each or US$49 for every skill on sale.",
  path: "/",
});

export default async function HomePage() {
  return <OutcomesPage staticPortfolio={portfolioPreviews(await publishedOutcomes())} />;
}
