import { useEffect, useMemo, useState } from "react";
import { compilePack, getPack, outcomePacks } from "@possible/packs";
import type { OutcomePack } from "@possible/packs";
import demoThreadData from "./demo-thread.json";

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

const exampleBriefs: Record<string, string> = {
  "hardware-launch": "Create a launch for my hardware app startup.",
  "software-launch": "Prepare my SaaS product for launch.",
  "open-source-release": "Turn this repository into a trustworthy open-source release.",
};

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
    <button className="copy-button" type="button" onClick={copy}>
      <span>{state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : label}</span>
      <span aria-hidden="true">{state === "copied" ? "✓" : "↗"}</span>
    </button>
  );
}

function SiteNav({ label }: { label?: string }) {
  return (
    <nav>
      <a className="wordmark" href="/">possible<span>.sh</span></a>
      {label ? <div className="nav-meta"><span>OUTCOME PACKS</span><strong>{label.toUpperCase()}</strong></div> : null}
      <div className="nav-links">
        <a href="/">CREATE</a>
        <a href="/packs">PACKS</a>
        <a href="/demo">DEMO</a>
        <a href="https://github.com/fraylabs/possible" target="_blank" rel="noreferrer">SOURCE ↗</a>
      </div>
    </nav>
  );
}

function SiteFooter() {
  return (
    <footer>
      <a className="wordmark" href="/">possible<span>.sh</span></a>
      <strong>SKILLS ARE INGREDIENTS.<br />POSSIBLE COMPILES THE OUTCOME.</strong>
      <span>BUILDWEEK 2026</span>
    </footer>
  );
}

function PackMetrics({ pack }: { pack: OutcomePack }) {
  return (
    <div className="pack-metrics" aria-label="Pack contents">
      <div><strong>{pack.skills.length}</strong><span>specialist skills</span></div>
      <div><strong>{pack.workstreams.length}</strong><span>parallel workstreams</span></div>
      <div><strong>{pack.outputs.length}</strong><span>integrated outputs</span></div>
      <div><strong>1</strong><span>independent review</span></div>
    </div>
  );
}

function WorkstreamList({ pack }: { pack: OutcomePack }) {
  return (
    <div className="workstreams">
      {pack.workstreams.map((stream, index) => (
        <article key={stream.id}>
          <span>0{index + 1}</span>
          <div><strong>{stream.name}</strong><p>{stream.brief}</p></div>
          <small>{stream.skills.map((skill) => `$${skill}`).join(" + ")}</small>
        </article>
      ))}
      <article className="workstream-review">
        <span>0{pack.workstreams.length + 1}</span>
        <div><strong>Independent review</strong><p>Inspect the integrated result and return evidence, failures, and unproven claims.</p></div>
        <small>{pack.reviewSkills.map((skill) => `$${skill}`).join(" + ")}</small>
      </article>
    </div>
  );
}

function IngredientList({ pack }: { pack: OutcomePack }) {
  return (
    <div className="ingredient-list">
      {pack.skills.map((source, index) => (
        <a href={source.reviewUrl} target="_blank" rel="noreferrer" key={source.id}>
          <span>0{index + 1}</span>
          <div><strong>{source.name}</strong><small>{source.role}</small></div>
          <code>{source.repository}</code>
          <b>{source.reviewedRevision.slice(0, 7)} ↗</b>
        </a>
      ))}
    </div>
  );
}

function OutcomeActions({ pack, brief }: { pack: OutcomePack; brief: string }) {
  const compiled = useMemo(() => compilePack(pack), [pack]);
  const installText = compiled.installCommands.join("\n");
  const runPrompt = compiled.runPrompt.replace(
    "[Replace this line with the product, audience, constraints, and any existing repository or assets.]",
    brief.trim() || "[Add your product brief here.]",
  );

  return (
    <div className="actions">
      <article>
        <header><span>STEP 01</span><strong>Install the ingredients</strong></header>
        <pre>{installText}</pre>
        <CopyButton label="Copy install commands" value={installText} />
      </article>
      <article className="actions-run">
        <header><span>STEP 02</span><strong>Run the recipe</strong></header>
        <pre>{runPrompt}</pre>
        <CopyButton label="Copy compiled prompt" value={runPrompt} />
      </article>
    </div>
  );
}

