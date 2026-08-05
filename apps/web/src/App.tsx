"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { compilePack, getPack, getPackStatus } from "@possible/packs";
import type { OutcomePack } from "@possible/packs";
import { exampleCatalog, getExample } from "./example-content";
import type { PossibleExample } from "./example-content";
import { getPublishedPack, getRoutablePack, githubUrl, installCommand, routablePacks } from "./public-content";

const PaperPlaneGame = lazy(() => import("./PaperPlaneGame"));
type CopyState = "idle" | "copied" | "failed";
const approvalDisclosure = "Saying yes authorizes repo-local agent skill installation, the shared outcome brief and state files, and local outcome work. External actions still require separate approval.";
const statusLabels = {
  stable: "Reviewed",
  experimental: "Experimental",
  archived: "Archived",
} as const;
const statusLabel = (status: keyof typeof statusLabels) => statusLabels[status];
const packStatusLabel = (slug: string) => {
  const status = getPackStatus(slug);
  return status ? statusLabel(status) : "Unlisted";
};
const navigationItems = [
  { label: "EXAMPLES", href: "/examples", external: false },
  { label: "DOCS", href: "/docs", external: false },
  { label: "GITHUB", href: githubUrl, external: true },
] as const;
function CopyButton({ label, value }: { label: string; value: string }) {
  const [state, setState] = useState<CopyState>("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
      window.setTimeout(() => setState("idle"), 1600);
    } catch {
      setState("failed");
    }
  }

  return (
    <button className="copy-button" type="button" onClick={copy} aria-label={label}>
      <span aria-live="polite">{state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : label}</span>
      <span aria-hidden="true">{state === "copied" ? "✓" : "↗"}</span>
    </button>
  );
}

