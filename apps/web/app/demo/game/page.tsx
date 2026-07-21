import PossibleRoute from "../../_components/PossibleRoute";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "Playable Web Game demo",
  description: "See the playable game outcome, its recorded thread, source artifacts, and verification evidence.",
  path: "/demo/game",
});

export default function GameDemoPage() {
  return <PossibleRoute path="/demo/game" />;
}
