import PossibleRoute from "../_components/PossibleRoute";
import { pageMetadata } from "../_metadata";

export const metadata = pageMetadata({
  title: "Outcome Packs",
  description: "Browse reviewed Outcome Packs that combine execution prompts, agent skills, safeguards, and completion checks.",
  path: "/packs",
});

export default function PacksPage() {
  return <PossibleRoute path="/packs" />;
}
