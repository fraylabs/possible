import type { Metadata } from "next";
import PossibleRoute from "../../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "Possible visual explainer — Demo",
  description: "Open the coded browser presentation that explains agent skills, reusable execution prompts, Outcome Packs, and the $possible guide.",
};

export default function PresentationDemoPage() {
  return <PossibleRoute path="/demo/presentation" />;
}
