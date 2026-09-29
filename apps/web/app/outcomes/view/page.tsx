import type { Metadata } from "next";
import { DynamicOutcomeDetailPage } from "../../../src/dynamic-outcome-detail";
import { pageMetadata } from "../../_metadata";

export const metadata: Metadata = pageMetadata({
  title: "Outcome",
  description: "Inspect a published result and its recipe: models, agents, pinned skills, references, tools, steps, and the exact prompt.",
  path: "/outcomes/view/",
});

export default function OutcomePage() {
  return <DynamicOutcomeDetailPage />;
}
