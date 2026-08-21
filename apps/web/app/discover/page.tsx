import { DiscoverPage } from "../../src/App";
import { pageMetadata } from "../_metadata";

export const metadata = pageMetadata({
  title: "Discover Products and Skills for AI agents",
  description: "Discover Products and Skills through the outcomes AI agents can make with them.",
  path: "/discover",
});

export default function DiscoveryDirectoryPage() {
  return <DiscoverPage />;
}
