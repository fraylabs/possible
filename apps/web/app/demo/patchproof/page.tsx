import PossibleRoute from "../../_components/PossibleRoute";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "How PatchProof was made — Recorded run",
  description: "Inspect the real three-stage Possible run that discovered, built, remixed, repaired, and independently verified PatchProof.",
  path: "/demo/patchproof",
});

export default function PatchProofDemoPage() {
  return <PossibleRoute path="/demo/patchproof" />;
}
