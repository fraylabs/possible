import PossibleRoute from "../../_components/PossibleRoute";
import { pageMetadata } from "../../_metadata";
import { getExample } from "../../../src/example-content";

const example = getExample("patchproof")!;

export const metadata = pageMetadata({
  ...example.metadata,
  path: "/examples/patchproof",
});

export default function PatchProofChainExamplePage() {
  return <PossibleRoute path="/examples/patchproof" />;
}
