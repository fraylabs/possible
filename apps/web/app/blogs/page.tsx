import type { Metadata } from "next";
import PossibleRoute from "../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "Blogs",
  description: "Writing about Possible, outcome-oriented collaboration, and the changing relationship between people and AI agents.",
};

export default function BlogsPage() {
  return <PossibleRoute path="/blogs" />;
}
