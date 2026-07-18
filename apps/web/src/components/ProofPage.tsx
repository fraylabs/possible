import { useEffect, useState } from "react";
import {
  getRelatedPages,
  loadWiki,
  searchPages,
  type WikiCorpus,
  type WikiPage,
} from "@possible/knowledge";

const EXAMPLE_QUERIES = [
  "digital photo frame",
  "robotic arm",
] as const;

const AGENT_PROMPT = `Use Possible as source-backed reading, not as a project planner.

1. Read https://possible.sh/llms.txt and follow its static retrieval protocol.
2. Search the published guide index locally with a short subject query.
3. Read only the guides relevant to the user's question.
4. Treat link adjacency and display order as related reading, not a complete workflow; judge any conditional sequence stated in prose against the project.
5. Cite the guide title, review date, and sources when the retrieved context matters.
6. Use your own reasoning for every project-specific question, recommendation, plan, action, and validation.`;

type LoadState =
  | { status: "loading" }
  | { status: "ready"; corpus: WikiCorpus }
  | { status: "error"; message: string };

interface RetrievalExample {
  query: string;
  guide: WikiPage | undefined;
  relatedGuides: WikiPage[];
}

const safeSourceHref = (value: string): string | undefined => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
};

const buildExample = (corpus: WikiCorpus, query: string): RetrievalExample => {
  const guide = searchPages(corpus, query, { limit: 1 })[0]?.page;
  return {
    query,
    guide,
    relatedGuides: guide ? getRelatedPages(corpus, guide.slug).slice(0, 6) : [],
  };
};

