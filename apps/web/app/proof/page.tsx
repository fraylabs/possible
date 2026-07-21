import type { Metadata } from "next";
import PossibleRoute from "../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "Build Week proof",
  description: "Inspect Possible's frozen five-workflow pilot, compiler flow, preserved verification repair, raw evidence, and explicit limitations.",
};

export default function ProofPage() {
  return <PossibleRoute path="/proof" />;
}
