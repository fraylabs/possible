import { AccountProfilePage } from "../../src/App";
import { pageMetadata } from "../_metadata";

export const metadata = pageMetadata({
  title: "Fray Labs",
  description: "Outcomes published by Fray Labs, with the Products and Skills used to make them.",
  path: "/fray-labs",
});

export default function FrayLabsPage() {
  return <AccountProfilePage handle="fray-labs" />;
}
