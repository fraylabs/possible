import type { Metadata } from "next";
import PossibleRoute from "../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "Recorded outcomes",
  description: "Open the live Possible explainer and inspect complete runs produced by coordinated Codex skills.",
};

export default function DemoPage() {
  return <PossibleRoute path="/demo" />;
}
