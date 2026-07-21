import PossibleRoute from "../../_components/PossibleRoute";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "Possible visual explainer — Demo",
  description: "Open the coded browser presentation that explains agent skills, reusable execution prompts, Outcome Packs, and the $possible guide.",
  path: "/demo/presentation",
});

export default function PresentationDemoPage() {
  return <PossibleRoute path="/demo/presentation" />;
}
