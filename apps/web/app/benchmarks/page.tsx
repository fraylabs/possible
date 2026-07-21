import type { Metadata } from "next";
import PossibleRoute from "../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "Benchmarks",
  description: "Browse Possible's open protocols for one-prompt work, company building and revenue, Kickstarter funding, and shipping.",
};

export default function BenchmarksPage() {
  return <PossibleRoute path="/benchmarks" />;
}
