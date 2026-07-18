import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

const sections = [
  ["What Possible is", "what-possible-is"],
  ["Search and read", "how-to-use"],
  ["For agents", "for-agents"],
  ["Trust boundary", "trust-boundary"],
  ["Contributing guides", "contributing"],
] as const;

export function DocsPage() {
  return (
    <main className="docs-view">
      <nav className="docs-nav" aria-label="Documentation navigation">
        <a className="brand-reset" href="/">
          <span className="brand-wordmark">possible<span>.sh</span></span>
          <span className="brand-tagline">Source-backed field guides for people and agents.</span>
        </a>
        <div className="route-nav-actions">
          <a className="back-button docs-back" href="/">
            <ArrowLeft size={17} aria-hidden="true" />
            Atlas
          </a>
          <a className="route-primary-link" href="/demo">
            See an example
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </nav>

      <div className="docs-layout">
        <aside className="docs-toc" aria-label="On this page">
          <p className="section-kicker">Documentation</p>
          <ol>
            {sections.map(([label, id], index) => (
              <li key={id}>
                <a href={`#${id}`}>
                  <span>0{index + 1}</span>
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </aside>

        <article className="docs-article">
          <header className="docs-header">
            <p className="section-kicker">How Possible works</p>
            <h1>Learn what the work involves.</h1>
            <p>
              Possible helps people and agents understand unfamiliar work through maintained,
              source-backed field guides. It informs decisions; it does not make them.
            </p>
            <a className="docs-hero-cta" href="/demo">
              See guide retrieval
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          </header>

          <section id="what-possible-is" className="docs-section">
            <p className="docs-number">01</p>
            <div>
              <h2>What Possible is</h2>
              <p>
                A field guide explains a subject clearly enough that a person or agent can enter
                the work with better context: common approaches, important decisions, trade-offs,
                failure modes, and evidence practitioners look for.
              </p>
              <p>
                Possible retrieves those guides and their sources. The reader or host agent still
                interprets the context, asks project-specific questions, chooses an approach, and
                owns every action and result.
              </p>
              <div className="how-flow" aria-label="Possible learning workflow">
                <div><span>01</span><strong>Ask</strong><p>Describe what you want to understand.</p></div>
                <div><span>02</span><strong>Learn</strong><p>Read relevant source-backed guides.</p></div>
                <div><span>03</span><strong>Decide</strong><p>You or your agent decide what to do.</p></div>
              </div>
            </div>
          </section>

          <section id="how-to-use" className="docs-section">
            <p className="docs-number">02</p>
            <div>
              <h2>Search and read</h2>
              <ol className="docs-steps">
                <li><strong>Start with a question.</strong> Search for the thing you are trying to make or understand.</li>
                <li><strong>Open a relevant guide.</strong> Read its scope and review date before applying its guidance.</li>
                <li><strong>Inspect the sources.</strong> Follow primary sources when a claim matters to your decision.</li>
                <li><strong>Follow related reading deliberately.</strong> Link adjacency and display order provide context, not a project workflow; guide prose may still explain a conditional common sequence.</li>
                <li><strong>Stop when you have enough context.</strong> Project-specific reasoning stays outside Possible.</li>
              </ol>
              <p className="docs-callout">
                The atlas is a map of related reading. Proximity and link order do not establish sequence,
                compatibility, endorsement, or completeness. The consumer decides whether any sequence described in prose fits the project.
              </p>
            </div>
          </section>

          <section id="for-agents" className="docs-section">
            <p className="docs-number">03</p>
            <div>
              <h2>For agents</h2>
              <p>
                Agents use the same guides as people: search with the user&apos;s question, read only
                relevant pages, follow useful references progressively, and cite the review date
                and sources when the retrieved context matters.
              </p>
              <div className="docs-code-block">
                <span>Question</span>
                <code>I want to understand what goes into a robotic arm.</code>
                <span>Possible</span>
                <code>Search → read “Robotic arms” → inspect related guides and sources.</code>
                <span>Agent</span>
                <code>Reason from that context, ask the user, and own the project decisions.</code>
              </div>
              <p>
                The bundled corpus is also available as structured guide data and an
                {" "}<a href="/llms.txt">agent-readable index</a>.
              </p>
              <a className="docs-source-link" href="/proof">
                See transparent retrieval examples
              </a>
            </div>
          </section>

          <section id="trust-boundary" className="docs-section">
            <p className="docs-number">04</p>
            <div>
              <h2>Trust boundary</h2>
              <div className="docs-definitions">
                <div><strong>Reviewed</strong><span>A contributor checked the guide and its cited sources on the listed review date.</span></div>
                <div><strong>Related</strong><span>Another guide is linked for context; it is not automatically a next step.</span></div>
                <div><strong>Source-backed</strong><span>Important factual claims can be inspected at their cited sources.</span></div>
                <div><strong>Not certified</strong><span>A guide does not validate a design, project, provider, or completed result.</span></div>
              </div>
              <p className="docs-callout">
                Possible never plans or composes a project, chooses tools on someone&apos;s behalf,
                executes actions, holds credentials, approves spending, or certifies a result.
              </p>
            </div>
          </section>

          <section id="contributing" className="docs-section">
            <p className="docs-number">05</p>
            <div>
              <h2>Contributing guides</h2>
              <p>
                A useful contribution teaches one coherent subject, stays honest about its limits,
                and gives another reader enough source-backed context to reason for themselves.
              </p>
              <ul className="docs-checklist">
                <li>Say what the guide covers and what it does not establish.</li>
                <li>Explain common approaches, decisions, trade-offs, and failure modes.</li>
                <li>Describe evidence practitioners look for without claiming Possible performs the checks.</li>
                <li>Use links for related context; explain any conditional sequence in prose instead of encoding it through adjacency.</li>
                <li>Provide primary sources and a real review date.</li>
              </ul>
              <p className="docs-footer-note">
                Publishing means the guide is reviewed and inspectable. It is not an endorsement,
                project plan, certification, or guarantee.
              </p>
              <a className="docs-source-link" href="https://github.com/fraylabs/possible" target="_blank" rel="noreferrer">
                Contribute a field guide <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
