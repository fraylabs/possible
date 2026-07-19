import { lazy, Suspense, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getPack, outcomePacks } from "@possible/packs";
import type { OutcomePack, PackLane } from "@possible/packs";
import demoThreadData from "./demo-thread.json";
import openSourceThreadData from "./open-source-thread.json";
import softwareThreadData from "./software-thread.json";

const PaperPlaneGame = lazy(() => import("./PaperPlaneGame"));

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
const openSourceThread = openSourceThreadData as DemoThread;
const softwareThread = softwareThreadData as DemoThread;

const installCommand = "npx @fraylabs/possible init";
const approvalDisclosure = "Saying yes authorizes repo-local ingredient skill installation, the shared outcome brief and state files, and local outcome work. External actions still require separate approval.";
const laneOrder: PackLane[] = ["create", "launch", "release", "operate"];
const laneLabels: Record<PackLane, string> = {
  create: "Create",
  launch: "Launch",
  release: "Release",
  operate: "Operate",
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
      {label ? <div className="nav-meta"><span>POSSIBLE</span><strong>{label.toUpperCase()}</strong></div> : null}
      <div className="nav-links">
        <a href="/">START</a>
        <a href="/packs">PACKS</a>
        <a href="/docs">DOCS</a>
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
        <header><p className="eyebrow">THE OUTCOME LANES</p><h2>Create it. Launch it.<br />Release it. Operate it.</h2><a className="button-link" href="/packs">Browse outcome packs <span>→</span></a></header>
        <div>{outcomePacks.map((pack) => <PackCard pack={pack} key={pack.slug} />)}</div>
      </section>

      <Boundary />
      <SiteFooter />
    </main>
  );
}

