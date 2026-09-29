import { AuthoringDocsPage as AuthoringDocsContent } from "../../../src/App";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "Publish an Outcome",
  description: "Share a result, its exact prompt, and the recipe behind it with models, pinned skills, references, tools, and steps.",
  path: "/docs/authoring",
});

export default function AuthoringDocsPage() {
  return <AuthoringDocsContent />;
}
