import { permanentRedirect } from "next/navigation";

export default function GameDemoPage() {
  permanentRedirect("/examples/fold?view=process");
}
