"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { compilePack } from "@possible/packs";
import type { OutcomePack } from "@possible/packs";
import { exampleCatalog, getExample } from "./example-content";
import type { PossibleExample } from "./example-content";
import { getPublishedPack, githubUrl, installCommand, publishedPacks } from "./public-content";

const PaperPlaneGame = lazy(() => import("./PaperPlaneGame"));
type CopyState = "idle" | "copied" | "failed";
const approvalDisclosure = "Saying yes authorizes repo-local agent skill installation, the shared outcome brief and state files, and local outcome work. External actions still require separate approval.";
const laneLabels = {
  create: "Create",
  launch: "Launch",
  release: "Release",
  operate: "Operate",
} as const;
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

        <section className="home-workflow" aria-labelledby="home-workflow-heading">
          <header><span>HOW IT WORKS</span><h2 id="home-workflow-heading">Bring the ambition.<br /><em>Possible supplies the missing work.</em></h2></header>
          <ol>
            <li><span>DESCRIBE</span><strong>Tell <code>$possible</code> what you want.</strong><p>A rough idea is enough.</p></li>
            <li><span>APPROVE</span><strong>Review the proposed outcome.</strong><p>Possible recommends the Outcome Pack and names the boundaries.</p></li>
            <li><span>EXECUTE</span><strong>Codex runs the workstreams.</strong><p>Selected agent skills create and integrate the artifacts.</p></li>
            <li><span>VERIFY</span><strong>Evidence decides what is done.</strong><p>Failures are repaired and limitations remain visible.</p></li>
          </ol>
        </section>

        <section className="home-demo" aria-labelledby="home-demo-heading">
          <header>
            <span>FEATURED OUTCOMES</span>
            <h2 id="home-demo-heading">Finished outcomes.<br /><em>Open one.</em></h2>
          </header>
          <ol aria-label="Possible example outcomes">
            {exampleCatalog.slice(0, 4).map((example) => (
              <li key={example.slug}><a href={`/examples/${example.slug}`}><span>{example.outcomeLabel}</span><h3>{example.name}</h3><i>↗</i></a></li>
            ))}
          </ol>
        </section>

        <div className="home-pack-index" id="packs" role="region" aria-labelledby="home-packs-heading">
          <header>
            <div>
              <span>THE TECHNICAL IDEA</span>
              <h2 id="home-packs-heading">Skills perform tasks.<br /><em>Outcome Packs coordinate the outcome.</em></h2>
            </div>
            <p>Each manifest compiles skills, safeguards and completion checks.</p>
          </header>

          <div className="home-pack-columns" aria-hidden="true">
            <span>OUTCOME PACK</span><span>PURPOSE</span><span>CATEGORY</span><span>OPEN</span>
          </div>
          <ol aria-label="Outcome Packs Possible can recommend">
            {publishedPacks.map((pack) => (
              <li key={pack.slug}>
                <a href={`/packs/${pack.slug}`} aria-label={`${pack.name}, ${laneLabels[pack.lane]} Outcome Pack`}>
                  <strong>{pack.name}</strong>
                  <span>{pack.promise}</span>
                  <span className={`home-pack-lane home-pack-lane--${pack.lane}`}>{laneLabels[pack.lane]}</span>
                  <i>↗</i>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="home-source" aria-labelledby="home-source-heading">
        <header><div><span>OPEN SOURCE</span><h2 id="home-source-heading">Inspect the compiler.<br /><em>Run the tests.</em></h2></div><p>The manifests, generated prompts, safety gates, verifier contracts and preserved demo evidence are public.</p></header>
        <div className="home-source-links">
          <a href={githubUrl} target="_blank" rel="noreferrer"><strong>GitHub</strong><span>Read the source ↗</span></a>
          <a href={`${githubUrl}#judge-quickstart`} target="_blank" rel="noreferrer"><strong>Judge quickstart</strong><span>Install and test ↗</span></a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function PackCard({ pack }: { pack: OutcomePack }) {
  return (
    <a className={`pack-card pack-card--${pack.slug}`} href={`/packs/${pack.slug}`}>
      <div className="pack-cover">
        <header><span>OUTCOME PACK</span><small>{pack.lane.toUpperCase()}</small><b>↗</b></header>
        <PackArtwork slug={pack.slug} />
        <div className="pack-cover-title">
          <small>POSSIBLE OUTCOME</small>
          <h2>{pack.name}</h2>
        </div>
      </div>
      <div className="pack-card-body">
        <p>{pack.promise}</p>
        <div className="pack-card-stats">
          <span>{pack.skills.length} AGENT SKILLS{pack.plugins?.length ? ` + ${pack.plugins.length} PLUGIN` : ""}</span>
          <span>{pack.workstreams.length} WORKSTREAMS</span>
          <span>{pack.outputs.length} ARTIFACTS</span>
        </div>
      </div>
    </a>
  );
}

function PackArtwork({ slug }: { slug: string }) {
  if (slug === "hardware-launch") {
    return (
      <div className="pack-art pack-art--hardware" aria-hidden="true">
        <i className="hardware-orbit" /><i className="hardware-device" />
        <span>FORM</span><span>FILM</span><span>FRONTEND</span>
      </div>
    );
  }
  if (slug === "software-launch") {
    return (
      <div className="pack-art pack-art--software" aria-hidden="true">
        <div className="software-window"><i /><i /><i /><b /><b /><b /></div>
        <span>BUILD</span><span>TEST</span><span>SHIP</span>
      </div>
    );
  }
  if (slug === "working-web-app") {
    return (
      <div className="pack-art pack-art--working" aria-hidden="true">
        <div className="working-window"><i /><i /><i /><b /><b /><b /><b /></div>
        <span>FLOW / COMPLETE</span><span>STATE / SAVED</span><span>BUILD / PASS</span>
      </div>
    );
  }
  if (slug === "playable-web-game") {
    return (
      <div className="pack-art pack-art--game" aria-hidden="true">
        <i className="game-flight-line" /><i className="game-plane" /><i className="game-gate game-gate--one" /><i className="game-gate game-gate--two" />
        <span>LOOP</span><span>FEEL</span><span>PLAY</span>
      </div>
    );
  }
  if (slug === "web-app-operations") {
    return (
      <div className="pack-art pack-art--operations" aria-hidden="true">
        <div className="operations-board"><i /><i /><i /><i /><i /><i /></div>
        <b className="operations-pulse" />
        <span>CYCLE / MANUAL FIRST</span><span>REPORT / DATED</span><span>SCHEDULE / SEPARATE YES</span>
      </div>
    );
  }
  if (slug === "marketing-operations") {
    return (
      <div className="pack-art pack-art--marketing" aria-hidden="true">
        <div className="marketing-cycle"><i /><i /><i /><b>REVIEW</b></div>
        <div className="marketing-calendar"><i /><i /><i /><i /><i /><i /></div>
        <span>PLAN / CONFIRMED</span><span>DRAFT / REVIEW</span><span>PUBLISH / GATED</span>
      </div>
    );
  }
  if (slug === "production-web-release") {
    return (
      <div className="pack-art pack-art--production-release" aria-hidden="true">
        <div className="release-track"><i /><i /><i /><b>APPROVAL</b></div>
        <span>CANDIDATE / PINNED</span><span>ROLLBACK / READY</span><span>PRODUCTION / VERIFIED</span>
      </div>
    );
  }
  if (slug === "billion-dollar-saas") {
    return (
      <div className="pack-art pack-art--company" aria-hidden="true">
        <div>{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div>
        <strong>COMPANY / OPERATING SYSTEM</strong>
        <span>PRODUCT</span><span>GROWTH</span><span>REVENUE</span><span>TRUST</span>
      </div>
    );
  }
  if (slug === "kickstarter-funding") {
    return (
      <div className="pack-art pack-art--funding" aria-hidden="true">
        <div><i /><b>0%</b></div><strong>GOAL → PAYOUT</strong>
        <span>OFFER</span><span>PROOF</span><span>AUDIENCE</span>
      </div>
    );
  }
  if (slug === "kickstarter-fulfillment") {
    return (
      <div className="pack-art pack-art--fulfillment" aria-hidden="true">
        <div><i /><i /><i /><i /><i /></div><strong>95% SHIPPED</strong>
        <span>BUILD</span><span>PACK</span><span>SHIP</span>
      </div>
    );
  }
  if (slug === "robot-prototype") {
    return (
      <div className="pack-art pack-art--robot" aria-hidden="true">
        <div className="robot-kinematic"><b />{Array.from({ length: 8 }, (_, index) => <i key={index} />)}</div>
        <strong>MODEL → CONTROL → PROOF</strong>
        <span>CAD</span><span>KINEMATICS</span><span>MUJOCO</span>
      </div>
    );
  }
  if (slug === "web-presentation") {
    return (
      <div className="pack-art pack-art--presentation" aria-hidden="true">
        <div className="presentation-atlas" />
        <strong>STORY → DECK → REVIEW</strong>
        <span>HTML</span><span>MOTION</span><span>PRESENT</span>
      </div>
    );
  }
  if (slug === "software-opportunity-discovery") {
    return (
      <div className="pack-art pack-art--discovery" aria-hidden="true">
        <i className="discovery-radar" /><i className="discovery-signal" />
        <strong>EVIDENCE → DECISION</strong>
        <span>PROBLEM</span><span>PROOF</span><span>GO / NO-GO</span>
      </div>
    );
  }
  if (slug === "developer-project-launch") {
    return (
      <div className="pack-art pack-art--developer-launch" aria-hidden="true">
        <div className="developer-launch-path"><i /><i /><i /><b>ADOPT</b></div>
        <span>POSITION / CLEAR</span><span>QUICKSTART / TESTED</span><span>LAUNCH / GATED</span>
      </div>
    );
  }
  return (
    <div className="pack-art pack-art--release" aria-hidden="true">
      <i className="release-ring" /><i className="release-dot" />
      <code>README.md</code><code>CI / PASS</code><code>v1.0.0</code>
    </div>
  );
}

function PacksPage() {
  const pageSize = 4;
  const pageCount = Math.ceil(publishedPacks.length / pageSize);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const syncPage = () => {
      const requestedPage = Number(new URLSearchParams(window.location.search).get("page") ?? "1");
      setCurrentPage(Number.isInteger(requestedPage) && requestedPage >= 1 && requestedPage <= pageCount ? requestedPage : 1);
    };
    syncPage();
    window.addEventListener("popstate", syncPage);
    return () => window.removeEventListener("popstate", syncPage);
  }, [pageCount]);

  function selectPage(event: MouseEvent<HTMLAnchorElement>, page: number) {
    event.preventDefault();
    const href = page === 1 ? "/packs" : `/packs?page=${page}`;
    window.history.pushState({}, "", href);
    setCurrentPage(page);
    window.requestAnimationFrame(() => {
      const catalog = document.getElementById("pack-catalog");
      document.getElementById(`pack-catalog-page-${page}`)?.focus({ preventScroll: true });
      catalog?.scrollIntoView?.({ block: "start" });
    });
  }

  const pages = Array.from({ length: pageCount }, (_, index) => publishedPacks.slice(index * pageSize, (index + 1) * pageSize));

  return (
    <main>
      <SiteNav label="Outcome Packs" />
      <section className="catalog-hero">
        <p className="eyebrow">OUTCOME PACKS</p>
        <h1>Reviewed Outcome Packs.<br /><em>Recommended by $possible.</em></h1>
        <div className="catalog-intro">
          <p>Each Outcome Pack combines a reusable execution prompt, selected agent skills, sequencing, safeguards, and completion checks. Describe the outcome; <code>$possible</code> recommends the right pack.</p>
          <a className="button-link" href="/#start">Start with Possible <span>→</span></a>
        </div>
      </section>
      <div id="pack-catalog" className="pack-catalog-pages">
        {pages.map((packs, index) => {
          const page = index + 1;
          return (
            <section
              id={`pack-catalog-page-${page}`}
              className={`pack-grid${packs.length < pageSize ? " pack-grid--filtered" : ""}`}
              aria-label={`Outcome Packs page ${page} of ${pageCount}`}
              hidden={currentPage !== page}
              tabIndex={-1}
              key={page}
            >
              {packs.map((pack) => <PackCard pack={pack} key={pack.slug} />)}
            </section>
          );
        })}
      </div>
      <nav className="pack-pagination" aria-label="Outcome Pack pages">
        <span>PAGE {String(currentPage).padStart(2, "0")} / {String(pageCount).padStart(2, "0")}</span>
        <div>{pages.map((_, index) => {
          const page = index + 1;
          return <a href={page === 1 ? "/packs" : `/packs?page=${page}`} aria-current={currentPage === page ? "page" : undefined} onClick={(event) => selectPage(event, page)} key={page}>{String(page).padStart(2, "0")}</a>;
        })}</div>
      </nav>
      <section className="catalog-principle">
        <span>THE DIFFERENCE</span>
        <p>Agent skills provide capabilities. Outcome Packs coordinate them toward a complete, verified result.</p>
      </section>
      <SiteFooter />
    </main>
  );
}

function PackDetailPage({ pack }: { pack: OutcomePack }) {
  const compiled = compilePack(pack);
  const reviewedLabel = new Date(`${pack.reviewedAt}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const sections = [
    ["overview", "Overview"],
    ["fit", "Fit"],
    ["outputs", "Outcome contract"],
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
            {publishedPacks.map((candidate) => (
              <a href={`/packs/${candidate.slug}`} aria-current={candidate.slug === pack.slug ? "page" : undefined} key={candidate.slug}>
                <strong>{candidate.name}</strong>
                <small>{candidate.lane}</small>
              </a>
            ))}
          </nav>
          <a className="pack-reference-back" href="/packs">← Gallery</a>
        </aside>

        <article className="pack-reference-document" id="pack-specification" tabIndex={-1}>
          <header className="pack-reference-header" id="overview">
            <div className="pack-reference-breadcrumb"><a href="/packs">OUTCOME PACKS</a><span>/</span><strong>{pack.lane.toUpperCase()}</strong></div>
            <dl className="pack-reference-meta">
              <div><dt>CATEGORY</dt><dd>{pack.lane}</dd></div>
              <div><dt>SCHEMA</dt><dd>v{pack.schemaVersion}</dd></div>
              <div><dt>LAST REVIEWED</dt><dd><time dateTime={pack.reviewedAt}>{reviewedLabel}</time></dd></div>
            </dl>
            <h1>{pack.name}</h1>
            <p className="pack-reference-promise">{pack.promise}</p>
            <div className="pack-reference-actions">
              <a href="/#start">Start with $possible <span>→</span></a>
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
            <header><span>02</span><h2>Outcome contract</h2><p>Completion requires every artifact below.</p></header>
            <ol className="pack-contract-list">{pack.outputs.map((output, index) => <li key={output}><span>{String(index + 1).padStart(2, "0")}</span><strong>{output}</strong></li>)}</ol>
          </section>

          <section className="pack-reference-section" id="workstreams">
            <header><span>03</span><h2 id="workstreams-heading">Execution plan</h2><p>Each workstream owns separate files.</p></header>
            <div className="pack-table-scroll">
              <table className="pack-reference-table pack-workstream-table" aria-labelledby="workstreams-heading">
                <caption className="sr-only">Workstreams, dependencies, invoked skills, owned files, and execution briefs for {pack.name}</caption>
                <thead><tr><th>Workstream</th><th>Depends on</th><th>Invokes</th><th>Owns</th><th>Brief</th></tr></thead>
                <tbody>
                  {pack.workstreams.map((stream) => <tr key={stream.id}><th scope="row"><strong>{stream.name}</strong></th><td>{stream.dependsOn?.length ? stream.dependsOn.map((dependency) => <code key={dependency}>{dependency}</code>) : <span>None</span>}</td><td>{stream.skills.map((skill) => <code key={skill}>${skill}</code>)}</td><td>{stream.owns.map((item) => <code key={item}>{item}</code>)}</td><td>{stream.brief}</td></tr>)}
                </tbody>
              </table>
            </div>
            {pack.remix ? <div className="pack-review-callout"><span>REMIX</span><div><code>{pack.remix.candidateCount} directions</code><code>{pack.remix.decisionPath}</code></div><p>Possible derives project-specific directions after product truth is known, then records one decision before dependent implementation begins. The outcome contract does not change.</p></div> : null}
            {pack.chainEntry?.length ? <div className="pack-review-callout"><span>CHAIN ENTRY</span><div>{pack.chainEntry.map((requirement) => <code key={requirement.id}>{requirement.id}</code>)}</div><p>A prior outcome may hand work to this pack only after fresh review proves every entry requirement. The user approves this stage separately.</p></div> : null}
            {pack.chainExit ? <div className="pack-review-callout"><span>CHAIN EXIT</span><div><code>{pack.chainExit.receiptPath}</code></div><p>Receipt status decides whether a later outcome may be proposed, paused, or stopped. Completion never pre-approves the next stage.</p></div> : null}
            <div className="pack-review-callout"><span>INDEPENDENT REVIEW</span><div>{pack.reviewSkills.map((skill) => <code key={skill}>${skill}</code>)}</div><p>A verifier checks the integrated outcome. It reports evidence, failures, skipped checks, and unsupported claims.</p></div>
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
            <header><span>08</span><h2>Verification</h2><p>Completion requires evidence. Missing or skipped proof stays visible.</p></header>
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

function ExampleModal({ example, onDismiss }: { example: PossibleExample; onDismiss: () => void }) {
  const closeRef = useRef<HTMLAnchorElement>(null);
  const modalRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        document.body.style.overflow = previousOverflow;
        window.history.replaceState({}, "", "/examples");
        onDismiss();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(modalRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])',
      ) ?? []);
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
  }, [onDismiss]);

  return (
    <div className="example-modal-backdrop">
      <section ref={modalRef} className="example-modal" role="dialog" aria-modal="true" aria-labelledby="example-modal-title">
        <header><span>{example.outcomeLabel}</span><a ref={closeRef} href="/examples" aria-label="Close example">CLOSE ×</a></header>
        <div className="example-modal-layout">
          <div className="example-modal-preview" role="region" aria-label="Preview">
            {example.visual.kind === "embed"
              ? <iframe src={example.visual.src} title={`${example.name} interactive preview`} />
              : <img src={example.visual.src} alt={example.visual.alt} style={{ objectFit: example.visual.fit, objectPosition: example.visual.position }} />}
          </div>
          <article>
            <p className="eyebrow">{example.projectLabel}</p>
            <h1 id="example-modal-title">{example.name}</h1>
            <div className="example-modal-details">
              <section aria-label="Description"><span>Description</span><p>{example.description}</p></section>
              <section aria-label="Outcome Pack"><span>Outcome Pack</span><p><a href={example.demo.packs[0].href}>{example.outcomeLabel} ↗</a></p></section>
            </div>
            <section className="example-modal-outputs" aria-label="Outputs produced">
              <span>OUTPUTS PRODUCED</span>
              <div>
                {example.demo.artifacts.filter((output) => output.showcase !== false).slice(0, 3).map((output, index) => (
                  <a className="example-modal-output" href={output.href} key={output.title}>
                    <small>{String(index + 1).padStart(2, "0")}</small>
                    <strong>{output.title}</strong>
                    <p>{output.description}</p>
                    <i>{output.label ?? "Open output"} ↗</i>
                  </a>
                ))}
              </div>
            </section>
            <footer><a href={example.primaryOutput.href}><span>OPEN OUTCOME</span><strong>{example.primaryOutput.label} ↗</strong></a><a href={example.demoHref}><span>SEE HOW POSSIBLE MADE THIS</span><strong>Open process record ↗</strong></a></footer>
          </article>
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
          <p>Finished things made with Possible. Open one to see the outcome; follow its process link only when you want the full run.</p>
        </section>
        <section className="examples-grid" aria-label="Possible examples">
          {exampleCatalog.map((example) => <ExampleCard key={example.slug} example={example} />)}
        </section>
        <SiteFooter />
      </div>
      {visibleExample ? <ExampleModal example={visibleExample} onDismiss={() => setModalDismissed(true)} /> : null}
    </main>
  );
}

function DemoIndexPage() {
  return (
    <main className="demo-index-page">
      <SiteNav label="Demos" />
      <section className="demo-index-intro" aria-labelledby="demo-index-heading">
        <p className="eyebrow">HOW THE OUTCOMES WERE MADE</p>
        <h1 id="demo-index-heading">The process,<br /><em>not another gallery.</em></h1>
        <p>Examples show the finished things. Demos show the request, conversation, Outcome Pack, compiled work, artifacts, verification, and evidence behind each one.</p>
      </section>
      <section className="demo-index-list" aria-label="Possible demo records">
        {exampleCatalog.map((example, index) => (
          <a href={example.demoHref} key={example.slug} aria-label={example.name}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><small>{example.demo.runKind === "preserved-run" ? "PRESERVED RUN" : "REFERENCE BUILD"}</small><h2>{example.name}</h2><p>{example.demo.summary}</p></div>
            <strong>VIEW PROCESS ↗</strong>
          </a>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}

function DemoPage({ example }: { example: PossibleExample }) {
  const { demo } = example;
  return (
    <main className={`demo-template demo-template--${example.slug}`} id="top" data-demo-template="outcome-process-v1">
      <SiteNav label={`Demo / ${example.name}`} />

      <section className="demo-template-hero" aria-labelledby="demo-template-heading">
        <div>
          <p className="eyebrow">{demo.runKind === "preserved-run" ? "PRESERVED POSSIBLE RUN" : "OUTCOME PACK REFERENCE BUILD"}</p>
          <h1 id="demo-template-heading">How <em>{example.name}</em><br />was made.</h1>
          <p>{demo.summary}</p>
          <div><a className="button-link" href={example.primaryOutput.href}>Open outcome <span>↗</span></a><a className="text-link" href={`/examples/${example.slug}`}>View example ↗</a></div>
        </div>
        {example.visual.kind === "image"
          ? <img src={example.visual.src} alt={example.visual.alt} />
          : <div className="demo-template-playable" aria-label={example.visual.alt}><span>PLAYABLE OUTCOME</span><strong>{example.name}</strong></div>}
      </section>

      <section className="demo-template-section demo-template-request" aria-label="Original request">
        <header><span>01</span><h2>Original request</h2></header>
        <blockquote>“{demo.request}”</blockquote>
      </section>

      <section className="demo-template-section demo-template-conversation" aria-label="$possible conversation">
        <header><span>02</span><h2>$possible conversation</h2><p>{demo.conversationNote}</p></header>
        {demo.conversation.length ? (
          <div className="demo-template-thread">
            {demo.conversation.map((message, index) => <p key={`${message.speaker}-${index}`}><strong>{message.speaker}</strong><span>{message.text}</span></p>)}
          </div>
        ) : (
          <aside className="demo-template-missing"><strong>NOT RECORDED</strong><p>{demo.conversationNote}</p></aside>
        )}
      </section>

      <section className="demo-template-section demo-template-packs" aria-label="Recommended Outcome Pack">
        <header><span>03</span><h2>{demo.packs.length > 1 ? "Recommended Outcome Chain" : "Recommended Outcome Pack"}</h2></header>
        <div className="demo-template-grid">
          {demo.packs.map((pack, index) => (
            <a href={pack.href} key={pack.name}><small>{String(index + 1).padStart(2, "0")} / OUTCOME PACK</small><h3>{pack.name}</h3><p>{pack.role}</p><strong>OPEN PACK ↗</strong></a>
          ))}
        </div>
      </section>

      <section className="demo-template-section demo-template-workstreams" aria-label="Compiled workstreams">
        <header><span>04</span><h2>Compiled workstreams</h2><p>The pack expands the request into owned, ordered work the user did not need to enumerate.</p></header>
        <ol className="demo-template-grid">
          {demo.workstreams.map((item, index) => <li key={item.title}><small>{String(index + 1).padStart(2, "0")}</small><h3>{item.title}</h3><p>{item.description}</p></li>)}
        </ol>
      </section>

      <section className="demo-template-section demo-template-artifacts" aria-label="Outcome artifacts">
        <header><span>05</span><h2>Outcome artifacts</h2><p>The finished, inspectable outputs from this outcome.</p></header>
        <div className="demo-template-grid">
          {demo.artifacts.map((item, index) => (
            <article key={item.title}><small>{String(index + 1).padStart(2, "0")} / ARTIFACT</small><h3>{item.title}</h3><p>{item.description}</p>{item.href ? <a href={item.href}>{item.label ?? "Open artifact"} ↗</a> : null}</article>
          ))}
        </div>
      </section>

      <section className="demo-template-section demo-template-verification" aria-label="Verification, repair, and pass">
        <header><span>06</span><h2>Verification, repair, and pass</h2><p>{demo.runKind === "preserved-run" ? "Completion remained withheld until the recorded review finished." : "Only preserved review evidence is shown; missing run evidence is stated explicitly."}</p></header>
        <ol>
          {demo.verification.map((item, index) => (
            <li className={item.tone ? `is-${item.tone}` : undefined} key={item.title}><small>{String(index + 1).padStart(2, "0")}</small><div><h3>{item.title}</h3><p>{item.description}</p>{item.href ? <a href={item.href}>{item.label ?? "Open evidence"} ↗</a> : null}</div></li>
          ))}
        </ol>
      </section>

      <section className="demo-template-section demo-template-evidence" aria-label="Evidence">
        <header><span>07</span><h2>Evidence</h2><p>Open the underlying records instead of taking the page’s claims on trust.</p></header>
        <div className="demo-template-grid">
          {demo.evidence.map((item, index) => (
            <a href={item.href} key={item.title}><small>{String(index + 1).padStart(2, "0")} / EVIDENCE</small><h3>{item.title}</h3><p>{item.description}</p><strong>{item.label ?? "Open evidence"} ↗</strong></a>
          ))}
        </div>
        <aside><strong>SCOPE BOUNDARY</strong><p>{demo.boundary}</p></aside>
      </section>

      <footer className="demo-template-footer"><a href="/examples">View all outcomes ←</a><a href="/demo">View all process records →</a></footer>
    </main>
  );
}

function DocsSidebar({ active }: { active: "overview" | "how-to-use" }) {
  return (
    <aside className="docs-sidebar" aria-label="Documentation navigation">
      <div className="docs-sidebar-title"><strong>Documentation</strong><span>V0.1</span></div>
      <nav aria-label="Getting started">
        <span>GETTING STARTED</span>
        <a className={active === "overview" ? "is-active" : undefined} href="/docs">Overview</a>
        <a className={active === "how-to-use" ? "is-active" : undefined} href="/docs/how-to-use">How to use Possible</a>
        <a href="/docs#installation">Installation</a>
        <a href="/docs#invoke">Invoke Possible</a>
      </nav>
      <nav aria-label="Core workflow">
        <span>CORE WORKFLOW</span>
        <a href="/docs#brainstorm">Brainstorm</a>
        <a href="/docs#recommend">Recommendation</a>
        <a href="/docs#confirm">Confirmation</a>
        <a href="/docs#execute">Execution</a>
      </nav>
      <nav aria-label="Reference">
        <span>REFERENCE</span>
        <a href="/docs#glossary">Glossary</a>
        <a href="/docs#files">Project files</a>
        <a href="/docs#safety">Safety boundary</a>
        <a href="/docs#troubleshooting">Troubleshooting</a>
        <a href="/packs">Outcome Pack library ↗</a>
      </nav>
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
            <p>Possible.sh is an open-source library of Outcome Packs for Codex. The installed <code>$possible</code> skill understands your request, recommends the right Outcome Pack, and runs it after approval—even when you do not know all the work required.</p>
          </header>

          <aside className="docs-callout docs-callout--info">
            <strong>THE SHORT VERSION</strong>
            <p>Install <code>$possible</code> once. Describe what you want to make. The skill finds the right Outcome Pack with you.</p>
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

          <section id="glossary">
            <h2>Glossary</h2>
            <p>Possible uses a small set of terms to separate the result you want from the work an agent performs.</p>
            <aside className="docs-outcome-definition">
              <span>OUTCOME</span>
              <strong>An observable end state that can be checked—not an activity the agent performs.</strong>
              <p>In practice: what should exist, who it is for, the constraints that matter, and the evidence required to call it complete.</p>
            </aside>
            <div className="docs-outcome-example" aria-label="Task and outcome example">
              <div><span>TASK</span><p>Build a landing page.</p></div>
              <div><span>OUTCOME</span><p>A responsive launch page for the confirmed audience, using approved claims, with one complete conversion flow and passing accessibility checks.</p></div>
            </div>
            <dl className="docs-glossary">
              <div><dt>Outcome</dt><dd>A specific end state the user wants to make true. One outcome can require many tasks.</dd></div>
              <div><dt>Task</dt><dd>One action taken toward an outcome. A task describes work; it does not define success.</dd></div>
              <div><dt>Possible.sh</dt><dd>The open-source library of Outcome Packs, documentation, examples, and evidence.</dd></div>
              <div><dt>$possible</dt><dd>The installed agent skill that understands a request, recommends an Outcome Pack, and runs it after approval.</dd></div>
              <div><dt>Outcome Pack</dt><dd>A reusable execution prompt, selected agent skills, sequencing, safeguards, and completion checks for one class of outcomes.</dd></div>
              <div><dt>Creative direction</dt><dd>A project-specific visual system derived from its audience, product truth, evidence, assets, and constraints.</dd></div>
              <div><dt>Remix</dt><dd>Reconsider how an outcome is expressed without changing its promised facts, safeguards, product behavior, or definition of done.</dd></div>
              <div><dt>Outcome Chain</dt><dd>A conditional sequence of independently verified Outcome Packs. Each stage is approved separately and advances only when its evidence satisfies the next pack.</dd></div>
              <div><dt>Stable pack</dt><dd>An Outcome Pack backed by a preserved end-to-end run and independent verification.</dd></div>
              <div><dt>Experimental pack</dt><dd>An Outcome Pack available to inspect and test before equivalent preserved evidence exists.</dd></div>
              <div><dt>Agent skill</dt><dd>A reusable capability that performs focused work during a run.</dd></div>
              <div><dt>Run</dt><dd>One approved Outcome Pack applied to one project.</dd></div>
              <div><dt>Workstream</dt><dd>A bounded part of the outcome with named inputs, outputs, ownership, and checks. Independent workstreams may run in parallel.</dd></div>
              <div><dt>Outcome brief</dt><dd>The durable record of the confirmed intent, audience, current reality, constraints, acceptance checks, gates, and unknowns.</dd></div>
              <div><dt>Acceptance check</dt><dd>A concrete condition the finished work must satisfy. It turns “done” into something inspectable.</dd></div>
              <div><dt>Verification</dt><dd>The tests, review, measurements, or inspected evidence used to determine whether the promised end state is true.</dd></div>
              <div><dt>Completion report</dt><dd>The final evidence and status: artifacts created, checks passed or failed, limitations, unproven claims, and external actions not taken.</dd></div>
              <div><dt>External action</dt><dd>A real-world change—such as deploying, publishing, spending, outreach, or fabrication—that requires separate approval.</dd></div>
            </dl>
          </section>

          <section id="brainstorm">
            <h2>Brainstorm the outcome</h2>
            <p>You do not need a finished brief. Describe the idea in your own words. Possible reflects what it heard and asks one useful question per turn until the desired end state is clear enough to recommend a path.</p>
            <div className="docs-do-dont">
              <div><strong>DURING INTAKE</strong><ul><li>Reflect the user&apos;s intent</li><li>Ask one question at a time</li><li>Preserve assumptions as assumptions</li></ul></div>
              <div><strong>NOT DURING INTAKE</strong><ul><li>Name or install an Outcome Pack</li><li>Edit files or create state</li><li>Spawn specialists</li></ul></div>
            </div>
          </section>

          <section id="recommend">
            <h2>Review the recommendation</h2>
            <p><code>$possible</code> recommends one primary Outcome Pack and links its public specification. Every recommendation should answer four questions:</p>
            <ol>
              <li><strong>What does Possible think you want to make?</strong><span>A concise outcome statement and any material assumptions.</span></li>
              <li><strong>Why does this Outcome Pack fit?</strong><span>A link to its specification and a short explanation.</span></li>
              <li><strong>What will exist afterward?</strong><span>Concrete outputs and the most important acceptance checks.</span></li>
              <li><strong>What remains unauthorized?</strong><span>External actions and claims that still require separate approval.</span></li>
            </ol>
            <a className="docs-reference-link" href="/packs/hardware-launch"><span>EXAMPLE OUTCOME PACK</span><strong>Hardware Launch</strong><i>View specification →</i></a>
          </section>

          <section id="confirm">
            <h2>Confirm before execution</h2>
            <p><code>$possible</code> waits for direct confirmation such as “yes, proceed,” “use this Outcome Pack,” or “go ahead.” A question, correction, or enthusiastic reaction is not confirmation.</p>
            <aside className="docs-callout docs-callout--approval">
              <strong>WHAT “YES” AUTHORIZES</strong>
              <p>{approvalDisclosure}</p>
            </aside>
            <p>If the recommendation is wrong, correct the understanding and continue the conversation. Possible should recommend again instead of defending the first answer.</p>
          </section>

          <section id="execute">
            <h2>Run the Outcome Pack</h2>
            <p>After confirmation, Codex coordinates the run:</p>
            <ol>
              <li><strong>Inspect and install</strong><span>Resolve the Outcome Pack&apos;s agent skills and detect optional agent plugins without pretending to install them.</span></li>
              <li><strong>Write shared state</strong><span>Record the confirmed brief, exact Outcome Pack snapshot, and resolved skill versions.</span></li>
              <li><strong>Coordinate workstreams</strong><span>Run independent specialist work in parallel where appropriate.</span></li>
              <li><strong>Integrate and verify</strong><span>Combine artifacts, run acceptance checks, and assign a fresh reviewer.</span></li>
            </ol>
            <a className="docs-text-link" href="/demo/still">See a complete recorded Hardware Launch run →</a>
          </section>

          <section id="files">
            <h2>Project files</h2>
            <p>Possible creates outcome state only after confirmation.</p>
            <div className="docs-table" role="table" aria-label="Possible project files">
              <div role="row"><strong role="columnheader">Path</strong><strong role="columnheader">Purpose</strong></div>
              <div role="row"><code role="cell">.possible/outcome-brief.md</code><span role="cell">Confirmed intent, constraints, interfaces, acceptance checks, gates, and unknowns.</span></div>
              <div role="row"><code role="cell">.possible/pack.json</code><span role="cell">The exact Outcome Pack snapshot approved for this run.</span></div>
              <div role="row"><code role="cell">.possible/skills-lock.json</code><span role="cell">Resolved sources, revisions, paths, and content hashes.</span></div>
            </div>
          </section>

          <section id="safety">
            <h2>Safety boundary</h2>
            <p>Outcome Pack approval authorizes local project work. It never grants real-world permission.</p>
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
              <details><summary>The recommended Outcome Pack lists @sites, but it is unavailable</summary><p>Sites is an optional OpenAI plugin, not a Skills CLI dependency. Possible records that it is unavailable and uses a reviewed provider fallback when one is compatible and authorized; otherwise its completion report marks deployment as blocked.</p></details>
              <details><summary>The recommended Outcome Pack feels wrong</summary><p>Do not confirm it. Correct Possible&apos;s understanding or continue brainstorming until the recommendation matches the outcome you actually want.</p></details>
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
          <a href="#glossary">Glossary</a>
          <a href="#brainstorm">Brainstorm</a>
          <a href="#recommend">Recommendation</a>
          <a href="#confirm">Confirmation</a>
          <a href="#execute">Execution</a>
          <a href="#files">Project files</a>
          <a href="#safety">Safety boundary</a>
          <a href="#troubleshooting">Troubleshooting</a>
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
              <li><strong>Review the recommendation</strong><span>Check the stated outcome, proposed Outcome Pack, expected outputs, acceptance checks, assumptions, and actions that remain gated.</span></li>
              <li><strong>Confirm—or revise</strong><span>Say “yes, proceed” only when the recommendation is right. Otherwise, correct it and continue the conversation.</span></li>
              <li><strong>Review the evidence</strong><span>Inspect the artifacts, verification results, limitations, and completion report. Approve any external action separately.</span></li>
            </ol>
          </section>

          <section id="possible">
            <h2>What Possible does</h2>
            <p>This behavior comes from the installed skill. You do not need to manually instruct the agent through these steps.</p>
            <ol className="docs-responsibility-list">
              <li><strong>Listen before selecting</strong><span><code>$possible</code> reflects the ambition and clarifies material unknowns before mentioning an Outcome Pack or beginning work.</span></li>
              <li><strong>Inspect what already exists</strong><span>When useful, it performs a read-only project check so the recommendation reflects the actual starting point.</span></li>
              <li><strong>Define the outcome</strong><span>It states the observable end condition, intended audience, constraints, acceptance checks, assumptions, and unknowns.</span></li>
              <li><strong>Recommend one Outcome Pack</strong><span>It explains why the Outcome Pack fits, what it should produce, how success will be checked, and what remains unauthorized.</span></li>
              <li><strong>Wait for explicit confirmation</strong><span>A question, correction, reaction, or silence does not authorize execution.</span></li>
              <li><strong>Assemble the capabilities</strong><span>After approval, it installs reviewed agent skills, records the approved Outcome Pack and versions, and creates shared outcome state.</span></li>
              <li><strong>Coordinate the work</strong><span>It assigns bounded workstreams, keeps them aligned to the same brief, and integrates their outputs.</span></li>
              <li><strong>Verify before declaring success</strong><span>It runs acceptance checks, uses fresh review where appropriate, and returns a completion report with failures, limitations, and unproven claims.</span></li>
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

          <section id="remix-and-chain">
            <h2>Remix and chain outcomes</h2>
            <p><strong>Remix changes the expression.</strong> A supporting pack can derive three project-specific creative directions from the audience and product truth, then select or ask about the choice before implementation. The promised outcome and its checks stay fixed.</p>
            <p><strong>Chain changes the next outcome.</strong> For example, Software Opportunity Discovery can lead to Working Web App, then Developer Project Launch. Possible shows <strong>NOW / IF THIS PASSES / LATER</strong>; it verifies each handoff and asks for separate approval before the next stage.</p>
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
              <li><span>YOU</span><strong>External decisions</strong></li>
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
            <a href="/packs">Explore Outcome Packs <b>→</b></a>
          </nav>
        </article>

        <aside className="docs-toc" aria-label="On this page">
          <span>ON THIS PAGE</span>
          <a href="#human">For the human</a>
          <a href="#possible">What Possible does</a>
          <a href="#goal-and-possible">Use with /goal</a>
          <a href="#remix-and-chain">Remix and chain</a>
          <a href="#handshake">The handshake</a>
          <a href="#approval">Approval boundary</a>
        </aside>
      </div>
      <SiteFooter />
    </main>
  );
}

function NotFoundPage() {
  return (
    <main>
      <SiteNav label="Not found" />
      <section className="not-found">
        <p className="eyebrow">404 / OUTCOME NOT FOUND</p>
        <h1>This outcome is<br /><em>not here.</em></h1>
        <a className="button-link" href="/demo">Browse the demos <span>→</span></a>
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
    claim: "Each demo presents the outcome beside its proof.",
    fact: "The demo gallery exposes five finished outcomes; each links to an honest preserved-run or reference-build record.",
    significance: "Judges can inspect the work before opening the process and evidence behind it.",
    href: "/demo",
    evidence: "Demo gallery",
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
  { step: "INTAKE", detail: "The confirmed brief records facts, constraints, required outputs, and acceptance checks.", href: "/demo/still/PRODUCT-BRIEF.md", evidence: "Confirmed brief" },
  { step: "COMPILE", detail: "The generated prompt assigns site, film, and CAD ownership before execution.", href: "https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/still/CODEX-THREAD.md#run-prompt", evidence: "Compiled workstreams" },
  { step: "FAIL", detail: "The first browser trace preserves the integrated site's asset-path 404s.", href: "/demo/still/verification/browser-results-initial-failure.json", evidence: "Failed trace" },
  { step: "REPAIR", detail: "The fresh-review receipt records the relative-base fix and mandatory rerun.", href: "/demo/still/evidence/final-receipt.md", evidence: "Repair receipt" },
  { step: "PASS", detail: "The outcome receipt records the post-repair browser pass, 58/58 audit, and remaining limits.", href: "/demo/still/OUTCOME-RECEIPT.md", evidence: "Completion receipt" },
] as const;

function JudgingPage() {
  return (
    <main className="judging-page">
      <SiteNav label="Judging evidence" />
      <article className="judging-document">
        <header className="judging-hero">
          <p className="eyebrow">OPENAI BUILD WEEK / DEVELOPER TOOLS</p>
          <h1>One rough idea.<br /><em>A verified outcome.</em></h1>
          <p>A robotics novice asked for a robot snake. Possible supplied the missing engineering work, coordinated the run, and verified the result.</p>
          <div><a href="/demo/robot-snake">Open Robot Snake <span>↗</span></a><a href="https://github.com/fraylabs/possible/blob/main/BUILD-WEEK.md" target="_blank" rel="noreferrer">Build Week record <span>↗</span></a><a href="https://github.com/fraylabs/possible" target="_blank" rel="noreferrer">Inspect GitHub <span>↗</span></a></div>
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
  if (path === "/packs") return <PacksPage />;
  if (path === "/docs") return <DocsPage />;
  if (path === "/docs/how-to-use") return <HowToUsePage />;
  if (path === "/judging") return <JudgingPage />;
  if (path === "/examples") return <ExamplesPage />;
  if (path === "/demo") return <DemoIndexPage />;
  if (path.startsWith("/examples/")) {
    const example = getExample(path.slice("/examples/".length));
    return example ? <ExamplesPage activeSlug={example.slug} /> : <NotFoundPage />;
  }
  if (path === "/demo/game/play") return <Suspense fallback={<main className="plane-game-shell plane-game-loading"><span>FOLD / LOADING FLIGHT</span></main>}><PaperPlaneGame /></Suspense>;
  if (path === "/demo/hardware") return <DemoPage example={getExample("still")!} />;
  if (path === "/demo/game") return <DemoPage example={getExample("fold")!} />;
  if (path === "/demo/presentation") return <DemoPage example={getExample("web-presentation")!} />;
  if (path.startsWith("/demo/")) {
    const example = getExample(path.slice("/demo/".length));
    return example ? <DemoPage example={example} /> : <NotFoundPage />;
  }
  if (path.startsWith("/packs/")) {
    const pack = getPublishedPack(path.slice("/packs/".length));
    return pack ? <PackDetailPage pack={pack} /> : <NotFoundPage />;
  }
  return <NotFoundPage />;
}

export default PossibleSite;
