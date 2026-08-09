import { DocsPage as DocsContent } from "../../src/App";
import { pageMetadata } from "../_metadata";

export const metadata = pageMetadata({
  title: "Documentation",
  description: "Install Possible, brainstorm an outcome with Codex, approve a reviewed pack, and understand every safety boundary.",
  path: "/docs",
});

export default function DocsPage() {
  return <DocsContent />;
}
