import { OutcomePacksDocsPage as OutcomePacksDocsContent } from "../../../src/App";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "Outcome Packs",
  description: "Understand the versioned contracts, trust statuses, and evidence Possible uses to coordinate complete outcomes.",
  path: "/docs/outcome-packs",
});

export default function OutcomePacksDocsPage() {
  return <OutcomePacksDocsContent />;
}
