import { OutcomesPage } from "../../src/App";
import { pageMetadata } from "../_metadata";

export const metadata = pageMetadata({
  title: "Skills used by AI agents",
  description: "Browse agent Skills through the Outcomes that use them.",
  path: "/skills",
  canonicalPath: "/",
});

export default function SkillsDirectoryPage() {
  return <OutcomesPage />;
}
