import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  ArrowLeft,
  Box,
  Check,
  CircleDot,
  FileCode2,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { WikiPage } from "@possible/knowledge";
import { wikiCorpusData } from "@possible/knowledge/data";

export const DEMO_DURATION_MS = 35_000;

export type DemoScene = "intro" | "outcome" | "research" | "execution" | "final";

export function demoSceneAt(elapsed: number): DemoScene {
  if (elapsed < 2_000) return "intro";
  if (elapsed < 10_000) return "outcome";
  if (elapsed < 21_000) return "research";
  if (elapsed < 31_000) return "execution";
  return "final";
}

const ROUTE_SLUGS = [
  "robotic-arms",
  "actuator-transmission-sizing",
  "parametric-cad-master",
  "mujoco",
  "manufacturing-process-selection",
  "robot-control-electronics",
  "robot-calibration-safety-physical-verification",
] as const;

function requirePage(slug: (typeof ROUTE_SLUGS)[number]): WikiPage {
  const page = wikiCorpusData.pages.find((candidate) => candidate.slug === slug);
  if (!page) throw new Error(`The demo route references a missing Possible page: ${slug}`);
  return page;
}

const OUTCOME = requirePage("robotic-arms");
const ROUTE = ROUTE_SLUGS.map(requirePage);
const SOURCES = OUTCOME.sources.slice(0, 3);

const FILES = [
  ["brief.md", "Outcome and constraints captured"],
  ["requirements/joint-loads.md", "Load cases ready to size"],
  ["cad/arm.step", "Parametric assembly target"],
  ["simulation/arm.xml", "MuJoCo model target"],
  ["controls/io-contract.md", "Commands, state, limits, faults"],
  ["verification/acceptance.md", "Physical acceptance gates"],
] as const;

const CHECKS = [
  "Size joints against load and duty cycle",
  "Build and inspect the parametric assembly",
  "Simulate motion, limits, and contact assumptions",
  "Preflight the selected manufacturing process",
  "Calibrate, risk-assess, and physically verify",
] as const;

function phaseState(elapsed: number, start: number, end: number) {
  if (elapsed >= end) return "done";
  if (elapsed >= start) return "active";
  return "waiting";
}

