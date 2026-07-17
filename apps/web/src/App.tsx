import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  ChevronRight,
  CircleAlert,
  Command,
  LoaderCircle,
  Menu,
  Search,
  Share2,
  X,
} from "lucide-react";
import { DetailPanel } from "./components/DetailPanel";
import { GraphCanvas } from "./components/GraphCanvas";
import {
  buildPath,
  getConnectedNodes,
  getRootNodes,
  loadPossibleGraph,
  searchNodes,
  type DisplayGraph,
} from "./graph";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; graph: DisplayGraph }
  | { status: "error"; message: string };

const readHash = (): string | undefined => {
  try {
    return decodeURIComponent(window.location.hash.replace(/^#\/?/, "")) || undefined;
  } catch {
    return undefined;
  }
};

export function App() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const navigationTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    let active = true;
    setLoadState({ status: "loading" });
    loadPossibleGraph()
      .then((graph) => {
        if (!active) return;
        setLoadState({ status: "ready", graph });
        if (!graph.nodes.length) return;
        const hashId = readHash();
        const first = hashId && graph.nodes.some((node) => node.id === hashId)
          ? hashId
          : getRootNodes(graph)[0]?.id ?? graph.nodes[0]?.id;
        if (first) setSelectedId(first);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadState({
          status: "error",
          message: error instanceof Error ? error.message : "The knowledge graph could not be loaded.",
        });
      });
    return () => { active = false; };
  }, [loadAttempt]);

  const graph = loadState.status === "ready" ? loadState.graph : undefined;
  const selectedNode = graph?.nodes.find((node) => node.id === selectedId);
  const path = useMemo(
    () => graph && selectedId ? buildPath(graph, selectedId) : [],
    [graph, selectedId],
  );
  const roots = useMemo(() => graph ? getRootNodes(graph) : [], [graph]);
  const searchHits = useMemo(() => graph ? searchNodes(graph, query) : [], [graph, query]);
  const connected = useMemo(
    () => graph && selectedId ? getConnectedNodes(graph, selectedId).slice(0, 7) : [],
    [graph, selectedId],
  );

  const selectNode = useCallback((id: string, options?: { preserveHistory?: boolean }) => {
    if (!graph || !graph.nodes.some((node) => node.id === id)) return;
    if (id !== selectedId && selectedId && !options?.preserveHistory) {
      setHistory((current) => [...current.slice(-11), selectedId]);
    }
    setSelectedId(id);
    setQuery("");
    setIsNavigating(true);
    setMobileDetailOpen(true);
    setMobileMenuOpen(false);
    window.history.replaceState(null, "", `#/${encodeURIComponent(id)}`);
    if (navigationTimer.current) window.clearTimeout(navigationTimer.current);
    navigationTimer.current = window.setTimeout(() => setIsNavigating(false), 680);
  }, [graph, selectedId]);

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
        setMobileMenuOpen(false);
        setMobileDetailOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => () => {
    if (navigationTimer.current) window.clearTimeout(navigationTimer.current);
  }, []);

  const goBack = () => {
    const prior = history.at(-1);
    if (!prior) return;
    setHistory((current) => current.slice(0, -1));
    selectNode(prior, { preserveHistory: true });
  };

  const resetOverview = () => {
    const root = roots[0];
    if (root) selectNode(root.id);
  };

  const openMobileSearch = () => {
    setMobileMenuOpen(true);
    window.requestAnimationFrame(() => searchRef.current?.focus());
  };

  if (loadState.status === "loading") {
    return (
      <main className="state-screen" aria-busy="true" aria-live="polite">
        <div className="state-screen__constellation" aria-hidden="true"><i /><i /><i /><span /></div>
        <p className="brand-wordmark">possible<span>.sh</span></p>
        <LoaderCircle className="state-screen__spinner" />
        <h1>Mapping contributor knowledge</h1>
        <p>Preparing the same operational graph agents can consult.</p>
      </main>
    );
  }

  if (loadState.status === "error") {
    return (
      <main className="state-screen state-screen--error" role="alert">
        <CircleAlert size={24} />
        <p className="brand-wordmark">possible<span>.sh</span></p>
        <h1>The map could not be assembled.</h1>
        <p>{loadState.message}</p>
        <button type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Try loading again</button>
      </main>
    );
  }

  if (!graph || !graph.nodes.length || !selectedNode) {
    return (
      <main className="state-screen">
        <BookOpenText size={24} />
        <p className="brand-wordmark">possible<span>.sh</span></p>
        <h1>The atlas is ready for its first contribution.</h1>
        <p>No validated knowledge nodes are available in this build yet.</p>
      </main>
    );
  }

  return (
    <main className={`app-shell${mobileDetailOpen ? " has-mobile-detail" : ""}`}>
      <a className="skip-link" href="#node-detail">Skip to selected knowledge</a>

      <nav className={`atlas-sidebar${mobileMenuOpen ? " is-open" : ""}`} aria-label="Knowledge navigation">
        <header className="sidebar-brand">
          <div>
            <a href="#/" className="brand-wordmark" onClick={(event) => { event.preventDefault(); resetOverview(); }}>
              possible<span>.sh</span>
            </a>
            <p>How the world gets built.</p>
          </div>
          <button type="button" className="mobile-menu-button" onClick={() => setMobileMenuOpen(false)} aria-label="Close knowledge menu">
            <X size={18} />
          </button>
        </header>

        <div className="sidebar-search">
          <label htmlFor="knowledge-search">Search operational knowledge</label>
          <div className="search-field">
            <Search size={15} aria-hidden="true" />
            <input
              ref={searchRef}
              id="knowledge-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Outcome, tool, provider…"
              autoComplete="off"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={14} /></button>
            ) : <kbd aria-label="Keyboard shortcut slash">/</kbd>}
          </div>
        </div>

        <div className="sidebar-scroll">
          {query ? (
            <section className="search-results" aria-labelledby="search-results-heading">
              <div className="sidebar-section-heading">
                <h2 id="search-results-heading">Matches</h2>
                <span aria-live="polite">{searchHits.length}</span>
              </div>
              {searchHits.length ? (
                <ul>
                  {searchHits.map((hit) => (
                    <li key={hit.node.id}>
                      <button type="button" onClick={() => selectNode(hit.node.id)}>
                        <span className="search-result__signal" data-kind={hit.node.type} />
                        <span>
                          <strong>{hit.node.title}</strong>
                          <small>{hit.reason} · {hit.node.type}</small>
                        </span>
                        <ArrowRight size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="search-empty">
                  <Search size={18} />
                  <strong>No maintained node found</strong>
                  <p>Try a broader outcome, tool, or capability.</p>
                </div>
              )}
            </section>
          ) : (
            <>
              <section className="current-path" aria-labelledby="current-path-heading">
                <div className="sidebar-section-heading">
                  <h2 id="current-path-heading">Current path</h2>
                  <span>{String(path.length).padStart(2, "0")}</span>
                </div>
                <ol>
                  {path.map((node, index) => (
                    <li key={node.id} className={node.id === selectedId ? "is-current" : ""}>
                      <button type="button" onClick={() => selectNode(node.id)} aria-current={node.id === selectedId ? "page" : undefined}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <strong>{node.title}</strong>
                        <ChevronRight size={13} />
                      </button>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="root-branches" aria-labelledby="branches-heading">
                <div className="sidebar-section-heading">
                  <h2 id="branches-heading">Top-level knowledge</h2>
                  <Share2 size={14} />
                </div>
                <ul>
                  {roots.slice(0, 8).map((node) => (
                    <li key={node.id}>
                      <button type="button" onClick={() => selectNode(node.id)} className={node.id === selectedId ? "is-active" : ""}>
                        <i data-kind={node.type} />
                        <span>{node.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              {connected.length > 0 && (
                <section className="nearby-list" aria-labelledby="nearby-heading">
                  <div className="sidebar-section-heading">
                    <h2 id="nearby-heading">Nearby</h2>
                    <span>{String(connected.length).padStart(2, "0")}</span>
                  </div>
                  <ul>
                    {connected.map((node) => (
                      <li key={node.id}>
                        <button type="button" onClick={() => selectNode(node.id)}>
                          <span>{node.title}</span><ArrowRight size={12} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>

        <footer className="sidebar-footer">
          <span><i /> {graph.nodes.length} maintained nodes</span>
          <span><Command size={12} /> Agent-readable</span>
        </footer>
      </nav>

      <div className="mobile-topbar">
        <button type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Open knowledge menu"><Menu size={19} /></button>
        <span className="brand-wordmark">possible<span>.sh</span></span>
        <button type="button" onClick={openMobileSearch} aria-label="Search knowledge"><Search size={18} /></button>
      </div>

      <div className="explorer-main">
        <div className="mobile-path" aria-label="Current knowledge path">
          {path.map((node, index) => (
            <span key={node.id}>
              {index > 0 && <ChevronRight size={11} />}
              <button type="button" onClick={() => selectNode(node.id)}>{node.title}</button>
            </span>
          ))}
        </div>
        <GraphCanvas
          graph={graph}
          selectedId={selectedId}
          isNavigating={isNavigating}
          onSelect={selectNode}
          onReset={resetOverview}
          onBack={goBack}
          canGoBack={history.length > 0}
        />
      </div>

      <div id="node-detail" className="detail-column">
        <DetailPanel
          graph={graph}
          node={selectedNode}
          onSelect={selectNode}
          onCloseMobile={() => setMobileDetailOpen(false)}
        />
      </div>
    </main>
  );
}
