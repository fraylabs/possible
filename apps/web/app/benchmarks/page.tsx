import type { Metadata } from "next";
import PossibleRoute from "../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "Step-Away Outcome Benchmark",
  description: "Compare how long agent workflows keep advancing a $1 million SaaS and how much of the outcome an independent verifier can prove.",
};

export default function BenchmarksPage() {
  return <PossibleRoute path="/benchmarks" />;
}
