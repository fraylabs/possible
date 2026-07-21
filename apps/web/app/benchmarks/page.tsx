import type { Metadata } from "next";
import PossibleRoute from "../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "Benchmarks",
  description: "Browse Possible's open benchmark protocols for autonomy, company-system coverage, and fulfillment.",
};

export default function BenchmarksPage() {
  return <PossibleRoute path="/benchmarks" />;
}
