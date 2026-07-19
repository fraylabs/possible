import { useEffect, useState } from "react";
import { getPack, outcomePacks } from "@possible/packs";
import type { OutcomePack } from "@possible/packs";
import demoThreadData from "./demo-thread.json";
import openSourceThreadData from "./open-source-thread.json";
import softwareThreadData from "./software-thread.json";

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

function DemoGalleryPage() {
  return (
    <main className="demo-gallery-page">
      <SiteNav label="Examples / 03" />
      <section className="demo-gallery-hero">
        <p className="eyebrow">THREE PACKS / THREE PRESERVED CODEX RUNS</p>
        <h1>Don’t imagine the outcome.<br /><em>Open it.</em></h1>
        <div>
          <p>Each example began in a clean project with <code>$possible</code>, passed through conversation and confirmation, then preserved its real artifacts, public thread, failures, and verification evidence.</p>
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
      </section>
      <SiteFooter />
    </main>
  );
}

type EvidenceLink = { label: string; title: string; format: string; href: string };

function ExampleHeader({
  navLabel,
  eyebrow,
  title,
  accent,
  description,
  metric,
  brief,
  packHref,
  packLabel,
  boundary,
  thread,
  onOpenThread,
}: {
  navLabel: string;
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  metric: string;
  brief: string;
  packHref: string;
  packLabel: string;
  boundary: string;
  thread: DemoThread;
  onOpenThread: () => void;
}) {
  return (
    <>
      <SiteNav label={navLabel} />
      <section className="example-detail-hero">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}<br /><em>{accent}</em></h1>
        </div>
        <aside>
          <p>{description}</p>
          <div className="example-hero-status"><span><i /> LOCAL RUN COMPLETE</span><strong>{metric} · {thread.agents.length} AGENT THREADS</strong></div>
          <div className="example-hero-actions">
            <button type="button" onClick={onOpenThread}>VIEW FULL CODEX THREAD <span>{thread.messages.length} MESSAGES</span></button>
            <a href="#artifacts">VIEW ARTIFACTS ↓</a>
          </div>
        </aside>
      </section>
      <section className="example-run-strip">
        <p><span>CONFIRMED BRIEF</span><strong>{brief}</strong></p>
        <p><span>SELECTED PACK</span><strong><a href={packHref}>{packLabel} ↗</a></strong></p>
        <p><span>RUN BOUNDARY</span><strong>{boundary}</strong></p>
      </section>
    </>
  );
}

function ExampleArtifactsHeader({ title, accent, description }: { title: string; accent: string; description: string }) {
  return (
    <header className="example-artifacts-header">
      <div><p className="eyebrow">ARTIFACTS PRODUCED</p><h2>{title}<br /><em>{accent}</em></h2></div>
      <p>{description}</p>
    </header>
  );
}

function ExampleEvidenceIndex({ links }: { links: EvidenceLink[] }) {
  return (
    <section className="example-evidence" aria-label="Run evidence">
      <header><span>EVIDENCE + VERIFICATION</span><strong>{links.length} INSPECTABLE RECEIPTS</strong></header>
      <div className="example-evidence-index">
        {links.map((link) => (
          <a href={link.href} target="_blank" rel="noreferrer" key={link.href}>
            <span>{link.label}</span><strong>{link.title}</strong><i>{link.format} ↗</i>
          </a>
        ))}
      </div>
    </section>
  );
}

function ExampleFooter({ children }: { children: string }) {
  return <footer className="example-detail-footer"><a href="/demo">← ALL EXAMPLES</a><p>{children}</p><a href="#top">BACK TO TOP ↑</a></footer>;
}

function OpenSourceDemoPage() {
  const [threadOpen, setThreadOpen] = useState(false);
  const evidence: EvidenceLink[] = [
    { label: "README", title: "Project entry point", format: "MD", href: "/demo/tiny-slug/README.md" },
    { label: "DOCS", title: "API contract", format: "MD", href: "/demo/tiny-slug/docs/api.md" },
    { label: "EXAMPLE", title: "Runnable usage", format: "JS", href: "/demo/tiny-slug/examples/basic.js" },
    { label: "CI", title: "SHA-pinned workflow", format: "YML", href: "/demo/tiny-slug/.github/workflows/ci.yml" },
    { label: "REVIEW", title: "Security evidence", format: "MD", href: "/demo/tiny-slug/release/security-review.md" },
    { label: "THREAD", title: "Complete public run", format: "MD", href: "/demo/tiny-slug/CODEX-THREAD.md" },
  ];

  return (
    <main className="example-detail example-detail--release" id="top" data-layout="recorded-run">
      <ExampleHeader
        navLabel="Recorded run / tiny-slug"
        eyebrow="REAL CLEAN-ROOM RUN / OPEN-SOURCE RELEASE"
        title="Three files became"
        accent="a release people can trust."
        description="A tiny ASCII-only slugifier entered as one function and one test. Possible prepared the package, documentation, examples, hardened CI, changelog, release plan, and independent security evidence—without publishing it."
        metric="9 / 9 TESTS · 0 FINDINGS"
        brief="Make a tiny ESM utility understandable, installable, testable, and contributor-ready."
        packHref="/packs/open-source-release"
        packLabel="Open-Source Release"
        boundary="No publish, push, tag, release, or repository-setting changes."
        thread={openSourceThread}
        onOpenThread={() => setThreadOpen(true)}
      />

      <section className="example-artifacts release-artifacts" id="artifacts">
        <ExampleArtifactsHeader
          title="Inspect the"
          accent="actual repository."
          description="The package contract, source, documentation, workflows, release evidence, and complete public Codex transcript are preserved below."
        />

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

        <ExampleEvidenceIndex links={evidence} />
      </section>

      <ExampleFooter>Prepared locally. Nothing was published, pushed, tagged, or changed externally.</ExampleFooter>
      {threadOpen ? <ThreadTranscript thread={openSourceThread} rawHref="/demo/tiny-slug/CODEX-THREAD.md" outputHref="#artifacts" onClose={() => setThreadOpen(false)} /> : null}
    </main>
  );
}

