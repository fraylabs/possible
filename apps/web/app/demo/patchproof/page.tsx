import { permanentRedirect } from "next/navigation";

export default function PatchProofDemoPage() {
  permanentRedirect("/examples/patchproof?view=process");
}
