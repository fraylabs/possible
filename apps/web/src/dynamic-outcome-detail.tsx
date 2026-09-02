"use client";

import { useEffect, useMemo, useState } from "react";
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
type GalleryItem =
  | { id: string; kind: "image"; src: string; alt: string; caption?: string | undefined }
  | { id: string; kind: "video"; src: string; poster?: string | undefined; caption?: string | undefined }
  | { id: string; kind: "audio"; src: string; poster?: string | undefined; caption?: string | undefined }
  | { id: string; kind: "cad"; poster?: string | undefined; caption?: string | undefined; downloads: NonNullable<NonNullable<OutcomePreview["cad"]>["downloads"]> };

function displayAttribution(item: RawAttribution, role: "primary" | "secondary"): OutcomeAttribution {
  if (item.kind === "product") {
    const [owner = item.id, product = item.id] = item.id.split("/");
    return { id: item.id, kind: "Product", name: attributionDisplayName(product), owner: attributionDisplayName(owner), href: sourceFilterHref({ kind: "product", id: item.id }), role };
  }
  const id = `${item.repository}/${item.directory}`;
  return { id, kind: "Skill", name: attributionDisplayName(item.directory), owner: item.repository, href: sourceFilterHref({ kind: "skill", id }), role };
}

function galleryItems(outcome: DirectoryOutcomeDetail): GalleryItem[] {
  const items: GalleryItem[] = [];
  const preview = outcome.preview;
  if (preview?.video) items.push({ id: `video:${preview.video.src}`, kind: "video", src: preview.video.src, poster: preview.video.poster, caption: preview.video.caption });
  for (const image of preview?.images ?? []) items.push({ id: `image:${image.src}`, kind: "image", src: image.src, alt: image.alt, caption: image.caption });
  if (preview?.audio) items.push({ id: `audio:${preview.audio.src}`, kind: "audio", src: preview.audio.src, poster: preview.audio.poster, caption: preview.audio.caption });
  if (preview?.cad) items.push({ id: "cad", kind: "cad", poster: preview.cad.poster, caption: preview.cad.caption, downloads: preview.cad.downloads ?? [] });
  if (!items.length && outcome.result_media_url) {
    const video = /\.(?:mp4|webm|mov)(?:$|\?)/i.test(outcome.result_media_url);
    items.push(video
      ? { id: `video:${outcome.result_media_url}`, kind: "video", src: outcome.result_media_url, poster: outcome.poster_url ?? undefined }
      : { id: `image:${outcome.result_media_url}`, kind: "image", src: outcome.result_media_url, alt: `${outcome.title} result` });
  }
  return items;
}

function OutcomeGallery({ outcome }: { outcome: DirectoryOutcomeDetail }) {
  const items = useMemo(() => galleryItems(outcome), [outcome]);
  const [selected, setSelected] = useState(0);
  if (!items.length) return <section className="outcome-gallery outcome-gallery--empty" aria-label="Outcome result"><span>RESULT PREVIEW</span><strong>No public preview was supplied.</strong><p>The exact prompt and downloadable result remain available below.</p></section>;
  const item = items[Math.min(selected, items.length - 1)]!;
  return <section className="outcome-gallery" aria-label="Outcome result">
    <figure className={`outcome-gallery-stage is-${item.kind}`}>
      {item.kind === "video" ? <video controls playsInline preload="metadata" poster={item.poster}><source src={item.src} /></video> : null}
      {item.kind === "image" ? <img src={item.src} alt={item.alt} /> : null}
      {item.kind === "audio" ? <div className="outcome-audio-stage">{item.poster ? <img src={item.poster} alt="" /> : <span aria-hidden="true">♫</span>}<audio controls preload="metadata"><source src={item.src} /></audio></div> : null}
      {item.kind === "cad" ? <div className="outcome-cad-stage">{item.poster ? <img src={item.poster} alt={item.caption ?? `${outcome.title} CAD preview`} /> : <span aria-hidden="true">CAD</span>}<div>{item.downloads.map((file) => <a href={file.src} key={file.src} download>{file.label ?? file.format.toUpperCase()} ↓</a>)}</div></div> : null}
      {item.caption ? <figcaption>{item.caption}</figcaption> : null}
    </figure>
    {items.length > 1 ? <div className="outcome-gallery-thumbnails" role="group" aria-label="Choose result media">{items.map((entry, index) => <button key={entry.id} type="button" aria-pressed={selected === index} aria-label={`Show ${entry.kind} ${index + 1}`} onClick={() => setSelected(index)}>{entry.kind === "image" ? <img src={entry.src} alt="" /> : entry.kind === "video" && entry.poster ? <img src={entry.poster} alt="" /> : entry.kind === "audio" && entry.poster ? <img src={entry.poster} alt="" /> : <span>{entry.kind}</span>}</button>)}</div> : null}
  </section>;
}

