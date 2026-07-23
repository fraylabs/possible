import { permanentRedirect } from "next/navigation";

export default function StillDemoPage() {
  permanentRedirect("/examples/still?view=process");
}
