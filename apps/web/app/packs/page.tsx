import type { Metadata } from "next";
import PossibleRoute from "../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "Outcome packs",
  description: "Browse complete, reviewed recipes that coordinate multiple Codex skills around one verifiable outcome.",
};

export default function PacksPage() {
  return <PossibleRoute path="/packs" />;
}
