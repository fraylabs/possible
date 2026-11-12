import { OutcomesPage } from "../../src/catalog";
import { pageMetadata } from "../_metadata";

export const metadata = pageMetadata({ title: "Results", description: "Explore results made with Possible skills and the prompts behind them.", path: "/results" });
export default function ResultsPage() { return <OutcomesPage />; }
