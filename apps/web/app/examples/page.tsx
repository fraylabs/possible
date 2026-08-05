import PossibleRoute from "../_components/PossibleRoute";
import { pageMetadata } from "../_metadata";

export const metadata = pageMetadata({
  title: "Examples",
  description: "Browse finished outcomes made with Possible, then open each result and inspect its preserved evidence.",
  path: "/examples",
});

export default function ExamplesPage() {
  return <PossibleRoute path="/examples" />;
}
