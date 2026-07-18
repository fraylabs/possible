import { ArrowLeft, ExternalLink } from "lucide-react";

const sections = [
  ["What Possible is", "what-possible-is"],
  ["How to use the atlas", "how-to-use"],
  ["How pages work", "how-pages-work"],
  ["For agents", "for-agents"],
  ["Contributing knowledge", "contributing"],
] as const;

export function DocsPage() {
  return (
    <main className="docs-view">
      <nav className="docs-nav" aria-label="Documentation navigation">
        <a className="brand-reset" href="/">
          <span className="brand-wordmark">possible<span>.sh</span></span>
          <span className="brand-tagline">A sourced wiki of what people and agents can make possible.</span>
        </a>
        <a className="back-button docs-back" href="/">
          <ArrowLeft size={17} aria-hidden="true" />
          Back to atlas
        </a>
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
            <h1>Start with what you want to make.</h1>
            <p>
              Possible is a sourced wiki of what people and agents can make possible. It collects
              the tools, methods, services, and decisions that help turn an outcome into a real
              starting point.
            </p>
          </header>

          <section id="what-possible-is" className="docs-section">
            <p className="docs-number">01</p>
            <div>
              <h2>What Possible is</h2>
              <p>
                When someone says “I want to build a robot arm” or “I want to ship a web app,”
                they should not have to begin with an empty folder. Possible maps the proven
                knowledge around that outcome so the next question is easier to answer.
              </p>
              <p>
                Each page is a compact, reviewed piece of practical knowledge: what it is, when
                to use it, what it connects to, and where the claim came from.
              </p>
            </div>
          </section>

          <section id="how-to-use" className="docs-section">
            <p className="docs-number">02</p>
            <div>
              <h2>How to use the atlas</h2>
              <ol className="docs-steps">
                <li><strong>Start at a field.</strong> Web and Manufacturing are top-level areas, not one mixed path.</li>
                <li><strong>Click a node.</strong> The graph focuses the node and highlights its authored connections.</li>
                <li><strong>Expand the page.</strong> Read the page in the left sidebar while keeping the map in view.</li>
                <li><strong>Follow the links.</strong> Move from a broad capability to the specific tools, methods, or services that support it.</li>
                <li><strong>Use search when you know the term.</strong> Search is for jumping directly to a page; the atlas is for discovering context.</li>
              </ol>
              <p className="docs-callout">
                The graph is a map of relationships, not a project plan. Use it to find the right
                starting knowledge, then make your own decisions for the specific project.
              </p>
            </div>
          </section>

          <section id="how-pages-work" className="docs-section">
            <p className="docs-number">03</p>
            <div>
              <h2>How pages work</h2>
              <div className="docs-definitions">
                <div><strong>Outcome</strong><span>The thing someone wants to make or accomplish.</span></div>
                <div><strong>Capability</strong><span>A reusable ability, such as deploying a site or making a parametric part.</span></div>
                <div><strong>Tool or method</strong><span>A concrete way to exercise that capability, such as Next.js, Three.js, or MuJoCo.</span></div>
                <div><strong>Service</strong><span>An external provider that helps complete the work, such as Vercel or a manufacturer.</span></div>
                <div><strong>Connection</strong><span>An authored link between pages that explains why they belong together.</span></div>
              </div>
            </div>
          </section>

          <section id="for-agents" className="docs-section">
            <p className="docs-number">04</p>
            <div>
              <h2>For agents</h2>
              <p>
                Possible is designed to be useful before an agent starts building. An agent can
                check whether an outcome has a known path, discover the current stack around it,
                and reuse contributor knowledge instead of inventing an untested workflow.
              </p>
              <div className="docs-code-block">
                <span>Goal</span>
                <code>I want to build a browser-based 3D configurator.</code>
                <span>Possible check</span>
                <code>Find the web field → 3D renderer selection → Three.js / React Three Fiber → deployment.</code>
              </div>
              <p>
                The graph is the human interface. The same pages are also available as structured
                wiki data and an <a href="/llms.txt">agent-readable index</a>.
              </p>
            </div>
          </section>

          <section id="contributing" className="docs-section">
            <p className="docs-number">05</p>
            <div>
              <h2>Contributing knowledge</h2>
              <p>
                A useful contribution is specific, sourced, and honest about its boundaries. Add
                one page when you can explain a decision clearly enough that another person or
                agent can start from it.
              </p>
              <ul className="docs-checklist">
                <li>State what the tool, method, or service is good for.</li>
                <li>Include the important trade-offs and prerequisites.</li>
                <li>Link to adjacent pages that make the workflow complete.</li>
                <li>Provide primary sources and a review date.</li>
                <li>Do not present a preference as universal truth.</li>
              </ul>
              <p className="docs-footer-note">
                Possible is early. Its job is not to know everything; it is to make the best
                available starting points easier to find and easier for agents to use.
              </p>
              <a className="docs-source-link" href="https://github.com/brainthrust/possible" target="_blank" rel="noreferrer">
                View the public repository <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
