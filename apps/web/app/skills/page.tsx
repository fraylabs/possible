import { AgentsPage } from "../../src/agents";
import { pageMetadata } from "../_metadata";

export const metadata = pageMetadata({
  title: "Skills for Claude Code and Codex",
  description: "See what each skill made. Download one for US$19 or every skill on sale for US$49.",
  path: "/skills",
});

export default function AgentsIndexPage() {
  return <AgentsPage />;
}
