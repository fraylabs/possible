import type { Metadata } from "next";
import PossibleRoute from "../../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "Playable Web Game demo",
  description: "See the playable game outcome, its recorded thread, source artifacts, and verification evidence.",
};

export default function GameDemoPage() {
  return <PossibleRoute path="/demo/game" />;
}
