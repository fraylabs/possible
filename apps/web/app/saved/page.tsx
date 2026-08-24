import type { Metadata } from "next";
import { SavedOutcomesPage } from "../../src/App";

export const metadata: Metadata = {
  title: "Saved Outcomes",
  description: "Outcomes saved to your Possible account.",
  robots: { index: false, follow: false },
};

export default SavedOutcomesPage;
