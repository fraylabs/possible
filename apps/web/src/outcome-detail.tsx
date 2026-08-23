"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import { skillPageUrl } from "@possible/catalog";
import type { OutcomeFile, OutcomePreview } from "@possible/catalog";
import { getPublishedOutcome, productHref } from "./public-content";
import { findPublishedOutcomeId, recordOutcomeCopy } from "./discovery-data";
import { CopyButton, NotFoundPage, SiteShell } from "./shared";

const OutcomeCadViewer = lazy(() => import("./OutcomeCadViewer"));
type PreviewSelection = { id: string; kind: "image" | "video" | "audio" | "cad"; imageIndex?: number };

function PromptPanel({ prompt, outcomeId }: { prompt: string; outcomeId?: string | undefined }) {
  const [remixing, setRemixing] = useState(false);
  const [draft, setDraft] = useState(prompt);

  function reset() {
    setDraft(prompt);
    setRemixing(false);
  }

  return (
    <div className={`pack-use-content pack-use-content--direct${remixing ? " is-remixing" : ""}`}>
      {remixing ? <textarea aria-label="Remix prompt" value={draft} onChange={(event) => setDraft(event.target.value)} /> : <pre className="is-long"><code>{prompt}</code></pre>}
      <div className="prompt-actions">
        <CopyButton label={remixing ? "Copy remixed prompt" : "Copy prompt"} value={draft} onCopied={() => recordOutcomeCopy(outcomeId)} />
        {remixing ? <button className="remix-button" type="button" onClick={reset}>Reset</button> : <button className="remix-button" type="button" onClick={() => setRemixing(true)}>Remix this prompt</button>}
      </div>
    </div>
  );
}

function OutcomePreviewView({ preview, title }: { preview: OutcomePreview; title: string }) {
  const items: PreviewSelection[] = [
    ...(preview.images ?? []).map((_, index) => ({ id: `image-${index}`, kind: "image" as const, imageIndex: index })),
    ...(preview.video ? [{ id: "video", kind: "video" as const }] : []),
    ...(preview.audio ? [{ id: "audio", kind: "audio" as const }] : []),
    ...(preview.cad ? [{ id: "cad", kind: "cad" as const }] : []),
  ];
  const [selectedId, setSelectedId] = useState(items[0]?.id);
  const selected = items.find(({ id }) => id === selectedId) ?? items[0];
  if (!selected) return preview.description ? <p className="pack-showcase-description">{preview.description}</p> : null;
  const image = selected.kind === "image" ? preview.images?.[selected.imageIndex ?? 0] : undefined;
  const cadPosterAlt = preview.images?.find(({ src }) => src === preview.cad?.poster)?.alt ?? `${title} CAD preview`;

  return (
    <section className="pack-showcase" aria-label="Outcome preview">
      {preview.description ? <header><span>PREVIEW</span><p>{preview.description}</p></header> : null}
      <div className="pack-showcase-stage">
        {image ? <figure><img src={image.src} alt={image.alt} /><figcaption>{image.caption}</figcaption></figure> : null}
        {selected.kind === "video" && preview.video ? <figure><video autoPlay muted loop controls playsInline preload="metadata" poster={preview.video.poster}><source src={preview.video.src} /><a href={preview.video.src}>Open video</a></video><figcaption>{preview.video.caption}</figcaption></figure> : null}
        {selected.kind === "audio" && preview.audio ? <figure>{preview.audio.poster ? <img src={preview.audio.poster} alt="" /> : null}<audio controls preload="metadata"><source src={preview.audio.src} /></audio><figcaption>{preview.audio.caption}</figcaption></figure> : null}
        {selected.kind === "cad" && preview.cad ? <figure>
          {preview.cad.preview && preview.cad.poster ? <Suspense fallback={<img src={preview.cad.poster} alt={cadPosterAlt} />}><OutcomeCadViewer modelSrc={preview.cad.preview} posterSrc={preview.cad.poster} alt={cadPosterAlt} /></Suspense> : preview.cad.poster ? <img src={preview.cad.poster} alt={cadPosterAlt} /> : <div className="pack-cad-download-only"><span>CAD FILES</span><strong>Download the editable files below.</strong></div>}
          <figcaption>{preview.cad.caption}</figcaption>
        </figure> : null}
      </div>
      {items.length > 1 ? <div className="pack-showcase-picker" role="group" aria-label="Choose preview media">{items.map((item, index) => <button type="button" aria-pressed={item.id === selected.id} onClick={() => setSelectedId(item.id)} key={item.id}><span>{String(index + 1).padStart(2, "0")}</span>{item.kind}</button>)}</div> : null}
      {selected.kind === "cad" && preview.cad?.downloads?.length ? <div className="pack-cad-downloads">{preview.cad.downloads.map((download) => <a href={download.src} download key={download.src}><span>{download.format.toUpperCase()}</span>{download.label ?? `Download ${download.format.toUpperCase()}`} <b>↓</b></a>)}</div> : null}
    </section>
  );
}

