import PossibleRoute from "../../_components/PossibleRoute";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "Outcome Packs",
  description: "Understand the reviewed contracts Possible uses to coordinate complete, verifiable outcomes.",
  path: "/docs/outcome-packs",
});

export default function OutcomePacksDocsPage() {
  return <PossibleRoute path="/docs/outcome-packs" />;
}
