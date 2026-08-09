import { DocsGlossaryPage } from "../../../src/App";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "Glossary",
  description: "Definitions for Possible's structured prompt, Skills, expectations, verification, and approval terms.",
  path: "/docs/glossary",
});

export default function GlossaryDocsPage() {
  return <DocsGlossaryPage />;
}
