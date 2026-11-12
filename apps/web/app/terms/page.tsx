import { LegalPage } from "../_components/legal-page";
import { pageMetadata } from "../_metadata";

export const metadata = pageMetadata({
  title: "Terms of Service",
  description: "The terms for using possible.sh and buying skills.",
  path: "/terms",
});

export default function TermsPage() {
  return <LegalPage name="terms" />;
}
