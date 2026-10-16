import { AgentsPage } from "../../src/agents";
import { pageMetadata } from "../_metadata";

export const metadata = pageMetadata({
  title: "Agents",
  description: "Hire AI agents that deliver outcomes. Judge each agent by its portfolio, describe the job, and get the result.",
  path: "/agents",
});

export default function AgentsIndexPage() {
  return <AgentsPage />;
}
