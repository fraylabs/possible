import { permanentRedirect } from "next/navigation";

export default function HardwareDemoPage() {
  permanentRedirect("/examples/still?view=process");
}
