import { permanentRedirect } from "next/navigation";

export default function FoldDemoPage() {
  permanentRedirect("/examples/fold?view=process");
}
