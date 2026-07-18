import { useMemo, useState } from "react";
import { compilePack, hardwareLaunchPack } from "@possible/packs";

type CopyState = "idle" | "copied" | "failed";

function CopyButton({ label, value, tone = "dark" }: { label: string; value: string; tone?: "dark" | "light" }) {
  const [state, setState] = useState<CopyState>("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
      window.setTimeout(() => setState("idle"), 1800);
    } catch {
      setState("failed");
    }
  }
  return <button className={`copy-button copy-button--${tone}`} type="button" onClick={copy}><span>{state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : label}</span><span aria-hidden="true">{state === "copied" ? "✓" : "↗"}</span></button>;
}

function App() {
  const compiled = useMemo(() => compilePack(hardwareLaunchPack), []);
  const installText = compiled.installCommands.join("\n");
  return (
    <main>
      <nav className="nav" aria-label="Primary navigation">
        <a className="wordmark" href="#top" aria-label="Possible home">possible<span>.sh</span></a>
        <div className="nav-links"><a href="#pack">The pack</a><a href="#sources">Sources</a><a className="nav-cta" href="#run">Run it <span aria-hidden="true">↘</span></a></div>
      </nav>
      <section className="hero" id="top">
        <div className="hero-kicker"><span>OUTCOME COMPILER</span><span>ONE PACK / FIVE SKILLS</span></div>
        <h1>Skills are ingredients.<br /><em>Possible compiles<br />the outcome.</em></h1>
        <div className="hero-foot"><p>Skills.sh gives agents individual capabilities. Possible turns the right ones into a coordinated, verifiable result.</p><a href="#pack" className="circle-link" aria-label="Explore Hardware Launch pack">↓</a></div>
      </section>
      <section className="manifesto" aria-label="Product definition">
        <p className="section-label">THE SIMPLE VERSION</p>
        <p className="manifesto-copy">You describe what you want. Possible gives Codex the skills, team structure, merge order, guardrails, and definition of done.</p>
        <div className="equation" aria-label="Skills dot sh plus Possible equals a complete launch"><span>SKILLS.SH</span><b>+</b><span>POSSIBLE</span><b>=</b><span className="equation-result">A COMPLETE LAUNCH</span></div>
      </section>
      <section className="pack" id="pack">
        <header className="pack-header"><p className="section-label section-label--light">{compiled.pack.eyebrow}</p><span className="status"><i /> REVIEWED {compiled.pack.reviewedAt}</span></header>
        <div className="pack-title"><div><h2>{compiled.pack.name}</h2><p>{compiled.pack.promise}</p></div><span className="pack-number">01</span></div>
        <div className="flow" aria-label="Pack workflow">
          <div className="flow-node"><small>INPUT</small><strong>Your product brief</strong></div><span className="flow-arrow">→</span>
          <div className="flow-center"><small>POSSIBLE PACK</small><strong>Captain</strong><span>shared brief · contracts · merge</span></div><span className="flow-arrow">→</span>
          <div className="flow-streams">{compiled.pack.workstreams.map((stream, index) => <article key={stream.id}><small>0{index + 1}</small><strong>{stream.name}</strong><span>{stream.skills.length} skill{stream.skills.length > 1 ? "s" : ""}</span></article>)}</div>
          <span className="flow-arrow">→</span><div className="flow-node"><small>OUTPUT</small><strong>Launch room</strong><span>tested together</span></div>
        </div>
        <div className="deliverables">{compiled.pack.outputs.map((output, index) => <div key={output}><span>0{index + 1}</span><strong>{output}</strong></div>)}</div>
      </section>
      <section className="sources" id="sources">
        <div className="sources-intro"><p className="section-label">WHAT'S INSIDE</p><h2>Five specialist skills.<br />One opinionated recipe.</h2><p>Every source is visible before you install. Possible owns the composition—not the ingredients.</p></div>
        <div className="source-list">{compiled.pack.skills.map((source, index) => <article className="source-row" key={source.id}><span className="source-index">0{index + 1}</span><div><strong>{source.name}</strong><p>{source.role}</p></div><code>{source.repository}</code><a href={source.reviewUrl} target="_blank" rel="noreferrer" aria-label={`Review ${source.name} source at revision ${source.reviewedRevision.slice(0, 7)}`}>{source.reviewedRevision.slice(0, 7)} ↗</a></article>)}</div>
      </section>
      <section className="run" id="run">
        <div className="run-copy"><p className="section-label section-label--light">RUN THE PACK</p><h2>Two copies.<br />One launch.</h2><p>Install the reviewed skill set. Start a fresh Codex session so it can see them. Then paste the compiled run prompt with your product brief.</p>
          <ol><li><span>1</span><div><strong>Install skills</strong><small>Review each external source first</small></div></li><li><span>2</span><div><strong>Reload Codex</strong><small>Confirm all five skills are visible</small></div></li><li><span>3</span><div><strong>Paste the run prompt</strong><small>Replace the product brief placeholder</small></div></li></ol>
        </div>
        <div className="terminal-stack">
          <article className="terminal"><header><span>01 / INSTALL</span><i /><i /><i /></header><pre>{installText}</pre><CopyButton label="Copy install commands" value={installText} /></article>
          <article className="terminal terminal--prompt"><header><span>02 / RUN</span><i /><i /><i /></header><pre>{compiled.runPrompt}</pre><CopyButton label="Copy run prompt" value={compiled.runPrompt} tone="light" /></article>
        </div>
      </section>
      <section className="boundary"><p className="section-label">HONEST BY DESIGN</p><h2>A recipe is not a guarantee.</h2><p>The listed revisions are the snapshots Possible reviewed. The install commands fetch external repositories, so inspect the resolved skill contents before running them. The pack never authorizes deployment, purchases, fabrication, outreach, or claims of real-world validation.</p></section>
      <footer><a className="wordmark" href="#top">possible<span>.sh</span></a><p>COMPILE WHAT'S POSSIBLE.</p><a href="https://github.com/fraylabs/possible" target="_blank" rel="noreferrer">SOURCE ↗</a></footer>
    </main>
  );
}
export default App;
