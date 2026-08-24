"use client";

import { useEffect, useState } from "react";
import type { OutcomeFile, OutcomePreview } from "@possible/catalog";
import ReactMarkdown from "react-markdown";
import { outcomeApiUrl } from "./backend";
import { attributionDisplayName, recordOutcomeUse, sourceFilterHref } from "./discovery-data";
import { OutcomeReactions } from "./outcome-reactions";
import { CopyButton, SiteShell } from "./shared";

export type DirectoryOutcomeDetail = {
  id: string; title: string; summary: string; about_markdown: string; prompt: string; result_media_url: string | null; poster_url: string | null;
  provider: string | null; agent: string | null; model: string | null; author_name: string | null; author_url: string | null;
  requirements: string[]; published_at: string; publication_kind: "official" | "community"; source_locator: string; source_url: string;
  preview: OutcomePreview | null; inputs: OutcomeFile[]; artifacts: OutcomeFile[];
  primary_attribution?: RawAttribution | null; secondary_attributions?: RawAttribution[]; like_count?: number;
};
export type OutcomeAttribution = { id: string; kind: "Product" | "Skill"; name: string; owner: string; href: string; role?: "primary" | "secondary" };
type RawAttribution = { kind: "product"; id: string } | { kind: "skill"; repository: string; directory: string; lastReviewedCommit: string };

function displayAttribution(item: RawAttribution, role: "primary" | "secondary"): OutcomeAttribution {
  if (item.kind === "product") {
    const [owner = item.id, product = item.id] = item.id.split("/");
    return { id: item.id, kind: "Product", name: attributionDisplayName(product), owner: attributionDisplayName(owner), href: sourceFilterHref({ kind: "product", id: item.id }), role };
  }
  const id = `${item.repository}/${item.directory}`;
  return { id, kind: "Skill", name: attributionDisplayName(item.directory), owner: item.repository, href: sourceFilterHref({ kind: "skill", id }), role };
}

function OutcomePreviewGallery({ outcome }: { outcome: DirectoryOutcomeDetail }) {
  const preview = outcome.preview;
  const images = preview?.images ?? [];
  const video = preview?.video;
  const audio = preview?.audio;
  const cad = preview?.cad;
  if (!preview && !outcome.result_media_url) return null;
  const fallbackVideo = Boolean(outcome.result_media_url && /\.(?:mp4|webm|mov)(?:$|\?)/i.test(outcome.result_media_url));
  return <section className="pack-readable-section pack-readable-section--first" aria-labelledby="dynamic-preview-heading"><h2 id="dynamic-preview-heading">What it made</h2><div className="pack-showcase">
    {video ? <figure><video controls playsInline preload="metadata" poster={video.poster}><source src={video.src} /></video>{video.caption ? <figcaption>{video.caption}</figcaption> : null}</figure> : null}
    {images.length ? <div className="pack-image-grid">{images.map((image) => <figure key={image.src}><img src={image.src} alt={image.alt} />{image.caption ? <figcaption>{image.caption}</figcaption> : null}</figure>)}</div> : null}
    {audio ? <figure className="pack-audio-preview">{audio.poster ? <img src={audio.poster} alt="" /> : null}<audio controls preload="metadata"><source src={audio.src} /></audio>{audio.caption ? <figcaption>{audio.caption}</figcaption> : null}</figure> : null}
    {cad ? <figure>{cad.poster ? <img src={cad.poster} alt={cad.caption ?? `${outcome.title} CAD preview`} /> : null}{cad.caption ? <figcaption>{cad.caption}</figcaption> : null}{cad.downloads?.length ? <div className="pack-cad-downloads">{cad.downloads.map((file) => <a href={file.src} key={file.src} download>{file.label ?? file.format.toUpperCase()} ↓</a>)}</div> : null}</figure> : null}
    {!preview && outcome.result_media_url ? <figure className="dynamic-outcome-preview">{fallbackVideo ? <video controls playsInline preload="metadata" poster={outcome.poster_url ?? undefined}><source src={outcome.result_media_url} /></video> : <img src={outcome.result_media_url} alt={`${outcome.title} result`} />}</figure> : null}
  </div></section>;
}

function OutcomeFiles({ title, files }: { title: string; files: OutcomeFile[] }) {
  if (!files.length) return null;
  return <section className="pack-readable-section"><h2>{title}</h2><ul className="pack-file-list">{files.map((file) => <li key={`${file.type}:${file.src}`}><a href={file.src} target="_blank" rel="noreferrer"><span>{file.type}</span><strong>{file.label}</strong><i>{file.format ?? "open"} ↗</i></a></li>)}</ul></section>;
}

