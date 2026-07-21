import type { Metadata } from "next";
import PossibleRoute from "../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "Step-Away Startup Benchmark",
  description: "Compare how long agent workflows keep advancing a $1 million SaaS and how many ingredients of a successful startup they put in place.",
};

export default function BenchmarksPage() {
  return <PossibleRoute path="/benchmarks" />;
}
