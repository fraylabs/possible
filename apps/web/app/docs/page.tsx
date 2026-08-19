import { DocsPage as DocsContent } from "../../src/App";
import { pageMetadata } from "../_metadata";

export const metadata = pageMetadata({
  title: "Documentation",
  description: "Learn how to browse request-to-result records, prepare execution prompts, and publish your own Outcome.",
  path: "/docs",
});

export default function DocsPage() {
  return <DocsContent />;
}
