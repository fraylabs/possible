import { AgentsPage } from "../../src/agents";
import { agentProfiles, BUNDLE_PRICE_USD } from "../../src/agents-data";
import { pageMetadata } from "../_metadata";

const prices = agentProfiles.map((agent) => agent.priceUsd);
const eachPrice = new Set(prices).size === 1 ? `US$${prices[0]} each` : `From US$${Math.min(...prices)} each`;

export const metadata = pageMetadata({
  title: "Agent prompts for Claude Code and Codex",
  description: `Download ${agentProfiles.length} agent prompts to run in your own Claude Code or Codex. ${eachPrice}, or US$${BUNDLE_PRICE_USD} for all ${agentProfiles.length}. See what each has made before you buy.`,
  path: "/agents",
});

export default function AgentsIndexPage() {
  return <AgentsPage />;
}
