import { AuthoringDocsPage as AuthoringDocsContent } from "../../../src/App";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "Publish an Outcome",
  description: "Share one exact prompt, its author, and optional preview media, Products, and Skills.",
  path: "/docs/authoring",
});

export default function AuthoringDocsPage() {
  return <AuthoringDocsContent />;
}
