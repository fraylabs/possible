"use client";

import { useMemo, useState } from "react";
import { CopyButton, SiteShell } from "./shared";
import { getSupabaseBrowserClient } from "./supabase";

type PublishResult = {
  source: { locator: string; revision: string; publisherName: string };
  outcomes: Array<{ id: string; slug: string; title: string; publicationKind: "official" | "community" }>;
};

export function normalizeSource(value: string): string {
  return value.trim().replace(/\/$/, "");
}

export function PublishPage() {
  const client = useMemo(() => getSupabaseBrowserClient(), []);
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string }>();
  const [result, setResult] = useState<PublishResult>();

  async function publish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeSource(source);
    if (!client || !normalized) return;
    setBusy(true);
    setNotice(undefined);
    setResult(undefined);
    try {
      const response = await client.functions.invoke("register-outcome-source", { body: { source: normalized } });
      if (response.error || response.data?.error) throw new Error(response.data?.error ?? response.error?.message ?? "Possible could not read this source.");
      setResult(response.data as PublishResult);
      setNotice({ tone: "success", text: `${response.data.outcomes.length} Outcome${response.data.outcomes.length === 1 ? "" : "s"} published from the public source.` });
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : String(error) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteShell className="publish-page">
      <section className="source-publish layout-reading">
        <header>
          <span>PUBLISH OUTCOMES</span>
          <h1>Publish from your source.</h1>
          <p>Keep the canonical files in a public GitHub repository or on your domain. Possible reads and snapshots them—no account required.</p>
        </header>

        <form onSubmit={publish}>
          <label htmlFor="source">GitHub repository or publisher domain</label>
          <div><input id="source" value={source} onChange={(event) => setSource(event.target.value)} placeholder="owner/repository or https://publisher.example" required /><button type="submit" disabled={!client || busy}>{busy ? "Reading…" : "Publish"}</button></div>
          <small>GitHub keeps <code>outcomes.json</code> at the repository root. Domains publish the same index at <code>/.well-known/possible/outcomes.json</code>.</small>
        </form>

        {!client ? <p className="publish-notice error">Publishing is not connected in this local build. You can still use the CLI below.</p> : null}
        {notice ? <p className={`publish-notice ${notice.tone}`} role="status">{notice.text}</p> : null}
        {result ? <section className="publish-result"><span>{result.source.publisherName}</span><strong>{result.source.locator}</strong><small>Revision {result.source.revision.slice(0, 12)}</small><ul>{result.outcomes.map((outcome) => <li key={outcome.id}><a href={`/outcomes/view/?id=${outcome.id}`}>{outcome.title}</a><span>{outcome.publicationKind}</span></li>)}</ul></section> : null}

        <section className="source-publish-contract">
          <div><span>01</span><h2>Author one folder per Outcome.</h2><pre>{"outcomes.json\noutcomes/<slug>/\n  outcome.json\n  outcome.md\n  prompt.md\n  media/       optional"}</pre></div>
          <div><span>02</span><h2>Validate and publish.</h2><p>The CLI creates the folder, checks the public contract, and submits the source URL.</p><CopyButton label="Copy CLI commands" value={"npx @fraylabs/possible@0.2.0 create my-outcome\nnpx @fraylabs/possible@0.2.0 validate\nnpx @fraylabs/possible@0.2.0 publish"} /></div>
        </section>
      </section>
    </SiteShell>
  );
}