function OutcomeFiles({ files }: { files: OutcomeFile[] }) {
  return <ul className="outcome-file-list">{files.map((file) => <li key={file.src}><a href={file.src} download><span>{file.type}</span><strong>{file.label}</strong><small>{file.format ?? file.src.split(".").at(-1)?.toUpperCase()}</small><i>↓</i></a></li>)}</ul>;
}

export function OutcomeDetailPage({ slug }: { slug: string }) {
  const [databaseId, setDatabaseId] = useState<string>();
  useEffect(() => {
    let cancelled = false;
    void findPublishedOutcomeId(slug).then((id) => { if (!cancelled) setDatabaseId(id); });
    return () => { cancelled = true; };
  }, [slug]);
  const entry = getPublishedOutcome(slug);
  if (!entry) return <NotFoundPage />;
  const { outcome } = entry;
  const officialSource = outcome.source?.type === "official-gallery" || outcome.source?.type === "official-example";
  const authorLabel = outcome.source?.type === "official-gallery" ? "Official gallery result by" : outcome.source?.type === "official-example" ? "Official example by" : "By";

  return (
    <SiteShell className="pack-detail-page">
      <article className="pack-detail-document layout-reading">
        <header className="pack-detail-header">
          <nav className="pack-detail-breadcrumb" aria-label="Breadcrumb"><a href="/#discover">Outcomes</a><span>/</span><span>{outcome.title}</span></nav>
          <h1>{outcome.title}</h1>
          <p>{outcome.summary}</p>
          <p className="outcome-author">{authorLabel} <a href={outcome.author.url} target="_blank" rel="noreferrer">{outcome.author.name} ↗</a></p>
          {entry.products.length ? <div className="pack-product-attribution"><span>USES</span>{entry.products.map((product) => <a href={productHref(product)} key={product.id}><strong>{product.name}</strong><small>by {product.company.name}</small></a>)}</div> : null}
        </header>

        <div className="pack-detail-layout"><div className="pack-detail-main">
          {outcome.preview ? <section className="pack-readable-section pack-readable-section--first" aria-labelledby="outcome-preview-heading"><h2 id="outcome-preview-heading">What it can make</h2><OutcomePreviewView preview={outcome.preview} title={outcome.title} /></section> : null}

          {outcome.inputs?.length ? <section className="pack-readable-section" aria-labelledby="outcome-inputs-heading"><h2 id="outcome-inputs-heading">Inputs used</h2><OutcomeFiles files={outcome.inputs} /></section> : null}

          {outcome.artifacts?.length ? <section className="pack-readable-section" aria-labelledby="outcome-artifacts-heading"><h2 id="outcome-artifacts-heading">Download the result</h2><OutcomeFiles files={outcome.artifacts} /></section> : null}

          {outcome.originalPrompt ? <section className="pack-readable-section" aria-labelledby="outcome-original-prompt-heading">
            <h2 id="outcome-original-prompt-heading">Original request</h2>
            <blockquote className="outcome-original-prompt">{outcome.originalPrompt}</blockquote>
          </section> : null}

          <section className="pack-use-panel" aria-labelledby="outcome-prompt-heading">
            <h2 id="outcome-prompt-heading">Prompt</h2>
            <PromptPanel prompt={outcome.executionPrompt} outcomeId={databaseId} />
          </section>

          <section className="pack-readable-section" aria-labelledby="outcome-execution-heading">
            <h2 id="outcome-execution-heading">Made with</h2>
            <dl className="outcome-execution">
              <div><dt>Provider</dt><dd>{outcome.execution.provider}</dd></div>
              <div><dt>Model</dt><dd>{outcome.execution.model}</dd></div>
              {outcome.execution.agent ? <div><dt>Agent</dt><dd>{outcome.execution.agent}</dd></div> : null}
              {outcome.execution.timestamp ? <div><dt>Created</dt><dd><time dateTime={outcome.execution.timestamp}>{outcome.execution.timestamp}</time></dd></div> : null}
              {outcome.source?.publishedAt ? <div><dt>Published</dt><dd><time dateTime={outcome.source.publishedAt}>{outcome.source.publishedAt}</time></dd></div> : null}
            </dl>
          </section>

          {outcome.skills?.length ? <section className="pack-readable-section" aria-labelledby="outcome-skills-heading">
            <h2 id="outcome-skills-heading">Skills</h2>
            <ul className="pack-skill-list">{outcome.skills.map((skill) => {
              const name = skill.directory.split("/").filter(Boolean).at(-1) ?? skill.repository;
              return <li key={`${skill.repository}/${skill.directory}`}><a href={skillPageUrl(skill)} target="_blank" rel="noreferrer"><strong>{name}</strong><span>{skill.repository}/{skill.directory} · reviewed at {skill.lastReviewedCommit.slice(0, 8)}</span><i>↗</i></a></li>;
            })}</ul>
          </section> : null}

          <footer className="outcome-source"><span>{officialSource ? "Sourced from" : "Published by"} <a href={outcome.author.url} target="_blank" rel="noreferrer">{outcome.author.name}</a></span><a href={entry.sourceUrl} target="_blank" rel="noreferrer">{outcome.source ? "View original" : "View source"} ↗</a></footer>
        </div></div>
      </article>
    </SiteShell>
  );
}