export function DynamicOutcomeDetailPage({ outcomeFixture, attributionsFixture = [] }: { outcomeFixture?: DirectoryOutcomeDetail; attributionsFixture?: OutcomeAttribution[] } = {}) {
  const [outcome, setOutcome] = useState<DirectoryOutcomeDetail | null | undefined>(outcomeFixture);
  const [attributions, setAttributions] = useState<OutcomeAttribution[]>(attributionsFixture);
  const [remixing, setRemixing] = useState(false);
  const [draft, setDraft] = useState(outcomeFixture?.prompt ?? "");

  useEffect(() => {
    if (outcomeFixture !== undefined) return;
    const id = new URL(window.location.href).searchParams.get("id");
    const endpoint = outcomeApiUrl();
    if (!endpoint || !id) { setOutcome(null); return; }
    let cancelled = false;
    void (async () => {
      const response = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, { headers: { accept: "application/json" } });
      if (cancelled) return;
      if (!response.ok) { setOutcome(null); return; }
      const body = await response.json() as { outcome?: DirectoryOutcomeDetail | null };
      if (!body.outcome) { setOutcome(null); return; }
      const next = body.outcome;
      setOutcome(next); setDraft(next.prompt);
      setAttributions([
        ...(next.primary_attribution ? [displayAttribution(next.primary_attribution, "primary")] : []),
        ...(next.secondary_attributions ?? []).map((item) => displayAttribution(item, "secondary")),
      ]);
    })();
    return () => { cancelled = true; };
  }, [outcomeFixture]);

  if (outcome === undefined) return <SiteShell className="pack-detail-page"><p className="dynamic-outcome-loading layout-reading">Loading Outcome…</p></SiteShell>;
  if (!outcome) return <SiteShell className="pack-detail-page"><section className="dynamic-outcome-missing layout-reading"><span>OUTCOME NOT FOUND</span><h1>This Outcome is not available.</h1><a href="/#discover">Browse Outcomes →</a></section></SiteShell>;
  return <SiteShell className="pack-detail-page"><article className="pack-detail-document layout-reading">
    <header className="pack-detail-header">
      <nav className="pack-detail-breadcrumb" aria-label="Breadcrumb"><a href="/#discover">Outcomes</a><span>/</span><span>{outcome.publication_kind}</span></nav>
      <h1>{outcome.title}</h1><p>{outcome.summary}</p><p className="outcome-author">By <a href={outcome.author_url ?? outcome.source_url} target="_blank" rel="noreferrer">{outcome.author_name ?? outcome.source_locator} ↗</a></p>
      <OutcomeReactions outcomeId={outcome.id} likeCount={outcome.like_count ?? 0} />
      {attributions.length ? <div className="pack-product-attribution"><span>MADE WITH</span>{attributions.map((item, index) => <a className={(item.role ?? (index === 0 ? "primary" : "secondary")) === "primary" ? "is-primary" : undefined} href={item.href} target={item.href.startsWith("https://") ? "_blank" : undefined} rel={item.href.startsWith("https://") ? "noreferrer" : undefined} key={`${item.kind}:${item.id}`}><strong>{item.name}</strong><small>{(item.role ?? (index === 0 ? "primary" : "secondary")) === "primary" ? "Primary " : ""}{item.kind} · {item.owner}</small></a>)}</div> : null}
    </header>
    <div className="pack-detail-layout"><div className="pack-detail-main">
      <OutcomePreviewGallery outcome={outcome} />
      <section className="pack-readable-section outcome-about"><h2>About this Outcome</h2><ReactMarkdown>{outcome.about_markdown.replace(/^# .+\n+/, "")}</ReactMarkdown></section>
      {outcome.requirements.length ? <section className="pack-readable-section"><h2>Required inputs</h2><ul className="dynamic-outcome-requirements">{outcome.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul></section> : null}
      <OutcomeFiles title="Inputs used" files={outcome.inputs} />
      <section className="pack-use-panel" aria-labelledby="dynamic-prompt-heading"><h2 id="dynamic-prompt-heading">Prompt</h2><div className={`pack-use-content pack-use-content--direct${remixing ? " is-remixing" : ""}`}>{remixing ? <textarea aria-label="Remix prompt" value={draft} onChange={(event) => setDraft(event.target.value)} /> : <pre className="is-long"><code>{outcome.prompt}</code></pre>}<div className="prompt-actions"><CopyButton label={remixing ? "Copy remixed prompt" : "Copy prompt"} value={draft} onCopied={() => recordOutcomeUse(outcome.id)} />{remixing ? <button className="remix-button" type="button" onClick={() => { setDraft(outcome.prompt); setRemixing(false); }}>Reset</button> : <button className="remix-button" type="button" onClick={() => setRemixing(true)}>Remix this prompt</button>}</div></div></section>
      <OutcomeFiles title="Download the result" files={outcome.artifacts} />
      <section className="pack-readable-section"><h2>Made with</h2><dl className="outcome-execution"><div><dt>Provider</dt><dd>{outcome.provider ?? "Not specified"}</dd></div><div><dt>Model</dt><dd>{outcome.model ?? "Not specified"}</dd></div>{outcome.agent ? <div><dt>Agent</dt><dd>{outcome.agent}</dd></div> : null}<div><dt>Published</dt><dd><time dateTime={outcome.published_at}>{new Date(outcome.published_at).toLocaleDateString()}</time></dd></div><div><dt>Publication</dt><dd>{outcome.publication_kind}</dd></div><div><dt>Source</dt><dd><a href={outcome.source_url} target="_blank" rel="noreferrer">{outcome.source_locator} ↗</a></dd></div></dl></section>
    </div></div>
  </article></SiteShell>;
}
