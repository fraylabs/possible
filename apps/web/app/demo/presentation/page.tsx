import { permanentRedirect } from "next/navigation";

export default function PresentationDemoPage() {
  permanentRedirect("/examples/web-presentation?view=process");
}
