import { PublishPage } from "../../src/App";
import { pageMetadata } from "../_metadata";

export const metadata = pageMetadata({
  title: "Publisher workspace",
  description: "Private workspace for reviewing gallery imports before they appear in Possible.",
  path: "/publish",
  noIndex: true,
});

export default function PublisherWorkspacePage() {
  return <PublishPage />;
}