function OutcomeDownloads({ files }: { files: OutcomeFile[] }) {
  if (!files.length) return null;
  return <section className="outcome-downloads" aria-labelledby="outcome-downloads-heading"><div><span>FILES</span><h2 id="outcome-downloads-heading">Download the result</h2></div><ul>{files.map((file) => <li key={`${file.type}:${file.src}`}><a href={file.src} target="_blank" rel="noreferrer"><span>{file.format ?? file.type}</span><strong>{file.label}</strong><i aria-hidden="true">↓</i></a></li>)}</ul></section>;
}

function OutcomeSupportingInformation({ outcome, skills }: { outcome: DirectoryOutcomeDetail; skills: OutcomeAttribution[] }) {
  const [showAllRequirements, setShowAllRequirements] = useState(false);
  const requirements = showAllRequirements ? outcome.requirements : outcome.requirements.slice(0, 3);
  return <section className="outcome-supporting">
    {outcome.requirements.length ? <div className="outcome-requirements"><h2>What you need</h2><ul>{requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul>{outcome.requirements.length > 3 ? <button type="button" aria-expanded={showAllRequirements} onClick={() => setShowAllRequirements((current) => !current)}>{showAllRequirements ? "Show less" : `Show all ${outcome.requirements.length} requirements`} <span aria-hidden="true">{showAllRequirements ? "↑" : "↓"}</span></button> : null}</div> : null}
    {outcome.inputs.length ? <div className="outcome-inputs"><h2>Inputs used for this result</h2><ul>{outcome.inputs.map((file) => <li key={`${file.type}:${file.src}`}><a href={file.src} target="_blank" rel="noreferrer"><strong>{file.label}</strong><span>{file.format ?? file.type} ↗</span></a></li>)}</ul></div> : null}
    {skills.length ? <div className="outcome-skills"><h2>Skills used</h2><ul>{skills.map((skill) => <li key={skill.id}><a href={skill.href}><span><strong>{skill.name}</strong><small>{skill.owner}</small></span><i>View skill ↗</i></a></li>)}</ul></div> : null}
  </section>;
}

function OutcomeExecutionDetails({ outcome }: { outcome: DirectoryOutcomeDetail }) {
  return <details className="outcome-details"><summary>Technical details and provenance <span aria-hidden="true">↓</span></summary><dl><div><dt>Provider</dt><dd>{outcome.provider ?? "Not specified"}</dd></div><div><dt>Model</dt><dd>{outcome.model ?? "Not specified"}</dd></div>{outcome.agent ? <div><dt>Agent</dt><dd>{outcome.agent}</dd></div> : null}<div><dt>Published</dt><dd><time dateTime={outcome.published_at}>{new Date(outcome.published_at).toLocaleDateString()}</time></dd></div><div><dt>Publication</dt><dd>{outcome.publication_kind}</dd></div><div><dt>Source</dt><dd><a href={outcome.source_url} target="_blank" rel="noreferrer">{outcome.source_locator} ↗</a></dd></div></dl></details>;
}

function OutcomePrompt({ outcome, draft, setDraft }: { outcome: DirectoryOutcomeDetail; draft: string; setDraft: (value: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [remixing, setRemixing] = useState(false);
  return <section className="outcome-prompt" aria-labelledby="outcome-prompt-heading">
    <header><h2 id="outcome-prompt-heading">Exact prompt</h2><span>Published unchanged</span></header>
    <div className={`outcome-prompt-panel${expanded ? " is-expanded" : ""}${remixing ? " is-remixing" : ""}`}>{remixing ? <textarea aria-label="Remix prompt" value={draft} onChange={(event) => setDraft(event.target.value)} /> : <pre><code>{outcome.prompt}</code></pre>}{!expanded && !remixing ? <div className="outcome-prompt-fade" aria-hidden="true" /> : null}<footer><button type="button" className="prompt-expand" aria-expanded={expanded} onClick={() => setExpanded((current) => !current)}>{expanded ? "Show less" : "Show full prompt"}</button><div>{remixing ? <CopyButton label="Copy remixed prompt" value={draft} onCopied={() => recordOutcomeUse(outcome.id)} /> : null}{remixing ? <button type="button" className="remix-button" onClick={() => { setDraft(outcome.prompt); setRemixing(false); }}>Reset</button> : <button type="button" className="remix-button" onClick={() => { setExpanded(true); setRemixing(true); }}>Remix prompt</button>}</div></footer></div>
  </section>;
}

export function DynamicOutcomeDetailPage({ outcomeFixture, attributionsFixture = [] }: { outcomeFixture?: DirectoryOutcomeDetail; attributionsFixture?: OutcomeAttribution[] } = {}) {
  const [outcome, setOutcome] = useState<DirectoryOutcomeDetail | null | undefined>(outcomeFixture);
  const [attributions, setAttributions] = useState<OutcomeAttribution[]>(attributionsFixture);
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
      const next = body.outcome; setOutcome(next); setDraft(next.prompt);
      setAttributions([...(next.primary_attribution ? [displayAttribution(next.primary_attribution, "primary")] : []), ...(next.secondary_attributions ?? []).map((item) => displayAttribution(item, "secondary"))]);
    })();
    return () => { cancelled = true; };
  }, [outcomeFixture]);
  if (outcome === undefined) return <SiteShell className="pack-detail-page"><p className="dynamic-outcome-loading layout-reading">Loading Outcome…</p></SiteShell>;
  if (!outcome) return <SiteShell className="pack-detail-page"><section className="dynamic-outcome-missing layout-reading"><span>OUTCOME NOT FOUND</span><h1>This Outcome is not available.</h1><a href="/#discover">Browse Outcomes →</a></section></SiteShell>;
  const skills = attributions.filter((item) => item.kind === "Skill");
  return <SiteShell className="pack-detail-page"><article className="outcome-detail layout-reading">
    <header className="outcome-hero"><nav aria-label="Breadcrumb"><a href="/#discover">← All Outcomes</a></nav><div className="outcome-meta"><span>{attributions[0]?.kind ?? "Outcome"}</span><span>{outcome.publication_kind}</span><OutcomeReactions outcomeId={outcome.id} likeCount={outcome.like_count ?? 0} /></div><h1>{outcome.title}</h1><p>{outcome.summary}</p><div className="outcome-byline"><span>By <a href={outcome.author_url ?? outcome.source_url} target="_blank" rel="noreferrer">{outcome.author_name ?? outcome.source_locator}</a></span>{attributions.length ? <span>Made with {attributions.map((item, index) => <span key={item.id}>{index ? ", " : ""}<a href={item.href}>{item.name}</a></span>)}</span> : null}</div><div className="outcome-hero-actions"><CopyButton label="Copy prompt" value={draft} onCopied={() => recordOutcomeUse(outcome.id)} /><a href="#exact-prompt">Remix</a></div></header>
    <OutcomeGallery outcome={outcome} />
    <section className="outcome-about"><h2>About</h2><ReactMarkdown>{outcome.about_markdown.replace(/^# .+\n+/, "")}</ReactMarkdown></section>
    <div id="exact-prompt"><OutcomePrompt outcome={outcome} draft={draft} setDraft={setDraft} /></div>
    <OutcomeSupportingInformation outcome={outcome} skills={skills} />
    <OutcomeDownloads files={outcome.artifacts} />
    <OutcomeExecutionDetails outcome={outcome} />
  </article></SiteShell>;
}
