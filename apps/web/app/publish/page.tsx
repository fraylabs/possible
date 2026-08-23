import { PublishPage } from "../../src/App";
import { pageMetadata } from "../_metadata";

export const metadata = pageMetadata({
  title: "Publish Outcomes",
  description: "Publish source-owned Outcomes from a public GitHub repository or publisher domain.",
  path: "/publish",
  noIndex: true,
});

export default function PublishRoute() {
  return <PublishPage />;
}
