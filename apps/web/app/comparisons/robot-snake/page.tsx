import PossibleRoute from "../../_components/PossibleRoute";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "Robot Snake: Possible and /goal comparison",
  description: "A preserved comparison showing what the same rough Robot Snake request caused /goal and Possible to include.",
  path: "/comparisons/robot-snake",
});

export default function RobotSnakeComparisonPage() {
  return <PossibleRoute path="/comparisons/robot-snake" />;
}
