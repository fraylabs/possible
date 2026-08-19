"use client";

import { lazy, Suspense, useState } from "react";
import { compilePack, skillNameFromReference, skillPageUrl } from "@possible/packs";
import type { PackShowcase } from "@possible/packs";
import { getPackShowcase, getRoutablePack, githubUrl, installCommand, packHref, packPublisher, productHref } from "./public-content";
import { CopyButton, NotFoundPage, SiteShell, statusLabel } from "./shared";

const PackCadViewer = lazy(() => import("./PackCadViewer"));

type ShowcaseSelection = { id: string; kind: "image" | "video" | "cad"; label: string; imageIndex?: number };

function PackShowcaseView({ showcase, packName }: { showcase: PackShowcase; packName: string }) {
  const items: ShowcaseSelection[] = [
    ...(showcase.images ?? []).map((_, index) => ({ id: `image-${index}`, kind: "image" as const, label: `Image ${index + 1}`, imageIndex: index })),
    ...(showcase.video ? [{ id: "video", kind: "video" as const, label: "Video" }] : []),
    ...(showcase.cad ? [{ id: "cad", kind: "cad" as const, label: "CAD" }] : []),
  ];
  const [selectedId, setSelectedId] = useState(items[0]?.id);
  const selected = items.find(({ id }) => id === selectedId) ?? items[0];
  if (!selected) return showcase.description ? <p className="pack-showcase-description">{showcase.description}</p> : null;
  const selectedImage = selected.kind === "image" ? showcase.images?.[selected.imageIndex ?? 0] : undefined;
  const cadPosterAlt = showcase.images?.find(({ src }) => src === showcase.cad?.poster)?.alt ?? `${packName} CAD preview`;

  return (
    <section className="pack-showcase" aria-labelledby="pack-showcase-heading">
      <header><span>OUTCOME PREVIEW</span><p id="pack-showcase-heading">{showcase.description ?? `Representative outputs from ${packName}.`}</p></header>
      <div className="pack-showcase-stage">
        {selectedImage ? <figure><img src={selectedImage.src} alt={selectedImage.alt} /><figcaption>{selectedImage.caption ?? "Representative outcome"}</figcaption></figure> : null}
        {selected.kind === "video" && showcase.video ? <figure><video controls playsInline preload="metadata" poster={showcase.video.poster}><source src={showcase.video.src} /><a href={showcase.video.src}>Open video</a></video><figcaption>{showcase.video.caption ?? "Representative outcome"}</figcaption></figure> : null}
        {selected.kind === "cad" && showcase.cad ? <figure>
          {showcase.cad.preview && showcase.cad.poster ? <Suspense fallback={<img src={showcase.cad.poster} alt={cadPosterAlt} />}><PackCadViewer modelSrc={showcase.cad.preview} posterSrc={showcase.cad.poster} alt={cadPosterAlt} /></Suspense> : showcase.cad.poster ? <img src={showcase.cad.poster} alt={cadPosterAlt} /> : <div className="pack-cad-download-only"><span>CAD FILES</span><strong>Download the engineering artifacts below.</strong></div>}
          <figcaption>{showcase.cad.caption ?? "Representative CAD outcome"}</figcaption>
        </figure> : null}
      </div>
      {items.length > 1 ? <div className="pack-showcase-picker" role="group" aria-label="Choose showcase media">{items.map((item) => <button type="button" aria-pressed={item.id === selected.id} onClick={() => setSelectedId(item.id)} key={item.id}><span>{item.kind === "image" ? String((item.imageIndex ?? 0) + 1).padStart(2, "0") : item.kind === "video" ? "▶" : "3D"}</span>{item.label}</button>)}</div> : null}
      {selected.kind === "cad" && showcase.cad?.downloads?.length ? <div className="pack-cad-downloads">{showcase.cad.downloads.map((download) => <a href={download.src} download key={download.src}><span>{download.format.toUpperCase()}</span>{download.label ?? `Download ${download.format.toUpperCase()}`} <b>↓</b></a>)}</div> : null}
      <p className="pack-showcase-disclosure">REPRESENTATIVE OUTCOME · SHOWCASE MEDIA IS NOT VERIFICATION</p>
    </section>
  );
}

