import { AuthoringDocsPage as AuthoringDocsContent } from "../../../src/App";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "Author an Outcome Pack",
  description: "Create, validate, review, and maintain a private JSON Outcome Pack with Possible's local CLI.",
  path: "/docs/authoring",
});

export default function AuthoringDocsPage() {
  return <AuthoringDocsContent />;
}
