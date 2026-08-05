import PossibleRoute from "../../_components/PossibleRoute";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "Glossary",
  description: "Definitions for Possible's outcome, pack, expectation, evidence, verification, and approval terms.",
  path: "/docs/glossary",
});

export default function GlossaryDocsPage() {
  return <PossibleRoute path="/docs/glossary" />;
}