export function PackDetailPage({ idOrSlug }: { idOrSlug: string }) {
  const [useMode, setUseMode] = useState<"possible" | "prompt">("possible");
  const catalogEntry = getRoutablePack(idOrSlug);
  if (!catalogEntry) return <NotFoundPage />;
  const { pack } = catalogEntry;
  const skills = pack.skills ?? [];
  const expectations = pack.expectations ?? [];
  const isDirectOutcome = expectations.length === 0;
  const compiled = compilePack(pack);
  const showcase = getPackShowcase(catalogEntry);
  const status = catalogEntry.trust.status;
  const publisher = packPublisher(catalogEntry);
  const publicationBase = packHref(catalogEntry);
  const updatedLabel = catalogEntry.trust.updatedAt
    ? new Date(catalogEntry.trust.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
    : "Not dated";
  const possibleInstruction = `$possible Use the ${pack.name} Outcome Pack for this project.`;
  const sourceHref = catalogEntry.origin.kind === "federated" ? catalogEntry.sourceRecord.source : `${githubUrl}/tree/main/packages/packs/src/packs/${catalogEntry.slug}`;
  const revision = catalogEntry.sourceRecord.revision.replace(/^sha256:/, "").slice(0, 12);

  return (
    <SiteShell className="pack-detail-page">
      <article className="pack-detail-document">
        <header className="pack-detail-header">
          <nav className="pack-detail-breadcrumb" aria-label="Breadcrumb"><a href="/#packs">Packs</a><span>/</span><span>{pack.name}</span></nav>
          {isDirectOutcome ? <span className="pack-direct-label">DIRECT OUTCOME</span> : null}
          <h1>{pack.name}</h1>
          <p>{pack.promise}</p>
          {catalogEntry.products.length ? <div className="pack-product-attribution">
            <span>FOR</span>
            {catalogEntry.products.map((product) => <a aria-label={`${product.name} by ${product.company.name}`} href={productHref(product)} key={product.id}><strong>{product.name}</strong><small>by {product.company.name}</small></a>)}
          </div> : null}
        </header>

        <div className="pack-detail-layout">
          <div className="pack-detail-main">
            {isDirectOutcome && showcase ? <section className="pack-readable-section pack-readable-section--first" aria-labelledby="pack-preview-heading"><h2 id="pack-preview-heading">Example result</h2><PackShowcaseView showcase={showcase} packName={pack.name} /></section> : null}

            <section className="pack-use-panel" aria-labelledby="use-pack-heading">
              <h2 id="use-pack-heading">{isDirectOutcome ? "Copy the exact prompt" : "Use this pack"}</h2>
              {!isDirectOutcome ? <div className="pack-use-tabs" role="tablist" aria-label="Pack usage options">
                <button id="pack-use-possible-tab" type="button" role="tab" aria-controls="pack-use-possible-panel" aria-selected={useMode === "possible"} onClick={() => setUseMode("possible")}>Possible</button>
                <button id="pack-use-prompt-tab" type="button" role="tab" aria-controls="pack-use-prompt-panel" aria-selected={useMode === "prompt"} onClick={() => setUseMode("prompt")}>Full prompt</button>
              </div> : null}
              {isDirectOutcome
                ? <div className="pack-use-content pack-use-content--direct"><p>This is the complete request behind the example above. Copy it as-is, or change the concrete details you want changed.</p><pre className="is-long"><code>{pack.prompt}</code></pre><CopyButton label="Copy exact prompt" value={pack.prompt} /></div>
                : useMode === "possible"
                  ? <div id="pack-use-possible-panel" className="pack-use-content" role="tabpanel" aria-labelledby="pack-use-possible-tab"><p>Ask Codex to use this exact outcome.</p><pre><code>{possibleInstruction}</code></pre><CopyButton label="Copy Codex instruction" value={possibleInstruction} /><small>New to Possible? Install it with <code>{installCommand}</code></small></div>
                  : <div id="pack-use-prompt-panel" className="pack-use-content" role="tabpanel" aria-labelledby="pack-use-prompt-tab"><p>Use the complete compiled prompt directly.</p><pre className="is-long"><code>{compiled.runPrompt}</code></pre><CopyButton label="Copy full run prompt" value={compiled.runPrompt} /></div>}
            </section>

            {!isDirectOutcome && showcase ? <section className="pack-readable-section" aria-labelledby="pack-preview-heading"><h2 id="pack-preview-heading">Outcome preview</h2><PackShowcaseView showcase={showcase} packName={pack.name} /></section> : null}

            <section className="pack-readable-section" aria-labelledby="pack-contents-heading">
              <h2 id="pack-contents-heading">{isDirectOutcome ? "What it uses" : "What’s inside"}</h2>
              <p className="pack-section-intro">{isDirectOutcome ? `One self-contained prompt for one concrete result.${skills.length > 0 ? ` It uses ${skills.length} specialist ${skills.length === 1 ? "Skill" : "Skills"}.` : ""}` : `The prompt tells the agent what to make. Expectations define what finished means.${skills.length > 0 ? ` This pack also uses ${skills.length} specialist ${skills.length === 1 ? "Skill" : "Skills"}.` : ""}`}</p>
              {expectations.length > 0 ? <div className="pack-inside-block"><h3>Expectations</h3><ol className="pack-expectation-list">{expectations.map((expectation) => <li key={expectation}><span>✓</span><p>{expectation}</p></li>)}</ol></div> : null}
              {skills.length > 0 ? <div className="pack-inside-block"><h3>Skills</h3><ul className="pack-skill-list">{skills.map((skill) => <li key={`${skill.repository}/${skill.directory}`}><a href={skillPageUrl(skill)} target="_blank" rel="noreferrer"><strong>{skillNameFromReference(skill)}</strong><span>{skill.repository}/{skill.directory} · last reviewed {skill.lastReviewedCommit.slice(0, 8)}</span><i>↗</i></a></li>)}</ul></div> : null}
              {pack.notFor?.length ? <details className="pack-fit-simple"><summary>When this pack is not a fit</summary><ul className="pack-readable-list is-negative">{pack.notFor.map((item) => <li key={item}>{item}</li>)}</ul></details> : null}
            </section>

            <details className="pack-detail-technical">
              <summary><span>Technical details</span><strong>Source, trust, and revision</strong><i aria-hidden="true">+</i></summary>
              {status === "listed" ? <p className="pack-listed-note">Valid community submission. Possible has not promoted it to experimental or verified.</p> : null}
              <dl className="pack-technical-grid">
                <div><dt>Publisher</dt><dd>{publisher}</dd></div>
                <div><dt>Status</dt><dd>{statusLabel(status)}</dd></div>
                <div><dt>Revision</dt><dd>{revision}</dd></div>
                <div><dt>Trust updated</dt><dd>{updatedLabel}</dd></div>
                {skills.length > 0 ? <div><dt>Skills</dt><dd>{skills.length}</dd></div> : null}
                <div><dt>Accepted evidence</dt><dd>{catalogEntry.acceptedEvidenceCount}</dd></div>
              </dl>
              <footer><a href={`${publicationBase}.json`}>View contract JSON <span>↗</span></a><a href={sourceHref} target="_blank" rel="noreferrer">View source <span>↗</span></a><code>{catalogEntry.id}</code></footer>
            </details>
          </div>
        </div>
      </article>
    </SiteShell>
  );
}
