import type { Metadata } from "next";
import PossibleRoute from "../../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "Hardware Launch demo",
  description: "A recorded Possible Hardware Launch run with site, film, CAD, evidence, and verification artifacts.",
};

export default function HardwareDemoPage() {
  return <PossibleRoute path="/demo/hardware" />;
}
