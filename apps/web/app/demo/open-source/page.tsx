import type { Metadata } from "next";
import PossibleRoute from "../../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "Open-Source Release demo",
  description: "A recorded Possible Open-Source Release run with package, documentation, governance, release, and verification artifacts.",
};

export default function OpenSourceDemoPage() {
  return <PossibleRoute path="/demo/open-source" />;
}
