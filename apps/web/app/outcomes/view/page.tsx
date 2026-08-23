import type { Metadata } from "next";
import { DynamicOutcomeDetailPage } from "../../../src/dynamic-outcome-detail";
import { pageMetadata } from "../../_metadata";

export const metadata: Metadata = pageMetadata({
  title: "Outcome",
  description: "Inspect a published result, its exact prompt, and the Products or Skills that made it possible.",
  path: "/outcomes/view/",
});

export default function OutcomePage() {
  return <DynamicOutcomeDetailPage />;
}
