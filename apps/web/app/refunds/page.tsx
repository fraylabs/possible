import { LegalPage } from "../_components/legal-page";
import { pageMetadata } from "../_metadata";

export const metadata = pageMetadata({
  title: "Refund Policy",
  description: "When and how we refund teardown reports bought on possible.sh.",
  path: "/refunds",
});

export default function RefundsPage() {
  return <LegalPage name="refunds" />;
}
