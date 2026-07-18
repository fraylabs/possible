import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import {
  assessSearchResults,
  getPage,
  loadWiki,
  searchPages,
  type WikiCorpus,
} from "@possible/knowledge";

const EXAMPLES = [
  "I want to make a digital photo frame",
  "I want to make a robotic arm",
  "I want to design a website",
] as const;

type LoadState =
  | { status: "loading" }
  | { status: "ready"; corpus: WikiCorpus }
  | { status: "error"; message: string };

const statusLabel = (status: ReturnType<typeof assessSearchResults>["status"]) => {
  if (status === "no-maintained-route") return "No maintained route";
  return status === "verified" ? "Verified route" : "Partial route";
};

export function DemoPage() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [draft, setDraft] = useState<string>(EXAMPLES[0]);
  const [query, setQuery] = useState<string>(EXAMPLES[0]);

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
          message: error instanceof Error ? error.message : "Possible could not load its corpus.",
        });
      });
    return () => { active = false; };
  }, []);

  const result = useMemo(() => {
    if (loadState.status !== "ready") return undefined;
    const results = searchPages(loadState.corpus, query, { limit: 10 });
    const assessment = assessSearchResults(results);
    const outcomeSlug = assessment.verifiedRoutes[0] ?? assessment.partialRoutes[0];
    const outcome = outcomeSlug ? getPage(loadState.corpus, outcomeSlug) : undefined;
    const nextPages = outcome
      ? outcome.links
        .map((slug) => getPage(loadState.corpus, slug))
        .filter((page) => page !== undefined)
        .slice(0, 6)
      : [];
    return { assessment, outcome, nextPages };
  }, [loadState, query]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = draft.trim();
    if (nextQuery) setQuery(nextQuery);
  };

  const runExample = (example: string) => {
    setDraft(example);
    setQuery(example);
  };

  return (
    <main className="demo-page">
      <nav className="demo-nav" aria-label="Demo navigation">
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

      <section className="demo-hero" aria-labelledby="demo-title">
        <p className="section-kicker">Live Possible demo</p>
        <h1 id="demo-title">What do you want to make possible?</h1>
        <p>
          Describe an outcome. Possible finds the maintained route, shows where to start, and
          tells you when the knowledge is incomplete.
        </p>

        <form className="demo-search" onSubmit={submit}>
          <Search size={20} aria-hidden="true" />
          <label className="visually-hidden" htmlFor="demo-query">Outcome</label>
          <input
            id="demo-query"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="I want to make a…"
            autoComplete="off"
          />
          <button type="submit">Find a route <ArrowRight size={17} aria-hidden="true" /></button>
        </form>

        <div className="demo-examples" aria-label="Example outcomes">
          <span>Try:</span>
          {EXAMPLES.map((example) => (
            <button key={example} type="button" onClick={() => runExample(example)}>{example}</button>
          ))}
        </div>
      </section>

      <section className="demo-output" aria-live="polite" aria-busy={loadState.status === "loading"}>
        {loadState.status === "loading" && <p className="demo-state">Searching the maintained corpus…</p>}
        {loadState.status === "error" && <p className="demo-state demo-state--error">{loadState.message}</p>}
        {result && (
          <>
            <header className="demo-result-header">
              <div>
                <p className="section-kicker">Possible found</p>
                <h2>{result.outcome?.title ?? "No maintained outcome"}</h2>
              </div>
              <span className={`demo-status demo-status--${result.assessment.status}`}>
                {statusLabel(result.assessment.status)}
              </span>
            </header>

            {result.outcome ? (
              <div className="demo-result-grid">
                <article className="demo-route-card">
                  <p className="demo-card-label">Why this route</p>
                  <p className="demo-outcome-summary">{result.outcome.summary}</p>
                  <p className="demo-assessment">{result.assessment.reason}</p>
                  <div className="demo-coverage" aria-label="Route coverage">
                    {(result.outcome.coverage ?? []).map((item) => <span key={item}>{item}</span>)}
                  </div>
                  <div className="demo-card-actions">
                    <a href={`/wiki/${result.outcome.slug}`}>Read the outcome</a>
                    <a href={`/agent/read/${result.outcome.slug}.json`}>Agent JSON</a>
                  </div>
                </article>

                <article className="demo-route-card">
                  <p className="demo-card-label">Start from here</p>
                  <ol className="demo-next-pages">
                    {result.nextPages.map((page) => (
                      <li key={page.slug}>
                        <a href={`/wiki/${page.slug}`}>{page.title}</a>
                        <span>{page.summary}</span>
                      </li>
                    ))}
                  </ol>
                </article>

                <article className="demo-route-card demo-route-card--sources">
                  <p className="demo-card-label">Maintained sources</p>
                  <ul className="demo-source-list">
                    {result.outcome.sources.slice(0, 5).map((source) => (
                      <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>
                    ))}
                  </ul>
                  <p className="demo-source-note">Reviewed {result.outcome.reviewedAt}. A partial route is a starting point, not proof that the outcome is complete.</p>
                </article>
              </div>
            ) : (
              <div className="demo-no-route">
                <h3>Possible will not invent an answer.</h3>
                <p>
                  No maintained outcome matches every meaningful term in “{query}”. Try a broader
                  outcome, explore the atlas, or contribute a sourced route that works.
                </p>
                <a href="https://github.com/fraylabs/possible" target="_blank" rel="noreferrer">Contribute a route</a>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
