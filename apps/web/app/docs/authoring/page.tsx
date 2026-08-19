import { AuthoringDocsPage as AuthoringDocsContent } from "../../../src/App";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "Publish an Outcome",
  description: "Share an original request, its full execution prompt and provenance, and optional result media, Products, and Skills.",
  path: "/docs/authoring",
});

export default function AuthoringDocsPage() {
  return <AuthoringDocsContent />;
}
