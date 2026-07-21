"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { compilePack } from "@possible/packs";
import type { OutcomePack } from "@possible/packs";
import demoThreadData from "./demo-thread.json";
import { featuredPacks, getFeaturedPack, githubUrl, installCommand } from "./public-content";

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
  { label: "DEMO", href: "/demo", external: false },
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
            <p className="build-hero-description">Possible gives Codex the workstreams, safeguards and verification needed to complete ambitious outcomes involving dozens of coordinated tasks.</p>
            <div className="build-hero-actions">
              <a className="button-link" href={githubUrl} target="_blank" rel="noreferrer">Star on GitHub <span>↗</span></a>
              <a className="text-link" href="/demo">See the outcomes ↗</a>
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
          <ol aria-label="Possible demo outcomes">
            <li><a href="/demo/hardware"><span>HARDWARE LAUNCH</span><h3>Still</h3><p>SITE · FILM · CAD</p><i>↗</i></a></li>
            <li><a href="/demo/robot-snake"><span>ROBOT PROTOTYPE</span><h3>Robot Snake</h3><p>CAD · MUJOCO · RERUN</p><i>↗</i></a></li>
            <li><a href="/demo/game"><span>PLAYABLE WEB GAME</span><h3>Fold</h3><p>THREE.JS · TOUCH · PLAY</p><i>↗</i></a></li>
            <li><a href="/demo/presentation"><span>WEB PRESENTATION</span><h3>Possible</h3><p>STORY · CODE · PRESENT</p><i>↗</i></a></li>
          </ol>
        </section>

        <div className="home-pack-index" id="packs" role="region" aria-labelledby="home-packs-heading">
          <header>
            <div>
              <span>THE TECHNICAL IDEA</span>
              <h2 id="home-packs-heading">Skills perform tasks.<br /><em>Outcome Packs coordinate the outcome.</em></h2>
            </div>
            <p>Each typed manifest compiles a reusable execution prompt, reviewed agent skills, owned workstreams, approval gates and completion checks.</p>
          </header>

          <div className="home-pack-columns" aria-hidden="true">
            <span>OUTCOME PACK</span><span>PURPOSE</span><span>CATEGORY</span><span>OPEN</span>
          </div>
          <ol aria-label="Outcome Packs Possible can recommend">
            {featuredPacks.map((pack) => (
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
  return (
    <div className="pack-art pack-art--release" aria-hidden="true">
      <i className="release-ring" /><i className="release-dot" />
      <code>README.md</code><code>CI / PASS</code><code>v1.0.0</code>
    </div>
  );
}

function PacksPage() {
  return (
    <main>
      <SiteNav label="Outcome Packs" />
      <section className="catalog-hero">
        <p className="eyebrow">FEATURED OUTCOME PACKS</p>
        <h1>Reviewed Outcome Packs.<br /><em>Recommended by $possible.</em></h1>
        <div className="catalog-intro">
          <p>Each Outcome Pack combines a reusable execution prompt, selected agent skills, sequencing, safeguards, and completion checks. Describe the outcome; <code>$possible</code> recommends the right pack.</p>
          <a className="button-link" href="/#start">Start with Possible <span>→</span></a>
        </div>
      </section>
      <section id="pack-catalog" className="pack-grid" aria-label="Featured Outcome Packs">
        {featuredPacks.map((pack) => <PackCard pack={pack} key={pack.slug} />)}
      </section>
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
            {featuredPacks.map((candidate) => (
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
                <caption className="sr-only">Workstreams, invoked skills, owned files, and execution briefs for {pack.name}</caption>
                <thead><tr><th>Workstream</th><th>Invokes</th><th>Owns</th><th>Brief</th></tr></thead>
                <tbody>
                  {pack.workstreams.map((stream) => <tr key={stream.id}><th scope="row"><strong>{stream.name}</strong></th><td>{stream.skills.map((skill) => <code key={skill}>${skill}</code>)}</td><td>{stream.owns.map((item) => <code key={item}>{item}</code>)}</td><td>{stream.brief}</td></tr>)}
                </tbody>
              </table>
            </div>
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

function DemoGalleryPage() {
  return (
    <main className="demo-gallery-page">
      <SiteNav label="Demos" />
      <h1 className="sr-only">Possible outcome demos</h1>

      <section className="demo-gallery-grid" aria-label="Possible demos and recorded examples">
        <a className="demo-example-card demo-example-card--hardware" href="/demo/hardware">
          <header><span>HARDWARE LAUNCH</span><strong>VERIFIED RUN ↗</strong></header>
          <div className="demo-example-visual demo-example-visual--hardware">
            <img src="/demo/still/hardware/still-iso.png" alt="Still e-ink focus device CAD concept" />
          </div>
          <div className="demo-example-copy">
            <p>STILL / E-INK FOCUS DEVICE</p>
            <h2>Idea to site,<br />film, and CAD.</h2>
            <p className="demo-example-transformation">A hardware novice supplied one rough idea. Possible identified and coordinated the product, website, film, CAD, safety, and verification work behind a credible launch package.</p>
            <div><span>{demoThread.agents.length} agent threads</span><span>{demoThread.messages.length} public messages</span><span>58 artifact checks</span></div>
          </div>
        </a>

        <a className="demo-example-card demo-example-card--robot" href="/demo/robot-snake">
          <header><span>ROBOT PROTOTYPE</span><strong>ISOLATED VERIFIED RUN ↗</strong></header>
          <div className="demo-example-visual demo-example-visual--robot">
            <img src="/demo/robot-snake/cad/iso.png" alt="Ten-link robot snake CAD prototype" />
            <span>CAD · URDF · MUJOCO</span>
          </div>
          <div className="demo-example-copy">
            <p>ROBOT SNAKE / DIGITAL PROTOTYPE</p>
            <h2>One rough idea.<br />A simulated robot.</h2>
            <p className="demo-example-transformation">A robotics novice asked for a robot snake. Possible supplied the mechanical, description, control, simulation, safety, and verification work required for an inspectable digital prototype.</p>
            <div><span>12 / 12 tests</span><span>186 interface checks</span><span>3 verifier repairs</span></div>
          </div>
        </a>

        <a className="demo-example-card demo-example-card--game" href="/demo/game">
          <header><span>PLAYABLE WEB GAME</span><strong>LIVE OUTCOME PROOF ↗</strong></header>
          <div className="demo-example-visual demo-example-visual--game" aria-hidden="true">
            <i className="demo-game-gate demo-game-gate--one" /><i className="demo-game-gate demo-game-gate--two" /><i className="demo-game-plane" />
            <span>POINTER</span><span>TOUCH</span><span>KEYS</span>
          </div>
          <div className="demo-example-copy">
            <p>FOLD / PAPER PLANE STORM RUN</p>
            <h2>One strange idea.<br />One game to play.</h2>
            <p className="demo-example-transformation">A creator supplied one strange idea. The Outcome Pack mapped the interaction, feel, runtime, input, and playability work needed to make it real.</p>
            <div><span>Three.js runtime</span><span>3 input modes</span><span>Play now</span></div>
          </div>
        </a>

        <a className="demo-example-card demo-example-card--presentation" href="/demo/presentation">
          <header><span>WEB PRESENTATION</span><strong>LIVE CODED DECK ↗</strong></header>
          <div className="demo-example-visual demo-example-visual--presentation">
            <img src="/presentation/possible-visual-atlas.webp" alt="Illustrations of an agent skill, execution prompt, Outcome Pack, and the Possible guide" />
          </div>
          <div className="demo-example-copy">
            <p>POSSIBLE.SH / WEB PRESENTATION</p>
            <h2>What Possible is.<br />In ten slides.</h2>
            <p className="demo-example-transformation">See how agent skills, reusable execution prompts, Outcome Packs, and <code>$possible</code> fit together—then inspect a real Robot Prototype outcome.</p>
            <div><span>10 coded slides</span><span>Keyboard + touch</span><span>Open presentation</span></div>
          </div>
        </a>
      </section>
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

      <RobotSnakeArtifacts />
      <RobotSnakeConversation />
      <DemoOutcomeFooter text="Digital prototype only. Physical locomotion, actuator suitability, fabrication readiness, and functional safety remain unproven." href="/demo/robot-snake/evidence/sim-to-real-gaps.md" linkLabel="READ THE GAPS ↗" />
    </main>
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

export function PossibleSite({ path: requestedPath }: { path?: string }) {
  const path = (requestedPath ?? (typeof window === "undefined" ? "/" : window.location.pathname)).replace(/\/+$/, "") || "/";
  if (path === "/") return <CreatePage />;
  if (path === "/packs") return <PacksPage />;
  if (path === "/docs") return <DocsPage />;
  if (path === "/docs/how-to-use") return <HowToUsePage />;
  if (path === "/demo") return <DemoGalleryPage />;
  if (path === "/demo/presentation") return <PresentationDemoPage />;
  if (path === "/demo/game/play") return <Suspense fallback={<main className="plane-game-shell plane-game-loading"><span>FOLD / LOADING FLIGHT</span></main>}><PaperPlaneGame /></Suspense>;
  if (path === "/demo/game") return <PlayableGameDemoPage />;
  if (path === "/demo/robot-snake") return <RobotSnakeDemoPage />;
  if (path === "/demo/hardware") return <HardwareDemoPage />;
  if (path.startsWith("/packs/")) {
    const pack = getFeaturedPack(path.slice("/packs/".length));
    return pack ? <PackDetailPage pack={pack} /> : <NotFoundPage />;
  }
  return <NotFoundPage />;
}

export default PossibleSite;
