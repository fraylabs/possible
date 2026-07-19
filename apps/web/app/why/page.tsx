import type { Metadata } from "next";
import PossibleRoute from "../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "Why Possible",
  description: "Move from managing prompts to steering outcomes. Learn how you, Possible, and specialist agents work together.",
};

export default function WhyPage() {
  return <PossibleRoute path="/why" />;
}
