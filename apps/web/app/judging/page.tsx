import PossibleRoute from "../_components/PossibleRoute";
import { pageMetadata } from "../_metadata";

export const metadata = pageMetadata({
  title: "Judging evidence",
  description: "Claims, implementation facts, and direct evidence for the Possible OpenAI Build Week submission.",
  path: "/judging",
});

export default function JudgingPage() {
  return <PossibleRoute path="/judging" />;
}