function SiteNav({ label }: { label?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 0);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      window.setTimeout(() => triggerRef.current?.focus(), 0);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }

  return (
    <>
      <nav aria-label="Primary">
        <a className="wordmark" href="/">possible<span>.sh</span></a>
        {label ? <div className="nav-meta"><span>POSSIBLE</span><strong>{label.toUpperCase()}</strong></div> : null}
        <div className="nav-links">
          {navigationItems.map((item) => (
            <a key={item.href} href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noreferrer" : undefined}>{item.label}{item.external ? " ↗" : ""}</a>
          ))}
        </div>
        <button
          ref={triggerRef}
          className="nav-menu-trigger"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen(true)}
        >
          <span>MENU</span><i aria-hidden="true" />
        </button>
      </nav>

      {menuOpen ? (
        <div className="mobile-nav-layer">
          <button className="mobile-nav-backdrop" type="button" aria-label="Close navigation" onClick={closeMenu} />
          <div id="mobile-navigation" className="mobile-nav-panel" role="dialog" aria-modal="true" aria-label="Mobile navigation">
            <header>
              <span>NAVIGATION</span>
              <button ref={closeRef} type="button" onClick={closeMenu}>CLOSE <i aria-hidden="true">×</i></button>
            </header>
            <ol>
              {navigationItems.map((item, index) => (
                <li key={item.href}>
                  <a href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noreferrer" : undefined} onClick={() => setMenuOpen(false)}>
                    <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><strong>{item.label}</strong><i aria-hidden="true">↗</i>
                  </a>
                </li>
              ))}
            </ol>
            <footer><span>POSSIBLE.SH</span><strong>MAKE OUTCOMES POSSIBLE.</strong></footer>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SiteFooter() {
  return (
    <footer>
      <a className="wordmark" href="/">possible<span>.sh</span></a>
      <strong>AGENT SKILLS PROVIDE CAPABILITIES.<br />OUTCOME PACKS COORDINATE COMPLETE RESULTS.</strong>
      <span>BUILDWEEK 2026</span>
    </footer>
  );
}

function CreatePage() {
  return (
    <main>
      <SiteNav label="Start / $possible" />

      <section className="start-section" id="top" aria-label="Start with Possible">
        <div className="build-hero">
          <div className="build-hero-copy">
            <p className="eyebrow">OPEN SOURCE / FOR CODEX</p>
            <h1>Complete a possible<br /><em>outcome.</em></h1>
            <p className="build-hero-description"><strong>Possible.sh is an open-source library of Outcome Packs.</strong> Each pack combines a reusable execution prompt and selected agent skills for dozens of coordinated tasks.</p>
            <div className="build-hero-actions">
              <a className="button-link" href={githubUrl} target="_blank" rel="noreferrer">Star on GitHub <span>↗</span></a>
              <a className="text-link" href="/examples">See the outcomes ↗</a>
              <a className="text-link" href="#try">Install ↓</a>
            </div>
          </div>

          <div className="build-hero-install" id="try">
            <article className="install-card" id="start">
              <header><span>INSTALL POSSIBLE</span><strong>ONE COMMAND</strong></header>
              <pre><code>{installCommand}</code></pre>
              <CopyButton label="Copy install command" value={installCommand} />
              <div className="install-next"><span>THEN ASK CODEX</span><code>$possible</code></div>
            </article>
          </div>
        </div>
      </section>

      <section className="home-pack-gallery" id="packs" aria-labelledby="home-packs-heading">
        <header className="home-pack-gallery-header">
          <div>
            <p className="eyebrow">OUTCOME PACKS / LIBRARY</p>
            <h2 id="home-packs-heading">Choose the work.<br /><em>Make it real.</em></h2>
          </div>
          <div className="home-pack-gallery-intro">
            <a className="text-link" href="/docs/glossary">How it works ↗</a>
          </div>
        </header>
        <div className="home-pack-gallery-grid" aria-label="Public Outcome Pack catalog">
          {routablePacks.map((pack) => <PackCard pack={pack} key={pack.slug} />)}
        </div>
        <div className="home-pack-gallery-footer">
          <span>{routablePacks.length} PACKS IN CATALOG</span>
          <a href={`${githubUrl}/tree/main/packages/packs/src`} target="_blank" rel="noreferrer">Inspect the source ↗</a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

const packPreviewMeta: Record<string, { label: string; mark: string; caption: string }> = {
  "playable-web-game": { label: "PLAYABLE", mark: "PLAY", caption: "INTERACTIVE PROOF" },
  "web-presentation": { label: "PRESENT", mark: "SHOW", caption: "RESPONSIVE DECK" },
  "software-opportunity-discovery": { label: "DISCOVER", mark: "THESIS", caption: "ONE PROVISIONAL BET" },
  "first-customer-sprint": { label: "CUSTOMER", mark: "SIGNAL", caption: "COMMERCIAL EVIDENCE" },
};

function PackCard({ pack }: { pack: OutcomePack }) {
  const preview = packPreviewMeta[pack.slug] ?? { label: "OUTCOME", mark: "BUILD", caption: "REVIEWED CONTRACT" };

  return (
    <a className={`pack-card pack-card--visual pack-card--${pack.slug}`} href={`/packs/${pack.slug}`}>
      <div className="pack-card-preview" aria-hidden="true">
        <div className="pack-preview-art">
          <div className="pack-preview-toolbar"><span>{String(pack.catalogNumber).padStart(2, "0")}</span><span>OUTCOME / {preview.label}</span><b>↗</b></div>
          <div className="pack-preview-composition"><i /><i /><i /></div>
          <strong>{preview.mark}</strong>
          <span className="pack-preview-caption">{preview.caption}</span>
        </div>
      </div>
      <div className="pack-card-info">
        <header>
          <div>
            <p className="pack-card-kicker">OUTCOME PACK · {packStatusLabel(pack.slug)}</p>
            <h3>{pack.name}</h3>
          </div>
          <span className="pack-card-open" aria-hidden="true">↗</span>
        </header>
        <p className="pack-card-promise">{pack.promise}</p>
        <div className="pack-card-meta">
          <span>{pack.skills.length} SKILLS{pack.plugins?.length ? ` + ${pack.plugins.length} PLUGIN${pack.plugins.length === 1 ? "" : "S"}` : ""}</span>
          <span>{pack.workstreams.length} WORKSTREAMS</span>
          <span>{pack.outputs.length} OUTPUTS</span>
        </div>
      </div>
    </a>
  );
}

function PackDetailPage({ pack }: { pack: OutcomePack }) {
  const compiled = compilePack(pack);
  const status = getPackStatus(pack.slug) ?? (pack.archived ? "archived" : "experimental");
  const reviewedLabel = new Date(`${pack.reviewedAt}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const sections = [
    ["overview", "Overview"],
    ["fit", "Fit"],
    ["outputs", "Outputs"],
    ["workstreams", "Execution plan"],
    ["agent-skills", "Agent skills"],
    ["install", "Install"],
    ["run-prompt", "Run prompt"],
    ["boundaries", "Boundaries"],
    ["verification", "Verification"],
  ];

  return (
    <main className="pack-reference-page">
      <a className="pack-reference-skip" href="#pack-specification">Skip to Outcome Pack specification</a>
      <SiteNav label="Outcome Pack" />
      <div className="pack-reference-shell">
        <aside className="pack-reference-packs" aria-label="Outcome Pack navigation">
          <header><span>OUTCOME PACKS</span></header>
          <nav aria-label="Outcome Packs">
            {routablePacks.map((candidate) => (
              <a href={`/packs/${candidate.slug}`} aria-current={candidate.slug === pack.slug ? "page" : undefined} key={candidate.slug}>
                <strong>{candidate.name}</strong>
                <small>{packStatusLabel(candidate.slug)}</small>
              </a>
            ))}
          </nav>
          <a className="pack-reference-back" href="/#packs">← Gallery</a>
        </aside>

        <article className="pack-reference-document" id="pack-specification" tabIndex={-1}>
          <header className="pack-reference-header" id="overview">
            <div className="pack-reference-breadcrumb"><a href="/#packs">OUTCOME PACKS</a><span>/</span><strong>{statusLabel(status).toUpperCase()}</strong></div>
            <dl className="pack-reference-meta">
              <div><dt>STATUS</dt><dd>{statusLabel(status)}</dd></div>
              <div><dt>SCHEMA</dt><dd>v{pack.schemaVersion}</dd></div>
              <div><dt>LAST REVIEWED</dt><dd><time dateTime={pack.reviewedAt}>{reviewedLabel}</time></dd></div>
            </dl>
            {pack.archived ? (
              <aside className="pack-archive-notice" aria-label="Archived Outcome Pack">
                <strong>ARCHIVED · {pack.archived.archivedAt}</strong>
                <p>{pack.archived.reason}</p>
                <p>This specification and its downloads remain available for historical runs. Possible will not recommend or compile it for new work.</p>
                <ul>
                  {pack.archived.replacementSlugs.map((slug) => {
                    const replacement = getPack(slug);
                    const publishedReplacement = getPublishedPack(slug);
                    return (
                      <li key={slug}>
                        {publishedReplacement
                          ? <a href={`/packs/${slug}`}>{replacement?.name ?? slug}</a>
                          : <a href={`${githubUrl}/blob/dev/packages/packs/src/${slug}.ts`}>{replacement?.name ?? slug}</a>}
                      </li>
                    );
                  })}
                </ul>
              </aside>
            ) : null}
            <h1>{pack.name}</h1>
            <p className="pack-reference-promise">{pack.promise}</p>
            <div className="pack-reference-actions">
              {pack.archived
                ? <a href="/#packs">View active packs <span>→</span></a>
                : <a href="/#start">Start with $possible <span>→</span></a>}
              <a href={`/packs/${pack.slug}.json`}>Outcome Pack JSON ↗</a>
            </div>
          </header>

          <details className="pack-reference-mobile-nav">
            <summary>On this page <span>{String(sections.length).padStart(2, "0")} sections</span></summary>
            <nav aria-label="Mobile page sections">{sections.map(([id, label]) => <a href={`#${id}`} key={id}>{label}</a>)}</nav>
          </details>

          <section className="pack-reference-section" id="fit">
            <header><span>01</span><h2>Fit</h2><p>Judge the outcome, not the category or agent skill list.</p></header>
            <div className="pack-fit-grid">
              <div><h3>Use this when</h3><ul>{pack.useWhen.map((item) => <li key={item}>{item}</li>)}</ul></div>
              <div><h3>Not for</h3><ul>{pack.notFor.map((item) => <li key={item}>{item}</li>)}</ul></div>
            </div>
          </section>

          <section className="pack-reference-section" id="outputs">
            <header><span>02</span><h2>Outputs</h2><p>These are the inspectable deliverables. The expectation contract and evidence decide whether they make the promised outcome true.</p></header>
            <ol className="pack-contract-list">{pack.outputs.map((output, index) => <li key={output}><span>{String(index + 1).padStart(2, "0")}</span><strong>{output}</strong></li>)}</ol>
          </section>

          <section className="pack-reference-section" id="workstreams">
            <header><span>03</span><h2 id="workstreams-heading">Execution plan</h2><p>Each workstream owns separate files.</p></header>
            <div className="pack-table-scroll">
              <table className="pack-reference-table pack-workstream-table" aria-labelledby="workstreams-heading">
                <caption className="sr-only">Workstreams, activation rules, dependencies, invoked skills, owned files, and execution briefs for {pack.name}</caption>
                <thead><tr><th>Workstream</th><th>Activation</th><th>Depends on</th><th>Invokes</th><th>Owns</th><th>Brief</th></tr></thead>
                <tbody>
                  {pack.workstreams.map((stream) => <tr key={stream.id}><th scope="row"><strong>{stream.name}</strong></th><td>{stream.activation ?? <span>Always</span>}</td><td>{stream.dependsOn?.length ? stream.dependsOn.map((dependency) => <code key={dependency}>{dependency}</code>) : <span>None</span>}</td><td>{stream.skills.map((skill) => <code key={skill}>${skill}</code>)}</td><td>{stream.owns.map((item) => <code key={item}>{item}</code>)}</td><td>{stream.brief}</td></tr>)}
                </tbody>
              </table>
            </div>
            {pack.opportunityDiscovery ? <div className="pack-review-callout"><span>OPPORTUNITY DISCOVERY</span><div><code>{pack.opportunityDiscovery.candidateRange.join("–")} candidates</code><code>{pack.opportunityDiscovery.decisionReceiptPath}</code></div><p>Possible infers a conservative operator baseline, compares traceable opportunities, and selects one thesis for a first-customer attempt. Selection is not demand or permission to build.</p></div> : null}
            {pack.firstCustomerSprint ? <div className="pack-review-callout"><span>COMMERCIAL EVIDENCE LADDER</span><div>{pack.firstCustomerSprint.evidenceLadder.map((stage) => <code key={stage}>{stage}</code>)}</div><p>Possible pursues the strongest honest commitment available, preserves the complete funnel, and lets customer behavior determine what should happen next.</p></div> : null}
            {pack.firstCustomerSprint ? <div className="pack-review-callout"><span>RESUMABLE SALES CYCLE</span><div>{pack.firstCustomerSprint.waitingStates.map((state) => <code key={state}>{state}</code>)}</div><p>Approved sales activity can pause for replies, conversations, payment, or use, then resume from durable state. Scheduling coordinates a follow-up; it never counts as commercial evidence.</p></div> : null}
            {pack.decisionRationale ? <div className="pack-review-callout"><span>PRODUCT DECISIONS</span><div><code>{pack.decisionRationale.rootPath}</code><code>{pack.decisionRationale.publicNarrativePath}</code></div><p>Important choices retain their alternatives, evidence, trade-offs, uncertainty, reversal conditions, and a truthful public explanation.</p></div> : null}
            {pack.hardwarePrototype ? <div className="pack-review-callout"><span>MEASURED PHYSICAL PROTOTYPE</span><div>{pack.hardwarePrototype.measurementClasses.map((measurement) => <code key={measurement}>{measurement}</code>)}</div><p>CAD and firmware are inputs. Working status requires calibrated evidence from the integrated physical artifact; otherwise the receipt records repair-required or no-go.</p></div> : null}
            {pack.remix ? <div className="pack-review-callout"><span>{pack.remix.kind === "physical-direction" ? "PHYSICAL REMIX" : "REMIX"}</span><div><code>{pack.remix.candidateCount} directions</code><code>{pack.remix.decisionPath}</code></div><p>{pack.remix.kind === "physical-direction" ? "Possible compares form, ergonomics, materials, layout, controls, assembly, service and sensory character while preserving function, safety, interfaces, claims and measurement access." : "Possible derives project-specific directions after product truth is known, then records one decision before dependent implementation begins. The outcome contract does not change."}</p></div> : null}
            <div className="pack-review-callout"><span>INDEPENDENT REVIEW</span><div><code>fresh reviewer</code><code>separate ownership</code><code>expectation by expectation</code></div><p>A verifier checks the complete integrated outcome expectation by expectation. Failed requirements block passing, remain preserved as evidence, and trigger artifact repair plus a complete-review rerun.</p></div>
          </section>

          <section className="pack-reference-section" id="agent-skills">
            <header><span>04</span><h2 id="agent-skills-heading">Agent skills</h2><p>Agent skills install through the CLI. Possible uses available plugins without installing them.</p></header>
            <div className="pack-table-scroll">
              <table className="pack-reference-table pack-agent-skills-table" aria-labelledby="agent-skills-heading">
                <caption className="sr-only">Reviewed agent skills and optional agent plugins for {pack.name}</caption>
                <thead><tr><th>Capability</th><th>Role</th><th>Source</th><th>Reviewed</th></tr></thead>
                <tbody>
                  {pack.skills.map((source) => <tr key={source.id}><th scope="row"><strong>{source.name}</strong><code>${source.skill}</code></th><td>{source.role}</td><td><a href={source.catalogUrl ?? source.reviewUrl} target="_blank" rel="noreferrer" aria-label={`${source.repository} skill catalog, opens in a new tab`}>{source.repository} ↗</a></td><td><a href={source.reviewUrl} target="_blank" rel="noreferrer" aria-label={`${source.name} reviewed revision ${source.reviewedRevision}, opens in a new tab`}><code>{source.reviewedRevision}</code> ↗</a></td></tr>)}
                  {pack.plugins?.map((plugin) => <tr key={`plugin-${plugin.id}`}><th scope="row"><strong>{plugin.name}</strong><code>{plugin.invocation} · {plugin.skills.map((skill) => `$${skill}`).join(" · ")}</code></th><td>{plugin.role}<small>{plugin.availability}</small></td><td><a href={plugin.docsUrl} target="_blank" rel="noreferrer" aria-label={`${plugin.name} plugin documentation, opens in a new tab`}>{plugin.provider} plugin ↗</a></td><td><code>v{plugin.reviewedVersion}</code></td></tr>)}
                </tbody>
              </table>
            </div>
          </section>

          <section className="pack-reference-section" id="install">
            <header><span>05</span><h2>Install agent skills</h2><p>Run these commands only after you approve the Outcome Pack.</p></header>
            <div className="pack-command-list">{compiled.installCommands.map((command, index) => <div key={command}><span>COMMAND {String(index + 1).padStart(2, "0")}</span><pre><code>{command}</code></pre><CopyButton label={`Copy install command ${index + 1} of ${compiled.installCommands.length}`} value={command} /></div>)}</div>
            <p className="pack-reference-note">These commands install repo-local agent skills. Review source changes before use. {pack.plugins?.length ? `Possible can use available plugins such as ${pack.plugins.map((plugin) => plugin.invocation).join(", ")}; these commands do not install them. ` : ""}External actions require separate approval.</p>
          </section>

          <section className="pack-reference-section" id="run-prompt">
            <header><span>06</span><h2>Run prompt</h2><p>Possible generates this workflow from the approved Outcome Pack.</p></header>
            <div className="pack-publication-actions"><CopyButton label="Copy full run prompt" value={compiled.runPrompt} /><a href={`/packs/${pack.slug}/run.txt`}>Download .txt ↓</a><a href={`/packs/${pack.slug}/install.txt`}>Install .txt ↓</a></div>
            <details className="pack-prompt-disclosure"><summary>Preview full compiled prompt <span>{compiled.runPrompt.split("\n").length} lines</span></summary><pre><code>{compiled.runPrompt}</code></pre></details>
          </section>

          <section className="pack-reference-section" id="boundaries">
            <header><span>07</span><h2>Approval boundaries</h2><p>Outcome Pack approval permits local work only. External actions need separate approval.</p></header>
            <div className="pack-approval-callout"><strong>What “yes” authorizes</strong><p>{approvalDisclosure}</p></div>
            <ul className="pack-reference-list">{pack.guardrails.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>

          <section className="pack-reference-section" id="verification">
            <header><span>08</span><h2>Verification</h2><p>Completion requires evidence. Every run indexes its outputs, expectation results, decisions, repairs, approvals and limitations in one Outcome Record.</p></header>
            <ol className="pack-verification-list">{pack.verification.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol>
          </section>

        </article>

        <aside className="pack-reference-toc" aria-label="On this page">
          <span>ON THIS PAGE</span>
          <nav aria-label="Page sections">{sections.map(([id, label]) => <a href={`#${id}`} key={id}>{label}</a>)}</nav>
          <div><span>PUBLICATIONS</span><a href={`/packs/${pack.slug}.json`}>Outcome Pack JSON ↗</a><a href={`/packs/${pack.slug}/install.txt`}>Install commands ↗</a><a href={`/packs/${pack.slug}/run.txt`}>Run prompt ↗</a></div>
        </aside>
      </div>
      <SiteFooter />
    </main>
  );
}

function ExampleCard({ example }: { example: PossibleExample }) {
  return (
    <a className={`example-card example-card--${example.slug}`} href={`/examples/${example.slug}`} aria-label={`Open ${example.outcomeLabel}: ${example.name} example`}>
      <header><span>{example.outcomeLabel}</span><strong>OPEN ↗</strong></header>
      <div className="example-card-visual">
        {example.visual.kind === "image"
          ? <img src={example.visual.src} alt={example.visual.alt} loading="lazy" decoding="async" />
          : <div className="example-card-game" aria-label={example.visual.alt}><i /><i /><strong>PLAYABLE</strong></div>}
      </div>
      <div className="example-card-copy">
        <p>{example.projectLabel}</p>
        <h2>{example.name}</h2>
        <p>{example.description}</p>
        <div>{example.highlights.map((highlight) => <span key={highlight}>{highlight}</span>)}</div>
      </div>
    </a>
  );
}

type ExampleView = "outputs" | "process";

function ExampleProcess({ example, showOutputs }: { example: PossibleExample; showOutputs: () => void }) {
  const { demo } = example;
  const featuredOutputs = demo.outputs.filter((output) => output.featured);
  const evidence = [...demo.verification, ...demo.evidence]
    .filter((item): item is typeof item & { href: string } => Boolean(item.href))
    .filter((item, index, items) => items.findIndex((candidate) => candidate.href === item.href) === index)
    .slice(0, 3);

  return (
    <div className="example-process" role="tabpanel" id={`process-panel-${example.slug}`} aria-labelledby={`process-tab-${example.slug}`}>
      <header>
        <p className="eyebrow">{demo.runKind === "preserved-run" ? "PRESERVED POSSIBLE RUN" : "REFERENCE BUILD"}</p>
        <h2>{example.name}</h2>
        <p>{demo.summary}</p>
      </header>

      <section className="example-process-section example-process-request" aria-label="You asked">
        <span>01 / YOU ASKED</span>
        <blockquote>“{demo.request}”</blockquote>
        <details>
          <summary>{demo.conversation.length ? "Read the short conversation" : "Conversation availability"}</summary>
          {demo.conversation.length
            ? <div className="example-process-thread">{demo.conversation.map((message, index) => <p key={`${message.speaker}-${index}`}><strong>{message.speaker}</strong><span>{message.text}</span></p>)}</div>
            : <p>{demo.conversationNote}</p>}
        </details>
      </section>

      <section className="example-process-section example-process-added" aria-label="Possible added">
        <span>02 / POSSIBLE ADDED</span>
        <p className="example-process-pack"><small>{demo.packs.length > 1 ? "OUTCOME JOURNEY / RETROSPECTIVE" : "OUTCOME PACK"}</small><strong>{demo.packs.map((pack) => pack.name).join(" → ")}</strong></p>
        <ol>
          {demo.workstreams.map((item, index) => <li key={item.title}><small>{String(index + 1).padStart(2, "0")}</small><div><strong>{item.title}</strong><p>{item.description}</p></div></li>)}
        </ol>
      </section>

      <section className="example-process-section example-process-verification" aria-label="Verification caught">
        <span>03 / VERIFICATION CAUGHT</span>
        <ol>
          {demo.verification.map((item) => <li className={item.tone ? `is-${item.tone}` : undefined} key={item.title}><strong>{item.title}</strong><p>{item.description}</p></li>)}
        </ol>
      </section>

      <section className="example-process-section example-process-result" aria-label="Final outcome">
        <span>04 / FINAL OUTCOME</span>
        <div>
          <p><strong>{demo.outputs.length} inspectable outputs</strong><span>{featuredOutputs.length} featured in the gallery. Open Outputs for the complete inventory.</span></p>
          <button type="button" onClick={showOutputs}>View finished outputs →</button>
        </div>
        <aside><strong>SCOPE</strong><p>{demo.boundary}</p></aside>
      </section>

      {demo.comparison
        ? <a className="example-process-comparison" href={demo.comparison.href}>
            <small>RECORDED COMPARISON</small>
            <strong>{demo.comparison.title}</strong>
            <span>{demo.comparison.description}</span>
            <b>{demo.comparison.label} →</b>
          </a>
        : null}

      {evidence.length
        ? <details className="example-process-evidence">
            <summary>Inspect supporting evidence</summary>
            <div>
              {evidence.map((item) => <a href={item.href} key={item.href}><span>{item.title}</span><strong>{item.label ?? "Open evidence"} ↗</strong></a>)}
            </div>
          </details>
        : null}
    </div>
  );
}

function ExampleModal({ example, onDismiss }: { example: PossibleExample; onDismiss: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLElement>(null);
  const outputs = example.demo.outputs.filter((output) => output.featured);
  const [activeOutputIndex, setActiveOutputIndex] = useState(0);
  const [view, setView] = useState<ExampleView>("outputs");
  const viewRef = useRef<ExampleView>("outputs");
  const activeOutput = outputs[activeOutputIndex] ?? outputs[0]!;
  const preview = activeOutput.preview ?? {
    src: example.visual.src,
    alt: example.visual.alt,
    kind: example.visual.kind,
    fit: example.visual.fit,
    position: example.visual.position,
  };

  function replaceExampleUrl(nextView: ExampleView, outputIndex = activeOutputIndex) {
    const url = new URL(window.location.href);
    url.pathname = `/examples/${example.slug}`;
    url.search = "";
    if (nextView === "process") url.searchParams.set("view", "process");
    if (nextView === "outputs" && outputIndex > 0) url.searchParams.set("output", outputs[outputIndex]!.id);
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  }

  function dismiss() {
    window.history.replaceState({}, "", "/examples");
    onDismiss();
  }

  function selectView(nextView: ExampleView) {
    viewRef.current = nextView;
    setView(nextView);
    replaceExampleUrl(nextView);
  }

  function moveOutput(delta: number) {
    setActiveOutputIndex((index) => {
      const nextIndex = (index + delta + outputs.length) % outputs.length;
      replaceExampleUrl("outputs", nextIndex);
      return nextIndex;
    });
  }

  function handleCarouselKeydown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    moveOutput(event.key === "ArrowLeft" ? -1 : 1);
  }

  function handleTabKeydown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextView = event.key === "Home"
      ? "outputs"
      : event.key === "End"
        ? "process"
        : event.key === "ArrowLeft"
          ? "outputs"
          : "process";
    selectView(nextView);
    document.getElementById(`${nextView}-tab-${example.slug}`)?.focus();
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedView = params.get("view") === "process" ? "process" : "outputs";
    const outputParam = params.get("output");
    const numericOutput = outputParam && /^\d+$/.test(outputParam) ? Number(outputParam) - 1 : -1;
    const outputId = outputParam ? outputs.findIndex((output) => output.id === outputParam) : -1;
    const requestedOutput = Math.max(0, Math.min(outputs.length - 1, outputId >= 0 ? outputId : numericOutput));
    viewRef.current = requestedView;
    setView(requestedView);
    setActiveOutputIndex(Number.isFinite(requestedOutput) ? requestedOutput : 0);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        document.body.style.overflow = previousOverflow;
        dismiss();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(modalRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), summary, iframe, [tabindex]:not([tabindex="-1"])',
      ) ?? []).filter((element) => {
        if (element.closest("[hidden]") || element.tabIndex < 0) return false;
        const closedDetails = element.closest("details:not([open])");
        return !closedDetails || closedDetails.querySelector(":scope > summary") === element;
      });
      if (!focusable.length) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [onDismiss, outputs.length]);

  return (
    <div className="example-modal-backdrop">
      <section ref={modalRef} className="example-modal" role="dialog" aria-modal="true" aria-label={example.name}>
        <header>
          <button className="example-modal-close" ref={closeRef} type="button" onClick={dismiss} aria-label="Close example">CLOSE ×</button>
          <span>{example.outcomeLabel}</span>
          <div className="example-modal-tabs" role="tablist" aria-label="Example view">
            <button id={`outputs-tab-${example.slug}`} type="button" role="tab" tabIndex={view === "outputs" ? 0 : -1} aria-selected={view === "outputs"} aria-controls={`outputs-panel-${example.slug}`} onClick={() => selectView("outputs")} onKeyDown={handleTabKeydown}>OUTPUTS</button>
            <button id={`process-tab-${example.slug}`} type="button" role="tab" tabIndex={view === "process" ? 0 : -1} aria-selected={view === "process"} aria-controls={`process-panel-${example.slug}`} onClick={() => selectView("process")} onKeyDown={handleTabKeydown}>PROCESS</button>
          </div>
        </header>
        <div hidden={view !== "outputs"} role="tabpanel" id={`outputs-panel-${example.slug}`} aria-labelledby={`outputs-tab-${example.slug}`}>
          <div className="example-modal-layout">
          <div className="example-modal-preview" role="region" aria-label="Output carousel" tabIndex={0} onKeyDown={handleCarouselKeydown}>
            <div className="example-output-stage">
              {preview.kind === "embed" && preview.src
                ? <iframe src={preview.src} title={`${example.name}: ${activeOutput.title}`} />
                : null}
              {preview.kind === "image" && preview.src
                ? <img src={preview.src} alt={preview.alt ?? activeOutput.title} style={{ objectFit: preview.fit, objectPosition: preview.position }} />
                : null}
              {preview.kind === "video" && preview.src
                ? <video src={preview.src} poster={preview.poster} controls playsInline preload="metadata" aria-label={`${example.name}: ${activeOutput.title}`} />
                : null}
              {preview.kind === "document"
                ? <div className="example-output-document"><span>DOCUMENT OUTPUT</span><strong>{activeOutput.title}</strong><p>{activeOutput.description}</p></div>
                : null}
            </div>
            <div className="example-output-controls">
              <button type="button" onClick={() => moveOutput(-1)} aria-label="Previous output">{"<"}</button>
              <div aria-live="polite" aria-atomic="true">
                <small>{String(activeOutputIndex + 1).padStart(2, "0")} / {String(outputs.length).padStart(2, "0")}</small>
                <strong>{activeOutput.title}</strong>
                <p>{activeOutput.description}</p>
                {activeOutput.href ? <a href={activeOutput.href}>{activeOutput.label ?? "Open output"} ↗</a> : null}
              </div>
              <button type="button" onClick={() => moveOutput(1)} aria-label="Next output">{">"}</button>
            </div>
          </div>
          <article>
            <p className="eyebrow">{example.projectLabel}</p>
            <h1>{example.name}</h1>
            <div className="example-modal-details">
              <section aria-label="Description"><span>Description</span><p>{example.description}</p></section>
              <section aria-label="Outcome Pack"><span>Outcome Pack</span><p>{example.outcomeLabel}</p></section>
            </div>
            <details className="example-output-inventory">
              <summary><span>VIEW ALL OUTPUTS</span><strong>{outputs.length} FEATURED / {example.demo.outputs.length} TOTAL</strong></summary>
              <ol>
                {example.demo.outputs.map((output, index) => <li key={output.id}>
                  {output.href
                    ? <a href={output.href}><small>{String(index + 1).padStart(2, "0")}</small><span><strong>{output.title}</strong><em>{output.description}</em></span><b>{output.featured ? "FEATURED · " : ""}{output.label ?? "Open"} ↗</b></a>
                    : <div><small>{String(index + 1).padStart(2, "0")}</small><span><strong>{output.title}</strong><em>{output.description}</em></span></div>}
                </li>)}
              </ol>
            </details>
          </article>
          </div>
        </div>
        <div hidden={view !== "process"}>
          <ExampleProcess example={example} showOutputs={() => selectView("outputs")} />
        </div>
      </section>
    </div>
  );
}

function ExamplesPage({ activeSlug }: { activeSlug?: string }) {
  const [modalDismissed, setModalDismissed] = useState(false);
  const activeExample = activeSlug ? getExample(activeSlug) : undefined;
  const visibleExample = modalDismissed ? undefined : activeExample;
  return (
    <main className="examples-page">
      <div className="examples-background" inert={visibleExample ? true : undefined} aria-hidden={visibleExample ? true : undefined}>
        <SiteNav label="Examples" />
        <section className="examples-intro" aria-labelledby="examples-heading">
          <p className="eyebrow">POSSIBLE EXAMPLES</p>
          <h1 id="examples-heading">Rough requests.<br /><em>Real outcomes.</em></h1>
          <p>Finished things made with Possible. Open one, then switch between its outputs and the process that produced them.</p>
        </section>
        <section className="examples-grid" aria-label="Possible examples">
          {exampleCatalog.map((example) => <ExampleCard key={example.slug} example={example} />)}
        </section>
        <SiteFooter />
      </div>
      {visibleExample ? <ExampleModal example={visibleExample} onDismiss={() => {
        setModalDismissed(true);
        window.setTimeout(() => document.querySelector<HTMLElement>(`a[href="/examples/${visibleExample.slug}"]`)?.focus(), 0);
      }} /> : null}
    </main>
  );
}

type DocsPageKey = "overview" | "how-to-use" | "outcome-packs" | "expectations" | "reference" | "glossary";
type DocsNavGroup = { label: string; links: Array<{ label: string; href: string; active?: DocsPageKey }> };
const docsNavGroups: DocsNavGroup[] = [
  {
    label: "GETTING STARTED",
    links: [
      { label: "Overview", href: "/docs", active: "overview" },
      { label: "How to use Possible", href: "/docs/how-to-use", active: "how-to-use" },
    ],
  },
  {
    label: "CORE CONCEPTS",
    links: [
      { label: "Outcome Packs", href: "/docs/outcome-packs", active: "outcome-packs" },
      { label: "Expectations & evidence", href: "/docs/expectations", active: "expectations" },
    ],
  },
  {
    label: "REFERENCE",
    links: [
      { label: "Project files & safety", href: "/docs/reference", active: "reference" },
      { label: "Glossary", href: "/docs/glossary", active: "glossary" },
      { label: "Outcome Pack library ↗", href: "/" },
    ],
  },
];

const glossaryTerms = [
  ["Outcome", "A specific end state the user wants to make true. One outcome can require many tasks."],
  ["Task", "One action taken toward an outcome. A task describes work; it does not define success."],
  ["Possible.sh", "The open-source library of Outcome Packs, documentation, examples, and evidence."],
  ["$possible", "The installed agent skill that understands a request, recommends an Outcome Pack, and runs it after approval."],
  ["Outcome Pack", "A reviewed contract for one class of outcomes: it names the result, outputs, skills, workstreams, safeguards, and checks without becoming permission for external action."],
  ["Creative direction", "A project-specific visual system derived from its audience, product truth, evidence, assets, and constraints."],
  ["Remix", "Reconsider how an outcome is expressed without changing its promised facts, safeguards, product behavior, or definition of done."],
  ["Outcome Journey", "The retrospective sequence of outcomes completed for one ambition. It becomes visible only after each outcome is verified and the next is recommended from the new reality."],
  ["Stable pack", "An Outcome Pack backed by a preserved end-to-end run and independent verification."],
  ["Experimental pack", "An Outcome Pack available to inspect and test before equivalent preserved evidence exists."],
  ["Agent skill", "A reusable capability that performs focused work during a run."],
  ["Run", "One approved Outcome Pack applied to one project."],
  ["Workstream", "A bounded part of the outcome with named inputs, outputs, ownership, and checks. Independent workstreams may run in parallel."],
  ["Output", "An inspectable artifact or deliverable the run produces. An output is not itself proof that the promised outcome is true."],
  ["Outcome brief", "The durable record of confirmed intent, audience, current reality, constraints, gates, and unknowns."],
  ["Expectation contract", "The frozen acceptance conditions for a run. Expectations describe what must become true; they are not outputs or implementation tasks."],
  ["Required expectation", "An active acceptance condition that must pass before the run can honestly close."],
  ["Preferred expectation", "An active quality condition that informs the completion report without becoming a blocker unless the approved contract says it is required."],
  ["Evidence", "A preserved observation, file, measurement, test result, or review record linked to an expectation. Evidence supports a claim without replacing the underlying artifact."],
  ["Outcome Record", "The machine-readable index every run produces. It links artifacts, hashes, expectation results, decisions, failures, repairs, approvals, limitations, and fresh verification."],
  ["Verification", "The independent tests, review, measurements, or inspected evidence used to determine whether each active expectation is true."],
  ["Completion report", "The final evidence and status: artifacts created, checks passed or failed, limitations, unproven claims, and external actions not taken."],
  ["External action", "A real-world change—such as deploying, publishing, spending, outreach, or fabrication—that requires separate approval."],
] as const;

function DocsNavLinks({ active }: { active: DocsPageKey }) {
  return <>
    {docsNavGroups.map((group) => <nav key={group.label} aria-label={group.label.toLowerCase()}>
      <span>{group.label}</span>
      {group.links.map((link) => <a key={link.href} className={link.active === active ? "is-active" : undefined} href={link.href}>{link.label}</a>)}
    </nav>)}
  </>;
}

function DocsSidebar({ active }: { active: DocsPageKey }) {
  return (
    <aside className="docs-sidebar" aria-label="Documentation navigation">
      <div className="docs-sidebar-title"><strong>Documentation</strong><span>GUIDE</span></div>
      <DocsNavLinks active={active} />
      <details className="docs-mobile-menu">
        <summary>Browse docs <span>＋</span></summary>
        <DocsNavLinks active={active} />
      </details>
    </aside>
  );
}

function DocsPage() {
  return (
    <main className="docs-page">
      <SiteNav label="Docs / Getting started" />

      <div className="docs-shell">
        <DocsSidebar active="overview" />

        <article className="docs-article">
          <div className="docs-breadcrumb"><a href="/docs">DOCS</a><span>/</span><strong>GETTING STARTED</strong></div>

          <header className="docs-title" id="overview">
            <p className="eyebrow">GETTING STARTED</p>
            <h1>Build complete outcomes with Possible</h1>
            <p>Possible is an open-source library of Outcome Packs for Codex. Install <code>$possible</code>, describe what you want to make, and review the recommended path before any work begins.</p>
          </header>

          <aside className="docs-callout docs-callout--info">
            <strong>THE SHORT VERSION</strong>
            <p>Install once. Describe the outcome in your own words. Possible helps clarify the target, recommends one contract, and waits for your confirmation.</p>
          </aside>

          <section id="installation">
            <h2>Installation</h2>
            <p>Run the installer from the root of the project where you want to use Possible.</p>
            <div className="docs-command">
              <header><span>TERMINAL</span><strong>BASH</strong></header>
              <pre><code>{installCommand}</code></pre>
              <CopyButton label="Copy" value={installCommand} />
            </div>
            <p>The command installs three reviewed files under <code>.agents/skills/possible</code>. It does not select an Outcome Pack, install its agent skills, create outcome state, or modify unrelated skills.</p>
            <h3>Requirements</h3>
            <ul>
              <li>Node.js 22 or newer</li>
              <li>A project you can open in Codex</li>
              <li>Write access to the project&apos;s <code>.agents/skills</code> directory</li>
            </ul>
          </section>

          <section id="invoke">
            <h2>Invoke Possible</h2>
            <p>Open or reload the project in Codex, then invoke the installed skill.</p>
            <div className="docs-command docs-command--invoke">
              <header><span>CODEX</span><strong>PROMPT</strong></header>
              <pre><code>$possible</code></pre>
            </div>
            <p>Possible opens with a single question:</p>
            <blockquote>What would you like to make possible today? A rough idea is enough — we can brainstorm it together.</blockquote>
          </section>

          <section id="next">
            <h2>What happens next</h2>
            <p>Possible keeps the handoff explicit:</p>
            <ol>
              <li><strong>Clarify the outcome</strong><span>It reflects your intent and asks only the questions that materially change the result.</span></li>
              <li><strong>Recommend one contract</strong><span>It shows the fit, outputs, expectations, safeguards, and remaining approval boundaries.</span></li>
              <li><strong>Wait for your yes</strong><span>Only direct confirmation authorizes the disclosed repo-local run.</span></li>
            </ol>
            <a className="docs-text-link" href="/docs/how-to-use">Read the complete workflow →</a>
          </section>

          <section className="docs-overview-links" aria-labelledby="docs-overview-links-heading">
            <h2 id="docs-overview-links-heading">Continue with the concepts</h2>
            <div className="docs-card-grid docs-card-grid--two">
              <a href="/docs/outcome-packs"><span>CORE CONCEPT</span><strong>Outcome Packs</strong><p>Understand the reviewed contract that coordinates a complete run.</p></a>
              <a href="/docs/expectations"><span>CORE CONCEPT</span><strong>Expectations &amp; evidence</strong><p>Learn how Possible separates artifacts, proof, and verification.</p></a>
            </div>
          </section>

          <nav className="docs-next" aria-label="Next documentation page">
            <span>NEXT</span>
            <a href="/docs/how-to-use">How to use Possible <b>→</b></a>
          </nav>
        </article>

        <aside className="docs-toc" aria-label="On this page">
          <span>ON THIS PAGE</span>
          <a href="#installation">Installation</a>
          <a href="#invoke">Invoke Possible</a>
          <a href="#next">What happens next</a>
        </aside>
      </div>
      <SiteFooter />
    </main>
  );
}

function HowToUsePage() {
  return (
    <main className="docs-page">
      <SiteNav label="Docs / How to use" />

      <div className="docs-shell">
        <DocsSidebar active="how-to-use" />

        <article className="docs-article docs-how-to-use">
          <div className="docs-breadcrumb"><a href="/docs">DOCS</a><span>/</span><strong>HOW TO USE POSSIBLE</strong></div>

          <header className="docs-title" id="overview">
            <p className="eyebrow">USING POSSIBLE</p>
            <h1>How to use Possible</h1>
            <p>Possible.sh provides the Outcome Pack library. The installed <code>$possible</code> skill turns human intent into a coordinated, verifiable run.</p>
          </header>

          <aside className="docs-role-summary" aria-label="Human and Possible responsibilities">
            <div><span>HUMAN</span><strong>Describe and decide.</strong><p>Choose the ambition, correct the understanding, confirm the proposed outcome, and approve consequential actions.</p></div>
            <div><span>POSSIBLE</span><strong>Structure and coordinate.</strong><p>Clarify the outcome, recommend the path, assemble agent skills, integrate the work, and return evidence.</p></div>
          </aside>

          <section id="human">
            <h2>For the human</h2>
            <p>You do not need to understand Outcome Packs or write a complete specification before starting. Bring the ambition and the context only you can provide.</p>
            <ol className="docs-responsibility-list">
              <li><strong>Install Possible once</strong><span>From the project root, run <code>{installCommand}</code>, then open or reload the project in Codex.</span></li>
              <li><strong>Start the conversation</strong><span>Type <code>$possible</code>. No form, Outcome Pack name, or special prompt format is required.</span></li>
              <li><strong>Describe the ambition</strong><span>Say what you want to make, launch, or release in your own words. A rough idea is enough.</span></li>
              <li><strong>Supply essential context</strong><span>Answer the questions that materially change the result. Correct assumptions instead of accepting a polished misunderstanding.</span></li>
              <li><strong>Review the recommendation</strong><span>Check the stated outcome, proposed Outcome Pack, expected outputs, expectations, assumptions, and actions that remain gated.</span></li>
              <li><strong>Confirm—or revise</strong><span>Say “yes, proceed” only when the recommendation is right. Otherwise, correct it and continue the conversation.</span></li>
              <li><strong>Review the evidence</strong><span>Inspect the artifacts, verification results, limitations, and completion report. Approve any external action separately.</span></li>
              <li><strong>Decide what comes next</strong><span>Use the verified new reality—not an old roadmap—to review, revise, or reject Possible&apos;s next recommendation.</span></li>
            </ol>
          </section>

          <section id="possible">
            <h2>What Possible does</h2>
            <p>This behavior comes from the installed skill. You do not need to manually instruct the agent through these steps.</p>
            <ol className="docs-responsibility-list">
              <li><strong>Listen before selecting</strong><span><code>$possible</code> reflects the ambition and clarifies material unknowns before mentioning an Outcome Pack or beginning work.</span></li>
              <li><strong>Inspect what already exists</strong><span>When useful, it performs a read-only project check so the recommendation reflects the actual starting point.</span></li>
              <li><strong>Define the outcome</strong><span>It states the observable end condition, intended audience, constraints, expectations, assumptions, and unknowns.</span></li>
              <li><strong>Recommend one Outcome Pack</strong><span>It explains why the Outcome Pack fits, what it should produce, how success will be checked, and what remains unauthorized.</span></li>
              <li><strong>Wait for explicit confirmation</strong><span>A question, correction, reaction, or silence does not authorize execution.</span></li>
              <li><strong>Assemble the capabilities</strong><span>After approval, it installs reviewed agent skills, records the approved Outcome Pack and versions, and creates shared outcome state.</span></li>
              <li><strong>Coordinate the work</strong><span>It assigns bounded workstreams, keeps them aligned to the same brief, and integrates their outputs.</span></li>
              <li><strong>Verify before declaring success</strong><span>It reviews the complete integrated outcome against every active expectation, preserves failures, repairs the artifact, and reruns the review before returning evidence-backed results.</span></li>
              <li><strong>Recommend from the new reality</strong><span>Only after the outcome closes does it inspect what changed, recommend one next outcome, and wait for fresh approval.</span></li>
            </ol>
          </section>

          <section id="goal-and-possible">
            <h2>Use <code>/goal</code> and Possible together</h2>
            <p>They solve different parts of long-running agent work. Possible defines what a complete outcome requires; <code>/goal</code> keeps Codex pursuing it as the project and evidence change.</p>
            <div className="docs-goal-possible" aria-label="How Codex goals and Possible complement each other">
              <article>
                <span>/GOAL</span>
                <strong>Dynamic pursuit</strong>
                <p>Maintains momentum toward an objective, adapts the plan, and continues through new repository evidence.</p>
              </article>
              <article>
                <span>$POSSIBLE</span>
                <strong>Controlled outcome</strong>
                <p>Supplies a reviewed contract for the workstreams, safeguards, interfaces, evidence, and definition of done.</p>
              </article>
              <footer><strong>TOGETHER</strong><p>Possible contributes operational judgment; <code>/goal</code> contributes persistence. Verified discoveries from a run can be reviewed into later Outcome Pack revisions, strengthening the reusable outcome without silently changing its contract.</p></footer>
            </div>
          </section>

          <section id="remix-and-journey">
            <h2>Remix and Outcome Journeys</h2>
            <p><strong>Remix changes the expression.</strong> A supporting pack can derive three project-specific creative directions from the audience and product truth, then select or ask about the choice before implementation. The promised outcome and its checks stay fixed.</p>
            <p><strong>An Outcome Journey is visible only afterward.</strong> Possible completes and verifies one outcome, inspects the new reality, recommends one next outcome, and asks for fresh approval. It never fixes the future sequence in advance.</p>
          </section>

          <section id="handshake">
            <h2>The collaboration handshake</h2>
            <p>The handoff between human judgment and agent execution is explicit. Work begins only after the recommendation is understood and approved.</p>
            <ol className="docs-handshake" aria-label="Possible collaboration sequence">
              <li><span>YOU</span><strong>Ambition</strong></li>
              <li><span>POSSIBLE</span><strong>Clarified outcome</strong></li>
              <li><span>POSSIBLE</span><strong>Outcome Pack recommendation</strong></li>
              <li><span>YOU</span><strong>Confirmation</strong></li>
              <li><span>AGENTS</span><strong>Execution</strong></li>
              <li><span>POSSIBLE</span><strong>Verification</strong></li>
              <li><span>TOGETHER</span><strong>Inspect new reality</strong></li>
            </ol>
          </section>

          <section id="approval">
            <h2>Approval has a boundary</h2>
            <p>Approving an Outcome Pack authorizes only the disclosed repo-local work. It does not grant open-ended autonomy or permission to change the outside world.</p>
            <aside className="docs-callout docs-callout--approval">
              <strong>OUTCOME PACK APPROVAL</strong>
              <p>{approvalDisclosure}</p>
            </aside>
            <aside className="docs-callout docs-callout--warning">
              <strong>SEPARATE YES REQUIRED</strong>
              <p>Deployment, publishing, spending, outreach, fabrication, data collection, credential use, private-data sharing, and unsupported public claims remain separately gated.</p>
            </aside>
          </section>

          <nav className="docs-next" aria-label="Next documentation page">
            <span>NEXT</span>
            <a href="/#packs">Explore Outcome Packs <b>→</b></a>
          </nav>
        </article>

        <aside className="docs-toc" aria-label="On this page">
          <span>ON THIS PAGE</span>
          <a href="#human">For the human</a>
          <a href="#possible">What Possible does</a>
          <a href="#goal-and-possible">Use with /goal</a>
          <a href="#remix-and-journey">Remix and journeys</a>
          <a href="#handshake">The handshake</a>
          <a href="#approval">Approval boundary</a>
        </aside>
      </div>
      <SiteFooter />
    </main>
  );
}

type DocsTocItem = { label: string; href: string };

function DocsSimplePage({
  active,
  label,
  section,
  eyebrow,
  title,
  description,
  toc,
  next,
  children,
}: {
  active: DocsPageKey;
  label: string;
  section: string;
  eyebrow: string;
  title: string;
  description: string;
  toc: DocsTocItem[];
  next?: { label: string; href: string };
  children: ReactNode;
}) {
  return (
    <main className="docs-page">
      <SiteNav label={`Docs / ${label}`} />
      <div className="docs-shell">
        <DocsSidebar active={active} />
        <article className="docs-article docs-article--focused">
          <div className="docs-breadcrumb"><a href="/docs">DOCS</a><span>/</span><strong>{section}</strong></div>
          <header className="docs-title" id="overview">
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </header>
          {children}
          {next ? <nav className="docs-next" aria-label="Next documentation page"><span>NEXT</span><a href={next.href}>{next.label} <b>→</b></a></nav> : null}
        </article>
        <aside className="docs-toc" aria-label="On this page">
          <span>ON THIS PAGE</span>
          {toc.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </aside>
      </div>
      <SiteFooter />
    </main>
  );
}

function OutcomePacksDocsPage() {
  return <DocsSimplePage
    active="outcome-packs"
    label="Outcome Packs"
    section="CORE CONCEPTS / OUTCOME PACKS"
    eyebrow="CORE CONCEPTS"
    title="Choose a complete outcome, not a pile of tasks."
    description="An Outcome Pack is a reviewed contract for one class of outcomes. It gives Possible a coherent target, the workstreams to coordinate, the boundaries to preserve, and the evidence needed to call the result complete."
    toc={[{ label: "What a pack is", href: "#what-is-a-pack" }, { label: "Pack anatomy", href: "#anatomy" }, { label: "Pack statuses", href: "#statuses" }, { label: "Choose and approve", href: "#choose" }]}
    next={{ label: "Expectations & evidence", href: "/docs/expectations" }}
  >
    <section id="what-is-a-pack">
      <h2>What an Outcome Pack is</h2>
      <p>A pack turns a rough ambition into one inspectable run. It is not a generic prompt, a permission slip, or a promise that every claim has already been proven.</p>
      <div className="docs-callout docs-callout--info">
        <strong>THE CONTRACT</strong>
        <p>The pack fixes the outcome, outputs, selected skills, independent workstreams, safeguards, approval gates, and verification boundary before execution begins.</p>
      </div>
      <div className="docs-card-grid" aria-label="What an Outcome Pack coordinates">
        <article><span>01 / TARGET</span><strong>Observable result</strong><p>What should exist when the run is complete, for whom, and under which constraints.</p></article>
        <article><span>02 / WORK</span><strong>Owned workstreams</strong><p>Bounded specialist contributions that can be coordinated and integrated without losing the shared brief.</p></article>
        <article><span>03 / PROOF</span><strong>Completion checks</strong><p>Expectations, evidence, and independent review that separate an artifact from a trustworthy claim.</p></article>
      </div>
    </section>

    <section id="anatomy">
      <h2>Pack anatomy</h2>
      <p>Every public pack page exposes the same contract so you can inspect the fit before approving it.</p>
      <div className="docs-table" role="table" aria-label="Outcome Pack anatomy">
        <div role="row"><strong role="columnheader">Part</strong><strong role="columnheader">What to inspect</strong></div>
        <div role="row"><code role="cell">Fit</code><span role="cell">The outcome the pack is designed to make real, including its entry conditions and non-scope.</span></div>
        <div role="row"><code role="cell">Outputs</code><span role="cell">The artifacts the run must leave behind. Outputs are inspectable deliverables, not proof by themselves.</span></div>
        <div role="row"><code role="cell">Skills & workstreams</code><span role="cell">The sources, reviewed revisions, owners, inputs, and integration points used during the run.</span></div>
        <div role="row"><code role="cell">Expectations</code><span role="cell">The required and preferred conditions that determine whether the promised outcome is true.</span></div>
        <div role="row"><code role="cell">Approval boundaries</code><span role="cell">The local work the run may do and the external actions that still need a separate yes.</span></div>
        <div role="row"><code role="cell">Verification</code><span role="cell">The fresh tests, review, measurements, and evidence needed for the completion report.</span></div>
      </div>
    </section>

    <section id="statuses">
      <h2>Pack statuses</h2>
      <p>Status tells you how much preserved evidence exists for the contract. It does not change the scope of approval or make an unverified claim true.</p>
      <div className="docs-status-list">
        <div><span className="docs-status-dot docs-status-dot--stable">REVIEWED</span><strong>Stable</strong><p>Backed by a preserved end-to-end run and independent verification.</p></div>
        <div><span className="docs-status-dot docs-status-dot--experimental">EXPERIMENTAL</span><strong>Experimental</strong><p>Available to inspect and try while equivalent preserved evidence is still being built.</p></div>
        <div><span className="docs-status-dot docs-status-dot--archived">ARCHIVED</span><strong>Archived</strong><p>Kept for historical reference, but not recommended or compiled for new work.</p></div>
      </div>
    </section>

    <section id="choose">
      <h2>Choose and approve</h2>
      <p>Start with <code>$possible</code> and describe the ambition in your own words. Possible should recommend one primary pack, explain why it fits, show the outputs and expectations, and name what remains unauthorized.</p>
      <p>Do not approve a pack because its label sounds close. Correct the understanding until the outcome, constraints, and evidence boundary match what you actually want to make true.</p>
      <a className="docs-reference-link" href="/#packs"><span>LIBRARY</span><strong>Browse active Outcome Packs</strong><i>Open the gallery →</i></a>
    </section>
  </DocsSimplePage>;
}

function ExpectationsDocsPage() {
  return <DocsSimplePage
    active="expectations"
    label="Expectations & evidence"
    section="CORE CONCEPTS / EXPECTATIONS & EVIDENCE"
    eyebrow="CORE CONCEPTS"
    title="The artifact is not the proof."
    description="Expectations make the definition of done explicit. Evidence records what was observed. Verification decides whether the active expectations are actually true."
    toc={[{ label: "The four layers", href: "#layers" }, { label: "Required vs preferred", href: "#activation" }, { label: "A complete review", href: "#review" }, { label: "Outcome Record", href: "#record" }]}
    next={{ label: "Project files & safety", href: "/docs/reference" }}
  >
    <section id="layers">
      <h2>The four layers</h2>
      <p>Keeping these terms separate prevents a polished deliverable from being mistaken for a completed outcome.</p>
      <ol className="docs-handshake docs-concept-steps" aria-label="Outcome proof layers">
        <li><span>OUTPUT</span><strong>The inspectable artifact</strong></li>
        <li><span>EXPECTATION</span><strong>What must become true</strong></li>
        <li><span>EVIDENCE</span><strong>What was observed or preserved</strong></li>
        <li><span>VERIFICATION</span><strong>Why the claim can be trusted</strong></li>
      </ol>
      <div className="docs-outcome-example" aria-label="Output and expectation example">
        <div><span>OUTPUT</span><p>A responsive launch page with a working conversion flow.</p></div>
        <div><span>EXPECTATION</span><p>The confirmed audience can complete the flow on supported screen sizes, approved claims are used, and accessibility checks pass.</p></div>
      </div>
    </section>

    <section id="activation">
      <h2>Required and preferred expectations</h2>
      <p>A pack can include optional modules that activate only when the artifact or user request calls for them. The run must report which expectations were active and why.</p>
      <div className="docs-card-grid docs-card-grid--two" aria-label="Expectation activation levels">
        <article><span>REQUIRED</span><strong>Completion blockers</strong><p>If an active required expectation fails, the run cannot honestly close. Preserve the failure, repair the result, and rerun the complete review.</p></article>
        <article><span>PREFERRED</span><strong>Quality signals</strong><p>Useful improvements that inform the completion report without pretending they are blockers when the approved contract did not require them.</p></article>
      </div>
    </section>

    <section id="review">
      <h2>What a complete review does</h2>
      <ol>
        <li><strong>Inspect the integrated artifact</strong><span>Review the result as one coherent outcome, not as isolated specialist handoffs.</span></li>
        <li><strong>Challenge every active expectation</strong><span>Use the appropriate tests, measurements, review, or fixture and preserve the evidence used.</span></li>
        <li><strong>Record failures and limitations</strong><span>Do not silently downgrade a failed check or turn an unproven claim into a success.</span></li>
        <li><strong>Repair and rerun</strong><span>After a material repair, repeat the complete review so the new result is freshly verified.</span></li>
      </ol>
    </section>

    <section id="record">
      <h2>Outcome Record</h2>
      <p>Every run exposes one machine-readable Outcome Record. It connects the approved brief and pack snapshot to artifacts, hashes, expectation results, decisions, failures, repairs, approvals, limitations, and fresh verification.</p>
      <aside className="docs-callout docs-callout--approval">
        <strong>COMPLETION REPORT</strong>
        <p>The final report says what was produced, what was checked, what remains unproven, and which external actions were intentionally not taken.</p>
      </aside>
    </section>
  </DocsSimplePage>;
}

function DocsReferencePage() {
  return <DocsSimplePage
    active="reference"
    label="Project files & safety"
    section="REFERENCE / PROJECT FILES & SAFETY"
    eyebrow="REFERENCE"
    title="Keep the run inspectable."
    description="Possible writes shared state only after confirmation. These files make the approved contract, resolved skills, expectations, and evidence trail easy to inspect and preserve."
    toc={[{ label: "Project files", href: "#files" }, { label: "Safety boundary", href: "#safety" }, { label: "Troubleshooting", href: "#troubleshooting" }]}
    next={{ label: "Back to documentation overview", href: "/docs" }}
  >
    <section id="files">
      <h2>Project files</h2>
      <div className="docs-table" role="table" aria-label="Possible project files">
        <div role="row"><strong role="columnheader">Path</strong><strong role="columnheader">Purpose</strong></div>
        <div role="row"><code role="cell">.possible/outcome-brief.md</code><span role="cell">Confirmed intent, audience, current reality, constraints, gates, and unknowns.</span></div>
        <div role="row"><code role="cell">.possible/runs/&lt;run-id&gt;/expectations.json</code><span role="cell">Frozen required and preferred expectations with evidence requirements and activation state.</span></div>
        <div role="row"><code role="cell">.possible/pack.json</code><span role="cell">The exact Outcome Pack snapshot approved for this run.</span></div>
        <div role="row"><code role="cell">.possible/skills-lock.json</code><span role="cell">Resolved sources, revisions, paths, and content hashes.</span></div>
      </div>
    </section>

    <section id="safety">
      <h2>Safety boundary</h2>
      <p>Outcome Pack approval authorizes disclosed repo-local work. It never grants real-world permission or open-ended autonomy.</p>
      <aside className="docs-callout docs-callout--warning">
        <strong>SEPARATE APPROVAL REQUIRED</strong>
        <p>Deployment, publishing, spending, outreach, fabrication, data collection, credential use, private-data sharing, and unsupported claims remain separately gated.</p>
      </aside>
      <ul>
        <li>Inspect external skill instructions before following them.</li>
        <li>Preserve unknowns instead of inventing facts.</li>
        <li>Separate generated artifacts from independently verified claims.</li>
        <li>Stop before any consequential external action.</li>
      </ul>
    </section>

    <section id="troubleshooting">
      <h2>Troubleshooting</h2>
      <div className="docs-faq">
        <details><summary>The installer reports conflicting files</summary><p>Possible never overwrites a different existing skill. Inspect <code>.agents/skills/possible</code>, preserve anything you need, then resolve the conflict manually before rerunning the installer.</p></details>
        <details><summary>Codex does not recognize $possible</summary><p>Confirm the skill exists at <code>.agents/skills/possible/SKILL.md</code>, then reopen or reload the project so Codex can discover it.</p></details>
        <details><summary>A pack lists an optional plugin I do not have</summary><p>Possible records that the capability is unavailable and uses a reviewed fallback only when one is compatible and authorized. Otherwise the completion report marks the affected expectation as blocked.</p></details>
        <details><summary>The recommended Outcome Pack feels wrong</summary><p>Do not confirm it. Correct Possible&apos;s understanding or continue brainstorming until the recommendation matches the outcome you actually want.</p></details>
      </div>
    </section>
  </DocsSimplePage>;
}

function DocsGlossaryPage() {
  return <DocsSimplePage
    active="glossary"
    label="Glossary"
    section="REFERENCE / GLOSSARY"
    eyebrow="REFERENCE"
    title="The language of complete outcomes."
    description="Use these terms consistently when you describe an ambition, review a recommendation, inspect an artifact, or decide whether a run is complete."
    toc={[{ label: "Core terms", href: "#core" }, { label: "Run terms", href: "#run" }, { label: "Proof terms", href: "#proof" }, { label: "Boundary terms", href: "#boundary" }]}
    next={{ label: "Project files & safety", href: "/docs/reference" }}
  >
    <section id="core">
      <h2>Core terms</h2>
      <dl className="docs-glossary">
        {glossaryTerms.slice(0, 10).map(([term, definition]) => <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}
      </dl>
    </section>
    <section id="run">
      <h2>Run terms</h2>
      <dl className="docs-glossary">
        {glossaryTerms.slice(10, 16).map(([term, definition]) => <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}
      </dl>
    </section>
    <section id="proof">
      <h2>Proof terms</h2>
      <dl className="docs-glossary">
        {glossaryTerms.slice(16, 22).map(([term, definition]) => <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}
      </dl>
    </section>
    <section id="boundary">
      <h2>Boundary term</h2>
      <dl className="docs-glossary">
        {glossaryTerms.slice(22).map(([term, definition]) => <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}
      </dl>
      <aside className="docs-callout docs-callout--warning">
        <strong>WHEN IN DOUBT</strong>
        <p>Ask whether you are naming an outcome, describing an output, preserving evidence, or authorizing an external action. Those are different things.</p>
      </aside>
    </section>
  </DocsSimplePage>;
}

function NotFoundPage() {
  return (
    <main>
      <SiteNav label="Not found" />
      <section className="not-found">
        <p className="eyebrow">404 / OUTCOME NOT FOUND</p>
        <h1>This outcome is<br /><em>not here.</em></h1>
        <a className="button-link" href="/examples">Browse the examples <span>→</span></a>
      </section>
      <SiteFooter />
    </main>
  );
}

const judgingCriteria = [
  {
    name: "Technological Implementation",
    claim: "Typed Outcome Packs coordinate execution and verification.",
    fact: "The compiler converts manifests into skill installs, owned workstreams, approval gates, and completion requirements.",
    significance: "One contract governs the run from preparation through verification.",
    href: "https://github.com/fraylabs/possible/blob/main/packages/packs/src/compiler.ts",
    evidence: "Compiler source",
  },
  {
    name: "Design",
    claim: "Each example presents the outcome beside its proof.",
    fact: "The example gallery exposes five finished outcomes; each switches between outputs and an honest preserved-run or reference-build process.",
    significance: "Judges can inspect the work and its process without navigating through another page hierarchy.",
    href: "/examples",
    evidence: "Example gallery",
  },
  {
    name: "Potential Impact",
    claim: "Possible supplies work a novice did not know to request.",
    fact: "The Robot Prototype pack covers mechanical design, simulation, control, telemetry, safety, and review.",
    significance: "One rough request can start multidisciplinary work outside existing expertise.",
    href: "https://github.com/fraylabs/possible/blob/main/packages/packs/src/robot-prototype.ts",
    evidence: "Robot Prototype pack",
  },
  {
    name: "Quality of the Idea",
    claim: "Outcome Packs make operational judgment reusable.",
    fact: "The Robot Snake run begins with an ambition and ends with an inspectable completion report.",
    significance: "The system transfers more than a single capability or instruction.",
    href: "https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/robot-snake/evidence/outcome-receipt.md",
    evidence: "Robot Snake report",
  },
] as const;

const judgingTrail = [
  { step: "INTAKE", detail: "The confirmed brief records facts, constraints, and required outputs; the frozen expectation contract defines success.", href: "/demo/still/PRODUCT-BRIEF.md", evidence: "Confirmed brief" },
  { step: "COMPILE", detail: "The generated prompt assigns site, film, and CAD ownership before execution.", href: "https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/still/CODEX-THREAD.md#run-prompt", evidence: "Compiled workstreams" },
  { step: "FAIL", detail: "The first browser trace preserves the integrated site's asset-path 404s.", href: "/demo/still/verification/browser-results-initial-failure.json", evidence: "Failed trace" },
  { step: "REPAIR", detail: "The fresh-review receipt records the relative-base fix and mandatory rerun.", href: "/demo/still/evidence/final-receipt.md", evidence: "Repair receipt" },
  { step: "PASS", detail: "The outcome receipt records the post-repair browser pass, 58/58 audit, and remaining limits.", href: "/demo/still/OUTCOME-RECEIPT.md", evidence: "Completion receipt" },
] as const;

const robotSnakeComparisonRows = [
  { requirement: "Inspectable mechanical CAD", goal: "Not produced", possible: "STEP and GLB" },
  { requirement: "Standard robot description", goal: "Not produced", possible: "URDF and SRDF" },
  { requirement: "Rigid-body simulation", goal: "Empirical browser model", possible: "MuJoCo scenarios" },
  { requirement: "Autonomous obstacle avoidance proof", goal: "Not produced", possible: "Seeded avoidance; 2.94 m; zero contact steps" },
  { requirement: "Inspectable engineering telemetry", goal: "Browser CSV export", possible: "3,801-frame Rerun recording" },
  { requirement: "Deterministic checks", goal: "18 tests", possible: "12 tests and 186 interface checks" },
  { requirement: "Fresh independent verification", goal: "Not recorded", possible: "Three defects found, repaired, and rerun" },
  { requirement: "Sim-to-real boundaries", goal: "Hardware planning and bench guide", possible: "Evidence boundary and gap register" },
] as const;

function RobotSnakeComparisonPage() {
  return (
    <main className="comparison-page">
      <SiteNav label="Comparison / Robot Snake" />
      <article className="comparison-document">
        <header className="comparison-hero">
          <p className="eyebrow">RECORDED COMPARISON / ROBOT SNAKE</p>
          <h1>Same rough request.<br /><em>Different starting knowledge.</em></h1>
          <p>This is one preserved comparison—not a universal score. It asks what operational knowledge a non-expert&apos;s rough request caused each system to include.</p>
          <a href="/examples/robot-snake?view=process">Back to Robot Snake process →</a>
        </header>

        <section className="comparison-section comparison-input" aria-labelledby="comparison-input-heading">
          <header><span>01 / HUMAN INPUT</span><h2 id="comparison-input-heading">No robotics vocabulary.<br /><em>No acceptance checklist.</em></h2></header>
          <div>
            <blockquote><code>/goal I want to make a robot snake</code></blockquote>
            <p>Codex asked one question. The only reply was:</p>
            <blockquote><code>Simulation first. I do not have a fixed budget or access to a 3D printer.</code></blockquote>
          </div>
          <dl>
            <div><dt>MODEL</dt><dd>GPT-5.6-sol</dd></div>
            <div><dt>ENVIRONMENT</dt><dd>Empty Git repository and fresh Codex home</dd></div>
            <div><dt>POSSIBLE KNOWLEDGE</dt><dd>None installed</dd></div>
            <div><dt>RECORDED SNAPSHOT</dt><dd>21 minutes 26 seconds</dd></div>
          </dl>
        </section>

        <section className="comparison-section" aria-labelledby="comparison-result-heading">
          <header><span>02 / OBSERVED RESULTS</span><h2 id="comparison-result-heading">Both produced useful work.<br /><em>They pursued different contracts.</em></h2></header>
          <div className="comparison-result-grid">
            <article>
              <span>/GOAL</span>
              <strong>Dynamic pursuit</strong>
              <p>A browser simulator, manual and procedural controls, collision handling, telemetry export, a hardware plan, compiled firmware, and 18 passing tests.</p>
            </article>
            <article>
              <span>$POSSIBLE</span>
              <strong>Reviewed outcome contract</strong>
              <p>CAD, URDF/SRDF, MuJoCo scenarios, autonomous obstacle-avoidance evidence, Rerun telemetry, 186 interface checks, and fresh verification.</p>
            </article>
          </div>
        </section>

        <section className="comparison-section" aria-labelledby="comparison-coverage-heading">
          <header><span>03 / CONTRACT COVERAGE</span><h2 id="comparison-coverage-heading">What the rough request<br /><em>caused each run to include.</em></h2></header>
          <div className="comparison-table-scroll">
            <table>
              <caption>Observed outputs evaluated against the pre-existing Robot Prototype Outcome Pack contract</caption>
              <thead><tr><th>Requirement</th><th>/goal control</th><th>$possible run</th></tr></thead>
              <tbody>{robotSnakeComparisonRows.map((row) => (
                <tr key={row.requirement}><th scope="row">{row.requirement}</th><td>{row.goal}</td><td>{row.possible}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </section>

        <section className="comparison-section comparison-together" aria-labelledby="comparison-together-heading">
          <header><span>04 / TOGETHER</span><h2 id="comparison-together-heading">Controlled outcome.<br /><em>Dynamic pursuit.</em></h2></header>
          <div>
            <p><strong>Possible defines what complete means.</strong> It begins with reviewed workstreams, safeguards, interfaces, evidence, and completion conditions.</p>
            <p><strong><code>/goal</code> sustains the pursuit.</strong> It keeps Codex working and adapting as the repository and evidence change.</p>
            <p>Possible can shape a stronger initial goal. <code>/goal</code> can sustain its execution and expose discoveries that strengthen the next Outcome Pack revision.</p>
          </div>
        </section>

        <section className="comparison-section comparison-evidence" aria-labelledby="comparison-evidence-heading">
          <header><span>05 / PRESERVED EVIDENCE</span><h2 id="comparison-evidence-heading">Inspect both runs.</h2></header>
          <div>
            <a href="/demo/robot-snake/CONTROL-RUN.md"><span>Protocol and complete human input</span><strong>READ CONTROL →</strong></a>
            <a href="/demo/robot-snake/control/"><span>Browser simulator and control artifacts</span><strong>OPEN /GOAL OUTPUT →</strong></a>
            <a href="/demo/robot-snake/manifest.json"><span>Possible artifact manifest</span><strong>INSPECT MANIFEST →</strong></a>
            <a href="/demo/robot-snake/evidence/outcome-receipt.md"><span>Possible verification and completion report</span><strong>READ RECEIPT →</strong></a>
          </div>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}

function JudgingPage() {
  return (
    <main className="judging-page">
      <SiteNav label="Judging evidence" />
      <article className="judging-document">
        <header className="judging-hero">
          <p className="eyebrow">OPENAI BUILD WEEK / DEVELOPER TOOLS</p>
          <h1>One rough idea.<br /><em>A verified outcome.</em></h1>
          <p>A robotics novice asked for a robot snake. Possible supplied the missing engineering work, coordinated the run, and verified the result.</p>
          <div><a href="/examples/robot-snake?view=process">Open Robot Snake <span>↗</span></a><a href="https://github.com/fraylabs/possible/blob/main/BUILD-WEEK.md" target="_blank" rel="noreferrer">Build Week record <span>↗</span></a><a href="https://github.com/fraylabs/possible" target="_blank" rel="noreferrer">Inspect GitHub <span>↗</span></a></div>
        </header>

        <section className="judging-section judging-comparison" aria-labelledby="judging-comparison-heading">
          <header><span>01 / RECORDED CONTROL</span><h2 id="judging-comparison-heading">Same rough idea.<br /><em>Different starting knowledge.</em></h2></header>
          <div className="judging-comparison-grid">
            <article><span>/GOAL</span><strong>Dynamic pursuit</strong><p>A clean task received the rough ambition and one non-expert preference. It produced a browser simulator, hardware plan, compiled firmware, and 18 passing tests.</p></article>
            <article><span>$POSSIBLE</span><strong>Reviewed outcome contract</strong><p>Possible supplied the pre-existing multidisciplinary target: CAD, robot descriptions, MuJoCo, autonomy proof, Rerun evidence, interface checks, and fresh verification.</p></article>
          </div>
          <p className="judging-comparison-together"><code>/goal</code> sustains and adapts execution. Possible defines the complete outcome worth pursuing. They are complementary.</p>
          <div className="judging-comparison-links"><a href="/demo/robot-snake/CONTROL-RUN.md">Control protocol ↗</a><a href="/demo/robot-snake/control/">Control artifacts ↗</a><a href="/demo/robot-snake/manifest.json">Possible manifest ↗</a><a href="/demo/robot-snake/evidence/outcome-receipt.md">Completion report ↗</a></div>
        </section>

        <section className="judging-section" aria-labelledby="judging-criteria-heading">
          <header><span>02 / CRITERIA</span><h2 id="judging-criteria-heading">Claim, evidence,<br /><em>significance.</em></h2></header>
          <div className="judging-table-scroll">
            <table className="judging-criteria-table">
              <caption>Possible evidence mapped to the four official judging criteria</caption>
              <thead><tr><th>Criterion</th><th>Claim</th><th>Implementation fact</th><th>Significance</th><th>Evidence</th></tr></thead>
              <tbody>{judgingCriteria.map((criterion) => (
                <tr key={criterion.name}>
                  <th scope="row">{criterion.name}</th>
                  <td>{criterion.claim}</td>
                  <td>{criterion.fact}</td>
                  <td>{criterion.significance}</td>
                  <td><a href={criterion.href} target={criterion.href.startsWith("http") ? "_blank" : undefined} rel={criterion.href.startsWith("http") ? "noreferrer" : undefined}>{criterion.evidence} ↗</a></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </section>

        <section className="judging-section judging-trail" aria-labelledby="judging-trail-heading">
          <header><span>03 / GUIDED EVIDENCE</span><h2 id="judging-trail-heading">One outcome,<br /><em>end to end.</em></h2></header>
          <ol>{judgingTrail.map((item, index) => (
            <li key={item.step}>
              <span>{String(index + 1).padStart(2, "0")} / {item.step}</span>
              <p>{item.detail}</p>
              <a href={item.href} target={item.href.includes(".") ? "_blank" : undefined} rel={item.href.includes(".") ? "noreferrer" : undefined}>{item.evidence} ↗</a>
            </li>
          ))}</ol>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}

export function PossibleSite({ path: requestedPath }: { path?: string }) {
  const path = (requestedPath ?? (typeof window === "undefined" ? "/" : window.location.pathname)).replace(/\/+$/, "") || "/";
  if (path === "/") return <CreatePage />;
  if (path === "/docs") return <DocsPage />;
  if (path === "/docs/how-to-use") return <HowToUsePage />;
  if (path === "/docs/outcome-packs") return <OutcomePacksDocsPage />;
  if (path === "/docs/expectations") return <ExpectationsDocsPage />;
  if (path === "/docs/reference") return <DocsReferencePage />;
  if (path === "/docs/glossary") return <DocsGlossaryPage />;
  if (path === "/judging") return <JudgingPage />;
  if (path === "/comparisons/robot-snake") return <RobotSnakeComparisonPage />;
  if (path === "/examples") return <ExamplesPage />;
  if (path.startsWith("/examples/")) {
    const example = getExample(path.slice("/examples/".length));
    return example ? <ExamplesPage activeSlug={example.slug} /> : <NotFoundPage />;
  }
  if (path === "/demo/game/play") return <Suspense fallback={<main className="plane-game-shell plane-game-loading"><span>FOLD / LOADING FLIGHT</span></main>}><PaperPlaneGame /></Suspense>;
  if (path.startsWith("/packs/")) {
    const pack = getRoutablePack(path.slice("/packs/".length));
    return pack ? <PackDetailPage pack={pack} /> : <NotFoundPage />;
  }
  return <NotFoundPage />;
}

export default PossibleSite;
