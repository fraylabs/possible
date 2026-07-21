import PossibleRoute from "../../_components/PossibleRoute";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "Hardware Launch demo",
  description: "A recorded Possible Hardware Launch run with site, film, CAD, evidence, and verification artifacts.",
  path: "/demo/hardware",
});

export default function HardwareDemoPage() {
  return <PossibleRoute path="/demo/hardware" />;
}
