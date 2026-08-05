import PossibleRoute from "../../_components/PossibleRoute";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "Project files & safety",
  description: "Reference Possible's shared project files, approval boundaries, and troubleshooting guidance.",
  path: "/docs/reference",
});

export default function DocsReferencePage() {
  return <PossibleRoute path="/docs/reference" />;
}
