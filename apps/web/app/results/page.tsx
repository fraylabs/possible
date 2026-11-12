import { OutcomesPage } from "../../src/catalog";
import { pageMetadata } from "../_metadata";
import { portfolioPreviews, publishedOutcomes } from "../../src/static-outcomes";

export const metadata = pageMetadata({ title: "Results", description: "Explore results made with Possible skills and the prompts behind them.", path: "/results" });
export default async function ResultsPage() { return <OutcomesPage staticPortfolio={portfolioPreviews(await publishedOutcomes())} />; }
