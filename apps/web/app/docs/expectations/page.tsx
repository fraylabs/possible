import PossibleRoute from "../../_components/PossibleRoute";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "Expectations & evidence",
  description: "Learn how Possible separates outputs, expectations, evidence, verification, and completion.",
  path: "/docs/expectations",
});

export default function ExpectationsDocsPage() {
  return <PossibleRoute path="/docs/expectations" />;
}
