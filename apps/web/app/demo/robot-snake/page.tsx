import type { Metadata } from "next";
import PossibleRoute from "../../_components/PossibleRoute";

export const metadata: Metadata = {
  title: "Robot Snake demo",
  description: "A recorded Possible Robot Prototype run with CAD, URDF, MuJoCo simulation, deterministic tests, and independent verification.",
};

export default function RobotSnakeDemoPage() {
  return <PossibleRoute path="/demo/robot-snake" />;
}
