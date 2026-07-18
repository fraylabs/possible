import { useMemo, useState } from "react";
import { compilePack, getPack, outcomePacks } from "@possible/packs";
import type { OutcomePack } from "@possible/packs";

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

function SiteNav({ label }: { label?: string }) {
  return (
    <nav>
      <a className="wordmark" href="/">possible<span>.sh</span></a>
      {label ? <div className="nav-meta"><span>OUTCOME PACKS</span><strong>{label.toUpperCase()}</strong></div> : null}
      <div className="nav-links">
        <a href="/">CREATE</a>
        <a href="/packs">PACKS</a>
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
    <a className="pack-card" href={`/packs/${pack.slug}`}>
      <header><span>0{index + 1}</span><small>{pack.eyebrow}</small><b>↗</b></header>
      <div className="pack-card-copy">
        <h2>{pack.name}</h2>
        <p>{pack.promise}</p>
      </div>
      <div className="pack-card-stats">
        <span>{pack.skills.length} SKILLS</span>
        <span>{pack.workstreams.length} WORKSTREAMS</span>
        <span>{pack.outputs.length} OUTPUTS</span>
      </div>
      <div className="pack-card-outputs">
        {pack.outputs.slice(0, 3).map((output) => <span key={output}>{output}</span>)}
        {pack.outputs.length > 3 ? <span>+{pack.outputs.length - 3} MORE</span> : null}
      </div>
    </a>
  );
}

function PacksPage() {
  return (
    <main>
      <SiteNav label="Catalog / 03" />
      <section className="catalog-hero">
        <p className="eyebrow">CURATED OUTCOME PACKS</p>
        <h1>Three outcomes.<br /><em>Not three hundred skills.</em></h1>
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
  if (path.startsWith("/packs/")) {
    const pack = getPack(path.slice("/packs/".length));
    return pack ? <PackDetailPage pack={pack} /> : <NotFoundPage />;
  }
  return <NotFoundPage />;
}

export default App;
