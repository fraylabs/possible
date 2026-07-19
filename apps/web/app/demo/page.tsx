import type { Metadata } from "next";
import PossibleRoute from "../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "Recorded outcomes",
  description: "Inspect complete Possible runs and the artifacts produced by coordinated Codex skills.",
};

export default function DemoPage() {
  return <PossibleRoute path="/demo" />;
}
