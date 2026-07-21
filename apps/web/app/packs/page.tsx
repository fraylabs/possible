import type { Metadata } from "next";
import PossibleRoute from "../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "Outcome Packs",
  description: "Browse reviewed Outcome Packs that combine execution prompts, agent skills, safeguards, and completion checks.",
};

export default function PacksPage() {
  return <PossibleRoute path="/packs" />;
}
