import type { Metadata } from "next";
import { DynamicOutcomeDetailPage } from "../../../src/dynamic-outcome-detail";
import { pageMetadata } from "../../_metadata";

export const metadata: Metadata = { ...pageMetadata({
  title: "Result",
  description: "Inspect a published result and the exact prompt behind it.",
  path: "/results/view/",
}), alternates: {} };

export default function OutcomePage() {
  return <DynamicOutcomeDetailPage />;
}