export function DemoPage() {
  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const [elapsed, setElapsed] = useState(reducedMotion ? DEMO_DURATION_MS : 0);

  useEffect(() => {
    if (reducedMotion) return;
    let frame = 0;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const next = Math.min(DEMO_DURATION_MS, now - startedAt);
      setElapsed(next);
      if (next < DEMO_DURATION_MS) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  const scene = demoSceneAt(elapsed);
  const progress = Math.min(100, (elapsed / DEMO_DURATION_MS) * 100);
  const style = { "--film-progress": `${progress}%` } as CSSProperties;

  return (
    <main className="demo-page film-page" data-scene={scene} style={style}>
      <nav className="demo-nav film-nav" aria-label="Demo navigation">
        <a className="brand-reset" href="/">
          <span className="brand-wordmark">possible<span>.sh</span></span>
          <span className="brand-tagline">A sourced wiki of what people and agents can make possible.</span>
        </a>
        <div className="route-nav-actions">
          <a className="back-button" href="/">
            <ArrowLeft size={17} aria-hidden="true" />
            Atlas
          </a>
          <a className="route-secondary-link" href="/how-it-works">How it works</a>
        </div>
      </nav>

      <section className="film-shell" aria-labelledby="demo-title" aria-live="off">
        <header className="film-header">
          <div>
            <p className="section-kicker">A 35-second agent workflow</p>
            <h1 id="demo-title">Watch an agent stop guessing.</h1>
          </div>
          <p>One outcome. Real Possible pages. A route that ends in evidence—not confidence.</p>
        </header>

        <ol className="film-phases" aria-label="Demo phases">
          <li data-state={phaseState(elapsed, 2_000, 10_000)}>
            <span>01</span><strong>What is possible?</strong><small>Educate the outcome</small>
          </li>
          <li data-state={phaseState(elapsed, 10_000, 21_000)}>
            <span>02</span><strong>How is it possible?</strong><small>Research the route</small>
          </li>
          <li data-state={phaseState(elapsed, 21_000, 31_000)}>
            <span>03</span><strong>Let’s make it possible!</strong><small>Execute with gates</small>
          </li>
        </ol>

        <div className="film-progress" aria-hidden="true"><span /></div>

        <div className="film-stage">
          <section className="film-conversation" aria-label="Agent conversation">
            <div className="film-window-bar">
              <span><CircleDot size={13} aria-hidden="true" /> agent session</span>
              <span className="film-running">{scene === "final" ? "route ready" : "working"}</span>
            </div>

            <div className="film-chat">
              <article className="film-message film-message--user film-reveal" data-visible={elapsed >= 450}>
                <span>You</span>
                <p>I want to make a robotic arm.</p>
              </article>
              <article className="film-message film-message--agent film-reveal" data-visible={elapsed >= 2_500}>
                <span>Agent</span>
                <p>Possible—but first, what outcome do you actually need?</p>
              </article>
              <article className="film-message film-message--user film-reveal" data-visible={elapsed >= 4_300}>
                <span>You</span>
                <p>A desktop arm for repeatable pick-and-place.</p>
              </article>

              <article className="film-brief film-reveal" data-visible={elapsed >= 6_100}>
                <header><Box size={15} aria-hidden="true" /> Outcome brief</header>
                <div className="film-brief-grid">
                  <span><small>Payload</small>500 g</span>
                  <span><small>Reach</small>600 mm</span>
                  <span><small>Task</small>Pick + place</span>
                  <span><small>Environment</small>People nearby</span>
                </div>
              </article>

              <article className="film-agent-action film-reveal" data-visible={elapsed >= 9_700}>
                <Search size={15} aria-hidden="true" />
                <span>Consulting possible.sh for a maintained route…</span>
              </article>

              <article className="film-route-summary film-reveal" data-visible={elapsed >= 10_500}>
                <header>
                  <div><small>Possible found</small><strong>{OUTCOME.title}</strong></div>
                  <span>{OUTCOME.routeStatus} route</span>
                </header>
                <p>{OUTCOME.summary}</p>
              </article>

              <article className="film-execution-note film-reveal" data-visible={elapsed >= 21_300}>
                <FileCode2 size={16} aria-hidden="true" />
                <div><strong>Execution workspace created</strong><span>The agent now has a sourced plan and explicit proof gates.</span></div>
              </article>
            </div>
          </section>

          <section className="film-workspace" aria-label="Possible route and execution workspace">
            <div className="film-window-bar">
              <span>possible.sh / {scene === "execution" || scene === "final" ? "execution" : "route"}</span>
              <span>{Math.round(progress)}%</span>
            </div>

            <div className="film-route film-reveal" data-visible={elapsed >= 10_500}>
              <div className="film-route-heading">
                <div><small>Outcome route</small><strong>/wiki/{OUTCOME.slug}</strong></div>
                <span><ShieldCheck size={14} aria-hidden="true" /> reviewed {OUTCOME.reviewedAt}</span>
              </div>
              <ol>
                {ROUTE.slice(1).map((page, index) => (
                  <li key={page.slug} className="film-route-node film-reveal" data-visible={elapsed >= 11_800 + index * 1_250}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <a href={`/wiki/${page.slug}`}>{page.title}</a>
                    <small>{page.kind ?? "page"}</small>
                  </li>
                ))}
              </ol>
              <div className="film-sources film-reveal" data-visible={elapsed >= 18_800}>
                <small>Sourced from</small>
                {SOURCES.map((source) => <span key={source.url}>{source.title}</span>)}
              </div>
            </div>

            <div className="film-execution film-reveal" data-visible={elapsed >= 21_300}>
              <div className="film-files">
                <small>WORKSPACE</small>
                {FILES.map(([file, description], index) => (
                  <div className="film-file film-reveal" data-visible={elapsed >= 22_000 + index * 850} key={file}>
                    <FileCode2 size={13} aria-hidden="true" /><span>{file}</span><em>{description}</em>
                  </div>
                ))}
              </div>
              <div className="film-checks">
                <small>ACCEPTANCE GATES</small>
                {CHECKS.map((check, index) => (
                  <div className="film-check film-reveal" data-visible={elapsed >= 25_200 + index * 1_050} key={check}>
                    <Check size={12} aria-hidden="true" /><span>{check}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="film-final film-reveal" data-visible={elapsed >= 31_000}>
            <span>possible.sh</span>
            <strong>Possible turns a vague intention into sourced execution.</strong>
            <p>The agent knows what to learn, what to use, what to make, and what still needs proof.</p>
          </div>
        </div>

        <p className="visually-hidden">
          The demonstration shows a user asking an agent to make a robotic arm. The agent refines the outcome,
          consults Possible, finds the partial Robotic arms route and its maintained sources, then creates an
          execution workspace with requirements, CAD, simulation, controls, manufacturing, safety, and physical
          verification gates. Possible does not claim the arm is complete until those gates have evidence.
        </p>
      </section>
    </main>
  );
}
