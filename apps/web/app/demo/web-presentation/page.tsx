import PossibleRoute from "../../_components/PossibleRoute";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "Possible web presentation demo",
  description: "Open the responsive ten-slide coded presentation that explains agent skills, Outcome Packs, and the Possible guide.",
  path: "/demo/web-presentation",
});

export default function WebPresentationDemoPage() {
  return <PossibleRoute path="/demo/web-presentation" />;
}
