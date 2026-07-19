import type { Metadata } from "next";
import PossibleRoute from "../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "Workflow Benchmark",
  description: "Compare prompt-by-prompt work, spec-driven development, Codex Plan mode, Goal mode, and Possible side by side.",
};

export default function BenchmarksPage() {
  return <PossibleRoute path="/benchmarks" />;
}
