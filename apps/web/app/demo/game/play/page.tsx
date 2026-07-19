import type { Metadata } from "next";
import PossibleRoute from "../../../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "Play Fold",
  description: "Play Fold, the Three.js paper-plane game produced by the Possible Playable Web Game pack.",
};

export default function PlayGamePage() {
  return <PossibleRoute path="/demo/game/play" />;
}
