import { useMemo, useState } from "react";
import { compilePack, outcomePacks } from "@possible/packs";

type CopyState = "idle" | "copied" | "failed";

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

function App() {
  const [selectedSlug, setSelectedSlug] = useState<string>(outcomePacks[0].slug);
  const selectedPack = outcomePacks.find((pack) => pack.slug === selectedSlug) ?? outcomePacks[0];
  const compiled = useMemo(() => compilePack(selectedPack), [selectedPack]);
  const [brief, setBrief] = useState(exampleBriefs[selectedSlug] ?? "");
  const [isCompiled, setIsCompiled] = useState(false);
  const installText = compiled.installCommands.join("\n");
  const runPrompt = compiled.runPrompt.replace(
    "[Replace this line with the product, audience, constraints, and any existing repository or assets.]",
    brief.trim() || "[Add your product brief here.]",
  );

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
      <nav>
        <a className="wordmark" href="#top">possible<span>.sh</span></a>
        <div className="nav-meta"><span>OUTCOME PACK</span><strong>{selectedPack.name.toUpperCase()} / 0{outcomePacks.indexOf(selectedPack) + 1}</strong></div>
        <a className="source-link" href="https://github.com/fraylabs/possible" target="_blank" rel="noreferrer">SOURCE ↗</a>
      </nav>

      <section className="composer" id="top">
        <div className="composer-copy">
          <p className="eyebrow">FOR CODEX · BUILT ON SKILLS.SH</p>
          <h1>Describe the outcome.<br /><em>Get the whole team.</em></h1>
          <p className="thesis">Possible compiles individual skills into one coordinated, verifiable run.</p>
        </div>

        <div className="brief-card">
          <div className="pack-picker" aria-label="Choose an outcome pack">
            <span>CHOOSE AN OUTCOME</span>
            <div>
              {outcomePacks.map((pack, index) => (
                <button
                  type="button"
                  aria-pressed={pack.slug === selectedSlug}
                  onClick={() => selectPack(pack.slug)}
                  key={pack.slug}
                >
                  <small>0{index + 1}</small>{pack.name}
                </button>
              ))}
            </div>
          </div>
          <label htmlFor="product-brief">WHAT DO YOU WANT TO SHIP?</label>
          <textarea
            id="product-brief"
            value={brief}
            onChange={(event) => {
              setBrief(event.target.value);
              setIsCompiled(false);
            }}
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

        <div className="pack-metrics" aria-label="Pack contents">
          <div><strong>{compiled.pack.skills.length}</strong><span>specialist skills</span></div>
          <div><strong>{compiled.pack.workstreams.length}</strong><span>parallel workstreams</span></div>
          <div><strong>{compiled.pack.outputs.length}</strong><span>integrated outputs</span></div>
          <div><strong>1</strong><span>independent review</span></div>
        </div>

        <div className="workstreams">
          {compiled.pack.workstreams.map((stream, index) => (
            <article key={stream.id}>
              <span>0{index + 1}</span>
              <div><strong>{stream.name}</strong><p>{stream.brief}</p></div>
              <small>{stream.skills.map((skill) => `$${skill}`).join(" + ")}</small>
            </article>
          ))}
          <article className="workstream-review">
            <span>0{compiled.pack.workstreams.length + 1}</span>
            <div><strong>Independent review</strong><p>Inspect the integrated result and return evidence, failures, and unproven claims.</p></div>
            <small>{compiled.pack.reviewSkills.map((skill) => `$${skill}`).join(" + ")}</small>
          </article>
        </div>

        <div className="outputs" aria-label="Compiled outputs">
          {compiled.pack.outputs.map((output) => <span key={output}>{output}</span>)}
        </div>

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
        <p className="reload-note">Install → reload Codex → paste the compiled prompt.</p>
      </section>

      <section className="ingredients">
        <div className="ingredients-title">
          <p className="eyebrow">INSPECT BEFORE INSTALL</p>
          <h2>Visible ingredients.<br />Opinionated recipe.</h2>
          <p>Skills remain owned by their source repositories. Possible owns how they work together.</p>
        </div>
        <div className="ingredient-list">
          {compiled.pack.skills.map((source, index) => (
            <a href={source.reviewUrl} target="_blank" rel="noreferrer" key={source.id}>
              <span>0{index + 1}</span>
              <div><strong>{source.name}</strong><small>{source.role}</small></div>
              <code>{source.repository}</code>
              <b>{source.reviewedRevision.slice(0, 7)} ↗</b>
            </a>
          ))}
        </div>
      </section>

      <section className="boundary">
        <span>THE BOUNDARY</span>
        <p>A pack coordinates work. It does not authorize deployment, spending, outreach, fabrication, data collection, or unsupported claims.</p>
      </section>

      <footer><a className="wordmark" href="#top">possible<span>.sh</span></a><strong>SKILLS ARE INGREDIENTS.<br />POSSIBLE COMPILES THE OUTCOME.</strong><span>BUILDWEEK 2026</span></footer>
    </main>
  );
}

export default App;
