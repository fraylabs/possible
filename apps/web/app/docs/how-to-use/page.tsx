import { HowToUsePage as HowToUseContent } from "../../../src/App";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "How to use Possible",
  description: "Browse prior Outcomes or use $possible to prepare a complete execution prompt for a fresh agent.",
  path: "/docs/how-to-use",
});

export default function HowToUsePage() {
  return <HowToUseContent />;
}
