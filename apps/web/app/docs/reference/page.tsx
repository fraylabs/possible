import { DocsReferencePage as DocsReferenceContent } from "../../../src/App";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "Result reference",
  description: "Reference the small result JSON format and Possible's machine-readable interfaces.",
  path: "/docs/reference",
});

export default function DocsReferencePage() {
  return <DocsReferenceContent />;
}
