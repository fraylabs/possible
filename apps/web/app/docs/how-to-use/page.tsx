import { HowToUsePage as HowToUseContent } from "../../../src/App";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "How to use Possible",
  description: "Browse prior Outcomes, hand their recipes to your agent, or use $possible to prepare a new execution prompt.",
  path: "/docs/how-to-use",
});

export default function HowToUsePage() {
  return <HowToUseContent />;
}