function SoftwareDemoPage() {
  const [threadOpen, setThreadOpen] = useState(false);
  const evidence: EvidenceLink[] = [
    { label: "BRIEF", title: "Confirmed outcome", format: "MD", href: "/demo/three/.possible/outcome-brief.md" },
    { label: "PRODUCT", title: "15-test receipt", format: "MD", href: "/demo/three/evidence/product-test-receipt.md" },
    { label: "SITE", title: "Build receipt", format: "MD", href: "/demo/three/evidence/site-test-receipt.md" },
    { label: "FILM", title: "Render receipt", format: "MD", href: "/demo/three/evidence/film-render-receipt.md" },
    { label: "RELEASE", title: "Gated plan", format: "MD", href: "/demo/three/release/release-plan.md" },
    { label: "FINAL", title: "L0–L8 decision", format: "MD", href: "/demo/three/evidence/final-verification.md" },
    { label: "FAILED PASS", title: "What review caught", format: "MD", href: "/demo/three/evidence/failed-review-01/README.md" },
    { label: "REPAIRS", title: "Failure history", format: "MD", href: "/demo/three/evidence/integration-repairs.md" },
    { label: "THREAD", title: "Complete public run", format: "MD", href: "/demo/three/CODEX-THREAD.md" },
  ];

  return (
    <main className="example-detail example-detail--software" id="top" data-layout="recorded-run">
      <ExampleHeader
        navLabel="Recorded run / Three"
        eyebrow="REAL CLEAN-ROOM RUN / SOFTWARE LAUNCH"
        title="An empty repo became"
        accent="a complete launch."
        description="Three began as a name and one sentence: a local-first app for choosing exactly three things today. Possible clarified what “launched” meant, recommended the pack, waited for approval, then produced the browser product, launch site, film, release plan, and independent evidence."
        metric="15 / 15 TESTS · 22S FILM"
        brief="Give overloaded solo builders a hard three-item boundary and a conclusive end to the day."
        packHref="/packs/software-launch"
        packLabel="Software Launch"
        boundary="Local-only. No accounts, backend, analytics, deployment, publishing, or outreach."
        thread={softwareThread}
        onOpenThread={() => setThreadOpen(true)}
      />

      <section className="example-artifacts software-artifacts" id="artifacts">
        <ExampleArtifactsHeader
          title="Use the product."
          accent="Watch the launch."
          description="These are the actual production builds and rendered film from the throwaway project. The browser app remains interactive inside this page and stores only its versioned record in local storage."
        />

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

        <ExampleEvidenceIndex links={evidence} />
      </section>

      <ExampleFooter>Prepared and verified locally. Nothing was deployed, published, or sent externally.</ExampleFooter>
      {threadOpen ? <ThreadTranscript thread={softwareThread} rawHref="/demo/three/CODEX-THREAD.md" outputHref="#artifacts" onClose={() => setThreadOpen(false)} /> : null}
    </main>
  );
}

