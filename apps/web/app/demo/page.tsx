import PossibleRoute from "../_components/PossibleRoute";
import { pageMetadata } from "../_metadata";

export const metadata = pageMetadata({
  title: "How Possible made the outcomes",
  description: "Inspect the request, conversation, Outcome Pack, compiled workstreams, artifacts, verification, and evidence behind each Possible outcome.",
  path: "/demo",
});

export default function DemoPage() {
  return <PossibleRoute path="/demo" />;
}
