import { DocsPage as DocsContent } from "../../src/App";
import { pageMetadata } from "../_metadata";

export const metadata = pageMetadata({
  title: "Documentation",
  description: "Learn how to browse real AI outcomes, copy their exact prompts, and publish your own.",
  path: "/docs",
});

export default function DocsPage() {
  return <DocsContent />;
}
