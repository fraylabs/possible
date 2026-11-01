import { AgentsPage } from "../../src/agents";
import { pageMetadata } from "../_metadata";

export const metadata = pageMetadata({
  title: "Agents",
  description: "AI agents you download and run in your own Claude Code or Codex. US$19 each, or US$49 for all seven. Judge each by its portfolio.",
  path: "/agents",
});

export default function AgentsIndexPage() {
  return <AgentsPage />;
}
