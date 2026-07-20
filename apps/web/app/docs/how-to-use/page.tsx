import type { Metadata } from "next";
import PossibleRoute from "../../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "How to use Possible",
  description: "Learn what the human decides, what Possible coordinates, and how approval and verification work together.",
};

export default function HowToUsePage() {
  return <PossibleRoute path="/docs/how-to-use" />;
}
