import PossibleRoute from "../../../_components/PossibleRoute";
import { pageMetadata } from "../../../_metadata";

export const metadata = pageMetadata({
  title: "Play Fold",
  description: "Play Fold, the Three.js paper-plane game produced by the Possible Playable Web Game pack.",
  path: "/demo/game/play",
});

export default function PlayGamePage() {
  return <PossibleRoute path="/demo/game/play" />;
}
