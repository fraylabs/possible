import { useEffect, useState } from "react";
import { getPack, outcomePacks } from "@possible/packs";
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

const installCommand = "npx @possible/cli init";
const approvalDisclosure = "Saying yes authorizes repo-local ingredient skill installation, the shared outcome brief and state files, and local outcome work. External actions still require separate approval.";

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
      {label ? <div className="nav-meta"><span>POSSIBLE</span><strong>{label.toUpperCase()}</strong></div> : null}
      <div className="nav-links">
        <a href="/">START</a>
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

function CreatePage() {
  return (
    <main>
      <SiteNav label="Start / $possible" />

      <section className="possible-hero" id="top">
        <div className="possible-hero-copy">
          <p className="eyebrow">A CONVERSATIONAL OUTCOME COMPILER FOR CODEX</p>
          <h1>Bring the idea.<br /><em>Possible finds the path.</em></h1>
          <p>Install one skill, say <code>$possible</code>, and talk through what you want to make real. Possible recommends the right outcome pack only when it understands enough.</p>
          <a className="text-link" href="#start">Start in two commands ↓</a>
        </div>

        <div className="start-stack" id="start">
          <article className="install-card">
            <header><span>01 / INSTALL POSSIBLE</span><strong>ONE TIME</strong></header>
            <pre><code>{installCommand}</code></pre>
            <CopyButton label="Copy install command" value={installCommand} />
            <div className="install-next"><span>THEN, INSIDE CODEX</span><code>$possible</code></div>
          </article>
          <article className="conversation-card" aria-label="Example Possible conversation">
            <header><span>POSSIBLE / INTAKE</span><i>● READY</i></header>
            <p className="message message--possible"><strong>POSSIBLE</strong><span>What would you like to make possible today?</span></p>
            <p className="message message--user"><strong>YOU</strong><span>I want to make a focus device that keeps me off my phone.</span></p>
            <p className="message message--possible"><strong>POSSIBLE</strong><span>Interesting. What do you imagine someone physically doing with it?</span></p>
          </article>
        </div>
      </section>

      <section className="journey">
        <header>
          <p className="eyebrow">THE WHOLE PROCESS</p>
          <h2>No forms.<br />No pack knowledge required.</h2>
        </header>
        <ol>
          {[
            ["Install", "Add Possible to the project."],
            ["Invoke", "Type $possible in Codex."],
            ["Brainstorm", "Start rough. Possible asks one useful question at a time."],
            ["Recommend", "Possible links the outcome pack that best fits."],
            ["Confirm", "No ingredient skills install and no outcome work starts until you say yes."],
            ["Execute", "Codex coordinates the specialists and verifies the result."],
          ].map(([title, detail], index) => <li key={title}><span>0{index + 1}</span><strong>{title}</strong><p>{detail}</p></li>)}
        </ol>
      </section>

      <section className="recommendation-example">
        <div>
          <p className="eyebrow">POSSIBLE RECOMMENDS · YOU DECIDE</p>
          <h2>The pack arrives<br />after the conversation.</h2>
          <p>Possible summarizes what it heard, links the complete recipe, explains what will exist, and waits for explicit approval.</p>
        </div>
        <article>
          <header><span>RECOMMENDED OUTCOME</span><strong>01 / BEST FIT</strong></header>
          <p><span>WHAT I UNDERSTAND</span>A believable launch for a desk-sized focus device, without claiming production hardware exists.</p>
          <a href="/packs/hardware-launch"><span>USE THIS PACK</span><strong>Hardware Launch</strong><i>VIEW PACK ↗</i></a>
          <p className="approval-disclosure">{approvalDisclosure}</p>
          <div><span>PROCEED WITH THIS OUTCOME?</span><strong>Yes, proceed.</strong></div>
        </article>
      </section>

      <section className="home-pack-preview">
        <header><p className="eyebrow">THE AVAILABLE RECIPES</p><h2>Possible chooses from<br />complete outcomes.</h2><a className="button-link" href="/packs">Browse all packs <span>→</span></a></header>
        <div>{outcomePacks.map((pack, index) => <PackCard pack={pack} index={index} key={pack.slug} />)}</div>
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
        <p className="eyebrow">PACKS POSSIBLE CAN RECOMMEND / 03</p>
        <h1>Complete recipes.<br /><em>Chosen through conversation.</em></h1>
        <div className="catalog-intro">
          <p>You do not need to choose a pack before starting. Invoke <code>$possible</code>, describe the idea, and Possible will link the best fit for your approval.</p>
          <a className="button-link" href="/#start">Start with Possible <span>→</span></a>
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
          <div><span>{pack.summary}</span><a className="button-link" href="/#start">Start with $possible <b>→</b></a></div>
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

      <section className="pack-start">
        <div>
          <p className="eyebrow">HOW THIS PACK STARTS</p>
          <h2>Possible recommends it.<br />You approve it.</h2>
          <p>This page is the transparent recipe—not a form you must configure. Begin with <code>$possible</code>; after the walkthrough, Possible links this pack and waits for your confirmation.</p>
          <a className="button-link" href="/#start">Install and invoke Possible <span>→</span></a>
        </div>
        <article className="pack-recommendation">
          <header><span>POSSIBLE / RECOMMENDATION</span><strong>WAITING FOR APPROVAL</strong></header>
          <p><span>RECOMMENDED OUTCOME</span><a href={`/packs/${pack.slug}`}>{pack.name} ↗</a></p>
          <p><span>WHY IT FITS</span>{pack.promise}</p>
          <p><span>WHAT WILL EXIST</span>{pack.outputs.join(" · ")}</p>
          <p className="approval-disclosure"><span>WHAT YES AUTHORIZES</span>{approvalDisclosure}</p>
          <footer><span>PROCEED WITH THIS OUTCOME?</span><strong>Yes, proceed.</strong></footer>
        </article>
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

function DemoIntakePrelude() {
  return (
    <section className="demo-intake">
      <header>
        <div><p className="eyebrow">CURRENT ENTRY FLOW / ILLUSTRATIVE INTAKE</p><h1>Before the run,<br /><em>a conversation.</em></h1></div>
        <p>This prelude explains how Possible starts today. It is not spliced into the preserved execution log below, which begins after the pack and brief were already confirmed.</p>
      </header>
      <div className="demo-intake-grid">
        <article className="demo-intake-install"><span>SHELL / INSTALL</span><code>{installCommand}</code><i>✓ Possible installed · Next: type $possible in Codex</i></article>
        <article className="demo-intake-thread">
          <p><strong>USER</strong><span>$possible</span></p>
          <p><strong>POSSIBLE</strong><span>What would you like to make possible today? A rough idea is enough — we can brainstorm it together.</span></p>
          <p><strong>USER</strong><span>I want to make a small device that helps me focus without opening my phone.</span></p>
          <p><strong>POSSIBLE</strong><span>Interesting — it sounds like a physical focus ritual, not another app. When this is finished, what would make it feel real to you?</span></p>
          <p><strong>USER</strong><span>A believable launch: the device concept, a website, and a short product film.</span></p>
          <p className="demo-intake-recommend"><strong>POSSIBLE</strong><span>I recommend the <a href="/packs/hardware-launch">Hardware Launch pack ↗</a>. It coordinates the site, film, prototype CAD, waitlist contract, and independent review. {approvalDisclosure} Proceed with this outcome?</span></p>
          <p className="demo-intake-confirm"><strong>USER</strong><span>Yes, proceed.</span></p>
        </article>
      </div>
    </section>
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
      <DemoIntakePrelude />
      <section className="replay-stage">
        <header className="replay-title">
          <div>
            <p className="eyebrow">RECORDED EXECUTION / AFTER CONFIRMATION</p>
            <h1>After the yes,<br /><em>watch it become real.</em></h1>
          </div>
          <div className="replay-title-meta">
            <p>After the outcome was confirmed, a fresh Codex captain ran Possible’s Hardware Launch pack against the fictional Still brief. Every event and artifact below comes from that preserved execution.</p>
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
          <h2>One conversation.<br /><em>Real outputs.</em></h2>
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
