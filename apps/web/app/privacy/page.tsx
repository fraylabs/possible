import { LegalPage } from "../_components/legal-page";
import { pageMetadata } from "../_metadata";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How possible.sh collects, uses, and protects your personal data.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return <LegalPage name="privacy" />;
}
