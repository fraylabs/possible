import type { Metadata } from "next";
import PossibleRoute from "../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "Step-Away Company Benchmark",
  description: "Compare autonomous work, company-system coverage, time to $100M, and the complete Kickstarter journey from rough idea to 95% shipped.",
};

export default function BenchmarksPage() {
  return <PossibleRoute path="/benchmarks" />;
}
