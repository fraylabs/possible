import { HowToUsePage as HowToUseContent } from "../../../src/App";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "How to use Possible",
  description: "Browse Outcomes on possible.sh or use the optional Codex discovery skill.",
  path: "/docs/how-to-use",
});

export default function HowToUsePage() {
  return <HowToUseContent />;
}