function CreatePage() {
  const [selectedSlug, setSelectedSlug] = useState<string>(outcomePacks[0].slug);
  const selectedPack = getPack(selectedSlug) ?? outcomePacks[0];
  const [brief, setBrief] = useState(exampleBriefs[selectedSlug] ?? "");
  const [isCompiled, setIsCompiled] = useState(false);

  function compileOutcome() {
    setIsCompiled(true);
    window.setTimeout(() => {
      const target = document.querySelector("#compiled");
      if (target && typeof target.scrollIntoView === "function") {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }, 0);
  }

  function selectPack(slug: string) {
    setSelectedSlug(slug);
    setBrief(exampleBriefs[slug] ?? "");
    setIsCompiled(false);
  }

  return (
    <main>
      <SiteNav label={`${selectedPack.name} / 0${outcomePacks.indexOf(selectedPack) + 1}`} />

      <section className="composer" id="top">
        <div className="composer-copy">
          <p className="eyebrow">FOR CODEX · BUILT ON SKILLS.SH</p>
          <h1>Describe the outcome.<br /><em>Get the whole team.</em></h1>
          <p className="thesis">Possible compiles individual skills into one coordinated, verifiable run.</p>
          <a className="text-link" href="/packs">Explore all outcome packs →</a>
        </div>

        <div className="brief-card">
          <div className="pack-picker" aria-label="Choose an outcome pack">
            <span>CHOOSE AN OUTCOME</span>
            <div>
              {outcomePacks.map((pack, index) => (
                <button type="button" aria-pressed={pack.slug === selectedSlug} onClick={() => selectPack(pack.slug)} key={pack.slug}>
                  <small>0{index + 1}</small>{pack.name}
                </button>
              ))}
            </div>
          </div>
          <label htmlFor="product-brief">WHAT DO YOU WANT TO SHIP?</label>
          <textarea
            id="product-brief"
            value={brief}
            onChange={(event) => { setBrief(event.target.value); setIsCompiled(false); }}
            rows={4}
          />
          <button className="compile-button" type="button" onClick={compileOutcome} disabled={!brief.trim()}>
            <span>Compile {selectedPack.name}</span><span aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      <section className={`compiled ${isCompiled ? "compiled--ready" : ""}`} id="compiled" aria-live="polite">
        <header className="compiled-header">
          <div><p className="eyebrow">COMPILED OUTCOME</p><h2>{selectedPack.name}</h2></div>
          <span className="ready-state"><i /> {isCompiled ? "READY TO RUN" : "PACK PREVIEW"}</span>
        </header>
        <PackMetrics pack={selectedPack} />
        <WorkstreamList pack={selectedPack} />
        <div className="outputs" aria-label="Compiled outputs">
          {selectedPack.outputs.map((output) => <span key={output}>{output}</span>)}
        </div>
        <OutcomeActions pack={selectedPack} brief={brief} />
        <p className="reload-note">Install → reload Codex → paste the compiled prompt.</p>
      </section>

      <section className="ingredients">
        <div className="ingredients-title">
          <p className="eyebrow">INSPECT BEFORE INSTALL</p>
          <h2>Visible ingredients.<br />Opinionated recipe.</h2>
          <p>Skills remain owned by their source repositories. Possible owns how they work together.</p>
        </div>
        <IngredientList pack={selectedPack} />
      </section>

      <Boundary />
      <SiteFooter />
    </main>
  );
}

function PackCard({ pack, index }: { pack: OutcomePack; index: number }) {
  return (
    <a className={`pack-card pack-card--${pack.slug}`} href={`/packs/${pack.slug}`}>
      <div className="pack-cover">
        <header><span>PACK / 0{index + 1}</span><small>{pack.eyebrow}</small><b>↗</b></header>
        <PackArtwork slug={pack.slug} />
        <div className="pack-cover-title">
          <small>POSSIBLE OUTCOME</small>
          <h2>{pack.name}</h2>
        </div>
      </div>
      <div className="pack-card-body">
        <p>{pack.promise}</p>
        <div className="pack-card-stats">
          <span>{pack.skills.length} SKILLS</span>
          <span>{pack.workstreams.length} WORKSTREAMS</span>
          <span>{pack.outputs.length} OUTPUTS</span>
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
      <SiteNav label="Catalog / 03" />
      <section className="catalog-hero">
        <p className="eyebrow">CURATED OUTCOME GALLERY / 03</p>
        <h1>Outcome gallery.<br /><em>Pick what ships next.</em></h1>
        <div className="catalog-intro">
          <p>Pick what you want to ship. Possible selects the specialists, splits the work, defines the handoffs, and adds an independent review.</p>
          <a className="button-link" href="/">Create an outcome <span>→</span></a>
        </div>
      </section>
      <section className="pack-grid" aria-label="Outcome packs">
        {outcomePacks.map((pack, index) => <PackCard pack={pack} index={index} key={pack.slug} />)}
      </section>
      <section className="catalog-principle">
        <span>THE DIFFERENCE</span>
        <p>Skills.sh helps you find an ingredient. Possible gives Codex the complete recipe, the team structure, and the definition of done.</p>
      </section>
      <SiteFooter />
    </main>
  );
}

function PackDetailPage({ pack }: { pack: OutcomePack }) {
  const [brief, setBrief] = useState(exampleBriefs[pack.slug] ?? "");
  const packNumber = outcomePacks.findIndex((candidate) => candidate.slug === pack.slug) + 1;

  return (
    <main>
      <SiteNav label={`${pack.name} / 0${packNumber}`} />
      <section className="pack-hero">
        <div className="pack-breadcrumb"><a href="/packs">PACKS</a><span>/</span><strong>0{packNumber}</strong></div>
        <p className="eyebrow">{pack.eyebrow}</p>
        <h1>{pack.name}</h1>
        <div className="pack-promise">
          <p>{pack.promise}</p>
          <div><span>{pack.summary}</span><a className="button-link" href="#compile">Compile this pack <b>↓</b></a></div>
        </div>
      </section>

      <section className="pack-spec">
        <PackMetrics pack={pack} />
        <div className="detail-grid">
          <header><p className="eyebrow">THE TEAM</p><h2>Parallel specialists.<br />One integrated launch.</h2></header>
          <WorkstreamList pack={pack} />
        </div>
      </section>

      <section className="deliverables">
        <div><p className="eyebrow">WHAT YOU GET</p><h2>One run.<br />A complete outcome.</h2></div>
        <ol>
          {pack.outputs.map((output, index) => <li key={output}><span>0{index + 1}</span><strong>{output}</strong></li>)}
        </ol>
      </section>

      <section className="detail-compiler" id="compile">
        <div className="detail-compiler-intro">
          <p className="eyebrow">MAKE IT YOURS</p>
          <h2>Describe your<br />{pack.name.toLowerCase()}.</h2>
          <p>Possible turns this brief into the captain prompt that coordinates every specialist and their final review.</p>
        </div>
        <div className="detail-compiler-content">
          <label htmlFor="detail-product-brief">YOUR PRODUCT BRIEF</label>
          <textarea id="detail-product-brief" value={brief} onChange={(event) => setBrief(event.target.value)} rows={4} />
          <OutcomeActions pack={pack} brief={brief} />
          <p className="reload-note">Install → reload Codex → paste the compiled prompt.</p>
        </div>
      </section>

      <section className="ingredients detail-ingredients">
        <div className="ingredients-title">
          <p className="eyebrow">INSPECT BEFORE INSTALL</p>
          <h2>Every ingredient<br />is visible.</h2>
          <p>Each source and reviewed revision is exposed. The install resolves from its upstream repository.</p>
        </div>
        <IngredientList pack={pack} />
      </section>

      <section className="assurance">
        <div>
          <p className="eyebrow">GUARDRAILS</p>
          <ul>{pack.guardrails.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div>
          <p className="eyebrow">VERIFICATION</p>
          <ul>{pack.verification.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>
      <Boundary />
      <SiteFooter />
    </main>
  );
}

function Boundary() {
  return (
    <section className="boundary">
      <span>THE BOUNDARY</span>
      <p>A pack coordinates work. It does not authorize deployment, spending, outreach, fabrication, data collection, or unsupported claims.</p>
    </section>
  );
}

function ThreadTranscript({ onClose }: { onClose: () => void }) {
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
    `# ${demoThread.title} — Codex thread`,
    demoThread.disclosure,
    "## Run prompt",
    demoThread.prompt,
    "## Public thread",
    ...demoThread.messages.map((message) =>
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
            <span>ACTUAL RUN LOG / {demoThread.runId.slice(0, 8)}</span>
            <h2 id="thread-title">The full Codex thread.</h2>
            <p>{demoThread.messages.length} exact public messages across {demoThread.agents.length} real agent threads.</p>
          </div>
          <div className="thread-header-actions">
            <button type="button" onClick={copyThread}>{copyState === "copied" ? "COPIED ✓" : copyState === "failed" ? "COPY FAILED" : "COPY THREAD"}</button>
            <a href="/demo/still/CODEX-THREAD.md" target="_blank" rel="noreferrer">RAW .MD ↗</a>
            <a className="thread-output-button" href="#artifacts" onClick={onClose}>SHOW OUTPUT ↓</a>
            <button className="thread-close" type="button" aria-label="Close full Codex thread" onClick={onClose}>×</button>
          </div>
        </header>

        <div className="thread-agents" aria-label="Agents in this run">
          {demoThread.agents.map((agent, index) => (
            <div key={agent.name} className={`thread-agent thread-agent-${index}`}>
              <i /><span>{agent.name}</span><strong>{agent.role}</strong>
            </div>
          ))}
        </div>

        <div className="thread-scroll">
          <article className="thread-prompt">
            <header><span>USER / RUN PROMPT</span><strong>HARDWARE-LAUNCH@1</strong></header>
            <pre>{demoThread.prompt}</pre>
          </article>

          <div className="thread-divider"><span>PARALLEL EXECUTION BEGINS</span><i /></div>

          {demoThread.messages.map((message, index) => {
            const agentIndex = demoThread.agents.findIndex((agent) => agent.name === message.agent);
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
            <p>{demoThread.disclosure}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function DemoPage() {
  const events = [
    { actor: "CAPTAIN", title: "Brief locked", detail: "Confirmed facts and boundaries written to outcome-brief.md." },
    { actor: "POSSIBLE", title: "Pack compiled", detail: "Five reviewed skills composed into one Hardware Launch recipe." },
    { actor: "CAPTAIN", title: "Workstreams spawned", detail: "Site, film, and CAD assigned to isolated subagents." },
    { actor: "SUBAGENTS", title: "Artifacts returned", detail: "Three specialists returned real outputs and receipts." },
    { actor: "CAPTAIN", title: "Outcome assembled", detail: "Website, film, CAD, and evidence collected into one inspectable result." },
    { actor: "REVIEWER", title: "Failure found", detail: "Embedded site assets returned 404 when reviewed from the combined output." },
    { actor: "REVIEWER", title: "Repair verified", detail: "Relative asset base fixed; browser and artifact audits passed." },
  ] as const;
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [threadOpen, setThreadOpen] = useState(false);
  const lastStep = events.length - 1;
  const currentEvent = events[step] ?? events[0];

  useEffect(() => {
    const target = new Set(["artifacts", "film-output", "hardware-output", "evidence-output"])
      .has(window.location.hash.slice(1))
      ? document.querySelector(window.location.hash)
      : null;
    if (target) window.requestAnimationFrame(() => target.scrollIntoView());
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    if (step >= lastStep) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setStep((value) => Math.min(value + 1, lastStep)), 1900);
    return () => window.clearTimeout(timer);
  }, [isPlaying, lastStep, step]);

  function togglePlayback() {
    if (step >= lastStep) setStep(0);
    setIsPlaying((value) => !value);
  }

  return (
    <main className="replay-page" id="top">
      <SiteNav label="Recorded run / Still" />
      <section className="replay-stage">
        <header className="replay-title">
          <div>
            <p className="eyebrow">RECORDED FROM A REAL CODEX RUN</p>
            <h1>Watch the outcome<br /><em>become real.</em></h1>
          </div>
          <div className="replay-title-meta">
            <p>A fresh Codex captain ran Possible’s Hardware Launch pack against one fictional e-ink product brief. Every event and artifact below comes from that run.</p>
            <div><span><i /> LOCAL RUN COMPLETE</span><strong>58 / 58 ARTIFACT CHECKS</strong></div>
            <div className="replay-proof-actions">
              <button type="button" onClick={() => setThreadOpen(true)}>VIEW FULL CODEX THREAD <span>31 MESSAGES</span></button>
              <a href="#artifacts">SHOW OUTPUT ↓</a>
            </div>
          </div>
        </header>

        <div className="replay-window">
          <header className="replay-window-bar">
            <div><i /><i /><i /></div>
            <strong>CODEX / POSSIBLE / HARDWARE-LAUNCH</strong>
            <span>RECORDED REAL RUN</span>
          </header>

          <aside className="replay-activity">
            <header><span>CODEX ACTIVITY</span><strong>0{step + 1} / 0{events.length}</strong></header>
            <div className="replay-event-list">
              {events.map((event, index) => (
                <button
                  type="button"
                  className={index === step ? "is-current" : index < step ? "is-past" : ""}
                  aria-current={index === step ? "step" : undefined}
                  onClick={() => { setStep(index); setIsPlaying(false); }}
                  key={event.title}
                >
                  <span>0{index + 1}</span>
                  <div><small>{event.actor}</small><strong>{event.title}</strong><p>{event.detail}</p></div>
                </button>
              ))}
            </div>
            <footer>
              <button type="button" onClick={() => setThreadOpen(true)}>VIEW FULL THREAD →</button>
              <a href="/demo/still/OUTCOME-RECEIPT.md" target="_blank" rel="noreferrer">VIEW RECEIPT ↗</a>
              <a href="#artifacts">VIEW ARTIFACTS ↓</a>
            </footer>
          </aside>

          <section className={`replay-canvas replay-step-${step}`} aria-live="polite">
            <header><span>ARTIFACT CANVAS</span><strong>{currentEvent.actor} / {currentEvent.title.toUpperCase()}</strong></header>
            <div className="replay-scene">
              <article className="replay-brief-card">
                <span>OUTCOME BRIEF / STILL</span>
                <h2>Create a launch for a palm-sized e-ink focus device.</h2>
                <p>Start a focused block without opening your phone.</p>
              </article>

              <article className="replay-recipe-card">
                <header><span>POSSIBLE PACK</span><strong>HARDWARE-LAUNCH@1</strong></header>
                <div><b>5</b><span>REVIEWED<br />SKILLS</span><i>→</i><b>3</b><span>PARALLEL<br />SUBAGENTS</span><i>→</i><b>5</b><span>INTEGRATED<br />OUTPUTS</span></div>
              </article>

              <div className="replay-artifacts">
                <article className="replay-artifact replay-artifact--site">
                  <header><span>01 / SITE</span><strong>{step >= 3 ? "PASS" : "RUNNING"}</strong></header>
                  <img src="/demo/still/evidence/screenshots/embedded-site-desktop.png" alt="Still launch website produced by the site workstream" />
                  <p>Responsive launch story + local-only waitlist</p>
                </article>
                <article className="replay-artifact replay-artifact--film">
                  <header><span>02 / FILM</span><strong>{step >= 3 ? "PASS" : "RUNNING"}</strong></header>
                  <video
                    controls
                    muted
                    playsInline
                    preload="metadata"
                    poster="/demo/still/film/still-launch-preview.png"
                    src="/demo/still/film/still-launch.mp4"
                  />
                  <p>24 seconds · 1080p · deterministic Remotion source</p>
                </article>
                <article className="replay-artifact replay-artifact--cad">
                  <header><span>03 / CAD</span><strong>{step >= 3 ? "PASS*" : "RUNNING"}</strong></header>
                  <img src="/demo/still/hardware/still-iso.png" alt="Still STEP-first exterior CAD concept" />
                  <p>STEP + STL + GLB · measured geometry receipt</p>
                </article>
              </div>

              <article className="replay-integration">
                <header><span>CAPTAIN / ASSEMBLED OUTCOME</span><strong>5 OUTPUTS PRESENT</strong></header>
                <div>
                  <p><span>01</span><strong>Launch website</strong><i>PASS</i></p>
                  <p><span>02</span><strong>Launch film</strong><i>PASS</i></p>
                  <p><span>03</span><strong>Prototype CAD</strong><i>PASS*</i></p>
                  <p><span>04</span><strong>Evidence receipts</strong><i>PASS</i></p>
                  <p><span>05</span><strong>Verification traces</strong><i>PASS</i></p>
                </div>
              </article>

              <article className="replay-review-card replay-review-card--failure">
                <span>FRESH REVIEW / MATERIAL FAILURE</span>
                <h2>Embedded site assets returned 404.</h2>
                <p>The site passed alone but failed inside the integrated room. The reviewer rejected the outcome.</p>
                <a href="/demo/still/verification/browser-results-initial-failure.json" target="_blank" rel="noreferrer">OPEN FAILED TRACE ↗</a>
              </article>

              <article className="replay-review-card replay-review-card--passed">
                <span>REPAIR VERIFIED / OUTCOME COMPLETE</span>
                <h2>Real outputs.<br />Real review.</h2>
                <div>
                  <p><strong>58 / 58</strong><span>ARTIFACT CHECKS</span></p>
                  <p><strong>50 / 50</strong><span>BROWSER RESPONSES</span></p>
                  <p><strong>0</strong><span>NETWORK WRITES</span></p>
                  <p><strong>1</strong><span>FAILURE REPAIRED</span></p>
                </div>
                <div className="replay-final-actions">
                  <button type="button" onClick={() => setThreadOpen(true)}>VIEW FULL THREAD →</button>
                  <a href="#artifacts">SHOW OUTPUT ↓</a>
                </div>
              </article>
            </div>

            <footer className="replay-controls">
              <div><span>NOW PLAYING</span><strong>{currentEvent.title}</strong></div>
              <div className="replay-progress" aria-label={`Replay step ${step + 1} of ${events.length}`}>
                {events.map((event, index) => <i className={index <= step ? "is-filled" : ""} key={event.title} />)}
              </div>
              <div className="replay-buttons">
                <button type="button" aria-label="Previous event" onClick={() => { setStep((value) => Math.max(0, value - 1)); setIsPlaying(false); }} disabled={step === 0}>←</button>
                <button type="button" className="replay-play" onClick={togglePlayback}>{isPlaying ? "Pause" : step === lastStep ? "Replay" : "Play real run"}</button>
                <button type="button" aria-label="Next event" onClick={() => { setStep((value) => Math.min(lastStep, value + 1)); setIsPlaying(false); }} disabled={step === lastStep}>→</button>
              </div>
            </footer>
          </section>
        </div>
      </section>
      <DemoArtifacts />
      {threadOpen ? <ThreadTranscript onClose={() => setThreadOpen(false)} /> : null}
    </main>
  );
}

function DemoArtifacts() {
  return (
    <section className="demo-artifacts" id="artifacts">
      <header className="demo-artifacts-title">
        <div>
          <p className="eyebrow">ARTIFACTS PRODUCED</p>
          <h2>One prompt.<br /><em>Real outputs.</em></h2>
        </div>
        <div>
          <p>The output is here, inside the demo—not hidden behind another presentation layer. Open the website, play the film, download the CAD, and inspect every receipt.</p>
          <span>STILL / HARDWARE-LAUNCH@1 / LOCAL EVALUATION</span>
        </div>
      </header>

      <article className="demo-site-output">
        <header>
          <span>01 / LAUNCH WEBSITE</span>
          <a href="/demo/still/site/" target="_blank" rel="noreferrer">OPEN FULL SITE ↗</a>
        </header>
        <iframe src="/demo/still/site/" title="Still launch website" loading="lazy" />
        <footer><p>Responsive launch story with a deliberately local-only waitlist interaction.</p><a href="/demo/still/evidence/site-receipt.md" target="_blank" rel="noreferrer">SITE RECEIPT ↗</a></footer>
      </article>

      <div className="demo-output-grid">
        <article className="demo-output-card demo-output-card--film" id="film-output">
          <header><span>02 / LAUNCH FILM</span><strong>24 SEC / 1080P</strong></header>
          <video controls muted playsInline preload="metadata" poster="/demo/still/film/still-launch-preview.png" src="/demo/still/film/still-launch.mp4" />
          <footer><p>Deterministic product film with preserved review frames.</p><a href="/demo/still/evidence/film-receipt.md" target="_blank" rel="noreferrer">FILM RECEIPT ↗</a></footer>
        </article>

        <article className="demo-output-card demo-output-card--cad" id="hardware-output">
          <header><span>03 / PROTOTYPE CAD</span><strong>STEP-FIRST / CONCEPT</strong></header>
          <img src="/demo/still/hardware/still-iso.png" alt="Isometric CAD view of the Still focus device concept" />
          <footer>
            <p>Measured exterior geometry in portable review formats.</p>
            <div><a href="/demo/still/hardware/still.step" download>STEP ↓</a><a href="/demo/still/hardware/still.glb" download>GLB ↓</a><a href="/demo/still/hardware/still.stl" download>STL ↓</a></div>
          </footer>
        </article>
      </div>

      <section className="demo-evidence-output" id="evidence-output">
        <header><span>04 / EVIDENCE + VERIFICATION</span><strong>58 / 58 ARTIFACT CHECKS · 50 / 50 BROWSER CHECKS</strong></header>
        <div>
          <a href="/demo/still/OUTCOME-RECEIPT.md" target="_blank" rel="noreferrer"><span>01 / OUTCOME</span><strong>Outcome receipt</strong><i>MARKDOWN ↗</i></a>
          <a href="/demo/still/evidence/final-receipt.md" target="_blank" rel="noreferrer"><span>02 / REVIEW</span><strong>Independent final receipt</strong><i>MARKDOWN ↗</i></a>
          <a href="/demo/still/verification/artifact-results.json" target="_blank" rel="noreferrer"><span>03 / TEST</span><strong>Artifact results</strong><i>JSON ↗</i></a>
          <a href="/demo/still/verification/browser-results.json" target="_blank" rel="noreferrer"><span>04 / TEST</span><strong>Browser results</strong><i>JSON ↗</i></a>
          <a href="/demo/still/verification/browser-results-initial-failure.json" target="_blank" rel="noreferrer"><span>05 / FAILURE</span><strong>Initial failed trace</strong><i>JSON ↗</i></a>
          <a href="/demo/still/manifest.json" target="_blank" rel="noreferrer"><span>06 / MANIFEST</span><strong>All generated files</strong><i>JSON ↗</i></a>
        </div>
      </section>

      <footer className="demo-artifacts-footer">
        <p>Fictional concept. Nothing was deployed, fabricated, purchased, emailed, or connected to real data collection.</p>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>
    </section>
  );
}

function NotFoundPage() {
  return (
    <main>
      <SiteNav label="Not found" />
      <section className="not-found">
        <p className="eyebrow">404 / OUTCOME NOT FOUND</p>
        <h1>This pack is<br /><em>not possible yet.</em></h1>
        <a className="button-link" href="/packs">Browse the three packs <span>→</span></a>
      </section>
      <SiteFooter />
    </main>
  );
}

function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return <CreatePage />;
  if (path === "/packs") return <PacksPage />;
  if (path === "/demo") return <DemoPage />;
  if (path.startsWith("/packs/")) {
    const pack = getPack(path.slice("/packs/".length));
    return pack ? <PackDetailPage pack={pack} /> : <NotFoundPage />;
  }
  return <NotFoundPage />;
}

export default App;
