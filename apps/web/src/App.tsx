import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  CircleAlert,
  LoaderCircle,
  Search,
  X,
} from "lucide-react";
import {
  getPage,
  loadWiki,
  searchPages,
  type WikiCorpus,
} from "@possible/knowledge";
import { buildAtlasBranches } from "./atlas";
import { ArticleView } from "./components/ArticleView";
import { AtlasGraph } from "./components/AtlasGraph";
import { DocsPage } from "./components/DocsPage";
import {
  DEFAULT_GRAPH_VIEWPORT,
  type GraphViewport,
} from "./components/KnowledgeGraph";
import { formatReviewedAt, routeSlug, wikiPath } from "./wiki";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; corpus: WikiCorpus }
  | { status: "error"; message: string };

type ViewMode = "explore" | "read";
type FocusTarget = "explore" | "read" | "search";

interface PossibleHistoryState {
  possible?: {
    version: 1;
    graphViewport: GraphViewport;
  };
}

const validGraphViewport = (value: unknown): value is GraphViewport => {
  if (!value || typeof value !== "object") return false;
  const viewport = value as Partial<GraphViewport>;
  return typeof viewport.x === "number" && Number.isFinite(viewport.x)
    && typeof viewport.y === "number" && Number.isFinite(viewport.y)
    && typeof viewport.scale === "number" && Number.isFinite(viewport.scale)
    && viewport.scale >= 0.42 && viewport.scale <= 2.8;
};

const viewportFromHistory = (state: unknown): GraphViewport | undefined => {
  if (!state || typeof state !== "object") return undefined;
  const viewport = (state as PossibleHistoryState).possible?.graphViewport;
  return validGraphViewport(viewport) ? viewport : undefined;
};

const historyStateFor = (graphViewport: GraphViewport): PossibleHistoryState => ({
  possible: { version: 1, graphViewport },
});