function HardwareArtifacts() {
  const evidence: EvidenceLink[] = [
    { label: "OUTCOME", title: "Outcome receipt", format: "MD", href: "/demo/still/OUTCOME-RECEIPT.md" },
    { label: "REVIEW", title: "Independent final receipt", format: "MD", href: "/demo/still/evidence/final-receipt.md" },
    { label: "ARTIFACTS", title: "Artifact results", format: "JSON", href: "/demo/still/verification/artifact-results.json" },
    { label: "BROWSER", title: "Browser results", format: "JSON", href: "/demo/still/verification/browser-results.json" },
    { label: "FAILED PASS", title: "Initial failed trace", format: "JSON", href: "/demo/still/verification/browser-results-initial-failure.json" },
    { label: "THREAD", title: "Complete public run", format: "MD", href: "/demo/still/CODEX-THREAD.md" },
  ];

  return (
    <section className="example-artifacts hardware-artifacts" id="artifacts">
      <ExampleArtifactsHeader
        title="Open the launch."
        accent="Inspect the hardware."
        description="The launch website, product film, four CAD views, portable geometry, receipts, and verification traces are presented in the same order as every other Possible example."
      />

      <div className="hardware-primary-grid">
        <article className="example-output-card hardware-site-card">
          <header><span>01 / LAUNCH WEBSITE</span><strong>INTERACTIVE BUILD</strong></header>
          <iframe src="/demo/still/site/" title="Still launch website" loading="lazy" />
          <footer><p><strong>Still / Focus without your phone</strong><span>Responsive launch story with a deliberately local-only waitlist interaction.</span></p><a href="/demo/still/site/" target="_blank" rel="noreferrer">OPEN SITE ↗</a></footer>
        </article>

        <article className="example-output-card hardware-film-card">
          <header><span>02 / LAUNCH FILM</span><strong>24 SEC · 1080P</strong></header>
          <video controls muted playsInline preload="metadata" poster="/demo/still/film/still-launch-preview.png" src="/demo/still/film/still-launch.mp4" />
          <footer><p><strong>A physical focus ritual.</strong><span>Deterministic product film with preserved review frames.</span></p><a href="/demo/still/evidence/film-receipt.md" target="_blank" rel="noreferrer">FILM RECEIPT ↗</a></footer>
        </article>
      </div>

      <article className="example-output-card hardware-cad-card">
        <header><span>03 / PROTOTYPE CAD</span><strong>4 VIEWS · STEP-FIRST · CONCEPT</strong></header>
        <div className="demo-cad-views">
          <a href="/demo/still/hardware/still-iso.png" target="_blank" rel="noreferrer"><figure><img src="/demo/still/hardware/still-iso.png" alt="Isometric CAD view of the Still focus device concept" /><figcaption><span>01</span><strong>ISOMETRIC</strong></figcaption></figure></a>
          <a href="/demo/still/hardware/still-rear.png" target="_blank" rel="noreferrer"><figure><img src="/demo/still/hardware/still-rear.png" alt="Rear CAD view of the Still focus device concept" /><figcaption><span>02</span><strong>REAR</strong></figcaption></figure></a>
          <a href="/demo/still/hardware/still-top.png" target="_blank" rel="noreferrer"><figure><img src="/demo/still/hardware/still-top.png" alt="Top CAD view of the Still focus device concept" /><figcaption><span>03</span><strong>TOP</strong></figcaption></figure></a>
          <a href="/demo/still/hardware/still-front.png" target="_blank" rel="noreferrer"><figure><img src="/demo/still/hardware/still-front.png" alt="Front CAD view of the Still focus device concept" /><figcaption><span>04</span><strong>FRONT</strong></figcaption></figure></a>
        </div>
        <footer>
          <p><strong>Measured exterior geometry.</strong><span>Portable review formats plus the parametric source and geometry report.</span></p>
          <div><a href="/demo/still/hardware/still.step" download>STEP ↓</a><a href="/demo/still/hardware/still.glb" download>GLB ↓</a><a href="/demo/still/hardware/still.stl" download>STL ↓</a><a href="/demo/still/hardware/still.py" download>SOURCE ↓</a><a href="/demo/still/evidence/geometry-report.md" target="_blank" rel="noreferrer">REPORT ↗</a></div>
        </footer>
      </article>

      <ExampleEvidenceIndex links={evidence} />
    </section>
  );
}

function HardwareDemoPage() {
  const [threadOpen, setThreadOpen] = useState(false);

  return (
    <main className="example-detail example-detail--hardware" id="top" data-layout="recorded-run">
      <ExampleHeader
        navLabel="Recorded run / Still"
        eyebrow="REAL CLEAN-ROOM RUN / HARDWARE LAUNCH"
        title="A focus-device idea became"
        accent="a complete launch."
        description="Still began as a palm-sized e-ink device for starting a focused block without opening a phone. Possible coordinated the launch website, product film, prototype CAD, waitlist contract, and independent review without fabricating, deploying, or collecting data."
        metric="58 / 58 CHECKS · 24S FILM"
        brief="Create a believable launch for a palm-sized e-ink focus device."
        packHref="/packs/hardware-launch"
        packLabel="Hardware Launch"
        boundary="Fictional concept. No deployment, fabrication, purchasing, outreach, or real data collection."
        thread={demoThread}
        onOpenThread={() => setThreadOpen(true)}
      />
      <HardwareArtifacts />
      <ExampleFooter>Prepared and verified locally. Nothing was deployed, fabricated, purchased, emailed, or connected to real data.</ExampleFooter>
      {threadOpen ? <ThreadTranscript thread={demoThread} rawHref="/demo/still/CODEX-THREAD.md" outputHref="#artifacts" onClose={() => setThreadOpen(false)} /> : null}
    </main>
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
  if (path === "/docs") return <DocsPage />;
  if (path === "/demo") return <DemoGalleryPage />;
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
