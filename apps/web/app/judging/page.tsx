import type { Metadata } from "next";
import PossibleRoute from "../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "Judging evidence",
  description: "Claims, implementation facts, and direct evidence for the Possible OpenAI Build Week submission.",
};

export default function JudgingPage() {
  return <PossibleRoute path="/judging" />;
}
