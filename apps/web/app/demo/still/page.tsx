import PossibleRoute from "../../_components/PossibleRoute";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "Still hardware launch demo",
  description: "Inspect the Still hardware launch: a finished local site, film, CAD package, honest waitlist, verifier repair, and preserved evidence.",
  path: "/demo/still",
});

export default function StillDemoPage() {
  return <PossibleRoute path="/demo/still" />;
}
