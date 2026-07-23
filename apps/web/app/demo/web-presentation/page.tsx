import { permanentRedirect } from "next/navigation";

export default function WebPresentationDemoPage() {
  permanentRedirect("/examples/web-presentation?view=process");
}
