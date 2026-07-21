"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { compilePack, getPack, outcomePacks } from "@possible/packs";
import type { OutcomePack, PackLane } from "@possible/packs";
import { benchmarkCards, benchmarkComparisons, getBenchmark } from "./benchmark-data";
import type { BenchmarkSlug } from "./benchmark-data";
import demoThreadData from "./demo-thread.json";
import openSourceThreadData from "./open-source-thread.json";
import softwareThreadData from "./software-thread.json";

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
const openSourceThread = openSourceThreadData as DemoThread;
const softwareThread = softwareThreadData as DemoThread;

const installCommand = "npx @fraylabs/possible@0.1.7 init";
const schedulePrompt = "I want to schedule operations.";
const approvalDisclosure = "Saying yes authorizes repo-local agent skill installation, the shared outcome brief and state files, and local outcome work. External actions still require separate approval.";
const laneOrder: PackLane[] = ["create", "launch", "release", "operate"];
const laneLabels: Record<PackLane, string> = {
  create: "Create",
  launch: "Launch",
  release: "Release",
  operate: "Operate",
};
const gallerySlugs = [
  "hardware-launch",
  "software-launch",
  "open-source-release",
  "playable-web-game",
  "web-app-operations",
  "working-web-app",
  "production-web-release",
  "marketing-operations",
  "billion-dollar-saas",
  "kickstarter-funding",
  "kickstarter-fulfillment",
  "robot-prototype",
  "web-presentation",
] as const;
const galleryPacks = gallerySlugs.map((slug) => outcomePacks.find((pack) => pack.slug === slug)!).filter(Boolean);
const navigationItems = [
  { label: "BLOGS", href: "/blogs", external: false },
  { label: "PACKS", href: "/packs", external: false },
  { label: "BENCH", href: "/benchmarks", external: false },
  { label: "DOCS", href: "/docs", external: false },
  { label: "DEMO", href: "/demo", external: false },
  { label: "SOURCE", href: "https://github.com/fraylabs/possible", external: true },
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
              <span>NAVIGATION / 06</span>
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
              <h1>Complete a possible <br /><em>outcome!</em></h1>
            <p className="build-hero-description"><strong>Possible.sh is an open-source library of Outcome Packs.</strong> Each pack combines a reusable execution prompt and selected agent skills for 50–100 coordinated tasks.</p>
            <div className="build-hero-actions">
              <a className="button-link" href="https://github.com/fraylabs/possible" target="_blank" rel="noreferrer">Star on GitHub <span>↗</span></a>
              <a className="text-link" href="/presentation">See the visual explainer ↗</a>
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

        <section className="home-demo" aria-labelledby="home-demo-heading">
          <header>
            <span>RECORDED OUTCOMES / 03</span>
            <h2 id="home-demo-heading">See <code>$possible</code> brainstorm—and what it produced.</h2>
          </header>
          <ol aria-label="Possible demo outcomes">
            <li><a href="/demo/robot-snake"><span>01 / ROBOT PROTOTYPE</span><h3>Robot Snake</h3><p>CAD · SIM · RERUN</p><i>↗</i></a></li>
            <li><a href="/demo/hardware"><span>02 / HARDWARE LAUNCH</span><h3>Still</h3><p>SITE · FILM · CAD</p><i>↗</i></a></li>
            <li><a href="/demo/game"><span>03 / PLAYABLE WEB GAME</span><h3>Fold</h3><p>THREE.JS · TOUCH · PLAY</p><i>↗</i></a></li>
          </ol>
        </section>

        <div className="home-pack-index" id="packs" role="region" aria-labelledby="home-packs-heading">
          <header>
            <div>
              <span>OUTCOME PACKS / {String(galleryPacks.length).padStart(2, "0")}</span>
              <h2 id="home-packs-heading">Outcome Packs coordinate <em>complete results.</em></h2>
            </div>
            <p>Describe the outcome. <code>$possible</code> recommends the right pack; you approve the run.</p>
          </header>

          <div className="home-pack-columns" aria-hidden="true">
            <span>#</span><span>OUTCOME PACK</span><span>CATEGORY</span><span>OPEN</span>
          </div>
          <ol aria-label="Outcome Packs Possible can recommend">
            {galleryPacks.map((pack) => (
              <li key={pack.slug}>
                <a href={`/packs/${pack.slug}`} aria-label={`${pack.name}, ${laneLabels[pack.lane]} Outcome Pack`}>
                  <span className="home-pack-number">{String(pack.catalogNumber).padStart(2, "0")}</span>
                  <strong>{pack.name}</strong>
                  <span className={`home-pack-lane home-pack-lane--${pack.lane}`}>{laneLabels[pack.lane]}</span>
                  <i>↗</i>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="home-benchmark" aria-labelledby="home-benchmark-heading">
        <header>
          <div>
            <span>BENCHMARK SUITE / TWO OUTCOMES</span>
            <h2 id="home-benchmark-heading">Can Codex infer <em>what you forgot to ask for?</em></h2>
          </div>
          <p>Compare Direct, <code>/goal</code>, and <code>$possible</code>.</p>
        </header>
        <ol className="home-benchmark-links" aria-label="Possible benchmarks">
          {benchmarkCards.map((benchmark) => (
            <li key={benchmark.slug}>
              <a href={`/benchmarks/${benchmark.slug}`}>
                <span>{benchmark.number}</span>
                <strong>{benchmark.shortTitle}</strong>
                <em>{benchmark.metric} · {benchmark.budget}</em>
                <i>↗</i>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <SiteFooter />
    </main>
  );
}

function BlogsPage() {
  return (
    <main className="blogs-page">
      <SiteNav label="Blogs / 02" />
      <h1 className="sr-only">Possible writing</h1>

      <section className="blogs-index" aria-label="Possible articles">
        <a href="/blogs/what-is-possible">
          <span>PRODUCT DEFINITION · 20 JUL 2026</span>
          <h2>What is Possible?</h2>
          <p>Possible.sh is an open-source library of Outcome Packs. The installed <code>$possible</code> skill recommends and runs them with Codex.</p>
          <strong>READ ARTICLE →</strong>
        </a>
        <a href="/blogs/why-possible">
          <span>ESSAY · 20 JUL 2026</span>
          <h2>Why Possible?</h2>
          <p>AI agents can perform increasingly complex work. The remaining bottleneck is our ability to define, coordinate, and verify what we want from them.</p>
          <strong>READ ARTICLE →</strong>
        </a>
      </section>

      <aside className="blogs-evidence">
        <span>LOOKING FOR EVIDENCE?</span>
        <p>The benchmark suite compares what Direct, <code>/goal</code>, and <code>$possible</code> produce from the same starting point and one rough prompt.</p>
        <a href="/benchmarks">View benchmarks →</a>
      </aside>

      <SiteFooter />
    </main>
  );
}

function WhatPage() {
  const productParts = [
    { label: "THE RESULT", term: "Outcome", description: "The observable end state you want to make true—not the activity an agent performs." },
    { label: "THE EXECUTION SYSTEM", term: "Outcome Pack", description: "A reusable execution prompt, selected agent skills, sequencing, safeguards, and completion checks for one class of outcomes." },
    { label: "THE CAPABILITIES", term: "Agent skills", description: "Reusable capabilities that perform focused work such as design, coding, testing, CAD, release, or operations." },
    { label: "THE GUIDE", term: "$possible", description: "The installed agent skill that understands your request, recommends an Outcome Pack, and runs it after approval." },
  ] as const;

  return (
    <main className="what-page editorial-page">
      <SiteNav label="Blog / What is Possible?" />

      <article className="what-article editorial-article">
      <header className="what-hero editorial-header">
        <p className="eyebrow">PRODUCT DEFINITION / POSSIBLE.SH</p>
        <h1>Possible.sh is an<br /><em>open-source library</em><br />of Outcome Packs.</h1>
        <p className="editorial-dek">Describe the result you want. The installed <code>$possible</code> skill clarifies the outcome, recommends an Outcome Pack, and runs it with selected agent skills until completion checks pass.</p>
        <div className="editorial-byline">
          <span>FRAY LABS · 20 JUL 2026</span><span>PRODUCT DEFINITION</span>
        </div>
      </header>

      <aside className="what-definition-note"><span>HOW YOU USE IT</span><strong>Install <code>$possible</code> in Codex.</strong><p>The skill connects your request to the open-source Outcome Pack library.</p></aside>

      <section className="what-flow" aria-labelledby="what-flow-heading">
        <header><span>THE COMPLETE MODEL</span><h2 id="what-flow-heading">One ambition. A coordinated path. A verified result.</h2></header>
        <ol>
          <li><span>01</span><strong>Your ambition</strong><p>You explain what you want to make possible in ordinary language.</p></li>
          <li><span>02</span><strong><code>$possible</code></strong><p>Clarifies the intended end state and recommends the appropriate Outcome Pack.</p></li>
          <li><span>03</span><strong>Outcome Pack + agent skills</strong><p>Sequence and perform the work after you approve the recommendation.</p></li>
          <li><span>04</span><strong>Verified outcome</strong><p>Artifacts, checks, limitations, and a completion report show what is actually true.</p></li>
        </ol>
      </section>

      <section className="what-anatomy" aria-labelledby="what-anatomy-heading">
        <header><span>DO NOT CONFUSE THE PARTS</span><h2 id="what-anatomy-heading">What each thing means.</h2></header>
        <div>
          {productParts.map((part) => (
            <article key={part.term}>
              <span>{part.label}</span>
              <h3>{part.term}</h3>
              <p>{part.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="what-surface" aria-labelledby="what-surface-heading">
        <div>
          <span>POSSIBLE.SH</span>
          <h2 id="what-surface-heading">The website is the public home, not the agent.</h2>
          <p>Possible.sh hosts the open-source Outcome Pack library, installer, documentation, demonstrations, and evidence. The installed <code>$possible</code> skill works with you inside the project and coordinates each run.</p>
          <a href="/docs">Read the documentation →</a>
        </div>
        <dl>
          <div><dt>Install</dt><dd><code>{installCommand}</code></dd></div>
          <div><dt>Interface</dt><dd><code>$possible</code> and a conversation</dd></div>
          <div><dt>Knowledge</dt><dd>Reviewed Outcome Packs</dd></div>
          <div><dt>Execution</dt><dd>Codex and agent skills</dd></div>
          <div><dt>Result</dt><dd>A verified outcome</dd></div>
        </dl>
      </section>

      <section className="what-not" aria-labelledby="what-not-heading">
        <header><span>BOUNDARIES</span><h2 id="what-not-heading">What Possible is not.</h2></header>
        <ul>
          <li>Not another directory where you must choose individual agent skills.</li>
          <li>Not one giant skill that can perform every kind of work itself.</li>
          <li>Not an outcome—the outcome is the result you are trying to achieve.</li>
          <li>Not blanket permission to deploy, publish, spend, contact people, or change external systems.</li>
        </ul>
        <aside><strong>CURRENT SUPPORT</strong><p>Possible is delivered and verified as a Codex skill today. Its model can extend to other agent surfaces, but they are not yet a supported product claim.</p></aside>
      </section>

      <section className="what-cta">
        <span>START WITH AN AMBITION</span>
        <h2>What do you want to make possible?</h2>
        <div><code>{installCommand}</code><CopyButton label="Copy install command" value={installCommand} /></div>
        <p>Then open Codex and type <code>$possible</code>.</p>
      </section>
      </article>

      <SiteFooter />
    </main>
  );
}

function WhyPage() {
  return (
    <main className="why-page editorial-page">
      <SiteNav label="Blog / Why Possible" />

      <article className="why-article editorial-article">
        <header className="why-article-header editorial-header">
          <p className="eyebrow">AN ESSAY FROM POSSIBLE</p>
          <h1>The bottleneck is no longer what AI can do.</h1>
          <p className="why-dek editorial-dek">It is our ability to see what is possible, define the outcome, and direct agents toward it.</p>
          <div className="why-byline editorial-byline"><span>FRAY LABS · 20 JUL 2026</span><span>WHY POSSIBLE</span></div>
        </header>

        <div className="why-article-body editorial-body">
          <section id="problem" aria-labelledby="why-problem-heading">
            <p className="why-lead">The way most people work with AI still resembles a chat window from years ago: ask for one thing, wait for the answer, decide what comes next, and prompt again.</p>
            <p>This interaction is useful for isolated tasks. It becomes exhausting when the ambition is larger than a task—launching a product, building a working application, preparing a release, or running an ongoing function.</p>
            <h2 id="why-problem-heading">The agent is no longer the only bottleneck.</h2>
            <p>The human must continuously hold the objective in mind, remember what has already happened, break the work into small instructions, inspect every response, and invent the next prompt. Over time, strategic thinking gives way to supervision. The user eventually asks the agent, “What should I do next?”</p>
            <p>At that point, the human has become the project manager, memory, and orchestration layer for a system that is supposed to reduce their workload.</p>
            <blockquote>
              <p>Ask → wait → inspect → decide what comes next → prompt again.</p>
              <footer>The prompt loop</footer>
            </blockquote>
          </section>

          <section id="outcome" aria-labelledby="why-outcome-heading">
            <h2 id="why-outcome-heading">The missing layer is the outcome.</h2>
            <p>Possible starts one level above the prompt. You describe what you want to make real—even when the idea is rough. Possible asks a few questions that can materially change the result: who it is for, what already exists, what success must prove, and which real-world actions remain off limits.</p>
            <p>From that conversation, <code>$possible</code> defines a finished outcome, recommends one reviewed Outcome Pack, and explains its outputs, checks, and boundaries. Only after you approve does the agent install the required capabilities and begin the run.</p>
            <p>This changes the human’s job. You remain responsible for intent and consequential decisions. You no longer need to translate an ambition into every intermediate instruction.</p>
          </section>

          <section id="roles" aria-labelledby="why-roles-heading">
            <h2 id="why-roles-heading">Three roles, clearly separated.</h2>
            <div className="why-responsibility-table">
              <article>
                <header><span>YOU</span><strong>Steer</strong></header>
                <p>Describe the ambition, provide essential context, and approve consequential decisions or external actions.</p>
              </article>
              <article>
                <header><span>POSSIBLE</span><strong>Coordinate</strong></header>
                <p>Clarify the outcome, inspect what exists, recommend the appropriate Outcome Pack, assemble reviewed capabilities, coordinate the run, and verify the result.</p>
              </article>
              <article>
                <header><span>AGENTS</span><strong>Execute</strong></header>
                <p>Complete bounded workstreams, create the artifacts, run the checks, and return evidence instead of unsupported claims.</p>
              </article>
            </div>
            <p>You do not need to browse the library or decide which agent skills belong together. <code>$possible</code> resolves those details from the conversation.</p>
          </section>

            <p className="why-thesis"><strong><code>$possible</code> recommends the Outcome Pack. You approve the run.</strong> Before approval, intake and inspection remain read-only; no agent skills, outcome state, or production work are installed or created.</p>

          <section id="process" aria-labelledby="why-process-heading">
            <h2 id="why-process-heading">From ambition to evidence.</h2>
            <ol className="why-process">
              <li><strong>Describe what you want to make real.</strong><p>A rough idea is enough. Possible helps shape it without forcing you through a form.</p></li>
              <li><strong>Review the proposed outcome.</strong><p><code>$possible</code> recommends one Outcome Pack and explains what it will produce, how it will be checked, and what remains gated.</p></li>
              <li><strong>Decide whether to proceed.</strong><p>Your confirmation authorizes the disclosed local work—not deployment, publishing, spending, outreach, or other external actions.</p></li>
              <li><strong>Receive the work and the proof.</strong><p>Agents execute coordinated work. <code>$possible</code> integrates their output and returns artifacts, checks, limitations, and a completion report.</p></li>
            </ol>
          </section>

          <section id="example" aria-labelledby="why-example-heading">
            <h2 id="why-example-heading">A concrete example.</h2>
            <p>Imagine opening Codex and saying:</p>
            <div className="why-transcript">
              <p><span>YOU</span>“I want to launch my e-ink focus device.”</p>
              <p><span>POSSIBLE</span>Clarifies what already exists, who the device is for, and what a credible launch must prove. It recommends Hardware Launch and explains the intended deliverables and boundaries.</p>
              <p><span>YOU</span>“Yes, proceed.”</p>
              <p><span>AGENTS</span>Coordinate product definition, CAD, positioning, website, launch film, and independent verification. Any deployment, fabrication, outreach, or spending still requires a separate decision.</p>
            </div>
            <p>The user chose the ambition and approved the outcome. Possible chose and coordinated the path. The agents performed the work.</p>
            <a className="why-text-link" href="/demo/hardware">See the recorded Hardware Launch outcome →</a>
          </section>

          <section id="scope" aria-labelledby="why-lanes-heading">
            <h2 id="why-lanes-heading">What can Possible coordinate?</h2>
            <p>The library currently covers four kinds of outcomes. You do not choose a category during intake; <code>$possible</code> selects the relevant Outcome Pack from the conversation.</p>
            <dl className="why-essay-lanes">
              <div><dt>Create</dt><dd>Build products, assets, systems, and experiences.</dd></div>
              <div><dt>Launch</dt><dd>Bring working software and hardware to an audience.</dd></div>
              <div><dt>Operate</dt><dd>Run repeatable functions such as marketing and application reliability.</dd></div>
              <div><dt>Release</dt><dd>Package, verify, deploy, and distribute completed work.</dd></div>
            </dl>
          </section>

          <section aria-labelledby="why-conclusion-heading">
            <h2 id="why-conclusion-heading">A different relationship with agents.</h2>
            <p>Possible does not eliminate human judgment. It puts that judgment where it is most valuable: choosing the ambition, correcting the understanding, approving the outcome, and deciding when consequential actions should happen.</p>
            <p>The agent handles the execution. Possible keeps that execution attached to the larger purpose.</p>
            <p>Instead of asking, “What should I prompt next?” the human can return to the more important question:</p>
            <p className="why-closing-line">What do I want to make possible?</p>
            <a className="why-text-link" href="/benchmarks">Compare the workflows →</a>
          </section>

          <footer className="why-article-cta">
            <div><span>START HERE</span><strong>Bring a rough idea.</strong><p>Possible will help define the outcome before any project-writing or production work begins.</p></div>
            <div><pre><code>{installCommand}</code></pre><CopyButton label="Copy install command" value={installCommand} /></div>
            <p>Then open Codex and type <code>$possible</code>.</p>
          </footer>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}

function BenchmarkGalleryPage() {
  return (
    <main className="benchmark-gallery-page">
      <SiteNav label="Benchmarks / 02" />

      <section className="benchmark-gallery" aria-labelledby="benchmark-gallery-heading">
        <header>
          <div>
            <p className="eyebrow">POSSIBLE BENCHMARK SUITE / V0.1</p>
            <h1 id="benchmark-gallery-heading">Which workflow supplies<br /><em>the missing judgment?</em></h1>
          </div>
          <p>Compare Direct, <code>/goal</code>, and <code>$possible</code> from the same prompt.</p>
        </header>

        <div className="benchmark-gallery-grid">
          {benchmarkCards.map((benchmark) => (
            <a href={`/benchmarks/${benchmark.slug}`} key={benchmark.slug}>
              <header><span>{benchmark.version} / {benchmark.label}</span><i>↗</i></header>
              <div><h2>{benchmark.shortTitle}</h2><p>{benchmark.question}</p></div>
              <dl><div><dt>PRIMARY METRIC</dt><dd>{benchmark.metric}</dd></div><div><dt>STATUS</dt><dd>{benchmark.status}</dd></div></dl>
              <div className="benchmark-card-footer"><span>{benchmark.budget}</span><strong>VIEW BENCHMARK →</strong></div>
            </a>
          ))}
        </div>

        <aside><strong>NO CONTROLLED RUNS</strong><span>Modeled · one prompt · same starting point · judgment, artifacts, and human time</span></aside>
      </section>

      <SiteFooter />
    </main>
  );
}

function BenchmarkDetailPage({ slug }: { slug: BenchmarkSlug }) {
  const benchmark = getBenchmark(slug)!;
  const comparison = benchmarkComparisons[slug];
  const pack = getPack(benchmark.packSlug)!;
  const maxOutputs = Math.max(...comparison.entries.map((entry) => entry.artifacts.length));

  return (
    <main className="benchmarks-page editorial-page">
      <SiteNav label={`Benchmark / ${benchmark.number}`} />

      <article className="benchmark-article editorial-article">
        <header className="benchmark-hero editorial-header">
          <p className="eyebrow">{benchmark.version} / {benchmark.label}</p>
          <h1>{benchmark.title}</h1>
          <p className="editorial-dek">{benchmark.question}</p>
          <div className="benchmark-release"><span>RELEASE {benchmark.version}</span><span>21 JUL 2026</span><strong>{benchmark.status}</strong></div>
        </header>

        <dl className="benchmark-facts" aria-label="Benchmark summary">
          <div><dt>STATUS</dt><dd>Modeled · no controlled runs</dd></div>
          <div><dt>INPUT</dt><dd>One prompt</dd></div>
          <div><dt>PRIMARY</dt><dd>Operational judgment</dd></div>
          <div><dt>OUTCOME PACK</dt><dd><a href={`/packs/${pack.slug}`}>{pack.name} ↗</a></dd></div>
        </dl>

        <section className="benchmark-section benchmark-task" aria-labelledby="benchmark-task-heading">
          <header><span>01 / ONE PROMPT</span><h2 id="benchmark-task-heading">Use the request a person would actually make.</h2></header>
          <blockquote><span>USER INTENT</span><p>“{comparison.brief}”</p></blockquote>
          <div className="benchmark-invocations" aria-label="Workflow invocations">
            {comparison.entries.map((entry) => <code key={entry.workflow}>{entry.invocation}</code>)}
          </div>
        </section>

        <section className="benchmark-section benchmark-before" aria-labelledby="benchmark-before-heading">
          <header><span>02 / STARTING POINT</span><h2 id="benchmark-before-heading">Each workflow starts with the same subject.</h2></header>
          <div><strong>SAME STARTING POINT</strong><p>{comparison.before}</p></div>
        </section>

        <section className="benchmark-section benchmark-judgment" aria-labelledby="benchmark-judgment-heading">
          <header>
            <span>03 / OPERATIONAL JUDGMENT</span>
            <h2 id="benchmark-judgment-heading">What did each workflow know to add?</h2>
            <p>Scores credit visible evidence only. They do not measure artifact quality.</p>
          </header>
          <div className="benchmark-judgment-table-wrap" role="region" aria-label="Scrollable operational judgment comparison" tabIndex={0}>
            <table className="benchmark-judgment-table">
              <caption className="sr-only">Operational judgment supplied by Direct, /goal, and $possible</caption>
              <thead><tr><th scope="col">Missing expertise</th><th scope="col">Direct</th><th scope="col">/goal</th><th scope="col">$possible</th></tr></thead>
              <tbody>{comparison.judgment.map((row) => <tr key={row.dimension}>
                <th scope="row">{row.dimension}</th>
                {([row.direct, row.goal, row.possible] as const).map((result, index) => <td key={index}>
                  <strong className={`benchmark-judgment-level benchmark-judgment-level--${result.level.toLowerCase()}`}>{result.level}</strong>
                  <span>{result.label}</span>
                  {result.evidence.length > 0 ? <code>{result.evidence.join(" · ")}</code> : null}
                </td>)}
              </tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className="benchmark-section benchmark-after" aria-labelledby="benchmark-after-heading">
          <header><span>04 / ARTIFACTS AND TIME</span><h2 id="benchmark-after-heading">Artifacts and time support the comparison.</h2></header>
          <figure aria-label={`Artifact comparison for ${benchmark.title}`}>
            <div className="benchmark-output-axis"><span>0</span><span>{Math.round(maxOutputs / 2)}</span><span>{maxOutputs} artifacts</span></div>
            <ol className="benchmark-output-bars" aria-label="Artifacts produced after one prompt">
              {comparison.entries.map((entry) => <li className={entry.possible ? "is-possible" : undefined} key={entry.workflow}>
                <header><strong>{entry.workflow}</strong><b>{entry.artifacts.length}</b></header>
                <div className="benchmark-output-track"><i style={{ width: `${entry.artifacts.length / maxOutputs * 100}%` }} /></div>
                <div className="benchmark-output-times"><span>AGENT RUNTIME <b>{entry.agentTime}</b></span><span>HUMAN COORDINATION <b>{entry.humanTime}</b></span></div>
                <p>{entry.summary}</p>
              </li>)}
            </ol>
          </figure>

          <div className="benchmark-output-snapshots" aria-label="Artifact inventories">
            {comparison.entries.map((entry) => <article className={entry.possible ? "is-possible" : undefined} key={entry.workflow}>
              <header><strong>{entry.workflow}</strong><span>{entry.artifacts.length} ARTIFACTS</span></header>
              <pre><code>{entry.artifacts.join("\n")}</code></pre>
            </article>)}
          </div>
        </section>

        <section className="benchmark-section benchmark-why" aria-labelledby="benchmark-why-heading">
          <header><span>05 / WHY THE GAP EXISTS</span><h2 id="benchmark-why-heading">Possible starts with a reviewed outcome map.</h2></header>
          <p>Direct and <code>/goal</code> infer the missing work. <code>$possible</code> loads that operational knowledge from the matching Outcome Pack.</p>
          <a className="why-text-link" href={`/packs/${pack.slug}`}>Inspect the {pack.name} Outcome Pack →</a>
        </section>

        <div className="benchmark-detail-nav">
          <a href="/benchmarks">← All benchmarks</a>
          <span>{benchmark.number} / 02</span>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
function PackCard({ pack }: { pack: OutcomePack }) {
  const isSchedulable = Boolean(pack.schedule);
  return (
    <a className={`pack-card pack-card--${pack.slug}`} href={`/packs/${pack.slug}`}>
      <div className="pack-cover">
        <header><span>OUTCOME PACK / {String(pack.catalogNumber).padStart(2, "0")}</span><small>{pack.lane.toUpperCase()}{isSchedulable ? " · SCHEDULABLE" : ""}</small><b>↗</b></header>
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
          {isSchedulable ? <span>OPTIONAL SCHEDULE</span> : null}
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
  const [activeLane, setActiveLane] = useState<"all" | PackLane>("all");
  const laneCounts = Object.fromEntries(laneOrder.map((lane) => [lane, outcomePacks.filter((pack) => pack.lane === lane).length])) as Record<PackLane, number>;
  const visibleLanes = laneOrder.filter((lane) => laneCounts[lane] > 0);
  const visiblePacks = activeLane === "all" ? galleryPacks : galleryPacks.filter((pack) => pack.lane === activeLane);
  const activeLabel = activeLane === "all" ? "All" : laneLabels[activeLane];
  const resultNoun = visiblePacks.length === 1 ? "Outcome Pack" : "Outcome Packs";

  return (
    <main>
      <SiteNav label={`Catalog / ${String(outcomePacks.length).padStart(2, "0")}`} />
      <section className="catalog-hero">
        <p className="eyebrow">OUTCOME PACK LIBRARY / {String(outcomePacks.length).padStart(2, "0")}</p>
        <h1>Reviewed Outcome Packs.<br /><em>Recommended by $possible.</em></h1>
        <div className="catalog-intro">
          <p>Each Outcome Pack combines a reusable execution prompt, selected agent skills, sequencing, safeguards, and completion checks. Describe the outcome; <code>$possible</code> recommends the right pack.</p>
          <a className="button-link" href="/#start">Start with Possible <span>→</span></a>
        </div>
      </section>
      <div className="pack-filter-header">
        <span>BROWSE BY OUTCOME</span>
        <div className="pack-filters" role="group" aria-label="Filter Outcome Packs by category">
          <button type="button" aria-label={`All, ${outcomePacks.length} Outcome Packs`} aria-pressed={activeLane === "all"} aria-controls="pack-catalog" onClick={() => setActiveLane("all")}>
            <span>ALL</span><strong>{String(outcomePacks.length).padStart(2, "0")}</strong>
          </button>
          {visibleLanes.map((lane) => (
            <button type="button" aria-label={`${laneLabels[lane]}, ${laneCounts[lane]} ${laneCounts[lane] === 1 ? "Outcome Pack" : "Outcome Packs"}`} aria-pressed={activeLane === lane} aria-controls="pack-catalog" onClick={() => setActiveLane(lane)} key={lane}>
              <span>{lane.toUpperCase()}</span><strong>{String(laneCounts[lane]).padStart(2, "0")}</strong>
            </button>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">Showing {visiblePacks.length} {activeLabel} {resultNoun}.</p>
      </div>
      <section id="pack-catalog" className={`pack-grid${activeLane === "all" ? "" : " pack-grid--filtered"}${visiblePacks.length === 1 ? " pack-grid--single" : ""}`} aria-label={`${activeLabel} Outcome Packs`}>
        {visiblePacks.map((pack) => <PackCard pack={pack} key={pack.slug} />)}
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
  const packNumber = pack.catalogNumber;
  const compiled = compilePack(pack);
  const reviewedLabel = new Date(`${pack.reviewedAt}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const isSchedulable = Boolean(pack.schedule);
  const sections = [
    ["overview", "Overview"],
    ["fit", "Fit"],
    ["outputs", "Outcome contract"],
    ["workstreams", "Execution plan"],
    ["agent-skills", "Agent skills"],
    ["install", "Install"],
    ["run-prompt", "Run prompt"],
    ...(isSchedulable ? [["schedule", "Schedule"]] : []),
    ["boundaries", "Boundaries"],
    ["verification", "Verification"],
  ];

  return (
    <main className="pack-reference-page">
      <a className="pack-reference-skip" href="#pack-specification">Skip to Outcome Pack specification</a>
      <SiteNav label={`Outcome Pack / ${String(packNumber).padStart(2, "0")}`} />
      <div className="pack-reference-shell">
        <aside className="pack-reference-packs" aria-label="Outcome Pack navigation">
          <header><span>OUTCOME PACKS</span><strong>{String(outcomePacks.length).padStart(2, "0")}</strong></header>
          <nav aria-label="Outcome Packs">
            {galleryPacks.map((candidate) => (
              <a href={`/packs/${candidate.slug}`} aria-current={candidate.slug === pack.slug ? "page" : undefined} key={candidate.slug}>
                <span>{String(candidate.catalogNumber).padStart(2, "0")}</span>
                <strong>{candidate.name}</strong>
                <small>{candidate.lane}</small>
              </a>
            ))}
          </nav>
          <a className="pack-reference-back" href="/packs">← Gallery</a>
        </aside>

        <article className="pack-reference-document" id="pack-specification" tabIndex={-1}>
          <header className="pack-reference-header" id="overview">
            <div className="pack-reference-breadcrumb"><a href="/packs">OUTCOME PACKS</a><span>/</span><strong>{pack.lane.toUpperCase()}</strong><span>/</span><strong>{String(packNumber).padStart(2, "0")}</strong></div>
            <dl className="pack-reference-meta">
              <div><dt>CATEGORY</dt><dd>{pack.lane}</dd></div>
              <div><dt>OUTCOME PACK</dt><dd>{String(packNumber).padStart(2, "0")}</dd></div>
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

          {isSchedulable ? (
            <section className="pack-reference-section pack-schedule-section" id="schedule">
              <header><span>07</span><h2>{pack.schedule?.title}</h2><p>{pack.schedule?.description}</p></header>
              <div className="pack-schedule-prompt">
                <header><span>START IN NATURAL LANGUAGE</span><strong>$possible</strong></header>
                <code>{pack.schedule?.request}</code>
              </div>
              <ol className="pack-schedule-flow" aria-label="Scheduling flow">
                <li><span>01</span><strong>Run it once</strong><p>Test the first cycle manually before scheduling.</p></li>
                <li><span>02</span><strong>Draft the task</strong><p>Show the exact task, cadence, timezone, project, prompt, and permissions. Also disclose its worktree mode and stop conditions.</p></li>
                <li><span>03</span><strong>Approve the schedule</strong><p>Ask for separate approval before creating or enabling the scheduled task.</p></li>
                <li><span>04</span><strong>Review every completion report</strong><p>Each recurring run reads the latest report, runs one cycle, carries unresolved work forward, and writes a new dated report.</p></li>
              </ol>
              <aside className="pack-schedule-boundary"><strong>SAFE DEFAULT</strong><p>{pack.schedule?.safeDefault}</p></aside>
            </section>
          ) : null}

          <section className="pack-reference-section" id="boundaries">
            <header><span>{isSchedulable ? "08" : "07"}</span><h2>Approval boundaries</h2><p>Outcome Pack approval permits local work only. External actions need separate approval.</p></header>
            <div className="pack-approval-callout"><strong>What “yes” authorizes</strong><p>{approvalDisclosure}</p></div>
            <ul className="pack-reference-list">{pack.guardrails.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>

          <section className="pack-reference-section" id="verification">
            <header><span>{isSchedulable ? "09" : "08"}</span><h2>Verification</h2><p>Completion requires evidence. Missing or skipped proof stays visible.</p></header>
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
      <SiteNav label="Examples / 04" />
      <h1 className="sr-only">Possible outcome demos</h1>

      <section className="demo-gallery-grid" aria-label="Recorded Possible examples">
        <a className="demo-example-card demo-example-card--hardware" href="/demo/hardware">
          <header><span>01 / HARDWARE LAUNCH</span><strong>VERIFIED RUN ↗</strong></header>
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

        <a className="demo-example-card demo-example-card--software" href="/demo/software">
          <header><span>02 / SOFTWARE LAUNCH</span><strong>VERIFIED RUN ↗</strong></header>
          <div className="demo-example-visual demo-example-visual--software" aria-hidden="true">
            <div className="three-card"><span>THREE / TODAY</span><b>1</b><i /><b>2</b><i /><b>3</b><i /><strong>THEN YOU’RE DONE.</strong></div>
          </div>
          <div className="demo-example-copy">
            <p>THREE / LOCAL-FIRST WEB APP</p>
            <h2>Empty repo to a<br />complete launch.</h2>
            <p className="demo-example-transformation">A software novice supplied one small app idea. Possible supplied the product, implementation, launch, testing, and verification work needed for a complete release.</p>
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
            <p className="demo-example-transformation">A first-time maintainer supplied three files. Possible identified the API, documentation, CI, security, packaging, and clean-consumer proof required for a trustworthy release.</p>
            <div><span>{openSourceThread.agents.length} agent threads</span><span>{openSourceThread.messages.length} public messages</span><span>9 / 9 tests</span></div>
          </div>
        </a>

        <a className="demo-example-card demo-example-card--game" href="/demo/game">
          <header><span>04 / PLAYABLE WEB GAME</span><strong>LIVE OUTCOME PROOF ↗</strong></header>
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

        <a className="demo-example-card demo-example-card--robot" href="/demo/robot-snake">
          <header><span>05 / ROBOT PROTOTYPE</span><strong>ISOLATED VERIFIED RUN ↗</strong></header>
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
      </section>
      <SiteFooter />
    </main>
  );
}

function OpenSourceDemoPage() {
  const [threadOpen, setThreadOpen] = useState(false);

  return (
    <main className="demo-detail-page demo-detail-page--release" id="top">
      <SiteNav label="Recorded run / tiny-slug" />
      <DemoOutcomeHeader
        eyebrow="OPEN-SOURCE RELEASE / VERIFIED OUTCOME"
        title="A tiny package,"
        accent="ready to trust."
        description="Open the package, documentation, CI, security review, and clean-consumer evidence produced by a preserved Open-Source Release run."
        metric="9 / 9 TESTS · 0 FINDINGS"
        thread={openSourceThread}
        onOpenThread={() => setThreadOpen(true)}
      />

      <section className="demo-artifacts release-artifacts" id="artifacts" aria-label="Outcome artifacts">
        <DemoOutputLabel />
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
            <a href="/demo/tiny-slug/.possible/outcome-receipt.md" target="_blank" rel="noreferrer">OPEN COMPLETION REPORT ↗</a>
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
      </section>

      <DemoConversation
        userIdea="I want to release tiny-slug, a tiny ASCII-only ESM slugifier."
        possibleQuestion="When this is finished, what would make the release trustworthy to a consumer and a contributor?"
        userOutcome="A clean package, API docs, runnable examples, CI, security review, and release plan—but do not publish, push, or tag anything."
        packHref="/packs/open-source-release"
        packLabel="Open-Source Release"
        recommendation="It coordinates release engineering, documentation, CI, security assurance, and independent consumer verification."
      />
      <DemoOutcomeFooter text="Prepared locally. Nothing was published, pushed, tagged, or changed externally." />

      {threadOpen ? <ThreadTranscript thread={openSourceThread} rawHref="/demo/tiny-slug/CODEX-THREAD.md" outputHref="#artifacts" onClose={() => setThreadOpen(false)} /> : null}
    </main>
  );
}

function SoftwareDemoPage() {
  const [threadOpen, setThreadOpen] = useState(false);

  return (
    <main className="demo-detail-page demo-detail-page--software" id="top">
      <SiteNav label="Recorded run / Three" />
      <DemoOutcomeHeader
        eyebrow="SOFTWARE LAUNCH / VERIFIED OUTCOME"
        title="A real product,"
        accent="ready to open."
        description="Use the browser product, open its launch site, watch the film, and inspect the release evidence from a preserved Software Launch run."
        metric="15 / 15 TESTS · 22 SECOND FILM"
        thread={softwareThread}
        onOpenThread={() => setThreadOpen(true)}
      />

      <section className="demo-artifacts software-artifacts" id="artifacts" aria-label="Outcome artifacts">
        <DemoOutputLabel />
        <div className="software-live-grid">
          <article className="software-live-card software-live-card--product">
            <header><span>01 / BROWSER PRODUCT</span><strong>INTERACTIVE BUILD</strong></header>
            <iframe title="Three local-first product" src="/demo/three/product/index.html" loading="lazy" />
            <footer><p><strong>Three / Today</strong><span>Add, complete, reload, remove, and reuse up to three lines.</span></p><a href="/demo/three/product/index.html" target="_blank" rel="noreferrer">OPEN PRODUCT ↗</a></footer>
          </article>

          <article className="software-live-card software-live-card--site">
            <header><span>02 / LAUNCH SITE</span><strong>PRODUCTION BUILD</strong></header>
            <iframe title="Three launch website" src="/demo/three/site/index.html" loading="lazy" />
            <footer><p><strong>Three things. Then you’re done.</strong><span>Truthful local-only positioning with no fake waitlist or demand claims.</span></p><a href="/demo/three/site/index.html" target="_blank" rel="noreferrer">OPEN SITE ↗</a></footer>
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
          <a href="/demo/three/evidence/product-test-receipt.md" target="_blank" rel="noreferrer"><span>PRODUCT</span><strong>15-test report</strong><i>MD ↗</i></a>
          <a href="/demo/three/evidence/site-test-receipt.md" target="_blank" rel="noreferrer"><span>SITE</span><strong>Build report</strong><i>MD ↗</i></a>
          <a href="/demo/three/evidence/film-render-receipt.md" target="_blank" rel="noreferrer"><span>FILM</span><strong>Render report</strong><i>MD ↗</i></a>
          <a href="/demo/three/release/release-plan.md" target="_blank" rel="noreferrer"><span>RELEASE</span><strong>Gated plan</strong><i>MD ↗</i></a>
          <a href="/demo/three/evidence/final-verification.md" target="_blank" rel="noreferrer"><span>FINAL</span><strong>L0–L8 decision</strong><i>MD ↗</i></a>
          <a href="/demo/three/evidence/failed-review-01/README.md" target="_blank" rel="noreferrer"><span>FAILED PASS</span><strong>What review caught</strong><i>MD ↗</i></a>
          <a href="/demo/three/evidence/integration-repairs.md" target="_blank" rel="noreferrer"><span>REPAIRS</span><strong>Failure history</strong><i>MD ↗</i></a>
          <a href="/demo/three/CODEX-THREAD.md" target="_blank" rel="noreferrer"><span>THREAD</span><strong>Complete public run</strong><i>MD ↗</i></a>
        </div>
      </section>

      <DemoConversation
        userIdea="I want to launch Three, a local-first web app that helps people commit to exactly three things today."
        possibleQuestion="Who is this for, and what must exist for you to consider it genuinely launched?"
        userOutcome="Overloaded solo builders. I want the real app, launch site, product film, and release plan—without accounts, a backend, analytics, or deployment."
        packHref="/packs/software-launch"
        packLabel="Software Launch"
        recommendation="It coordinates the product, launch website, demo film, release readiness, and fresh independent review."
      />
      <DemoOutcomeFooter text="Prepared and verified locally. Nothing was deployed, published, or sent externally." />

      {threadOpen ? <ThreadTranscript thread={softwareThread} rawHref="/demo/three/CODEX-THREAD.md" outputHref="#artifacts" onClose={() => setThreadOpen(false)} /> : null}
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
        <a href="/docs#schedule">Scheduling</a>
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
            <p>Install <code>$possible</code> once. Describe what you want to make—or say “I want to schedule operations.” The skill finds the right Outcome Pack with you.</p>
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
              <div><dt>External action</dt><dd>A real-world change—such as deploying, publishing, spending, outreach, fabrication, or scheduling—that requires separate approval.</dd></div>
              <div><dt>Schedule</dt><dd>An approved way to repeat a proven run. It is not an Outcome Pack and does not grant blanket permission for external actions.</dd></div>
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

          <section id="schedule">
            <h2>Schedule a recurring outcome</h2>
            <p>Scheduling is for work that genuinely repeats, such as operating an already-live web app or running a bounded marketing review and draft cycle. It is not a new Outcome Pack or permission to rerun every launch unattended.</p>
            <div className="docs-command docs-command--schedule">
              <header><span>CODEX</span><strong>NATURAL LANGUAGE</strong></header>
              <pre><code>$possible{"\n"}{schedulePrompt}</code></pre>
              <CopyButton label="Copy scheduling prompt" value={`$possible\n${schedulePrompt}`} />
            </div>
            <p>For recurring plans, drafts, and measurement, say <code>I want to schedule marketing operations.</code> <code>$possible</code> will recommend the Marketing Operations Outcome Pack instead of Web App Operations.</p>
            <ol>
              <li><strong>Prove the first cycle</strong><span>Possible establishes the operating loop and runs it manually before offering recurrence.</span></li>
              <li><strong>Inspect the exact task</strong><span>Review its cadence, timezone, project, worktree mode, prompt, permissions, completion report, and stop conditions.</span></li>
              <li><strong>Approve scheduling separately</strong><span>Outcome Pack approval does not create, update, or enable a scheduled task.</span></li>
              <li><strong>Review recurring evidence</strong><span>Each run invokes <code>$possible resume</code>, carries unresolved work forward, and writes one dated completion report.</span></li>
            </ol>
            <aside className="docs-callout docs-callout--approval">
              <strong>DEFAULT SCHEDULE</strong>
              <p>Use a standalone task in an isolated worktree. Report findings and prepare reviewable repo-local evidence. Stop before deployment, production changes, paging, publishing, posting, sending, outreach, spending, tracking changes, secrets, or private data. For local projects, the machine and Codex app must remain running and the project must stay available.</p>
            </aside>
            <a className="docs-reference-link" href="/packs/web-app-operations"><span>SCHEDULABLE OUTCOME PACK</span><strong>Web App Operations</strong><i>View schedule contract →</i></a>
            <a className="docs-reference-link" href="/packs/marketing-operations"><span>SCHEDULABLE OUTCOME PACK</span><strong>Marketing Operations</strong><i>View schedule contract →</i></a>
          </section>

          <section id="files">
            <h2>Project files</h2>
            <p>Possible creates outcome state only after confirmation.</p>
            <div className="docs-table" role="table" aria-label="Possible project files">
              <div role="row"><strong role="columnheader">Path</strong><strong role="columnheader">Purpose</strong></div>
              <div role="row"><code role="cell">.possible/outcome-brief.md</code><span role="cell">Confirmed intent, constraints, interfaces, acceptance checks, gates, and unknowns.</span></div>
              <div role="row"><code role="cell">.possible/pack.json</code><span role="cell">The exact Outcome Pack snapshot approved for this run.</span></div>
              <div role="row"><code role="cell">.possible/skills-lock.json</code><span role="cell">Resolved sources, revisions, paths, and content hashes.</span></div>
              <div role="row"><code role="cell">.possible/schedule.json</code><span role="cell">Record of the last approved schedule. It stores the task identifier and configuration, but does not prove the external task is still enabled.</span></div>
            </div>
          </section>

          <section id="safety">
            <h2>Safety boundary</h2>
            <p>Outcome Pack approval authorizes local project work. It never grants real-world permission.</p>
            <aside className="docs-callout docs-callout--warning">
              <strong>SEPARATE APPROVAL REQUIRED</strong>
              <p>Deployment, scheduling changes, publishing, spending, outreach, fabrication, data collection, credential use, private-data sharing, and unsupported claims remain separately gated.</p>
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
              <details><summary>Scheduling is unavailable in my current Codex surface</summary><p>Possible should still test and prepare the durable task prompt, then return a completion report that marks scheduling as blocked. Create and manage scheduled tasks from ChatGPT web or the desktop app; do not claim a schedule exists until its external state can be inspected.</p></details>
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
          <a href="#schedule">Scheduling</a>
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
              <li><strong>Describe the ambition</strong><span>Say what you want to make, launch, operate, release, or repeat in your own words. A rough idea is enough.</span></li>
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
              <p>Deployment, publishing, scheduling changes, spending, outreach, fabrication, data collection, credential use, private-data sharing, and unsupported public claims remain separately gated.</p>
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
        <h1>This Outcome Pack is<br /><em>not possible yet.</em></h1>
        <a className="button-link" href="/packs">Browse all Outcome Packs <span>→</span></a>
      </section>
      <SiteFooter />
    </main>
  );
}

export function PossibleSite({ path: requestedPath }: { path?: string }) {
  const path = (requestedPath ?? (typeof window === "undefined" ? "/" : window.location.pathname)).replace(/\/+$/, "") || "/";
  if (path === "/") return <CreatePage />;
  if (path === "/blogs") return <BlogsPage />;
  if (path === "/blogs/what-is-possible") return <WhatPage />;
  if (path === "/blogs/why-possible") return <WhyPage />;
  if (path === "/benchmarks") return <BenchmarkGalleryPage />;
  if (path.startsWith("/benchmarks/")) {
    const benchmark = getBenchmark(path.slice("/benchmarks/".length));
    return benchmark ? <BenchmarkDetailPage slug={benchmark.slug} /> : <NotFoundPage />;
  }
  if (path === "/packs") return <PacksPage />;
  if (path === "/docs") return <DocsPage />;
  if (path === "/docs/how-to-use") return <HowToUsePage />;
  if (path === "/demo") return <DemoGalleryPage />;
  if (path === "/demo/game/play") return <Suspense fallback={<main className="plane-game-shell plane-game-loading"><span>FOLD / LOADING FLIGHT</span></main>}><PaperPlaneGame /></Suspense>;
  if (path === "/demo/game") return <PlayableGameDemoPage />;
  if (path === "/demo/robot-snake") return <RobotSnakeDemoPage />;
  if (path === "/demo/hardware") return <HardwareDemoPage />;
  if (path === "/demo/software") return <SoftwareDemoPage />;
  if (path === "/demo/open-source") return <OpenSourceDemoPage />;
  if (path.startsWith("/packs/")) {
    const pack = getPack(path.slice("/packs/".length));
    return pack ? <PackDetailPage pack={pack} /> : <NotFoundPage />;
  }
  return <NotFoundPage />;
}

export default PossibleSite;