export function App() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [selectedSlug, setSelectedSlug] = useState<string | undefined>();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<ViewMode>("explore");
  const [graphViewport, setGraphViewport] = useState<GraphViewport>({ ...DEFAULT_GRAPH_VIEWPORT });
  const searchRef = useRef<HTMLInputElement>(null);
  const exploreTitleRef = useRef<HTMLHeadingElement>(null);
  const readTitleRef = useRef<HTMLHeadingElement>(null);
  const pendingFocusRef = useRef<FocusTarget | undefined>(undefined);

  useEffect(() => {
    let active = true;
    setLoadState({ status: "loading" });

    loadWiki()
      .then((corpus) => {
        if (!active) return;
        setLoadState({ status: "ready", corpus });
        const requestedSlug = routeSlug(window.location.pathname);
        setSelectedSlug(requestedSlug);
        const restoredViewport = viewportFromHistory(window.history.state);
        if (restoredViewport) setGraphViewport(restoredViewport);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadState({
          status: "error",
          message: error instanceof Error ? error.message : "The wiki could not be loaded.",
        });
      });

    return () => {
      active = false;
    };
  }, [loadAttempt]);

  const corpus = loadState.status === "ready" ? loadState.corpus : undefined;
  const selectedPage = corpus && selectedSlug ? getPage(corpus, selectedSlug) : undefined;
  const branches = corpus ? buildAtlasBranches(corpus) : [];
  const fallbackPage = branches[0]?.page ?? (corpus ? corpus.pages[0] : undefined);
  const searchResults = corpus && query.trim()
    ? searchPages(corpus, query, { limit: 5 })
    : [];

  useEffect(() => {
    const target = pendingFocusRef.current;
    if (!target) return;
    pendingFocusRef.current = undefined;

    const frame = window.requestAnimationFrame(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (target === "search") searchRef.current?.focus({ preventScroll: true });
      if (target === "explore") exploreTitleRef.current?.focus({ preventScroll: true });
      if (target === "read") readTitleRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [mode, selectedSlug]);

  useEffect(() => {
    if (!corpus) return undefined;

    const handlePopState = (event: PopStateEvent) => {
      const nextSlug = routeSlug(window.location.pathname);
      const restoredViewport = viewportFromHistory(event.state);
      pendingFocusRef.current = nextSlug ? mode : "explore";
      if (!nextSlug) setMode("explore");
      setSelectedSlug(nextSlug);
      if (restoredViewport) setGraphViewport(restoredViewport);
      setQuery("");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [corpus, mode]);

  useEffect(() => {
    if (!corpus || mode !== "explore") return;
    window.history.replaceState(historyStateFor(graphViewport), "", window.location.href);
  }, [corpus, graphViewport, mode, selectedSlug]);

  const returnToExplore = (focus: FocusTarget = "explore") => {
    pendingFocusRef.current = focus;
    setMode("explore");
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";

      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        if (mode === "read") {
          returnToExplore("search");
        } else {
          searchRef.current?.focus();
        }
      }

      if (event.key === "Escape") {
        if (mode === "read") {
          returnToExplore();
        } else if (query) {
          setQuery("");
        } else if (selectedSlug) {
          clearSelection();
        } else {
          setQuery("");
        }
      }

      if (!isTyping && mode === "explore" && event.key === "0") {
        event.preventDefault();
        setGraphViewport({ ...DEFAULT_GRAPH_VIEWPORT });
      }

      if (!isTyping && mode === "explore" && (event.key === "+" || event.key === "=")) {
        event.preventDefault();
        setGraphViewport((viewport) => ({
          ...viewport,
          scale: Math.min(2.8, viewport.scale * 1.18),
        }));
      }

      if (!isTyping && mode === "explore" && event.key === "-") {
        event.preventDefault();
        setGraphViewport((viewport) => ({
          ...viewport,
          scale: Math.max(0.42, viewport.scale * 0.82),
        }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [graphViewport, mode, query, selectedSlug]);

  const selectPage = (
    slug: string,
    options?: {
      history?: "push" | "replace" | "none";
      focus?: FocusTarget;
      mode?: ViewMode;
    },
  ) => {
    if (options?.focus) pendingFocusRef.current = options.focus;
    if (options?.mode) setMode(options.mode);
    setSelectedSlug(slug);
    setQuery("");

    if (options?.history === "none") return;
    const nextPath = wikiPath(slug);
    if (window.location.pathname === nextPath) return;
    const method = options?.history === "replace" ? "replaceState" : "pushState";
    window.history[method](historyStateFor(graphViewport), "", nextPath);
  };

  function clearSelection() {
    pendingFocusRef.current = "explore";
    setSelectedSlug(undefined);
    setQuery("");
    if (window.location.pathname !== "/") {
      window.history.pushState(historyStateFor(graphViewport), "", "/");
    }
  }

  const resetToAtlas = () => {
    const resetViewport = { ...DEFAULT_GRAPH_VIEWPORT };
    pendingFocusRef.current = "explore";
    setMode("explore");
    setSelectedSlug(undefined);
    setGraphViewport(resetViewport);
    setQuery("");
    if (window.location.pathname !== "/") {
      window.history.pushState(historyStateFor(resetViewport), "", "/");
    } else {
      window.history.replaceState(historyStateFor(resetViewport), "", "/");
    }
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const firstResult = searchResults[0]?.page;
    if (firstResult) {
      selectPage(firstResult.slug, { focus: "explore", mode: "explore" });
    }
  };

  if (window.location.pathname.replace(/\/+$/, "") === "/docs") {
    return <DocsPage />;
  }

  if (loadState.status === "loading") {
    return (
      <main className="state-screen" aria-busy="true" aria-live="polite">
        <LoaderCircle className="state-screen__spinner" />
        <p className="brand-wordmark">possible<span>.sh</span></p>
        <h1>Loading Possible</h1>
        <p>Preparing the shared wiki for search, reading, and exploration.</p>
      </main>
    );
  }

  if (loadState.status === "error") {
    return (
      <main className="state-screen state-screen--error" role="alert">
        <CircleAlert size={24} />
        <p className="brand-wordmark">possible<span>.sh</span></p>
        <h1>The wiki could not be loaded.</h1>
        <p>{loadState.message}</p>
        <button type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>
          Try again
        </button>
      </main>
    );
  }

  if (!corpus || corpus.pages.length === 0) {
    return (
      <main className="state-screen">
        <p className="brand-wordmark">possible<span>.sh</span></p>
        <h1>No validated wiki pages are available yet.</h1>
        <p>Build or refresh the shared knowledge package, then reload this app.</p>
      </main>
    );
  }

  if (mode === "read") {
    return (
      <main className="app-shell app-shell--read">
        <a className="skip-link" href="#read-title">Skip to article</a>
        <ArticleView
          page={selectedPage}
          routeSlug={selectedSlug}
          fallbackPage={fallbackPage}
          titleRef={readTitleRef}
          onBack={() => returnToExplore()}
          onHome={resetToAtlas}
          onSelectPage={(slug) => selectPage(slug, { focus: "read", mode: "read" })}
        />
      </main>
    );
  }

  return (
    <main className="app-shell app-shell--explore">
      <a className="skip-link" href="#explore-title">
        {selectedSlug ? "Skip to selected page" : "Skip to atlas"}
      </a>

      <div className="explore-view">
        <aside className="explore-panel" aria-label="Explore Possible">
          <button type="button" className="brand-reset" onClick={resetToAtlas}>
            <span className="brand-wordmark">possible<span>.sh</span></span>
            <span className="brand-tagline">A sourced wiki of what people can make possible.</span>
          </button>

          <div className="search-area">
            <form className="search-form" onSubmit={submitSearch}>
              <label htmlFor="wiki-search" className="visually-hidden">Search pages</label>
              <Search size={17} aria-hidden="true" />
              <input
                ref={searchRef}
                id="wiki-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search outcomes, tools, and methods"
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </form>

            {query && (
              <div className="search-results" role="listbox" aria-label="Search results">
                {searchResults.length > 0 ? (
                  <ul>
                    {searchResults.map((result) => (
                      <li key={result.page.slug}>
                        <button
                          type="button"
                          onClick={() => selectPage(result.page.slug, {
                            focus: "explore",
                            mode: "explore",
                          })}
                        >
                          <strong>{result.page.title}</strong>
                          <span>{result.page.summary}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="search-empty">No page matches that search yet.</p>
                )}
              </div>
            )}
            <a className="docs-link" href="/docs">How Possible works</a>
          </div>

          <section className="selected-context" aria-labelledby="explore-title">
            {selectedSlug ? (
              <>
                <div className="inspector-heading">
                  <p className="section-kicker">Focused page</p>
                  <button type="button" className="inspector-clear" onClick={clearSelection} aria-label="Clear graph focus">
                    <X size={15} aria-hidden="true" />
                  </button>
                </div>
                <h1 id="explore-title" ref={exploreTitleRef} tabIndex={-1}>
                  {selectedPage?.title ?? "Page not found"}
                </h1>
                {selectedPage ? (
                  <>
                    <p className="selected-summary">{selectedPage.summary}</p>
                    <p className="review-note">Reviewed {formatReviewedAt(selectedPage.reviewedAt)}</p>
                    <p className="atlas-note">Its authored connections are highlighted in the full universe.</p>
                  </>
                ) : fallbackPage ? (
                  <button
                    type="button"
                    className="read-button"
                    onClick={() => selectPage(fallbackPage.slug, { focus: "explore" })}
                  >
                    Open {fallbackPage.title}
                  </button>
                ) : null}
              </>
            ) : (
              <>
                <p className="section-kicker">Atlas</p>
                <h1 className="atlas-title" id="explore-title" ref={exploreTitleRef} tabIndex={-1}>
                  What do you want to make possible?
                </h1>
                <p className="selected-summary">
                  Zoom from fields into individual pages. Selecting something focuses its authored connections without replacing the wider map.
                </p>
                <p className="atlas-note">{branches.length} fields · {corpus.pages.length} sourced pages</p>
              </>
            )}
          </section>
        </aside>

        <AtlasGraph
          corpus={corpus}
          branches={branches}
          selectedSlug={selectedSlug}
          viewport={graphViewport}
          onViewportChange={setGraphViewport}
          onSelectPage={(slug) => selectPage(slug, { focus: "explore", mode: "explore" })}
        />
      </div>
    </main>
  );
}
