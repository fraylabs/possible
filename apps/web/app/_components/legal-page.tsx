import { readFileSync } from "node:fs";
import { join } from "node:path";
import ReactMarkdown from "react-markdown";
import { SiteShell } from "../../src/shared";

export function LegalPage({ name }: { name: "terms" | "privacy" | "refunds" }) {
  const markdown = readFileSync(join(process.cwd(), "content/legal", `${name}.md`), "utf8");
  return (
    <SiteShell className="legal-page">
      <article className="legal-article layout-reading">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </article>
    </SiteShell>
  );
}
