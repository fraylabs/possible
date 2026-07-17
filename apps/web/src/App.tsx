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
import { ArticleSheet } from "./components/ArticleSheet";
import { RelatedGraph } from "./components/RelatedGraph";
import { buildRelatedGraph, routeSlug, wikiPath } from "./wiki";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; corpus: WikiCorpus }
  | { status: "error"; message: string };

function useMediaQuery(query: string): boolean {
  const getMatches = () =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(query).matches
      : false;

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return undefined;
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

export function App() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [selectedSlug, setSelectedSlug] = useState<string | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [mobileArticleOpen, setMobileArticleOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery("(max-width: 960px)");

  useEffect(() => {
    let active = true;
    setLoadState({ status: "loading" });

    loadWiki()
      .then((corpus) => {
        if (!active) return;
        setLoadState({ status: "ready", corpus });
        const requestedSlug = routeSlug(window.location.pathname);
        const initialSlug = requestedSlug ?? getPage(corpus, "web")?.slug ?? corpus.pages[0]?.slug;
        setSelectedSlug(initialSlug);

        if (!requestedSlug && initialSlug) {
          window.history.replaceState(null, "", wikiPath(initialSlug));
        }
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
  const fallbackPage = corpus ? getPage(corpus, "web") ?? corpus.pages[0] : undefined;
  const graph = corpus && selectedSlug ? buildRelatedGraph(corpus, selectedSlug) : {
    nodes: [],
    edges: [],
    outgoingPages: [],
    backlinkPages: [],
    relatedPages: [],
    hiddenCount: 0,
  };
  const searchResults = corpus && query.trim()
    ? searchPages(corpus, query, { limit: 8 })
    : [];
  const outgoingPages = graph.outgoingPages;
  const backlinkPages = graph.backlinkPages;
  const relatedPages = graph.relatedPages;

  useEffect(() => {
    if (!isMobile) {
      setMobileArticleOpen(false);
      return;
    }
    if (selectedSlug) {
      setMobileArticleOpen(true);
    }
  }, [isMobile, selectedSlug]);

  useEffect(() => {
    if (!corpus) return undefined;

    const handlePopState = () => {
      const nextSlug = routeSlug(window.location.pathname)
        ?? getPage(corpus, "web")?.slug
        ?? corpus.pages[0]?.slug;
      setSelectedSlug(nextSlug);
      setQuery("");
      if (isMobile && nextSlug) {
        setMobileArticleOpen(true);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [corpus, isMobile]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";

      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (event.key === "Escape") {
        setQuery("");
        setMobileArticleOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const selectPage = (
    slug: string,
    options?: { history?: "push" | "replace" | "none"; openMobileArticle?: boolean },
  ) => {
    setSelectedSlug(slug);
    setQuery("");

    if (isMobile && options?.openMobileArticle !== false) {
      setMobileArticleOpen(true);
    }

    if (options?.history === "none") return;
    const nextPath = wikiPath(slug);
    if (window.location.pathname === nextPath) return;
    const method = options?.history === "replace" ? "replaceState" : "pushState";
    window.history[method](null, "", nextPath);
  };

  const resetToFirstPage = () => {
    if (fallbackPage) selectPage(fallbackPage.slug);
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const firstResult = searchResults[0]?.page;
    if (firstResult) {
      selectPage(firstResult.slug);
    }
  };

  if (loadState.status === "loading") {
    return (
      <main className="state-screen" aria-busy="true" aria-live="polite">
        <LoaderCircle className="state-screen__spinner" />
        <p className="brand-wordmark">possible<span>.sh</span></p>
        <h1>Loading Possible</h1>
        <p>Preparing the shared wiki corpus for search, reading, and graph navigation.</p>
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

  return (
    <main className="app-shell">
      <a className="skip-link" href="#wiki-article-title">Skip to article</a>

      <header className="app-header">
        <button type="button" className="brand-reset" onClick={resetToFirstPage}>
          <span className="brand-wordmark">possible<span>.sh</span></span>
          <span className="brand-tagline">A sourced wiki of what people and agents can make possible.</span>
        </button>

        <div className="search-area">
          <form className="search-form" onSubmit={submitSearch}>
            <label htmlFor="wiki-search" className="visually-hidden">Search pages</label>
            <Search size={16} aria-hidden="true" />
            <input
              ref={searchRef}
              id="wiki-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="What do you want to make possible?"
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
                      <button type="button" onClick={() => selectPage(result.page.slug)}>
                        <strong>{result.page.title}</strong>
                        <span>{result.page.summary}</span>
                        <small>{result.matchedTerms.join(" · ")}</small>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="search-empty">No page matches that search yet.</p>
              )}
            </div>
          )}
        </div>

        <div className="header-meta">
          <span>{corpus.pages.length} pages</span>
          {isMobile && (
            <button
              type="button"
              className="article-toggle article-toggle--header"
              onClick={() => setMobileArticleOpen((open) => !open)}
            >
              {mobileArticleOpen ? "Hide article" : "Open article"}
            </button>
          )}
        </div>
      </header>

      <div className="app-content">
        <ArticleSheet
          page={selectedPage}
          routeSlug={selectedSlug}
          outgoingPages={outgoingPages}
          backlinkPages={backlinkPages}
          relatedCount={relatedPages.length}
          fallbackPage={fallbackPage}
          isMobile={isMobile}
          isOpen={mobileArticleOpen}
          onClose={() => setMobileArticleOpen(false)}
          onSelectPage={selectPage}
        />

        <RelatedGraph
          graph={graph}
          onSelectPage={selectPage}
        />
      </div>
    </main>
  );
}
