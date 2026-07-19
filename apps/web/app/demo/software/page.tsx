import type { Metadata } from "next";
import PossibleRoute from "../../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "Software Launch demo",
  description: "A recorded Possible Software Launch run and its integrated product, launch, film, release, and evidence outputs.",
};

export default function SoftwareDemoPage() {
  return <PossibleRoute path="/demo/software" />;
}
