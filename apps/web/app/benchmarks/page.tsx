import type { Metadata } from "next";
import PossibleRoute from "../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "Time-to-Outcome Benchmark",
  description: "Explore an illustrative time-to-outcome model for prompt-by-prompt work, specifications, Plan mode, Goal mode, and Possible.",
};

export default function BenchmarksPage() {
  return <PossibleRoute path="/benchmarks" />;
}
