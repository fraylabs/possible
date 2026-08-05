import { permanentRedirect } from "next/navigation";

export default function RobotSnakeDemoPage() {
  permanentRedirect("/examples/robot-snake?view=process");
}
