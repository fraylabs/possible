"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { OutcomeReviews } from "./outcome-reviews";
import { recordOutcomeCopy } from "./discovery-data";
import { CopyButton, SiteShell } from "./shared";
import { getSupabaseBrowserClient } from "./supabase";

type Outcome = {
  id: string; title: string; summary: string; about_markdown: string; prompt: string; result_media_url: string | null; poster_url: string | null;
  provider: string | null; agent: string | null; model: string | null; author_name: string | null; author_url: string | null;
  requirements: string[]; published_at: string; publication_kind: "official" | "community"; source_locator: string; source_url: string;
};
type Attribution = { id: string; kind: "Product" | "Skill"; name: string; owner: string; href: string };

export function DynamicOutcomeDetailPage() {
  const client = useMemo(() => getSupabaseBrowserClient(), []);
  const [outcome, setOutcome] = useState<Outcome | null | undefined>();
  const [attributions, setAttributions] = useState<Attribution[]>([]);
  const [remixing, setRemixing] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const id = new URL(window.location.href).searchParams.get("id");
    if (!client || !id) { setOutcome(null); return; }
    let cancelled = false;
    void (async () => {
      const [outcomeResult, productResult, skillResult] = await Promise.all([
        client.from("outcome_directory").select("id,title,summary,about_markdown,prompt,result_media_url,poster_url,provider,agent,model,author_name,author_url,requirements,published_at,publication_kind,source_locator,source_url").eq("id", id).maybeSingle(),
        client.from("product_outcome_directory").select("linked_product_id,linked_product_slug,linked_product_name,linked_company_name").eq("id", id),
        client.from("skill_outcome_directory").select("linked_skill_id,linked_skill_name,linked_skill_repository,linked_skill_directory").eq("id", id),
      ]);
      if (cancelled) return;
      if (outcomeResult.error || !outcomeResult.data) { setOutcome(null); return; }
      const next = outcomeResult.data as Outcome;
      setOutcome(next); setDraft(next.prompt);
      setAttributions([
        ...((productResult.data ?? []) as Array<{ linked_product_id: string; linked_product_slug: string; linked_product_name: string; linked_company_name: string }>).map((row) => ({ id: row.linked_product_id, kind: "Product" as const, name: row.linked_product_name, owner: row.linked_company_name, href: `/products/${row.linked_product_slug}` })),
        ...((skillResult.data ?? []) as Array<{ linked_skill_id: string; linked_skill_name: string; linked_skill_repository: string; linked_skill_directory: string }>).map((row) => ({ id: row.linked_skill_id, kind: "Skill" as const, name: row.linked_skill_name, owner: row.linked_skill_repository, href: `https://github.com/${row.linked_skill_repository}/tree/HEAD/${row.linked_skill_directory}` })),
      ]);
    })();
    return () => { cancelled = true; };
  }, [client]);

  if (outcome === undefined) return <SiteShell className="pack-detail-page"><p className="dynamic-outcome-loading layout-reading">Loading Outcome…</p></SiteShell>;
  if (!outcome) return <SiteShell className="pack-detail-page"><section className="dynamic-outcome-missing layout-reading"><span>OUTCOME NOT FOUND</span><h1>This Outcome is not available.</h1><a href="/#discover">Browse Outcomes →</a></section></SiteShell>;
  const video = Boolean(outcome.result_media_url && /\.(?:mp4|webm|mov)(?:$|\?)/i.test(outcome.result_media_url));

  return <SiteShell className="pack-detail-page"><article className="pack-detail-document layout-reading">
    <header className="pack-detail-header">
      <nav className="pack-detail-breadcrumb" aria-label="Breadcrumb"><a href="/#discover">Outcomes</a><span>/</span><span>{outcome.publication_kind}</span></nav>
      <h1>{outcome.title}</h1><p>{outcome.summary}</p><p className="outcome-author">By <a href={outcome.author_url ?? outcome.source_url} target="_blank" rel="noreferrer">{outcome.author_name ?? outcome.source_locator} ↗</a></p>
      {attributions.length ? <div className="pack-product-attribution"><span>MADE WITH</span>{attributions.map((item) => <a href={item.href} target={item.href.startsWith("https://") ? "_blank" : undefined} rel={item.href.startsWith("https://") ? "noreferrer" : undefined} key={`${item.kind}:${item.id}`}><strong>{item.name}</strong><small>{item.kind} · {item.owner}</small></a>)}</div> : null}
    </header>
    <div className="pack-detail-layout"><div className="pack-detail-main">
      {outcome.result_media_url ? <section className="pack-readable-section pack-readable-section--first" aria-labelledby="dynamic-preview-heading"><h2 id="dynamic-preview-heading">What it made</h2><figure className="dynamic-outcome-preview">{video ? <video controls playsInline preload="metadata" poster={outcome.poster_url ?? undefined}><source src={outcome.result_media_url} /></video> : <img src={outcome.result_media_url} alt={`${outcome.title} result`} />}<figcaption>{outcome.summary}</figcaption></figure></section> : null}
      <section className="pack-readable-section outcome-about"><h2>About this Outcome</h2><ReactMarkdown>{outcome.about_markdown.replace(/^# .+\n+/, "")}</ReactMarkdown></section>
      {outcome.requirements.length ? <section className="pack-readable-section"><h2>Required inputs</h2><ul className="dynamic-outcome-requirements">{outcome.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul></section> : null}
      <section className="pack-use-panel" aria-labelledby="dynamic-prompt-heading"><h2 id="dynamic-prompt-heading">Prompt</h2><div className={`pack-use-content pack-use-content--direct${remixing ? " is-remixing" : ""}`}>{remixing ? <textarea aria-label="Remix prompt" value={draft} onChange={(event) => setDraft(event.target.value)} /> : <pre className="is-long"><code>{outcome.prompt}</code></pre>}<div className="prompt-actions"><CopyButton label={remixing ? "Copy remixed prompt" : "Copy prompt"} value={draft} onCopied={() => recordOutcomeCopy(outcome.id)} />{remixing ? <button className="remix-button" type="button" onClick={() => { setDraft(outcome.prompt); setRemixing(false); }}>Reset</button> : <button className="remix-button" type="button" onClick={() => setRemixing(true)}>Remix this prompt</button>}</div></div></section>
      <OutcomeReviews outcomeId={outcome.id} />
      <section className="pack-readable-section"><h2>Made with</h2><dl className="outcome-execution"><div><dt>Provider</dt><dd>{outcome.provider ?? "Not specified"}</dd></div><div><dt>Model</dt><dd>{outcome.model ?? "Not specified"}</dd></div>{outcome.agent ? <div><dt>Agent</dt><dd>{outcome.agent}</dd></div> : null}<div><dt>Published</dt><dd><time dateTime={outcome.published_at}>{new Date(outcome.published_at).toLocaleDateString()}</time></dd></div><div><dt>Publication</dt><dd>{outcome.publication_kind}</dd></div><div><dt>Source</dt><dd><a href={outcome.source_url} target="_blank" rel="noreferrer">{outcome.source_locator} ↗</a></dd></div></dl></section>
    </div></div>
  </article></SiteShell>;
}
