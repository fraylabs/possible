import PossibleRoute from "../../_components/PossibleRoute";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "How to use Possible",
  description: "Learn what the human decides, what Possible coordinates, and how approval and verification work together.",
  path: "/docs/how-to-use",
});

export default function HowToUsePage() {
  return <PossibleRoute path="/docs/how-to-use" />;
}
