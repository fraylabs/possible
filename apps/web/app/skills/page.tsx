import { AgentsPage } from "../../src/agents";
import { pageMetadata } from "../_metadata";
import { portfolioPreviews, publishedOutcomes } from "../../src/static-outcomes";

export const metadata = pageMetadata({
  title: "Skills for Claude Code and Codex",
  description: "See what each skill made. Download one for US$19 or every skill on sale for US$49.",
  path: "/skills",
});

export default async function AgentsIndexPage() {
  return <AgentsPage staticPortfolio={portfolioPreviews(await publishedOutcomes())} />;
}
