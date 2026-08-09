import { ExpectationsDocsPage as ExpectationsDocsContent } from "../../../src/App";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "Expectations & evidence",
  description: "Learn how Possible separates outcome expectations from proportional runtime verification.",
  path: "/docs/expectations",
});

export default function ExpectationsDocsPage() {
  return <ExpectationsDocsContent />;
}