function RetrievalArticle({ example, index }: { example: RetrievalExample; index: number }) {
  const titleId = `retrieval-example-${index}-title`;
  const guide = example.guide;

  return (
    <article className="proof-query" aria-labelledby={titleId}>
      <header className="proof-query-header">
        <p className="proof-query-label">Example {index + 1}</p>
        <h2 id={titleId} className="proof-query-text">“{example.query}”</h2>
      </header>

      <section className="proof-section">
        <h3 className="proof-section-title">First relevant guide</h3>
        {guide ? (
          <div className="proof-outcome">
            <a className="proof-outcome-link" href={`/wiki/${guide.slug}`}>{guide.title}</a>
            <p className="proof-summary">{guide.summary}</p>
            <p className="proof-reviewed">Reviewed {guide.reviewedAt}</p>
          </div>
        ) : (
          <p className="proof-empty">No field guide matches every meaningful query term.</p>
        )}
      </section>

      <section className="proof-section">
        <h3 className="proof-section-title">Published sources</h3>
        {guide && guide.sources.length > 0 ? (
          <ol className="proof-source-list">
            {guide.sources.map((source) => {
              const href = safeSourceHref(source.url);
              return (
                <li className="proof-source-item" key={source.url}>
                  {href ? (
                    <a className="proof-source-link" href={href} target="_blank" rel="noreferrer">
                      {source.title}
                    </a>
                  ) : <span className="proof-source-title">{source.title}</span>}
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="proof-empty">No sources are published for this guide.</p>
        )}
      </section>

      <section className="proof-section">
        <h3 className="proof-section-title">Related reading</h3>
        {example.relatedGuides.length > 0 ? (
          <ol className="proof-page-list">
            {example.relatedGuides.map((relatedGuide) => (
              <li className="proof-page-item" key={relatedGuide.slug}>
                <a className="proof-page-link" href={`/wiki/${relatedGuide.slug}`}>{relatedGuide.title}</a>
                <span className="proof-page-summary">{relatedGuide.summary}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="proof-empty">No authored related reading is published for this guide.</p>
        )}
        <p className="proof-retrieval-boundary">
          Related guides provide context. Possible does not order them into a project workflow.
        </p>
      </section>

      {guide && (
        <nav className="proof-json" aria-label={`Published data for ${guide.title}`}>
          <h3 className="proof-section-title">Published guide data</h3>
          <ul className="proof-json-list">
            <li className="proof-json-item">
              <a className="proof-json-link" href={`/agent/read/${guide.slug}.json`}>Agent read JSON</a>
            </li>
            <li className="proof-json-item">
              <a className="proof-json-link" href={`/agent/related/${guide.slug}.json`}>Related guides JSON</a>
            </li>
            <li className="proof-json-item">
              <a className="proof-json-link" href={`/wiki/${guide.slug}.json`}>Guide JSON</a>
            </li>
          </ul>
        </nav>
      )}
    </article>
  );
}

export function ProofPage() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    let active = true;
    loadWiki()
      .then((corpus) => {
        if (active) setLoadState({ status: "ready", corpus });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadState({
          status: "error",
          message: error instanceof Error ? error.message : "The field guide library could not be loaded.",
        });
      });

    return () => {
      active = false;
    };
  }, []);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(AGENT_PROMPT);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  };

  const examples = loadState.status === "ready"
    ? EXAMPLE_QUERIES.map((query) => buildExample(loadState.corpus, query))
    : [];

  return (
    <main className="proof-page retrieval-page">
      <header className="proof-header">
        <nav className="proof-nav" aria-label="Retrieval example navigation">
          <a className="proof-brand" href="/">possible.sh</a>
          <a className="proof-back" href="/">Back to atlas</a>
        </nav>
        <p className="proof-kicker">Bundled corpus examples</p>
        <h1 className="proof-title">Two questions, with the reading left inspectable.</h1>
        <p className="proof-intro">
          This page runs both searches against the same bundled guide library used by the site.
          It shows retrieval, sources, and related reading—not a project assessment or validation.
        </p>
      </header>

      <section className="proof-agent" aria-labelledby="retrieval-agent-title">
        <div className="proof-agent-header">
          <div className="proof-agent-copy">
            <p className="proof-kicker">Agent handoff</p>
            <h2 id="retrieval-agent-title" className="proof-agent-title">Give an agent the same reading boundary.</h2>
          </div>
          <button className="proof-copy-button" type="button" onClick={copyPrompt}>
            {copyStatus === "copied" ? "Copied" : "Copy prompt"}
          </button>
        </div>
        <label className="proof-prompt-label" htmlFor="retrieval-agent-prompt">Agent prompt</label>
        <textarea
          id="retrieval-agent-prompt"
          className="proof-prompt"
          value={AGENT_PROMPT}
          readOnly
          rows={12}
          onFocus={(event) => event.currentTarget.select()}
        />
        <p className="proof-copy-status" role="status" aria-live="polite">
          {copyStatus === "copied" && "Prompt copied to the clipboard."}
          {copyStatus === "error" && "Copy failed. Select the prompt and copy it manually."}
        </p>
        <p className="proof-agent-links">
          <a className="proof-agent-link" href="/llms.txt">Open llms.txt</a>
          <span className="proof-agent-separator" aria-hidden="true">·</span>
          <a className="proof-agent-link" href="/agent/protocol.json">Agent protocol JSON</a>
          <span className="proof-agent-separator" aria-hidden="true">·</span>
          <a className="proof-agent-link" href="/agent/search.json">Guide search index</a>
        </p>
      </section>

      {loadState.status === "loading" && (
        <section className="proof-state" aria-live="polite" aria-busy="true">
          <h2 className="proof-state-title">Loading the guide library</h2>
          <p className="proof-state-message">The retrieval examples will appear when the corpus is ready.</p>
        </section>
      )}

      {loadState.status === "error" && (
        <section className="proof-state proof-state--error" role="alert">
          <h2 className="proof-state-title">The guide library could not be loaded</h2>
          <p className="proof-state-message">{loadState.message}</p>
        </section>
      )}

      {loadState.status === "ready" && (
        <section className="proof-results" aria-label="Guide retrieval examples">
          {examples.map((example, index) => (
            <RetrievalArticle key={example.query} example={example} index={index} />
          ))}
        </section>
      )}
    </main>
  );
}
