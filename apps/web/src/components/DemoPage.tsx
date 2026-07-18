import { ArrowLeft, BookOpenText, ExternalLink, Search } from "lucide-react";
import {
  getRelatedPages,
  searchPages,
  type WikiPage,
} from "@possible/knowledge";
import { wikiCorpusData } from "@possible/knowledge/data";

export const DEMO_QUERY = "robotic arm";

export function findDemoGuide(): WikiPage | undefined {
  return searchPages(wikiCorpusData, DEMO_QUERY, { limit: 1 })[0]?.page;
}

export function DemoPage() {
  const guide = findDemoGuide();
  const relatedGuides = guide
    ? getRelatedPages(wikiCorpusData, guide.slug).slice(0, 5)
    : [];

  return (
    <main className="demo-page guide-demo-page">
      <nav className="demo-nav" aria-label="Example navigation">
        <a className="brand-reset" href="/">
          <span className="brand-wordmark">possible<span>.sh</span></span>
          <span className="brand-tagline">Source-backed field guides for people and agents.</span>
        </a>
        <div className="route-nav-actions">
          <a className="back-button" href="/">
            <ArrowLeft size={17} aria-hidden="true" />
            Atlas
          </a>
          <a className="route-secondary-link" href="/how-it-works">How it works</a>
        </div>
      </nav>

      <section className="guide-demo-shell" aria-labelledby="demo-title">
        <header className="guide-demo-header">
          <p className="section-kicker">Transparent retrieval example</p>
          <h1 id="demo-title">Context for an agent—not a project plan.</h1>
          <p>
            This example runs a plain query against the published guide library, opens the first
            result, and shows its authored references and sources. Nothing is composed or executed.
          </p>
        </header>

        <ol className="guide-demo-steps" aria-label="Guide retrieval steps">
          <li><span>01</span><strong>Search</strong><p>Use the subject the reader wants to understand.</p></li>
          <li><span>02</span><strong>Read</strong><p>Inspect one relevant guide and its sources.</p></li>
          <li><span>03</span><strong>Reason</strong><p>The host agent owns every later decision.</p></li>
        </ol>

        <div className="guide-demo-grid">
          <article className="guide-demo-query" aria-labelledby="demo-query-title">
            <p className="section-kicker">Agent search</p>
            <h2 id="demo-query-title">“I want to understand what goes into a robotic arm.”</h2>
            <div className="guide-demo-search">
              <Search size={17} aria-hidden="true" />
              <code>{DEMO_QUERY}</code>
            </div>
            <p>
              The agent reduces the user&apos;s sentence to a short retrieval query. Possible ranks
              authored guides by their published text and aliases; it does not assess the project.
            </p>
          </article>

          <article className="guide-demo-result" aria-labelledby="demo-result-title">
            <p className="section-kicker">First relevant guide</p>
            {guide ? (
              <>
                <h2 id="demo-result-title">
                  <a href={`/wiki/${guide.slug}`}>
                    <BookOpenText size={20} aria-hidden="true" />
                    {guide.title}
                  </a>
                </h2>
                <p>{guide.summary}</p>
                <p className="review-note">Reviewed {guide.reviewedAt}</p>
                <div className="guide-demo-sources">
                  <h3>Published sources</h3>
                  <ul>
                    {guide.sources.map((source) => (
                      <li key={source.url}>
                        <a href={source.url} target="_blank" rel="noreferrer">
                          {source.title}
                          <ExternalLink size={13} aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <>
                <h2 id="demo-result-title">No matching guide yet</h2>
                <p>The library did not return a guide for this query.</p>
              </>
            )}
          </article>
        </div>

        {guide && (
          <section className="guide-demo-related" aria-labelledby="demo-related-title">
            <div>
              <p className="section-kicker">Authored references</p>
              <h2 id="demo-related-title">Related reading, not ordered steps.</h2>
              <p>
                These links help the agent learn more when needed. Their presence does not mean
                they form a complete workflow or fit the user&apos;s project.
              </p>
            </div>
            <ul>
              {relatedGuides.map((relatedGuide) => (
                <li key={relatedGuide.slug}>
                  <a href={`/wiki/${relatedGuide.slug}`}>
                    <strong>{relatedGuide.title}</strong>
                    <span>{relatedGuide.summary}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <aside className="guide-demo-boundary" aria-label="Agent responsibility">
          <p className="section-kicker">What happens next</p>
          <strong>“I have better context. I still need to ask about your requirements and decide how to proceed.”</strong>
          <p>
            That sentence belongs to the host agent. Possible supplied reading; it did not plan,
            compose, execute, or validate a robotic-arm project.
          </p>
        </aside>
      </section>
    </main>
  );
}
