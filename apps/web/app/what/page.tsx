import type { Metadata } from "next";
import PossibleRoute from "../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "What is Possible?",
  description: "Possible is the outcome layer for AI agents: an installable Codex skill that coordinates specialist capabilities toward verified results.",
};

export default function WhatPage() {
  return <PossibleRoute path="/what" />;
}
