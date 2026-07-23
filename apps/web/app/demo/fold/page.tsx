import PossibleRoute from "../../_components/PossibleRoute";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "Fold process record",
  description: "Play Fold and inspect the brief, review repair, and verification evidence behind the Three.js paper-plane game.",
  path: "/demo/fold",
});

export default function FoldDemoPage() {
  return <PossibleRoute path="/demo/fold" />;
}
