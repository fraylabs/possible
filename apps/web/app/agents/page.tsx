import { AgentsPage } from "../../src/agents";
import { agentProfiles, BUNDLE_PRICE_USD } from "../../src/agents-data";
import { pageMetadata } from "../_metadata";

export const metadata = pageMetadata({
  title: "Agents",
  description: `AI agents you download and run in your own Claude Code or Codex. US$19 each, or US$${BUNDLE_PRICE_USD} for all ${agentProfiles.length}. Judge each by its portfolio.`,
  path: "/agents",
});

export default function AgentsIndexPage() {
  return <AgentsPage />;
}
