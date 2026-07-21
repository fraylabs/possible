import PossibleRoute from "../../_components/PossibleRoute";
import { pageMetadata } from "../../_metadata";

export const metadata = pageMetadata({
  title: "Robot Snake demo",
  description: "A recorded Possible Robot Prototype run with CAD, URDF, MuJoCo simulation, deterministic tests, and independent verification.",
  path: "/demo/robot-snake",
});

export default function RobotSnakeDemoPage() {
  return <PossibleRoute path="/demo/robot-snake" />;
}