function PackCard({ pack }: { pack: OutcomePack }) {
  const index = outcomePacks.findIndex((candidate) => candidate.slug === pack.slug);
  return (
    <a className={`pack-card pack-card--${pack.slug}`} href={`/packs/${pack.slug}`}>
      <div className="pack-cover">
        <header><span>PACK / 0{index + 1}</span><small>{pack.lane.toUpperCase()}</small><b>↗</b></header>
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
  if (slug === "playable-web-game") {
    return (
      <div className="pack-art pack-art--game" aria-hidden="true">
        <i className="game-flight-line" /><i className="game-plane" /><i className="game-gate game-gate--one" /><i className="game-gate game-gate--two" />
        <span>LOOP</span><span>FEEL</span><span>PLAY</span>
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
  const [activeLane, setActiveLane] = useState<"all" | PackLane>("all");
  const laneCounts = Object.fromEntries(laneOrder.map((lane) => [lane, outcomePacks.filter((pack) => pack.lane === lane).length])) as Record<PackLane, number>;
  const visibleLanes = laneOrder.filter((lane) => laneCounts[lane] > 0);
  const visiblePacks = activeLane === "all" ? outcomePacks : outcomePacks.filter((pack) => pack.lane === activeLane);
  const activeLabel = activeLane === "all" ? "All" : laneLabels[activeLane];
  const resultNoun = visiblePacks.length === 1 ? "pack" : "packs";

  return (
    <main>
      <SiteNav label="Catalog / 04" />
      <section className="catalog-hero">
        <p className="eyebrow">PACKS POSSIBLE CAN RECOMMEND / 04</p>
        <h1>Complete recipes.<br /><em>Chosen through conversation.</em></h1>
        <div className="catalog-intro">
          <p>You do not need to choose a pack before starting. Invoke <code>$possible</code>, describe the idea, and Possible will link the best fit for your approval.</p>
          <a className="button-link" href="/#start">Start with Possible <span>→</span></a>
        </div>
      </section>
      <div className="pack-filter-header">
        <span>BROWSE BY OUTCOME</span>
        <div className="pack-filters" role="group" aria-label="Filter outcome packs by lane">
          <button type="button" aria-label={`All, ${outcomePacks.length} packs`} aria-pressed={activeLane === "all"} aria-controls="pack-catalog" onClick={() => setActiveLane("all")}>
            <span>ALL</span><strong>{String(outcomePacks.length).padStart(2, "0")}</strong>
          </button>
          {visibleLanes.map((lane) => (
            <button type="button" aria-label={`${laneLabels[lane]}, ${laneCounts[lane]} ${laneCounts[lane] === 1 ? "pack" : "packs"}`} aria-pressed={activeLane === lane} aria-controls="pack-catalog" onClick={() => setActiveLane(lane)} key={lane}>
              <span>{lane.toUpperCase()}</span><strong>{String(laneCounts[lane]).padStart(2, "0")}</strong>
            </button>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">Showing {visiblePacks.length} {activeLabel} {resultNoun}.</p>
      </div>
      <section id="pack-catalog" className={`pack-grid${activeLane === "all" ? "" : " pack-grid--filtered"}${visiblePacks.length === 1 ? " pack-grid--single" : ""}`} aria-label={`${activeLabel} outcome packs`}>
        {visiblePacks.map((pack) => <PackCard pack={pack} key={pack.slug} />)}
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
        <div className="pack-breadcrumb"><a href="/packs">PACKS</a><span>/</span><strong>{pack.lane.toUpperCase()}</strong><span>/</span><strong>0{packNumber}</strong></div>
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
          <header><p className="eyebrow">THE TEAM</p><h2>Parallel specialists.<br />One integrated outcome.</h2></header>
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

type ReplayEvent = { actor: string; title: string; detail: string };

function RecordedIntakePrelude({
  eyebrow,
  title,
  accent,
  description,
  userIdea,
  possibleQuestion,
  userOutcome,
  packHref,
  packLabel,
  recommendation,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  userIdea: string;
  possibleQuestion: string;
  userOutcome: string;
  packHref: string;
  packLabel: string;
  recommendation: string;
}) {
  return (
    <section className="demo-intake">
      <header>
        <div><p className="eyebrow">{eyebrow}</p><h1>{title}<br /><em>{accent}</em></h1></div>
        <p>{description}</p>
      </header>
      <div className="demo-intake-grid">
        <article className="demo-intake-install"><span>SHELL / INSTALL</span><code>{installCommand}</code><i>✓ Possible installed · Next: type $possible in Codex</i></article>
        <article className="demo-intake-thread">
          <p><strong>USER</strong><span>$possible</span></p>
          <p><strong>POSSIBLE</strong><span>What would you like to make possible today? A rough idea is enough — we can brainstorm it together.</span></p>
          <p><strong>USER</strong><span>{userIdea}</span></p>
          <p><strong>POSSIBLE</strong><span>{possibleQuestion}</span></p>
          <p><strong>USER</strong><span>{userOutcome}</span></p>
          <p className="demo-intake-recommend"><strong>POSSIBLE</strong><span>I recommend the <a href={packHref}>{packLabel} pack ↗</a>. {recommendation} {approvalDisclosure} Proceed with this outcome?</span></p>
          <p className="demo-intake-confirm"><strong>USER</strong><span>Yes, proceed with this pack.</span></p>
        </article>
      </div>
    </section>
  );
}

function RecordedExecutionStage({
  eyebrow,
  title,
  accent,
  description,
  metric,
  packCode,
  briefTitle,
  briefDetail,
  skillCount,
  outputCount,
  events,
  artifactCards,
  integrationOutputs,
  failureTitle,
  failureDetail,
  failureHref,
  finalStats,
  thread,
  onOpenThread,
  runLabel = "RECORDED REAL RUN",
  playLabel = "Play real run",
}: {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  metric: string;
  packCode: string;
  briefTitle: string;
  briefDetail: string;
  skillCount: number;
  outputCount: number;
  events: ReplayEvent[];
  artifactCards: ReactNode;
  integrationOutputs: string[];
  failureTitle: string;
  failureDetail: string;
  failureHref: string;
  finalStats: Array<{ value: string; label: string }>;
  thread?: DemoThread;
  onOpenThread?: () => void;
  runLabel?: string;
  playLabel?: string;
}) {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const lastStep = events.length - 1;
  const currentEvent = events[step] ?? { actor: "CAPTAIN", title: "Run ready", detail: "Recorded outcome run." };

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
    <section className="replay-stage">
      <header className="replay-title">
        <div><p className="eyebrow">{eyebrow}</p><h1>{title}<br /><em>{accent}</em></h1></div>
        <div className="replay-title-meta">
          <p>{description}</p>
          <div><span><i /> LOCAL RUN COMPLETE</span><strong>{metric}</strong></div>
          <div className="replay-proof-actions">{thread && onOpenThread ? <button type="button" onClick={onOpenThread}>VIEW FULL CODEX THREAD <span>{thread.messages.length} MESSAGES</span></button> : null}<a href="#artifacts">SHOW OUTPUT ↓</a></div>
        </div>
      </header>

      <div className="replay-window">
        <header className="replay-window-bar"><div><i /><i /><i /></div><strong>CODEX / POSSIBLE / {packCode}</strong><span>{runLabel}</span></header>
        <aside className="replay-activity">
          <header><span>CODEX ACTIVITY</span><strong>0{step + 1} / 0{events.length}</strong></header>
          <div className="replay-event-list">
            {events.map((event, index) => (
              <button type="button" className={index === step ? "is-current" : index < step ? "is-past" : ""} aria-current={index === step ? "step" : undefined} onClick={() => { setStep(index); setIsPlaying(false); }} key={event.title}>
                <span>0{index + 1}</span><div><small>{event.actor}</small><strong>{event.title}</strong><p>{event.detail}</p></div>
              </button>
            ))}
          </div>
          <footer>{onOpenThread ? <button type="button" onClick={onOpenThread}>VIEW FULL THREAD →</button> : null}<a href="#artifacts">VIEW ARTIFACTS ↓</a></footer>
        </aside>

        <section className={`replay-canvas replay-step-${step}`} aria-live="polite">
          <header><span>ARTIFACT CANVAS</span><strong>{currentEvent.actor} / {currentEvent.title.toUpperCase()}</strong></header>
          <div className="replay-scene">
            <article className="replay-brief-card"><span>OUTCOME BRIEF</span><h2>{briefTitle}</h2><p>{briefDetail}</p></article>
            <article className="replay-recipe-card"><header><span>POSSIBLE PACK</span><strong>{packCode}@1</strong></header><div><b>{skillCount}</b><span>REVIEWED<br />SKILLS</span><i>→</i><b>3</b><span>PARALLEL<br />SUBAGENTS</span><i>→</i><b>{outputCount}</b><span>INTEGRATED<br />OUTPUTS</span></div></article>
            <div className="replay-artifacts">{artifactCards}</div>
            <article className="replay-integration"><header><span>CAPTAIN / ASSEMBLED OUTCOME</span><strong>{outputCount} OUTPUTS PRESENT</strong></header><div>{integrationOutputs.map((output, index) => <p key={output}><span>{String(index + 1).padStart(2, "0")}</span><strong>{output}</strong><i>PASS</i></p>)}</div></article>
            <article className="replay-review-card replay-review-card--failure"><span>FRESH REVIEW / MATERIAL FAILURE</span><h2>{failureTitle}</h2><p>{failureDetail}</p><a href={failureHref} target="_blank" rel="noreferrer">OPEN FAILED TRACE ↗</a></article>
            <article className="replay-review-card replay-review-card--passed"><span>REPAIR VERIFIED / OUTCOME COMPLETE</span><h2>Real outputs.<br />Real review.</h2><div>{finalStats.map((stat) => <p key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></p>)}</div><div className="replay-final-actions">{onOpenThread ? <button type="button" onClick={onOpenThread}>VIEW FULL THREAD →</button> : null}<a href="#artifacts">SHOW OUTPUT ↓</a></div></article>
          </div>
          <footer className="replay-controls">
            <div><span>NOW PLAYING</span><strong>{currentEvent.title}</strong></div>
            <div className="replay-progress" aria-label={`Replay step ${step + 1} of ${events.length}`}>{events.map((event, index) => <i className={index <= step ? "is-filled" : ""} key={event.title} />)}</div>
            <div className="replay-buttons"><button type="button" aria-label="Previous event" onClick={() => { setStep((value) => Math.max(0, value - 1)); setIsPlaying(false); }} disabled={step === 0}>←</button><button type="button" className="replay-play" onClick={togglePlayback}>{isPlaying ? "Pause" : step === lastStep ? "Replay" : playLabel}</button><button type="button" aria-label="Next event" onClick={() => { setStep((value) => Math.min(lastStep, value + 1)); setIsPlaying(false); }} disabled={step === lastStep}>→</button></div>
          </footer>
        </section>
      </div>
    </section>
  );
}

function DemoGalleryPage() {
  return (
    <main className="demo-gallery-page">
      <SiteNav label="Examples / 04" />
      <section className="demo-gallery-hero">
        <p className="eyebrow">FOUR PACKS / THREE PRESERVED RUNS / ONE LIVE PROOF</p>
        <h1>Don’t imagine the outcome.<br /><em>Open it.</em></h1>
        <div>
          <p>Three examples preserve clean <code>$possible</code> runs and their evidence. The new game pack adds a clearly labeled live proof you can play immediately.</p>
          <span><i /> ALL RUNS LOCAL · NO EXTERNAL RELEASE ACTIONS</span>
        </div>
      </section>

      <section className="demo-gallery-grid" aria-label="Recorded Possible examples">
        <a className="demo-example-card demo-example-card--hardware" href="/demo/hardware">
          <header><span>01 / HARDWARE LAUNCH</span><strong>VERIFIED RUN ↗</strong></header>
          <div className="demo-example-visual demo-example-visual--hardware">
            <img src="/demo/still/hardware/still-iso.png" alt="Still e-ink focus device CAD concept" />
          </div>
          <div className="demo-example-copy">
            <p>STILL / E-INK FOCUS DEVICE</p>
            <h2>Idea to site,<br />film, and CAD.</h2>
            <div><span>{demoThread.agents.length} agent threads</span><span>{demoThread.messages.length} public messages</span><span>58 artifact checks</span></div>
          </div>
        </a>

        <a className="demo-example-card demo-example-card--software" href="/demo/software">
          <header><span>02 / SOFTWARE LAUNCH</span><strong>VERIFIED RUN ↗</strong></header>
          <div className="demo-example-visual demo-example-visual--software" aria-hidden="true">
            <div className="three-card"><span>THREE / TODAY</span><b>1</b><i /><b>2</b><i /><b>3</b><i /><strong>THEN YOU’RE DONE.</strong></div>
          </div>
          <div className="demo-example-copy">
            <p>THREE / LOCAL-FIRST WEB APP</p>
            <h2>Empty repo to a<br />complete launch.</h2>
            <div><span>{softwareThread.agents.length} agent threads</span><span>{softwareThread.messages.length} public messages</span><span>15 / 15 tests</span></div>
          </div>
        </a>

        <a className="demo-example-card demo-example-card--open-source" href="/demo/open-source">
          <header><span>03 / OPEN-SOURCE RELEASE</span><strong>VERIFIED RUN ↗</strong></header>
          <div className="demo-example-visual demo-example-visual--release" aria-hidden="true">
            <code><span>export function</span> slugify(value) {'{'}<br />&nbsp;&nbsp;return value<br />&nbsp;&nbsp;&nbsp;&nbsp;.toLowerCase()<br />&nbsp;&nbsp;&nbsp;&nbsp;.replace(…);<br />{'}'}</code>
          </div>
          <div className="demo-example-copy">
            <p>TINY-SLUG / ESM PACKAGE</p>
            <h2>Three files to a<br />trustworthy release.</h2>
            <div><span>{openSourceThread.agents.length} agent threads</span><span>{openSourceThread.messages.length} public messages</span><span>9 / 9 tests</span></div>
          </div>
        </a>

        <a className="demo-example-card demo-example-card--game" href="/demo/game">
          <header><span>04 / PLAYABLE WEB GAME</span><strong>LIVE PACK PROOF ↗</strong></header>
          <div className="demo-example-visual demo-example-visual--game" aria-hidden="true">
            <i className="demo-game-gate demo-game-gate--one" /><i className="demo-game-gate demo-game-gate--two" /><i className="demo-game-plane" />
            <span>POINTER</span><span>TOUCH</span><span>KEYS</span>
          </div>
          <div className="demo-example-copy">
            <p>FOLD / PAPER PLANE STORM RUN</p>
            <h2>One strange idea.<br />One game to play.</h2>
            <div><span>Three.js runtime</span><span>3 input modes</span><span>Play now</span></div>
          </div>
        </a>
      </section>
      <SiteFooter />
    </main>
  );
}

function OpenSourceDemoPage() {
  const [threadOpen, setThreadOpen] = useState(false);
  const events: ReplayEvent[] = [
    { actor: "CAPTAIN", title: "Brief locked", detail: "Release promise, compatibility, and no-publish boundary confirmed." },
    { actor: "POSSIBLE", title: "Pack compiled", detail: "Release engineering, documentation, CI, and security skills assembled." },
    { actor: "CAPTAIN", title: "Workstreams spawned", detail: "Package, documentation, and assurance work delegated independently." },
    { actor: "SUBAGENTS", title: "Artifacts returned", detail: "Source contract, docs, CI, examples, and review evidence returned." },
    { actor: "CAPTAIN", title: "Outcome assembled", detail: "The exact consumer package and contributor surface were integrated." },
    { actor: "REVIEWER", title: "Failure found", detail: "Fresh review found release-readiness gaps that the first pass missed." },
    { actor: "REVIEWER", title: "Repair verified", detail: "Offline consumer install and every final verification gate passed." },
  ];

  return (
    <main className="replay-page replay-page--release" id="top">
      <SiteNav label="Recorded run / tiny-slug" />
      <RecordedIntakePrelude
        eyebrow="PRESERVED INTAKE / BEFORE EXECUTION"
        title="Before the release,"
        accent="define trust."
        description="The clean-room run began with $possible, clarified what a credible open-source release meant, and waited for explicit approval before any repository work."
        userIdea="I want to release tiny-slug, a tiny ASCII-only ESM slugifier."
        possibleQuestion="When this is finished, what would make the release trustworthy to a consumer and a contributor?"
        userOutcome="A clean package, API docs, runnable examples, CI, security review, and release plan—but do not publish, push, or tag anything."
        packHref="/packs/open-source-release"
        packLabel="Open-Source Release"
        recommendation="It coordinates release engineering, documentation, CI, security assurance, and independent consumer verification."
      />
      <RecordedExecutionStage
        eyebrow="RECORDED EXECUTION / AFTER CONFIRMATION"
        title="After the yes,"
        accent="watch the release harden."
        description="A fresh Codex captain ran the Open-Source Release pack in a throwaway project. The package, documentation, CI, security review, failures, repairs, and final consumer verification below come from that preserved run."
        metric="9 / 9 TESTS · 0 FINDINGS"
        packCode="OPEN-SOURCE-RELEASE"
        briefTitle="Make tiny-slug understandable, installable, testable, and contributor-ready."
        briefDetail="No publishing, pushing, tagging, or repository-setting changes."
        skillCount={4}
        outputCount={6}
        events={events}
        artifactCards={<>
          <article className="replay-artifact replay-artifact--site"><header><span>01 / SOURCE</span><strong>PASS</strong></header><pre><code>{`export function slugify(value) {\n  return value\n    .replace(/[^A-Za-z0-9]+/g, "-")\n    .toLowerCase();\n}`}</code></pre><p>Typed ESM API with zero runtime dependencies</p></article>
          <article className="replay-artifact replay-artifact--film"><header><span>02 / DOCS</span><strong>PASS</strong></header><div className="replay-artifact-summary"><b>README</b><b>API</b><b>EXAMPLES</b><b>CONTRIBUTING</b></div><p>Consumer and contributor documentation</p></article>
          <article className="replay-artifact replay-artifact--cad"><header><span>03 / ASSURANCE</span><strong>PASS</strong></header><div className="replay-artifact-summary"><strong>9 / 9</strong><span>OFFLINE INSTALL<br />CLEAN CONSUMER<br />0 FINDINGS</span></div><p>CI, security, and package verification</p></article>
        </>}
        integrationOutputs={["Package contract", "API documentation", "Runnable examples", "Hardened CI", "Security review", "Release plan"]}
        failureTitle="The first release candidate was not yet trustworthy."
        failureDetail="Independent review rejected gaps between the package promise, documentation, consumer install path, and assurance evidence."
        failureHref="/demo/tiny-slug/release/security-review.md"
        finalStats={[{ value: "9 / 9", label: "PACKAGE TESTS" }, { value: "0", label: "RUNTIME DEPS" }, { value: "0", label: "FINDINGS" }, { value: "1", label: "CLEAN CONSUMER" }]}
        thread={openSourceThread}
        onOpenThread={() => setThreadOpen(true)}
      />

      <section className="demo-artifacts release-artifacts" id="artifacts">
        <header className="demo-artifacts-title">
          <div><p className="eyebrow">ARTIFACTS PRODUCED</p><h2>Inspect the<br /><em>actual repository.</em></h2></div>
          <p>The package contract, source, documentation, workflows, release evidence, and complete public Codex transcript are preserved below.</p>
        </header>

        <div className="release-artifact-grid">
          <article className="release-code-card">
            <header><span>01 / PUBLIC API</span><strong>INDEX.JS</strong></header>
            <pre><code>{`export function slugify(value) {
  if (typeof value !== "string") {
    throw new TypeError("slugify() expects a string");
  }

  return value
    .replace(/[^A-Za-z0-9]+/g, "-")
    .toLowerCase()
    .replace(/^-|-$/g, "");
}`}</code></pre>
            <a href="/demo/tiny-slug/index.js" target="_blank" rel="noreferrer">OPEN SOURCE ↗</a>
          </article>

          <article className="release-package-card">
            <header><span>02 / PACKAGE CONTRACT</span><strong>1.0.0 / ESM</strong></header>
            <div><p><span>RUNTIME DEPS</span><strong>0</strong></p><p><span>PUBLIC EXPORTS</span><strong>1</strong></p><p><span>PACKED FILES</span><strong>6</strong></p><p><span>TESTS</span><strong>9 / 9</strong></p></div>
            <a href="/demo/tiny-slug/package.json" target="_blank" rel="noreferrer">OPEN PACKAGE.JSON ↗</a>
          </article>

          <article className="release-verification-card">
            <header><span>03 / INDEPENDENT REVIEW</span><strong>PASS</strong></header>
            <h3>Offline install.<br />Clean consumer.<br />Zero remaining findings.</h3>
            <p>The verifier packed the exact release artifact, installed it offline into a fresh project, imported the named ESM API, parsed JSON and YAML, checked documentation links, and reran the security review.</p>
            <a href="/demo/tiny-slug/.possible/outcome-receipt.md" target="_blank" rel="noreferrer">OPEN OUTCOME RECEIPT ↗</a>
          </article>
        </div>

        <div className="release-file-index">
          <a href="/demo/tiny-slug/README.md" target="_blank" rel="noreferrer"><span>README</span><strong>Project entry point</strong><i>MD ↗</i></a>
          <a href="/demo/tiny-slug/docs/api.md" target="_blank" rel="noreferrer"><span>DOCS</span><strong>API contract</strong><i>MD ↗</i></a>
          <a href="/demo/tiny-slug/examples/basic.js" target="_blank" rel="noreferrer"><span>EXAMPLE</span><strong>Runnable usage</strong><i>JS ↗</i></a>
          <a href="/demo/tiny-slug/.github/workflows/ci.yml" target="_blank" rel="noreferrer"><span>CI</span><strong>SHA-pinned workflow</strong><i>YML ↗</i></a>
          <a href="/demo/tiny-slug/release/security-review.md" target="_blank" rel="noreferrer"><span>REVIEW</span><strong>Security evidence</strong><i>MD ↗</i></a>
          <a href="/demo/tiny-slug/CODEX-THREAD.md" target="_blank" rel="noreferrer"><span>THREAD</span><strong>Complete public run</strong><i>MD ↗</i></a>
        </div>
        <footer className="demo-artifacts-footer"><p>Prepared locally. Nothing was published, pushed, tagged, or changed externally.</p><a href="#top">BACK TO TOP ↑</a></footer>
      </section>

      {threadOpen ? <ThreadTranscript thread={openSourceThread} rawHref="/demo/tiny-slug/CODEX-THREAD.md" outputHref="#artifacts" onClose={() => setThreadOpen(false)} /> : null}
    </main>
  );
}

function SoftwareDemoPage() {
  const [threadOpen, setThreadOpen] = useState(false);
  const events: ReplayEvent[] = [
    { actor: "CAPTAIN", title: "Brief locked", detail: "Three-item invariant, local-only boundary, and launch outputs confirmed." },
    { actor: "POSSIBLE", title: "Pack compiled", detail: "Product, website, film, and release-readiness skills assembled." },
    { actor: "CAPTAIN", title: "Workstreams spawned", detail: "Product, site, film, and release planning delegated independently." },
    { actor: "SUBAGENTS", title: "Artifacts returned", detail: "The working app, site, film, and release plan returned for integration." },
    { actor: "CAPTAIN", title: "Outcome assembled", detail: "All launch surfaces and exact verification commands were integrated." },
    { actor: "REVIEWER", title: "Failure found", detail: "Fresh review overrode a false-green pass with accessibility failures." },
    { actor: "REVIEWER", title: "Repair verified", detail: "Contrast, semantics, settled evidence, and L0–L8 verification passed." },
  ];

  return (
    <main className="replay-page replay-page--software" id="top">
      <SiteNav label="Recorded run / Three" />
      <RecordedIntakePrelude
        eyebrow="PRESERVED INTAKE / BEFORE EXECUTION"
        title="Before the build,"
        accent="define launched."
        description="The clean-room run began with $possible, turned a rough product sentence into a concrete outcome, and waited for explicit approval before touching the empty project."
        userIdea="I want to launch Three, a local-first web app that helps people commit to exactly three things today."
        possibleQuestion="Who is this for, and what must exist for you to consider it genuinely launched?"
        userOutcome="Overloaded solo builders. I want the real app, launch site, product film, and release plan—without accounts, a backend, analytics, or deployment."
        packHref="/packs/software-launch"
        packLabel="Software Launch"
        recommendation="It coordinates the product, launch website, demo film, release readiness, and fresh independent review."
      />
      <RecordedExecutionStage
        eyebrow="RECORDED EXECUTION / AFTER CONFIRMATION"
        title="After the yes,"
        accent="watch the launch take shape."
        description="A fresh Codex captain ran the Software Launch pack in a throwaway project. The working product, website, film, failed review, repairs, and final L0–L8 receipts below come from that preserved run."
        metric="15 / 15 TESTS · 22 SECOND FILM"
        packCode="SOFTWARE-LAUNCH"
        briefTitle="Give overloaded solo builders a hard three-item boundary."
        briefDetail="A real local-first product, launch site, film, and honest release plan."
        skillCount={6}
        outputCount={5}
        events={events}
        artifactCards={<>
          <article className="replay-artifact replay-artifact--site"><header><span>01 / PRODUCT</span><strong>PASS</strong></header><img src="/demo/three/evidence/screenshots/product-desktop.png" alt="Three browser product produced by the product workstream" /><p>Working local-first three-item product</p></article>
          <article className="replay-artifact replay-artifact--film"><header><span>02 / SITE</span><strong>PASS</strong></header><img src="/demo/three/evidence/screenshots/site-desktop.png" alt="Three launch website produced by the site workstream" /><p>Responsive, truthful launch narrative</p></article>
          <article className="replay-artifact replay-artifact--cad"><header><span>03 / FILM</span><strong>PASS</strong></header><img src="/demo/three/film/stills/04-done.png" alt="Final frame from the Three launch film" /><p>22-second deterministic product film</p></article>
        </>}
        integrationOutputs={["Browser product", "Launch website", "Product film", "Release plan", "Verification evidence"]}
        failureTitle="The first green build failed fresh review."
        failureDetail="The reviewer found missing semantics, seven contrast failures, ambiguous metadata, and screenshots captured before transitions settled."
        failureHref="/demo/three/evidence/failed-review-01/README.md"
        finalStats={[{ value: "15 / 15", label: "PRODUCT TESTS" }, { value: "L0–L8", label: "LOCAL GATES" }, { value: "0", label: "NETWORK WRITES" }, { value: "1", label: "FAILURE REPAIRED" }]}
        thread={softwareThread}
        onOpenThread={() => setThreadOpen(true)}
      />

      <section className="demo-artifacts software-artifacts" id="artifacts">
        <header className="demo-artifacts-title">
          <div><p className="eyebrow">ARTIFACTS PRODUCED</p><h2>Use the product.<br /><em>Watch the launch.</em></h2></div>
          <p>These are the actual production builds and rendered film from the throwaway project. The browser app remains interactive inside this page and stores only its versioned record in local storage.</p>
        </header>

        <div className="software-live-grid">
          <article className="software-live-card software-live-card--product">
            <header><span>01 / BROWSER PRODUCT</span><strong>INTERACTIVE BUILD</strong></header>
            <iframe title="Three local-first product" src="/demo/three/product/" loading="lazy" />
            <footer><p><strong>Three / Today</strong><span>Add, complete, reload, remove, and reuse up to three lines.</span></p><a href="/demo/three/product/" target="_blank" rel="noreferrer">OPEN PRODUCT ↗</a></footer>
          </article>

          <article className="software-live-card software-live-card--site">
            <header><span>02 / LAUNCH SITE</span><strong>PRODUCTION BUILD</strong></header>
            <iframe title="Three launch website" src="/demo/three/site/" loading="lazy" />
            <footer><p><strong>Three things. Then you’re done.</strong><span>Truthful local-only positioning with no fake waitlist or demand claims.</span></p><a href="/demo/three/site/" target="_blank" rel="noreferrer">OPEN SITE ↗</a></footer>
          </article>
        </div>

        <article className="software-film-card">
          <header><span>03 / PRODUCT FILM</span><strong>1920 × 1080 · 30 FPS · 22.06S</strong></header>
          <video controls preload="metadata" poster="/demo/three/film/stills/04-done.png">
            <source src="/demo/three/film/three-demo.mp4" type="video/mp4" />
          </video>
          <footer><p><strong>From overload to done.</strong><span>Four scenes, eight inspected frames, full-file decode passed.</span></p><a href="/demo/three/film/three-demo.mp4" target="_blank" rel="noreferrer">OPEN MP4 ↗</a></footer>
        </article>

        <div className="software-evidence-index">
          <a href="/demo/three/.possible/outcome-brief.md" target="_blank" rel="noreferrer"><span>BRIEF</span><strong>Confirmed outcome</strong><i>MD ↗</i></a>
          <a href="/demo/three/evidence/product-test-receipt.md" target="_blank" rel="noreferrer"><span>PRODUCT</span><strong>15-test receipt</strong><i>MD ↗</i></a>
          <a href="/demo/three/evidence/site-test-receipt.md" target="_blank" rel="noreferrer"><span>SITE</span><strong>Build receipt</strong><i>MD ↗</i></a>
          <a href="/demo/three/evidence/film-render-receipt.md" target="_blank" rel="noreferrer"><span>FILM</span><strong>Render receipt</strong><i>MD ↗</i></a>
          <a href="/demo/three/release/release-plan.md" target="_blank" rel="noreferrer"><span>RELEASE</span><strong>Gated plan</strong><i>MD ↗</i></a>
          <a href="/demo/three/evidence/final-verification.md" target="_blank" rel="noreferrer"><span>FINAL</span><strong>L0–L8 decision</strong><i>MD ↗</i></a>
          <a href="/demo/three/evidence/failed-review-01/README.md" target="_blank" rel="noreferrer"><span>FAILED PASS</span><strong>What review caught</strong><i>MD ↗</i></a>
          <a href="/demo/three/evidence/integration-repairs.md" target="_blank" rel="noreferrer"><span>REPAIRS</span><strong>Failure history</strong><i>MD ↗</i></a>
          <a href="/demo/three/CODEX-THREAD.md" target="_blank" rel="noreferrer"><span>THREAD</span><strong>Complete public run</strong><i>MD ↗</i></a>
        </div>
        <footer className="demo-artifacts-footer"><p>Prepared and verified locally. Nothing was deployed, published, or sent externally.</p><a href="#top">BACK TO TOP ↑</a></footer>
      </section>

      {threadOpen ? <ThreadTranscript thread={softwareThread} rawHref="/demo/three/CODEX-THREAD.md" outputHref="#artifacts" onClose={() => setThreadOpen(false)} /> : null}
    </main>
  );
}

function PlayableGameDemoPage() {
  const events: ReplayEvent[] = [
    { actor: "CAPTAIN", title: "Outcome locked", detail: "One paper plane, one storm, one replayable rule." },
    { actor: "POSSIBLE", title: "Sources reviewed", detail: "Three.js, game feel, touch, interface, and browser review skills inspected." },
    { actor: "POSSIBLE", title: "Pack compiled", detail: "Three owned workstreams and one independent review contract assembled." },
    { actor: "RUNTIME", title: "Flight built", detail: "Three.js scene, gates, scoring, collision, and state transitions implemented." },
    { actor: "CAPTAIN", title: "Experience assembled", detail: "HUD, pointer, touch, keyboard, pause, mute, and restart joined the core loop." },
    { actor: "REVIEW", title: "Failure found", detail: "The first sound toggle controlled no sound and failed its own interface promise." },
    { actor: "CAPTAIN", title: "Repair verified", detail: "Procedural gate and collision tones now obey the mute control." },
  ];

  return (
    <main className="replay-page replay-page--game" id="top">
      <SiteNav label="Live pack proof / Fold" />
      <RecordedIntakePrelude
        eyebrow="PACK PROOF / ILLUSTRATIVE INTAKE"
        title="Before the build,"
        accent="find the fun."
        description="This is the conversation Possible would use to narrow a broad game idea into one finished core loop before recommending a recipe."
        userIdea="I want to make a tiny browser game where you pilot a paper plane through a storm."
        possibleQuestion="What should a player understand in five seconds—and what single action should feel good enough to repeat?"
        userOutcome="Steer through storm gates, build a score, crash, and instantly try again. It should work with pointer, touch, or keys."
        packHref="/packs/playable-web-game"
        packLabel="Playable Web Game"
        recommendation="It coordinates the core loop, Three.js runtime, responsive controls, game feel, and an independent browser review."
      />
      <RecordedExecutionStage
        eyebrow="LIVE PROOF / BUILT IN THE POSSIBLE PRODUCT THREAD"
        title="After the yes,"
        accent="make it playable."
        description="Fold is a real Three.js reference build made alongside the new pack. It proves the promised output and interaction shape; it is not presented as a clean-room pack evaluation."
        metric="1 LOOP · 3 INPUT MODES"
        packCode="PLAYABLE-WEB-GAME"
        briefTitle="Thread a paper plane through the orange before the storm closes in."
        briefDetail="One complete loop. No accounts, economy, level editor, multiplayer, analytics, or external assets."
        skillCount={5}
        outputCount={5}
        events={events}
        artifactCards={<>
          <article className="replay-artifact replay-artifact--site replay-artifact--game"><header><span>01 / CORE LOOP</span><strong>PLAYABLE</strong></header><div className="game-loop-mark"><i /><b>→</b><i /><b>→</b><i /></div><p>Steer · clear gate · score · crash · retry</p></article>
          <article className="replay-artifact replay-artifact--film replay-artifact--game"><header><span>02 / THREE.JS</span><strong>LIVE</strong></header><div className="game-runtime-mark"><i /><span>WEBGL</span><b>3D</b></div><p>Procedural world with no external game assets</p></article>
          <article className="replay-artifact replay-artifact--cad replay-artifact--game"><header><span>03 / CONTROLS</span><strong>3 MODES</strong></header><div className="replay-artifact-summary"><b>POINTER</b><b>TOUCH</b><b>KEYS</b><b>PAUSE</b></div><p>Responsive input and explicit game states</p></article>
        </>}
        integrationOutputs={["Playable browser game", "Core-loop brief", "Responsive HUD", "Input contract", "Review evidence"]}
        failureTitle="The first mute control was only visual."
        failureDetail="Review caught a real contract failure: the interface exposed sound state before the runtime produced any sound. Procedural feedback and mute behavior were added together."
        failureHref="/demo/fold/review.md"
        finalStats={[{ value: "1", label: "CORE LOOP" }, { value: "3", label: "INPUT MODES" }, { value: "0", label: "EXTERNAL ASSETS" }, { value: "1", label: "FAILURE REPAIRED" }]}
        runLabel="LIVE PACK PROOF"
        playLabel="Play build story"
      />

      <section className="demo-artifacts game-artifacts" id="artifacts">
        <header className="demo-artifacts-title">
          <div><p className="eyebrow">PLAYABLE ARTIFACT</p><h2>Don’t watch it.<br /><em>Fly it.</em></h2></div>
          <p>The outcome is the game itself. Start a flight below, then open it full-screen or inspect the brief and review evidence.</p>
        </header>

        <article className="game-live-card">
          <header><span>01 / FOLD</span><strong>THREE.JS · POINTER · TOUCH · KEYS</strong></header>
          <iframe title="Fold paper plane game" src="/demo/game/play" loading="lazy" />
          <footer><p><strong>Thread the orange.</strong><span>Move to steer. P pauses. Space starts again.</span></p><a href="/demo/game/play" target="_blank" rel="noreferrer">PLAY FULL SCREEN ↗</a></footer>
        </article>

        <div className="game-evidence-index">
          <a href="/demo/fold/game-brief.md" target="_blank" rel="noreferrer"><span>01 / BRIEF</span><strong>One-loop contract</strong><i>MD ↗</i></a>
          <a href="/demo/fold/review.md" target="_blank" rel="noreferrer"><span>02 / FAILURE</span><strong>What review caught</strong><i>MD ↗</i></a>
          <a href="/demo/fold/verification.md" target="_blank" rel="noreferrer"><span>03 / EVIDENCE</span><strong>Verification receipt</strong><i>MD ↗</i></a>
          <a href="/packs/playable-web-game"><span>04 / RECIPE</span><strong>Playable Web Game pack</strong><i>PACK ↗</i></a>
        </div>

        <footer className="demo-artifacts-footer"><p>A game pack should finish with a game—not a design document, a framework, or a list of ideas.</p><a href="/packs/playable-web-game">INSPECT THE PACK →</a></footer>
      </section>
    </main>
  );
}

function HardwareDemoPage() {
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
      {threadOpen ? <ThreadTranscript thread={demoThread} rawHref="/demo/still/CODEX-THREAD.md" onClose={() => setThreadOpen(false)} /> : null}
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

function DocsPage() {
  return (
    <main className="docs-page">
      <SiteNav label="Docs / Getting started" />

      <div className="docs-shell">
        <aside className="docs-sidebar" aria-label="Documentation navigation">
          <div className="docs-sidebar-title"><strong>Documentation</strong><span>V0.1</span></div>
          <nav aria-label="Getting started">
            <span>GETTING STARTED</span>
            <a className="is-active" href="#overview">Overview</a>
            <a href="#installation">Installation</a>
            <a href="#invoke">Invoke Possible</a>
          </nav>
          <nav aria-label="Core workflow">
            <span>CORE WORKFLOW</span>
            <a href="#brainstorm">Brainstorm</a>
            <a href="#recommend">Recommendation</a>
            <a href="#confirm">Confirmation</a>
            <a href="#execute">Execution</a>
          </nav>
          <nav aria-label="Reference">
            <span>REFERENCE</span>
            <a href="#files">Project files</a>
            <a href="#safety">Safety boundary</a>
            <a href="#troubleshooting">Troubleshooting</a>
            <a href="/packs">Pack gallery ↗</a>
          </nav>
        </aside>

        <article className="docs-article">
          <div className="docs-breadcrumb"><a href="/docs">DOCS</a><span>/</span><strong>GETTING STARTED</strong></div>

          <header className="docs-title" id="overview">
            <p className="eyebrow">GETTING STARTED</p>
            <h1>Build complete outcomes with Possible</h1>
            <p>Possible is a conversational Codex skill. Start with a rough idea, clarify the outcome one question at a time, inspect a recommended pack, and approve it before any work begins.</p>
          </header>

          <aside className="docs-callout docs-callout--info">
            <strong>THE SHORT VERSION</strong>
            <p>Install Possible once. Type <code>$possible</code>. Describe what you want to make. Possible handles pack discovery with you.</p>
          </aside>

          <section id="installation">
            <h2>Installation</h2>
            <p>Run the installer from the root of the project where you want to use Possible.</p>
            <div className="docs-command">
              <header><span>TERMINAL</span><strong>BASH</strong></header>
              <pre><code>{installCommand}</code></pre>
              <CopyButton label="Copy" value={installCommand} />
            </div>
            <p>The command installs three reviewed files under <code>.agents/skills/possible</code>. It does not select a pack, install ingredient skills, create outcome state, or modify unrelated skills.</p>
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

          <section id="brainstorm">
            <h2>Brainstorm the outcome</h2>
            <p>You do not need a finished brief. Describe the idea in your own words. Possible reflects what it heard and asks one useful question per turn until the desired end state is clear enough to recommend a path.</p>
            <div className="docs-do-dont">
              <div><strong>DURING INTAKE</strong><ul><li>Reflect the user&apos;s intent</li><li>Ask one question at a time</li><li>Preserve assumptions as assumptions</li></ul></div>
              <div><strong>NOT DURING INTAKE</strong><ul><li>Name or install packs</li><li>Edit files or create state</li><li>Spawn specialists</li></ul></div>
            </div>
          </section>

          <section id="recommend">
            <h2>Review the recommendation</h2>
            <p>Possible recommends one primary outcome pack and links its public recipe. Every recommendation should answer four questions:</p>
            <ol>
              <li><strong>What does Possible think you want to make?</strong><span>A concise outcome statement and any material assumptions.</span></li>
              <li><strong>Why does this pack fit?</strong><span>A link to the pack and a short explanation.</span></li>
              <li><strong>What will exist afterward?</strong><span>Concrete outputs and the most important acceptance checks.</span></li>
              <li><strong>What remains unauthorized?</strong><span>External actions and claims that still require separate approval.</span></li>
            </ol>
            <a className="docs-reference-link" href="/packs/hardware-launch"><span>EXAMPLE PACK</span><strong>Hardware Launch</strong><i>View recipe →</i></a>
          </section>

          <section id="confirm">
            <h2>Confirm before execution</h2>
            <p>Possible waits for direct confirmation such as “yes, proceed,” “use this pack,” or “go ahead.” A question, correction, or enthusiastic reaction is not confirmation.</p>
            <aside className="docs-callout docs-callout--approval">
              <strong>WHAT “YES” AUTHORIZES</strong>
              <p>{approvalDisclosure}</p>
            </aside>
            <p>If the recommendation is wrong, correct the understanding and continue the conversation. Possible should recommend again instead of defending the first answer.</p>
          </section>

          <section id="execute">
            <h2>Execute the pack</h2>
            <p>After confirmation, Codex becomes the captain for the outcome:</p>
            <ol>
              <li><strong>Inspect and install</strong><span>Resolve the pack&apos;s reviewed ingredient skills and inspect them before use.</span></li>
              <li><strong>Write shared state</strong><span>Record the confirmed brief, exact pack snapshot, and resolved skill versions.</span></li>
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
              <div role="row"><code role="cell">.possible/pack.json</code><span role="cell">The exact outcome pack snapshot approved for this run.</span></div>
              <div role="row"><code role="cell">.possible/skills-lock.json</code><span role="cell">Resolved sources, revisions, paths, and content hashes.</span></div>
            </div>
          </section>

          <section id="safety">
            <h2>Safety boundary</h2>
            <p>Pack confirmation authorizes local project work. It never grants real-world permission.</p>
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
              <details><summary>The recommended pack feels wrong</summary><p>Do not confirm it. Correct Possible&apos;s understanding or continue brainstorming until the recommendation matches the outcome you actually want.</p></details>
            </div>
          </section>

          <nav className="docs-next" aria-label="Next documentation page">
            <span>NEXT</span>
            <a href="/packs">Explore outcome packs <b>→</b></a>
          </nav>
        </article>

        <aside className="docs-toc" aria-label="On this page">
          <span>ON THIS PAGE</span>
          <a href="#installation">Installation</a>
          <a href="#invoke">Invoke Possible</a>
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

function NotFoundPage() {
  return (
    <main>
      <SiteNav label="Not found" />
      <section className="not-found">
        <p className="eyebrow">404 / OUTCOME NOT FOUND</p>
        <h1>This pack is<br /><em>not possible yet.</em></h1>
        <a className="button-link" href="/packs">Browse the four packs <span>→</span></a>
      </section>
      <SiteFooter />
    </main>
  );
}

function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return <CreatePage />;
  if (path === "/packs") return <PacksPage />;
  if (path === "/docs") return <DocsPage />;
  if (path === "/demo") return <DemoGalleryPage />;
  if (path === "/demo/game/play") return <Suspense fallback={<main className="plane-game-shell plane-game-loading"><span>FOLD / LOADING FLIGHT</span></main>}><PaperPlaneGame /></Suspense>;
  if (path === "/demo/game") return <PlayableGameDemoPage />;
  if (path === "/demo/hardware") return <HardwareDemoPage />;
  if (path === "/demo/software") return <SoftwareDemoPage />;
  if (path === "/demo/open-source") return <OpenSourceDemoPage />;
  if (path.startsWith("/packs/")) {
    const pack = getPack(path.slice("/packs/".length));
    return pack ? <PackDetailPage pack={pack} /> : <NotFoundPage />;
  }
  return <NotFoundPage />;
}

export default App;
