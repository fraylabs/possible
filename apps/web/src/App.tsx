"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { compilePack } from "@possible/packs";
import type { OutcomePack } from "@possible/packs";
import demoThreadData from "./demo-thread.json";
import { exampleCatalog, getExample } from "./example-content";
import type { PossibleExample } from "./example-content";
import { getPublishedPack, githubUrl, installCommand, publishedPacks } from "./public-content";

const PaperPlaneGame = lazy(() => import("./PaperPlaneGame"));
const RobotSnakeViewer = lazy(() => import("./RobotSnakeViewer"));

type CopyState = "idle" | "copied" | "failed";

type DemoThread = {
  title: string;
  runId: string;
  recordedAt: string;
  disclosure: string;
  prompt: string;
  agents: Array<{ name: string; role: string; thread: string }>;
  messages: Array<{
    timestamp: string;
    agent: string;
    role: string;
    thread: string;
    phase: string;
    message: string;
  }>;
};

const demoThread = demoThreadData as DemoThread;
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
            <h2 id="home-demo-heading">See the conversation.<br /><em>Inspect the result.</em></h2>
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

function ThreadTranscript({
  thread,
  rawHref,
  outputHref = "#artifacts",
  onClose,
}: {
  thread: DemoThread;
  rawHref: string;
  outputHref?: string;
  onClose: () => void;
}) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  const copyableThread = [
    `# ${thread.title} — Codex thread`,
    thread.disclosure,
    "## Run prompt",
    thread.prompt,
    "## Public thread",
    ...thread.messages.map((message) =>
      `### ${new Date(message.timestamp).toISOString().slice(11, 19)} UTC — ${message.agent} / ${message.role}\n${message.message}`,
    ),
  ].join("\n\n");

  async function copyThread() {
    try {
      await navigator.clipboard.writeText(copyableThread);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1600);
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <div className="thread-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="thread-panel" role="dialog" aria-modal="true" aria-labelledby="thread-title">
        <header className="thread-header">
          <div>
            <span>ACTUAL RUN LOG / {thread.runId.slice(0, 8)}</span>
            <h2 id="thread-title">The full Codex thread.</h2>
            <p>{thread.messages.length} exact public messages across {thread.agents.length} real agent threads.</p>
          </div>
          <div className="thread-header-actions">
            <button type="button" onClick={copyThread}>{copyState === "copied" ? "COPIED ✓" : copyState === "failed" ? "COPY FAILED" : "COPY THREAD"}</button>
            <a href={rawHref} target="_blank" rel="noreferrer">RAW .MD ↗</a>
            <a className="thread-output-button" href={outputHref} onClick={onClose}>SHOW OUTPUT ↓</a>
            <button className="thread-close" type="button" aria-label="Close full Codex thread" onClick={onClose}>×</button>
          </div>
        </header>

        <div className="thread-agents" aria-label="Agents in this run">
          {thread.agents.map((agent, index) => (
            <div key={agent.name} className={`thread-agent thread-agent-${index}`}>
              <i /><span>{agent.name}</span><strong>{agent.role}</strong>
            </div>
          ))}
        </div>

        <div className="thread-scroll">
          <article className="thread-prompt">
            <header><span>USER / RUN PROMPT</span><strong>{thread.title.split(" / ").at(-1)?.toUpperCase().replaceAll(" ", "-")}@1</strong></header>
            <pre>{thread.prompt}</pre>
          </article>

          <div className="thread-divider"><span>PARALLEL EXECUTION BEGINS</span><i /></div>

          {thread.messages.map((message, index) => {
            const agentIndex = thread.agents.findIndex((agent) => agent.name === message.agent);
            return (
              <article className={`thread-message thread-agent-${agentIndex}`} key={`${message.timestamp}-${message.agent}`}>
                <aside><span>{String(index + 1).padStart(2, "0")}</span><i /></aside>
                <div>
                  <header>
                    <p><strong>{message.agent}</strong><span>{message.role}</span></p>
                    <time dateTime={message.timestamp}>{new Date(message.timestamp).toISOString().slice(11, 19)} UTC</time>
                  </header>
                  <p className="thread-message-body">{message.message}</p>
                  <footer><span>{message.phase.replace("_", " ")}</span><code>{message.thread}</code></footer>
                </div>
              </article>
            );
          })}

          <div className="thread-disclosure">
            <span>EXPORT BOUNDARY</span>
            <p>{thread.disclosure}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function DemoOutcomeHeader({
  eyebrow,
  title,
  accent,
  description,
  metric,
  thread,
  onOpenThread,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  metric: string;
  thread?: DemoThread;
  onOpenThread?: () => void;
}) {
  return (
    <section className="demo-outcome-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}<br /><em>{accent}</em></h1>
      </div>
      <div className="demo-outcome-summary">
        <p>{description}</p>
        <strong><i /> {metric}</strong>
        <div>
          <a href="#artifacts"><span>01 / OUTPUT</span><b>OPEN ↓</b></a>
          <a href="#conversation"><span>02 / CONVERSATION</span><b>READ ↓</b></a>
          {thread && onOpenThread ? <button type="button" onClick={onOpenThread}><span>03 / FULL CODEX THREAD</span><b>{thread.messages.length} MESSAGES ↗</b></button> : null}
        </div>
      </div>
    </section>
  );
}

function DemoConversation({
  userIdea,
  possibleQuestion,
  userOutcome,
  packHref,
  packLabel,
  recommendation,
}: {
  userIdea: string;
  possibleQuestion: string;
  userOutcome: string;
  packHref: string;
  packLabel: string;
  recommendation: string;
}) {
  return (
    <section className="demo-conversation" id="conversation" aria-label="$possible conversation">
      <header>
        <div><p className="eyebrow">02 / CONVERSATION</p><h2>One short<br /><em>conversation.</em></h2></div>
        <p><code>$possible</code> turns a rough idea into a concrete outcome, recommends an Outcome Pack, and waits for permission. Then Codex runs it.</p>
      </header>
      <article className="demo-conversation-thread">
          <p><strong>USER</strong><span>$possible</span></p>
          <p><strong>POSSIBLE</strong><span>What would you like to make possible today? A rough idea is enough — we can brainstorm it together.</span></p>
          <p><strong>USER</strong><span>{userIdea}</span></p>
          <p><strong>POSSIBLE</strong><span>{possibleQuestion}</span></p>
          <p><strong>USER</strong><span>{userOutcome}</span></p>
          <p className="demo-conversation-recommend"><strong>POSSIBLE</strong><span>I recommend the <a href={packHref}>{packLabel} Outcome Pack ↗</a>. {recommendation} {approvalDisclosure} Proceed with this outcome?</span></p>
          <p className="demo-conversation-confirm"><strong>USER</strong><span>Yes, proceed.</span></p>
      </article>
    </section>
  );
}

function DemoOutputLabel() {
  return <p className="demo-output-label"><span>01 /</span><strong>OUTPUT</strong></p>;
}

function DemoOutcomeFooter({ text, href = "#top", linkLabel = "BACK TO TOP ↑" }: { text: string; href?: string; linkLabel?: string }) {
  return <footer className="demo-outcome-footer"><p>{text}</p><a href={href}>{linkLabel}</a></footer>;
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
        <p>“{example.roughRequest}”</p>
        <div>{example.proofMetrics.map((metric) => <span key={metric}>{metric}</span>)}</div>
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
              : <img src={example.visual.src} alt={example.visual.alt} />}
          </div>
          <article>
            <p className="eyebrow">{example.projectLabel}</p>
            <h1 id="example-modal-title">{example.name}</h1>
            <div className="example-modal-details">
              <section aria-label="Original request"><span>Original request</span><p>“{example.roughRequest}”</p></section>
              <section aria-label={example.inferenceLabel ?? "What Possible inferred"}><span>{example.inferenceLabel ?? "What Possible inferred"}</span><p>{example.inference}</p></section>
              <section aria-label={example.outcomeLabel.includes("Chain") ? "Outcome Chain" : "Outcome Pack"}><span>{example.outcomeLabel.includes("Chain") ? "Outcome Chain" : "Outcome Pack"}</span><p>{example.outcomeLabel}</p></section>
            </div>
            <section aria-label="Proof"><span>PROOF</span><ul>{example.proofMetrics.map((metric) => <li key={metric}>{metric}</li>)}</ul></section>
            <footer><a href={example.primaryOutput.href}><span>OPEN OUTPUT</span><strong>{example.primaryOutput.label} ↗</strong></a><a href={example.evidence.href}><span>INSPECT EVIDENCE</span><strong>{example.evidence.label} ↗</strong></a></footer>
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
          <p>Open any example for the request, the work its Outcome Pack supplies, the finished output, and its supporting evidence.</p>
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

function PatchProofDemoPage() {
  const evidenceRoot = "/examples/patchproof-chain/evidence";
  return (
    <main className="patchproof-record">
      <SiteNav label="Demo / PatchProof" />

      <section className="patchproof-record-hero" id="top" aria-labelledby="patchproof-record-heading">
        <div>
          <p className="eyebrow">RECORDED RUN / PATCHPROOF</p>
          <h1 id="patchproof-record-heading">How PatchProof<br />was <em>made.</em></h1>
          <p>Possible chained three separately verified outcomes: compare developer problems, build the selected browser tool, then create its local launch package through Remix.</p>
          <div className="patchproof-record-actions">
            <a className="button-link" href="/examples/patchproof-chain/product/index.html">Open the tool <span>↗</span></a>
            <a className="text-link" href="/examples/patchproof">View the example ↗</a>
          </div>
        </div>
        <dl aria-label="PatchProof run summary">
          <div><dt>OUTCOME STAGES</dt><dd>3</dd></div>
          <div><dt>AGENT MESSAGES</dt><dd>46</dd></div>
          <div><dt>REMIX DIRECTIONS</dt><dd>3</dd></div>
          <div><dt>EXTERNAL ACTIONS</dt><dd>0</dd></div>
        </dl>
      </section>

      <section className="patchproof-record-request" aria-labelledby="patchproof-request-heading">
        <header><span>00 / ORIGINAL REQUEST</span><h2 id="patchproof-request-heading">One ambition,<br /><em>without a chosen idea.</em></h2></header>
        <blockquote>“I want to discover, build, and launch a useful developer tool. I do not already know which problem is worth solving. Keep external actions local-only unless I approve them separately.”</blockquote>
        <p>This is a record of the real run—not a reconstructed chat. The transcripts retain public captain and specialist messages with UTC order, while excluding private reasoning, system instructions, user metadata, raw tool output, usage telemetry, and machine-specific paths. The hexadecimal IDs below are isolated-run revisions, not commits available in this repository; archived SHA-256 manifests verify the portable evidence.</p>
      </section>

      <section className="patchproof-record-stages" id="run-stages" aria-labelledby="patchproof-stages-heading">
        <header><span>01 / OUTCOME CHAIN</span><h2 id="patchproof-stages-heading">Evidence crossed<br /><em>every handoff.</em></h2></header>
        <ol>
          <li>
            <div className="patchproof-stage-index"><span>01</span><i aria-hidden="true">→</i></div>
            <article>
              <header><p>SOFTWARE OPPORTUNITY DISCOVERY</p><strong>COMPLETED · PURSUE</strong></header>
              <h3>Choose the problem before building the product.</h3>
              <p>Four developer-tool opportunities were compared against 21 dated sources. PatchProof scored 92/100 and advanced only as a narrow build hypothesis—not as proof of demand.</p>
              <dl><div><dt>CANDIDATES</dt><dd>4</dd></div><div><dt>SOURCES</dt><dd>21</dd></div><div><dt>ISOLATED RUN REV.</dt><dd><code>3cdefb9</code></dd></div></dl>
              <footer>
                <a href={`${evidenceRoot}/transcripts/discovery.md`}>Recorded thread ↗</a>
                <a href={`${evidenceRoot}/discovery-receipt.json`}>Decision receipt ↗</a>
                <a href={`${evidenceRoot}/discovery-verification.md`}>Independent review ↗</a>
                <a href={`${evidenceRoot}/discovery-to-product-handoff.json`}>Hashed handoff ↗</a>
              </footer>
            </article>
          </li>
          <li>
            <div className="patchproof-stage-index"><span>02</span><i aria-hidden="true">→</i></div>
            <article>
              <header><p>WORKING WEB APP</p><strong>COMPLETED · PASSED</strong></header>
              <h3>Turn supplied patch evidence into an inspectable receipt.</h3>
              <p>The local browser app derives five explicit claim states and exports deterministic Markdown and JSON. Integration and fresh review found real truth-model, fixture, UI, and chain-resume defects before passing it.</p>
              <dl><div><dt>ASSERTIONS</dt><dd>34/34</dd></div><div><dt>FIXTURES</dt><dd>12/12</dd></div><div><dt>ISOLATED RUN REV.</dt><dd><code>ae88d46</code></dd></div></dl>
              <footer>
                <a href={`${evidenceRoot}/transcripts/product.md`}>Recorded thread ↗</a>
                <a href={`${evidenceRoot}/product-receipt.json`}>Product receipt ↗</a>
                <a href={`${evidenceRoot}/product-verification.md`}>Independent review ↗</a>
                <a href={`${evidenceRoot}/product-to-launch-handoff.json`}>Hashed handoff ↗</a>
              </footer>
            </article>
          </li>
          <li>
            <div className="patchproof-stage-index"><span>03</span><i aria-hidden="true">✓</i></div>
            <article>
              <header><p>DEVELOPER PROJECT LAUNCH</p><strong>COMPLETED · LOCAL ONLY</strong></header>
              <h3>Explore the expression without changing product truth.</h3>
              <p>Three comparable directions used the same factual copy at 1440×900. Continuous Form was selected, implemented, checked in a clean room, and stopped before deployment or publication.</p>
              <dl><div><dt>DIRECTIONS</dt><dd>3</dd></div><div><dt>CLEAN VERIFY</dt><dd>12s</dd></div><div><dt>ISOLATED RUN REV.</dt><dd><code>29b6e94</code></dd></div></dl>
              <footer>
                <a href="/examples/patchproof-chain/product/launch/site/index.html">Open launch site ↗</a>
                <a href={`${evidenceRoot}/transcripts/launch.md`}>Recorded thread ↗</a>
                <a href={`${evidenceRoot}/launch-receipt.json`}>Launch receipt ↗</a>
                <a href={`${evidenceRoot}/launch-verification.md`}>Independent review ↗</a>
                <a href={`${evidenceRoot}/remix-decision.json`}>Remix decision ↗</a>
              </footer>
            </article>
          </li>
        </ol>
      </section>

      <section className="patchproof-record-remix" aria-labelledby="patchproof-remix-heading">
        <header>
          <div><span>02 / REMIX</span><h2 id="patchproof-remix-heading">Same facts.<br /><em>Three directions.</em></h2></div>
          <p>Remix changed typography, color, composition, shape language, and motion. It did not change the confirmed product behavior, claims, quickstart, or verification boundary.</p>
        </header>
        <div>
          <figure className="patchproof-remix-selected">
            <img src={`${evidenceRoot}/remix/continuous-form.png`} alt="Continuous Form PatchProof launch direction" loading="lazy" />
            <figcaption><span>01 / SELECTED</span><strong>Continuous Form</strong><p>Highest score across all six declared criteria.</p></figcaption>
          </figure>
          <figure>
            <img src={`${evidenceRoot}/remix/evidence-stamp.png`} alt="Evidence Stamp PatchProof launch direction" loading="lazy" />
            <figcaption><span>02 / EXPLORED</span><strong>Evidence Stamp</strong><p>Distinctive, with a risk of implying approval.</p></figcaption>
          </figure>
          <figure>
            <img src={`${evidenceRoot}/remix/patch-panel.png`} alt="Patch Panel PatchProof launch direction" loading="lazy" />
            <figcaption><span>03 / EXPLORED</span><strong>Patch Panel</strong><p>Expressive, with greater responsive complexity.</p></figcaption>
          </figure>
        </div>
      </section>

      <section className="patchproof-record-repairs" id="repairs" aria-labelledby="patchproof-repairs-heading">
        <header><span>03 / REPAIR RECORD</span><h2 id="patchproof-repairs-heading">Passing came<br /><em>after failure.</em></h2></header>
        <div>
          <article><span>PRODUCT CONTRACT</span><h3>Claims became derived, not self-declared.</h3><p>An early flat status model let users force a result. Integration realigned the app so missing proof resolves to <code>unsupported</code>.</p></article>
          <article><span>BROWSER FLOW</span><h3>A real import crash was caught.</h3><p>The dialog trigger lacked the DOM identifier its handler expected. The complete desktop and mobile flow was rerun after repair.</p></article>
          <article><span>TRUTH MODEL</span><h3>“1 failing” could not pass anymore.</h3><p>A contradictory log with exit code 0 exposed a parser gap. The conflict detector and regression contract were tightened.</p></article>
          <article><span>PROOF COVERAGE</span><h3>Fixtures had to prove more than results.</h3><p>All 12 fixtures now assert extracted evidence, warnings, and limitations—not only their final claim state.</p></article>
          <article><span>CHAIN INTEGRITY</span><h3>Handoffs survived a moving workspace.</h3><p>Resume and completed-chain checks were repaired to verify immutable source revisions without weakening recorded hashes.</p></article>
          <article><span>LAUNCH EVIDENCE</span><h3>Visual proof became deterministic.</h3><p>Screenshot generation, copy comparison, and creative-direction contracts were repaired before the local-only launch record was sealed.</p></article>
        </div>
      </section>

      <section className="patchproof-record-evidence" id="evidence" aria-labelledby="patchproof-evidence-heading">
        <header>
          <div><span>04 / EVIDENCE INDEX</span><h2 id="patchproof-evidence-heading">Readable first.<br /><em>Raw when needed.</em></h2></div>
          <p>The demo is the explanation layer. These files are the underlying record, copied byte-for-byte from the preserved run and checked for drift.</p>
        </header>
        <div>
          <article>
            <h3>Recorded threads</h3>
            <a href={`${evidenceRoot}/transcripts/discovery.md`}><span>Discovery</span><strong>7 messages ↗</strong></a>
            <a href={`${evidenceRoot}/transcripts/discovery.json`}><span>Discovery / raw export</span><strong>JSON ↗</strong></a>
            <a href={`${evidenceRoot}/transcripts/product.md`}><span>Working Web App</span><strong>28 messages ↗</strong></a>
            <a href={`${evidenceRoot}/transcripts/product.json`}><span>Working Web App / raw export</span><strong>JSON ↗</strong></a>
            <a href={`${evidenceRoot}/transcripts/launch.md`}><span>Project Launch</span><strong>11 messages ↗</strong></a>
            <a href={`${evidenceRoot}/transcripts/launch.json`}><span>Project Launch / raw export</span><strong>JSON ↗</strong></a>
          </article>
          <article>
            <h3>State and handoffs</h3>
            <a href={`${evidenceRoot}/request.md`}><span>Original request</span><strong>MD ↗</strong></a>
            <a href={`${evidenceRoot}/chain.json`}><span>Completed chain</span><strong>JSON ↗</strong></a>
            <a href={`${evidenceRoot}/discovery-to-product-handoff.json`}><span>Discovery → Product</span><strong>JSON ↗</strong></a>
            <a href={`${evidenceRoot}/product-to-launch-handoff.json`}><span>Product → Launch</span><strong>JSON ↗</strong></a>
          </article>
          <article>
            <h3>Receipts and reviews</h3>
            <a href={`${evidenceRoot}/discovery-receipt.json`}><span>Discovery receipt</span><strong>JSON ↗</strong></a>
            <a href={`${evidenceRoot}/product-receipt.json`}><span>Product receipt</span><strong>JSON ↗</strong></a>
            <a href={`${evidenceRoot}/launch-receipt.json`}><span>Launch receipt</span><strong>JSON ↗</strong></a>
            <a href={`${evidenceRoot}/product-repair-log.md`}><span>Product repair log</span><strong>MD ↗</strong></a>
            <a href={`${evidenceRoot}/launch-repair-log.md`}><span>Launch repair log</span><strong>MD ↗</strong></a>
          </article>
        </div>
      </section>

      <aside className="patchproof-record-boundary" aria-label="Authority boundary">
        <span>AUTHORITY BOUNDARY</span>
        <p><strong>The recorded run stopped before external launch.</strong> It did not deploy, publish, configure DNS, contact users, collect data, or spend money. Possible published this evidence copy later; that does not retroactively change the run’s local-only status.</p>
        <a href={`${evidenceRoot}/launch-receipt.json`}>Inspect the external gate ↗</a>
      </aside>

      <DemoOutcomeFooter text="The finished tool belongs in Examples. This page records how Possible made it." href="/examples/patchproof" linkLabel="VIEW PATCHPROOF EXAMPLE ↗" />
      <SiteFooter />
    </main>
  );
}

function PresentationDemoPage() {
  return (
    <main className="demo-detail-page demo-detail-page--presentation" id="top">
      <SiteNav label="Live demo / Possible explainer" />
      <DemoOutcomeHeader
        eyebrow="WEB PRESENTATION / LIVE EXPLAINER"
        title="What Possible is,"
        accent="in ten slides."
        description="A coded browser deck that makes agent skills, reusable execution prompts, Outcome Packs, and the $possible guide immediately understandable."
        metric="10 SLIDES / BROWSER-TESTED"
      />

      <section className="presentation-artifacts" id="artifacts" aria-label="Outcome artifacts">
        <DemoOutputLabel />
        <header>
          <div><p className="eyebrow">LIVE / HTML · CSS · JAVASCRIPT</p><h2>The explanation<br /><em>is the output.</em></h2></div>
          <p>Navigate with arrow keys or swipe. On a phone, scroll through the complete presentation as one readable story.</p>
        </header>
        <article className="demo-site-output presentation-live-card">
          <header><span>POSSIBLE.SH / VISUAL EXPLAINER</span><strong>INTERACTIVE OUTPUT</strong></header>
          <iframe src="/presentation/possible.html" title="Possible.sh visual explainer" allow="fullscreen" />
          <footer>
            <p><strong>Ten coded slides.</strong><span>No PowerPoint, proprietary editor, or exported screenshot deck.</span></p>
            <a href="/presentation">OPEN FULLSCREEN ↗</a>
          </footer>
        </article>
      </section>

      <DemoConversation
        userIdea="I need people to understand what Possible.sh is without reading a wall of text."
        possibleQuestion="Should this be a downloadable slide file, or a live visual experience people can open in the browser?"
        userOutcome="A distinctive coded presentation with simple visuals, a clear story, and a real outcome at the end."
        packHref="/packs/web-presentation"
        packLabel="Web Presentation"
        recommendation="It coordinates the narrative, evidence, visual direction, coded deck, presenter experience, responsive behavior, and browser review."
      />

      <DemoOutcomeFooter text="Live coded demonstration. The deck is browser-tested, but this page is not presented as a preserved $possible run." href="/demo" linkLabel="BACK TO DEMOS ↑" />
    </main>
  );
}

function PlayableGameDemoPage() {
  return (
    <main className="demo-detail-page demo-detail-page--game" id="top">
      <SiteNav label="Live outcome proof / Fold" />
      <DemoOutcomeHeader
        eyebrow="PLAYABLE WEB GAME / LIVE OUTCOME PROOF"
        title="A strange idea,"
        accent="made playable."
        description="Fold is a real Three.js reference build made alongside the Playable Web Game Outcome Pack. It proves the promised output and interaction shape; it is not presented as a clean-room evaluation."
        metric="1 LOOP · 3 INPUT MODES"
      />

      <section className="demo-artifacts game-artifacts" id="artifacts" aria-label="Outcome artifacts">
        <DemoOutputLabel />
        <article className="game-live-card">
          <header><span>01 / FOLD</span><strong>THREE.JS · POINTER · TOUCH · KEYS</strong></header>
          <iframe title="Fold paper plane game" src="/demo/game/play" loading="lazy" />
          <footer><p><strong>Thread the orange.</strong><span>Move to steer. P pauses. Space starts again.</span></p><a href="/demo/game/play" target="_blank" rel="noreferrer">PLAY FULL SCREEN ↗</a></footer>
        </article>

        <div className="game-evidence-index">
          <a href="/demo/fold/game-brief.md" target="_blank" rel="noreferrer"><span>01 / BRIEF</span><strong>One-loop contract</strong><i>MD ↗</i></a>
          <a href="/demo/fold/review.md" target="_blank" rel="noreferrer"><span>02 / FAILURE</span><strong>What review caught</strong><i>MD ↗</i></a>
          <a href="/demo/fold/verification.md" target="_blank" rel="noreferrer"><span>03 / EVIDENCE</span><strong>Verification report</strong><i>MD ↗</i></a>
          <a href="/packs/playable-web-game"><span>04 / OUTCOME PACK</span><strong>Playable Web Game</strong><i>PACK ↗</i></a>
        </div>

      </section>

      <DemoConversation
        userIdea="I want to make a tiny browser game where you pilot a paper plane through a storm."
        possibleQuestion="What should a player understand in five seconds—and what single action should feel good enough to repeat?"
        userOutcome="Steer through storm gates, build a score, crash, and instantly try again. It should work with pointer, touch, or keys."
        packHref="/packs/playable-web-game"
        packLabel="Playable Web Game"
        recommendation="It coordinates the core loop, Three.js runtime, responsive controls, game feel, and an independent browser review."
      />
      <DemoOutcomeFooter text="A Playable Web Game run should finish with a game—not a design document, a framework, or a list of ideas." href="/packs/playable-web-game" linkLabel="INSPECT THE OUTCOME PACK →" />
    </main>
  );
}

function RobotSnakeDemoPage() {
  return (
    <main className="demo-detail-page demo-detail-page--robot" id="top">
      <SiteNav label="Recorded run / Robot Snake" />
      <DemoOutcomeHeader
        eyebrow="ROBOT PROTOTYPE / ISOLATED VERIFIED RUN"
        title="A robot snake,"
        accent="simulated and checked."
        description="Inspect the CAD, replay both seeded MuJoCo scenarios, open the robot descriptions, and audit the fresh-review repairs from an isolated Robot Prototype run."
        metric="12 / 12 TESTS · 186 INTERFACE CHECKS · 0 OBSTACLE CONTACTS"
      />

      <RobotSnakeComparison />
      <RobotSnakeArtifacts />
      <RobotSnakeConversation />
      <DemoOutcomeFooter text="Digital prototype only. Physical locomotion, actuator suitability, fabrication readiness, and functional safety remain unproven." href="/demo/robot-snake/evidence/sim-to-real-gaps.md" linkLabel="READ THE GAPS ↗" />
    </main>
  );
}

function RobotSnakeComparison() {
  const rows = [
    ["Mechanical CAD", "—", "STEP + GLB"],
    ["Robot description", "—", "URDF + SRDF"],
    ["Physics", "Browser kinematics", "MuJoCo"],
    ["Autonomous avoidance", "—", "Seeded + measured"],
    ["Engineering timeline", "CSV export", "3,801-frame Rerun"],
    ["Deterministic checks", "18 tests", "12 tests + 186 interfaces"],
    ["Fresh verification", "—", "3 defects repaired"],
  ];

  return (
    <section className="robot-comparison" aria-labelledby="robot-comparison-title">
      <div className="robot-comparison-intro">
        <p className="eyebrow">RECORDED COMPARISON / SAME ROUGH IDEA</p>
        <h2 id="robot-comparison-title">What did the user<br />not know to ask for?</h2>
        <p>A clean GPT-5.6 Sol task received <code>/goal I want to make a robot snake</code> and one non-expert preference. It built a strong simulator and hardware handoff. Possible supplied the missing multidisciplinary outcome contract.</p>
        <div><a href="/demo/robot-snake/control/" target="_blank" rel="noreferrer">OPEN THE CONTROL ↗</a><a href="/demo/robot-snake/CONTROL-RUN.md" target="_blank" rel="noreferrer">READ THE PROTOCOL ↗</a></div>
      </div>
      <div className="robot-comparison-table" role="table" aria-label="Robot Prototype contract comparison">
        <div className="robot-comparison-row robot-comparison-row--head" role="row"><span>PRE-EXISTING CONTRACT</span><span>/GOAL</span><span>$POSSIBLE</span></div>
        {rows.map(([requirement, control, possible]) => <div className="robot-comparison-row" role="row" key={requirement}><strong>{requirement}</strong><span>{control}</span><span>{possible}</span></div>)}
      </div>
      <p className="robot-comparison-note"><strong>The control was not weakened.</strong> It produced gait controls, collision handling, telemetry, a BOM, compiled ESP32 firmware, and 18 passing tests. The difference is the expert work the rough request never named.</p>
      <p className="robot-comparison-relationship"><code>/goal</code> sustains dynamic pursuit; Possible supplies the reviewed outcome contract.</p>
    </section>
  );
}

function RobotSnakeArtifacts() {
  return (
    <section className="demo-artifacts robot-artifacts" id="artifacts" aria-label="Outcome artifacts">
      <DemoOutputLabel />

      <article className="robot-viewer-card">
        <header><span>01 / INSPECTABLE CAD</span><strong>10 LINKS · 9 JOINTS · 945 × 55 × 35 MM</strong></header>
        <Suspense fallback={<div className="robot-viewer-loading">LOADING REVIEW GEOMETRY…</div>}>
          <RobotSnakeViewer />
        </Suspense>
        <footer>
          <p><strong>Interactive static CAD.</strong><span>Rotate the GLB in-browser or download the STEP source geometry. Verified motion appears only in the saved simulation replays below.</span></p>
          <div><a href="/demo/robot-snake/cad/robot-snake.step" download>STEP ↓</a><a href="/demo/robot-snake/cad/robot-snake.glb" download>GLB ↓</a></div>
        </footer>
      </article>

      <article className="robot-rerun-card">
        <header><span>02 / LOCAL ENGINEERING VIEWER</span><strong>RERUN · 3,801 FRAMES · VERIFIED RRD</strong></header>
        <div className="robot-rerun-layout">
          <a href="/demo/robot-snake/viewer/preview.png" target="_blank" rel="noreferrer"><img src="/demo/robot-snake/viewer/preview.png" alt="Rerun engineering viewer showing the robot snake, obstacle, sensor rays, controller state, and telemetry plots" loading="lazy" decoding="async" /></a>
          <div>
            <p className="eyebrow">PRESERVED TRAJECTORY / NO PHYSICS RERUN</p>
            <h2>Inspect the whole run<br />on one timeline.</h2>
            <p>The recording replays ten link poses, five range rays, the route, controller state, joint commands, tracking error, and range telemetry from the saved MuJoCo evidence.</p>
            <code>rerun robot-snake.rrd</code>
            <div><a href="/demo/robot-snake/viewer/robot-snake.rrd" download>DOWNLOAD RRD · 10.4 MB ↓</a><a href="/demo/robot-snake/viewer/README.md" target="_blank" rel="noreferrer">OPEN LOCAL GUIDE ↗</a><a href="/demo/robot-snake/viewer/robot-snake.manifest.json" target="_blank" rel="noreferrer">VERIFY RECORDING ↗</a></div>
          </div>
        </div>
      </article>

      <div className="robot-simulation-grid">
        <article className="robot-simulation-card robot-simulation-card--obstacle">
          <header><span>03 / SEEDED AUTONOMOUS AVOIDANCE</span><strong>SEED 42 · 190 SIM SECONDS</strong></header>
          <picture><source media="(prefers-reduced-motion: reduce)" srcSet="/demo/robot-snake/simulation/obstacle-course/contact_sheet.png" /><img src="/demo/robot-snake/simulation/obstacle-course/preview.gif" alt="MuJoCo verification replay of the robot snake detecting, clearing, and passing a cylindrical obstacle" loading="lazy" decoding="async" /></picture>
          <footer><p><strong>Detect. Detour. Rejoin.</strong><span>2.94 m forward · zero contact steps · entire body cleared.</span></p><a href="/demo/robot-snake/simulation/obstacle-course/metrics.json" target="_blank" rel="noreferrer">OPEN METRICS ↗</a></footer>
        </article>

        <article className="robot-simulation-card">
          <header><span>04 / SEEDED LOCOMOTION</span><strong>SEED 42 · 12 SIM SECONDS</strong></header>
          <picture><source media="(prefers-reduced-motion: reduce)" srcSet="/demo/robot-snake/simulation/locomotion/contact_sheet.png" /><img src="/demo/robot-snake/simulation/locomotion/preview.gif" alt="MuJoCo verification replay of the robot snake's traveling lateral wave" loading="lazy" decoding="async" /></picture>
          <footer><p><strong>Bounded traveling wave.</strong><span>0.15 m forward · commands and joint limits passed.</span></p><a href="/demo/robot-snake/simulation/locomotion/metrics.json" target="_blank" rel="noreferrer">OPEN METRICS ↗</a></footer>
        </article>
      </div>

      <section className="robot-metrics" aria-label="Verified simulation metrics">
        <p><span>OBSTACLE CONTACT</span><strong>0</strong><small>physics steps</small></p>
        <p><span>FORWARD PROGRESS</span><strong>2.94 m</strong><small>obstacle scenario</small></p>
        <p><span>MAX JOINT SPEED</span><strong>3.38</strong><small>rad/s · limit 4.0</small></p>
        <p><span>FRESH SUITE</span><strong>12 / 12</strong><small>tests passed</small></p>
      </section>

      <aside className="robot-proof-boundary">
        <span>SIMULATION BOUNDARY</span>
        <p>The model uses an explicit aggregate propulsion and steering surrogate. These replays prove the declared deterministic simulation checks—not physical locomotion, actuator suitability, fabrication readiness, manufacturability, or functional safety.</p>
        <a href="/demo/robot-snake/evidence/sim-to-real-gaps.md" target="_blank" rel="noreferrer">INSPECT EVERY GAP ↗</a>
      </aside>

      <article className="robot-cad-review">
        <header><span>05 / CAD REVIEW PACKET</span><strong>FOUR INSPECTED VIEWS</strong></header>
        <div className="demo-cad-views">
          <a href="/demo/robot-snake/cad/iso.png" target="_blank" rel="noreferrer"><figure><img src="/demo/robot-snake/cad/iso.png" alt="Isometric robot snake CAD view" loading="lazy" decoding="async" /><figcaption><span>01</span><strong>ISO</strong></figcaption></figure></a>
          <a href="/demo/robot-snake/cad/iso-opposite.png" target="_blank" rel="noreferrer"><figure><img src="/demo/robot-snake/cad/iso-opposite.png" alt="Opposite isometric robot snake CAD view" loading="lazy" decoding="async" /><figcaption><span>02</span><strong>OPPOSITE</strong></figcaption></figure></a>
          <a href="/demo/robot-snake/cad/top.png" target="_blank" rel="noreferrer"><figure><img src="/demo/robot-snake/cad/top.png" alt="Top robot snake CAD view" loading="lazy" decoding="async" /><figcaption><span>03</span><strong>TOP</strong></figcaption></figure></a>
          <a href="/demo/robot-snake/cad/front.png" target="_blank" rel="noreferrer"><figure><img src="/demo/robot-snake/cad/front.png" alt="Front robot snake CAD view" loading="lazy" decoding="async" /><figcaption><span>04</span><strong>FRONT</strong></figcaption></figure></a>
        </div>
      </article>

      <section className="demo-evidence-output robot-evidence-output" id="evidence-output">
        <header><span>06 / FRESH VERIFICATION</span><strong>THREE MATERIAL DEFECTS CAUGHT AND REPAIRED</strong></header>
        <div className="demo-verification-story">
          <p><span>01 / PRODUCED</span><strong>CAD, robot descriptions, control, and seeded simulation passed the lead agent’s first suite.</strong></p>
          <p><span>02 / WITHHELD</span><strong>Possible assigned a fresh verification-only workstream before declaring the outcome complete.</strong></p>
          <p className="is-failure"><span>03 / FAILED</span><strong>The reviewer found an unlatching safe stop, unsafe stop targets, and a hidden velocity-limit overshoot.</strong></p>
          <p><span>04 / REPAIRED</span><strong>Stop behavior was latched and frozen; physics-step measurement exposed and removed the overshoot.</strong></p>
          <p className="is-pass"><span>05 / PASSED</span><strong>The fresh suite passed 12/12 tests after regeneration. The failure history remains in the completion report.</strong></p>
        </div>
        <div>
          <a href="/demo/robot-snake/evidence/outcome-receipt.md" target="_blank" rel="noreferrer"><span>01 / COMPLETION REPORT</span><strong>Passes, repairs, skips, and limits</strong><i>MD ↗</i></a>
          <a href="/demo/robot-snake/evidence/simulation-contract.md" target="_blank" rel="noreferrer"><span>02 / CONTRACT</span><strong>What the simulation proves</strong><i>MD ↗</i></a>
          <a href="/demo/robot-snake/evidence/sim-to-real-gaps.md" target="_blank" rel="noreferrer"><span>03 / BOUNDARY</span><strong>What remains unproven</strong><i>MD ↗</i></a>
          <a href="/demo/robot-snake/model/robot-snake.urdf" target="_blank" rel="noreferrer"><span>04 / MODEL</span><strong>Generated URDF</strong><i>URDF ↗</i></a>
          <a href="/demo/robot-snake/model/robot-snake.srdf" target="_blank" rel="noreferrer"><span>05 / PLANNING</span><strong>Generated SRDF</strong><i>SRDF ↗</i></a>
          <a href="/demo/robot-snake/INTAKE-TRANSCRIPT.md" target="_blank" rel="noreferrer"><span>06 / INTAKE</span><strong>Preserved conversation</strong><i>MD ↗</i></a>
          <a href="/demo/robot-snake/simulation/obstacle-course/contact_sheet.png" target="_blank" rel="noreferrer"><span>07 / REVIEW</span><strong>Obstacle contact sheet</strong><i>PNG ↗</i></a>
          <a href="/demo/robot-snake/simulation/obstacle-course/trajectory.csv" target="_blank" rel="noreferrer"><span>08 / DATA</span><strong>Obstacle trajectory</strong><i>CSV ↗</i></a>
          <a href="/demo/robot-snake/manifest.json" target="_blank" rel="noreferrer"><span>09 / MANIFEST</span><strong>Published provenance</strong><i>JSON ↗</i></a>
        </div>
      </section>
    </section>
  );
}

function RobotSnakeConversation() {
  return (
    <section className="demo-conversation" id="conversation" aria-label="$possible conversation">
      <header>
        <div><p className="eyebrow">02 / CONVERSATION</p><h2>One rough idea.<br /><em>A bounded outcome.</em></h2></div>
        <p>The user did not choose CAD, URDF, MuJoCo, control architecture, safety behavior, or tests. Possible elicited the intended behavior and supplied the missing robotics work.</p>
      </header>
      <article className="demo-conversation-thread">
        <p><strong>USER</strong><span>$possible<br />I want to make a robot snake.</span></p>
        <p><strong>POSSIBLE</strong><span>What should it be able to do when it is finished?</span></p>
        <p><strong>USER</strong><span>Slither convincingly and navigate around obstacles on its own.</span></p>
        <p><strong>POSSIBLE</strong><span>Where should it operate, what are we starting from, and should the first proof be physical or digital?</span></p>
        <p><strong>USER</strong><span>A smooth indoor floor. Starting from scratch, only the idea. I want a convincing digital prototype I can inspect and simulate now, with a clear path toward fabricating later.</span></p>
        <p className="demo-conversation-recommend"><strong>POSSIBLE</strong><span>I recommend the <a href="/packs/robot-prototype">Robot Prototype Outcome Pack ↗</a>. It coordinates the STEP assembly, URDF/SRDF, MuJoCo simulation, controls, deterministic tests, sim-to-real gaps, and independent verification. {approvalDisclosure} Proceed with this outcome?</span></p>
        <p className="demo-conversation-confirm"><strong>USER</strong><span>Yes, proceed.</span></p>
      </article>
    </section>
  );
}

function HardwareDemoPage() {
  const [threadOpen, setThreadOpen] = useState(false);

  useEffect(() => {
    const target = new Set(["artifacts", "film-output", "hardware-output", "evidence-output", "conversation"])
      .has(window.location.hash.slice(1))
      ? document.querySelector(window.location.hash)
      : null;
    if (target) window.requestAnimationFrame(() => target.scrollIntoView());
  }, []);

  return (
    <main className="demo-detail-page" id="top">
      <SiteNav label="Recorded run / Still" />
      <DemoOutcomeHeader
        eyebrow="HARDWARE LAUNCH / VERIFIED OUTCOME"
        title="A focus device,"
        accent="made believable."
        description="Open the launch website, watch the product film, inspect every CAD view, and audit the completion reports from a preserved Hardware Launch run."
        metric="58 / 58 ARTIFACT CHECKS"
        thread={demoThread}
        onOpenThread={() => setThreadOpen(true)}
      />
      <DemoArtifacts />
      <DemoConversation
        userIdea="I want to make a small device that helps me focus without opening my phone."
        possibleQuestion="Interesting — it sounds like a physical focus ritual, not another app. When this is finished, what would make it feel real to you?"
        userOutcome="A believable launch: the device concept, a website, and a short product film."
        packHref="/packs/hardware-launch"
        packLabel="Hardware Launch"
        recommendation="It coordinates the site, film, prototype CAD, waitlist contract, and independent review."
      />
      <DemoOutcomeFooter text="Fictional concept. Nothing was deployed, fabricated, purchased, emailed, or connected to real data collection." />
      {threadOpen ? <ThreadTranscript thread={demoThread} rawHref="/demo/still/CODEX-THREAD.md" outputHref="#artifacts" onClose={() => setThreadOpen(false)} /> : null}
    </main>
  );
}

function DemoArtifacts() {
  return (
    <section className="demo-artifacts" id="artifacts" aria-label="Outcome artifacts">
      <DemoOutputLabel />
      <article className="demo-site-output">
        <header>
          <span>01 / LAUNCH WEBSITE</span>
          <a href="/demo/still/site/index.html" target="_blank" rel="noreferrer">OPEN FULL SITE ↗</a>
        </header>
        <iframe src="/demo/still/site/index.html" title="Still launch website" loading="lazy" />
        <footer><p>Responsive launch story with a deliberately local-only waitlist interaction.</p><a href="/demo/still/evidence/site-receipt.md" target="_blank" rel="noreferrer">SITE REPORT ↗</a></footer>
      </article>

      <div className="demo-output-grid">
        <article className="demo-output-card demo-output-card--film" id="film-output">
          <header><span>02 / LAUNCH FILM</span><strong>24 SEC / 1080P</strong></header>
          <video controls muted playsInline preload="metadata" poster="/demo/still/film/still-launch-preview.png" src="/demo/still/film/still-launch.mp4" />
          <footer><p>Deterministic product film with preserved review frames.</p><a href="/demo/still/evidence/film-receipt.md" target="_blank" rel="noreferrer">FILM REPORT ↗</a></footer>
        </article>

        <article className="demo-output-card demo-output-card--cad" id="hardware-output">
          <header><span>03 / PROTOTYPE CAD</span><strong>4 VIEWS / STEP-FIRST / CONCEPT</strong></header>
          <div className="demo-cad-views">
            <a href="/demo/still/hardware/still-iso.png" target="_blank" rel="noreferrer">
              <figure><img src="/demo/still/hardware/still-iso.png" alt="Isometric CAD view of the Still focus device concept" /><figcaption><span>01</span><strong>ISO</strong></figcaption></figure>
            </a>
            <a href="/demo/still/hardware/still-rear.png" target="_blank" rel="noreferrer">
              <figure><img src="/demo/still/hardware/still-rear.png" alt="Rear CAD view of the Still focus device concept" /><figcaption><span>02</span><strong>REAR</strong></figcaption></figure>
            </a>
            <a href="/demo/still/hardware/still-top.png" target="_blank" rel="noreferrer">
              <figure><img src="/demo/still/hardware/still-top.png" alt="Top CAD view of the Still focus device concept" /><figcaption><span>03</span><strong>TOP</strong></figcaption></figure>
            </a>
            <a href="/demo/still/hardware/still-front.png" target="_blank" rel="noreferrer">
              <figure><img src="/demo/still/hardware/still-front.png" alt="Front CAD view of the Still focus device concept" /><figcaption><span>04</span><strong>FRONT</strong></figcaption></figure>
            </a>
          </div>
          <footer>
            <p>Measured exterior geometry in portable review formats.</p>
            <div><a href="/demo/still/hardware/still.step" download>STEP ↓</a><a href="/demo/still/hardware/still.glb" download>GLB ↓</a><a href="/demo/still/hardware/still.stl" download>STL ↓</a><a href="/demo/still/hardware/still.py" download>SOURCE ↓</a><a href="/demo/still/evidence/geometry-report.md" target="_blank" rel="noreferrer">REPORT ↗</a></div>
          </footer>
        </article>
      </div>

      <section className="demo-evidence-output" id="evidence-output">
        <header><span>04 / EVIDENCE + VERIFICATION</span><strong>58 / 58 ARTIFACT CHECKS · 50 SUCCESSFUL BROWSER RESPONSES</strong></header>
        <div className="demo-verification-story">
          <p><span>01 / PRODUCED</span><strong>The three workstreams finished and Codex integrated the outcome.</strong></p>
          <p><span>02 / WITHHELD</span><strong>Possible assigned a fresh verification-only agent before declaring completion.</strong></p>
          <p className="is-failure"><span>03 / FAILED</span><strong>The reviewer found four 404s caused by the embedded site’s root-absolute asset paths.</strong></p>
          <p><span>04 / REPAIRED</span><strong>Codex fixed the Vite base path and rebuilt only the affected bundle.</strong></p>
          <p className="is-pass"><span>05 / PASSED</span><strong>The fresh rerun passed 50/50 browser responses; the failed trace remains public.</strong></p>
        </div>
        <div>
          <a href="/demo/still/OUTCOME-RECEIPT.md" target="_blank" rel="noreferrer"><span>01 / OUTCOME</span><strong>Completion report</strong><i>MARKDOWN ↗</i></a>
          <a href="/demo/still/evidence/final-receipt.md" target="_blank" rel="noreferrer"><span>02 / REVIEW</span><strong>Independent final report</strong><i>MARKDOWN ↗</i></a>
          <a href="/demo/still/verification/artifact-results.json" target="_blank" rel="noreferrer"><span>03 / TEST</span><strong>Artifact results</strong><i>JSON ↗</i></a>
          <a href="/demo/still/verification/browser-results.json" target="_blank" rel="noreferrer"><span>04 / TEST</span><strong>Browser results</strong><i>JSON ↗</i></a>
          <a href="/demo/still/verification/browser-results-initial-failure.json" target="_blank" rel="noreferrer"><span>05 / FAILURE</span><strong>Initial failed trace</strong><i>JSON ↗</i></a>
          <a href="/demo/still/manifest.json" target="_blank" rel="noreferrer"><span>06 / MANIFEST</span><strong>All generated files</strong><i>JSON ↗</i></a>
        </div>
      </section>

    </section>
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
            <a className="docs-text-link" href="/demo/hardware">See a complete recorded Hardware Launch run →</a>
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
    fact: "The demo gallery exposes four visual outcomes and their preserved evidence.",
    significance: "Judges can inspect the work without reading agent logs first.",
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
  if (path === "/examples" || path === "/demo") return <ExamplesPage />;
  if (path.startsWith("/examples/")) {
    const example = getExample(path.slice("/examples/".length));
    return example ? <ExamplesPage activeSlug={example.slug} /> : <NotFoundPage />;
  }
  if (path === "/demo/patchproof") return <PatchProofDemoPage />;
  if (path === "/demo/presentation") return <PresentationDemoPage />;
  if (path === "/demo/game/play") return <Suspense fallback={<main className="plane-game-shell plane-game-loading"><span>FOLD / LOADING FLIGHT</span></main>}><PaperPlaneGame /></Suspense>;
  if (path === "/demo/game") return <PlayableGameDemoPage />;
  if (path === "/demo/robot-snake") return <RobotSnakeDemoPage />;
  if (path === "/demo/hardware") return <HardwareDemoPage />;
  if (path.startsWith("/packs/")) {
    const pack = getPublishedPack(path.slice("/packs/".length));
    return pack ? <PackDetailPage pack={pack} /> : <NotFoundPage />;
  }
  return <NotFoundPage />;
}

export default PossibleSite;
