import PossibleRoute from "../_components/PossibleRoute";
import { pageMetadata } from "../_metadata";

export const metadata = pageMetadata({
  title: "Recorded outcomes",
  description: "Open the live Possible explainer and inspect complete runs produced by coordinated Codex skills.",
  path: "/demo",
});

export default function DemoPage() {
  return <PossibleRoute path="/demo" />;
}
