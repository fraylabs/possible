import type { Metadata } from "next";
import PossibleRoute from "../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Install Possible, brainstorm an outcome with Codex, approve a reviewed pack, and understand every safety boundary.",
};

export default function DocsPage() {
  return <PossibleRoute path="/docs" />;
}
