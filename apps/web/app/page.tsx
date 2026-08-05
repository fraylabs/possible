import PossibleRoute from "./_components/PossibleRoute";
import { pageMetadata, siteDescription } from "./_metadata";

export const metadata = pageMetadata({
  title: "Possible — Complete a possible outcome",
  description: siteDescription,
  path: "/",
});

export default function HomePage() {
  return <PossibleRoute path="/" />;
}
