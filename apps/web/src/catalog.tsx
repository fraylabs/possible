"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchDiscoveryOutcomes,
  isOutcomeCategory,
  outcomeCategories,
  outcomeCategoryLabels,
  recordOutcomeUse,
  searchDiscoveryOutcomes,
  sourceFilterKey,
} from "./discovery-data";
import type { DiscoveryOutcome, DiscoverySource, OutcomeCategory } from "./discovery-data";
import { OutcomeReactions } from "./outcome-reactions";
import { CopyButton, SiteShell } from "./shared";

const pageSize = 10;

function visiblePages(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const start = Math.min(Math.max(current - 2, 1), total - 4);
  return Array.from({ length: 5 }, (_, index) => start + index);
}

function updateLocation(mutator: (url: URL) => void, mode: "push" | "replace" = "replace") {
  const url = new URL(window.location.href);
  mutator(url);
  window.history[mode === "push" ? "pushState" : "replaceState"](
    window.history.state,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

function OutcomeMedia({ outcome, priority = false }: { outcome: DiscoveryOutcome; priority?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const media = outcome.media;
  if (!media) {
    const label = outcomeCategoryLabels[outcome.category];
    return <span className="home-outcome-fallback" data-category={outcome.category}>
      <b aria-hidden="true">{label.slice(0, 3).toUpperCase()}</b>
      <small>{label}</small>
    </span>;
  }
  if (media.kind === "image") return <img src={media.src} alt={media.alt} loading={priority ? "eager" : "lazy"} decoding="async" />;
  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      preload="metadata"
      poster={media.poster}
      aria-label={media.alt}
      onLoadedMetadata={(event) => {
        if (media.poster || !Number.isFinite(event.currentTarget.duration)) return;
        event.currentTarget.currentTime = Math.min(Math.max(event.currentTarget.duration * 0.08, 0.25), 1);
      }}
      onPointerEnter={() => void videoRef.current?.play().catch(() => undefined)}
      onPointerLeave={() => videoRef.current?.pause()}
      onFocus={() => void videoRef.current?.play().catch(() => undefined)}
      onBlur={() => videoRef.current?.pause()}
    >
      <source src={media.src} />
    </video>
  );
}

function OutcomeSource({ outcome, onSelect }: { outcome: DiscoveryOutcome; onSelect: (source: DiscoverySource) => void }) {
  const source = outcome.source;
  if (!source) return <span className="home-outcome-source">No Product or Skill attached</span>;
  const initials = source.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <button className="home-outcome-source" type="button" onClick={() => onSelect(source)} aria-label={`Filter by ${source.kind} ${source.name}`}>
      <b aria-hidden="true">{initials}</b>
      <span><small>{source.kind} · {source.owner}</small><strong>{source.name}</strong></span>
      {outcome.sources.length > 1 ? <i>+{outcome.sources.length - 1}</i> : null}
    </button>
  );
}

function usageLabel(count: number): string {
  return `${count.toLocaleString()} ${count === 1 ? "use" : "uses"}`;
}

function OutcomeResult({ outcome, rank, priority, featured, onSelectSource }: { outcome: DiscoveryOutcome; rank: number | undefined; priority: boolean; featured: boolean; onSelectSource: (source: DiscoverySource) => void }) {
  const external = outcome.href.startsWith("https://");
  const [useCount, setUseCount] = useState(outcome.useCount);

  useEffect(() => setUseCount(outcome.useCount), [outcome.id, outcome.useCount]);

  async function recordUse() {
    if (await recordOutcomeUse(outcome.databaseId)) setUseCount((count) => count + 1);
  }

  return (
    <article className="home-result-row" data-featured={featured ? "true" : undefined}>
      <span className="home-result-rank" aria-label={rank ? `Rank ${rank}` : "Unranked Outcome"}>{rank ? `#${rank}` : "—"}</span>
      <a
        className="home-result-media"
        data-fit={outcome.media?.fit ?? "cover"}
        href={outcome.href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        aria-label={`Open ${outcome.title}`}
      >
        <OutcomeMedia outcome={outcome} priority={priority} />
      </a>
      <div className="home-result-copy">
        <div className="home-result-meta">
          <OutcomeSource outcome={outcome} onSelect={onSelectSource} />
          <span>{outcome.publicationKind} · {outcomeCategoryLabels[outcome.category]}</span>
        </div>
        <h2><a href={outcome.href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>{outcome.title}</a></h2>
        <p>{outcome.summary}</p>
        <footer>
          <div className="home-result-signals">
            <strong><i aria-hidden="true" /> {usageLabel(useCount)}</strong>
            <OutcomeReactions outcomeId={outcome.databaseId} likeCount={outcome.likeCount} />
          </div>
          <CopyButton label="Copy prompt" value={outcome.prompt} onCopied={recordUse} />
        </footer>
      </div>
    </article>
  );
}

function Pagination({ page, total, onPageChange, label = "Outcome pages" }: { page: number; total: number; onPageChange: (page: number) => void; label?: string }) {
  const pageCount = Math.ceil(total / pageSize);
  if (pageCount <= 1) return null;
  const pages = visiblePages(page, pageCount);
  return (
    <nav className="home-pagination" aria-label={label}>
      <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label={`Previous ${label === "Outcome pages" ? "Outcome" : "leaderboard"} page`}>←</button>
      {pages[0] && pages[0] > 1 ? <span aria-hidden="true">…</span> : null}
      {pages.map((pageNumber) => <button type="button" key={pageNumber} aria-current={pageNumber === page ? "page" : undefined} onClick={() => onPageChange(pageNumber)}>{pageNumber}</button>)}
      {pages.at(-1) && pages.at(-1)! < pageCount ? <span aria-hidden="true">…</span> : null}
      <button type="button" onClick={() => onPageChange(page + 1)} disabled={page === pageCount} aria-label={`Next ${label === "Outcome pages" ? "Outcome" : "leaderboard"} page`}>→</button>
    </nav>
  );
}

export function OutcomesPage({ outcomesFixture }: { outcomesFixture?: DiscoveryOutcome[] } = {}) {
  const [outcomes, setOutcomes] = useState<DiscoveryOutcome[]>(outcomesFixture ?? []);
  const [directoryState, setDirectoryState] = useState<"loading" | "ready" | "error">(outcomesFixture === undefined ? "loading" : "ready");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<OutcomeCategory | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = query.trim();
  const hasUsageRanking = outcomes.some((outcome) => outcome.useCount > 0);
  const availableCategories = useMemo(() => outcomeCategories.filter((candidate) => outcomes.some((outcome) => outcome.category === candidate)), [outcomes]);
  const activeSource = useMemo(() => outcomes.flatMap((outcome) => outcome.sources).find((source) => sourceFilterKey(source) === sourceFilter), [outcomes, sourceFilter]);

  const filteredOutcomes = useMemo(() => {
    const matches = searchDiscoveryOutcomes(outcomes, query, category, sourceFilter);
    if (normalizedQuery || hasUsageRanking) return matches;
    return [...matches].sort((left, right) => {
      const byDate = Date.parse(right.publishedAt ?? "") - Date.parse(left.publishedAt ?? "");
      if (Number.isFinite(byDate) && byDate !== 0) return byDate;
      return left.catalogNumber - right.catalogNumber;
    });
  }, [category, hasUsageRanking, normalizedQuery, outcomes, query, sourceFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredOutcomes.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleOutcomes = filteredOutcomes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (outcomesFixture !== undefined) return;
    let cancelled = false;
    void fetchDiscoveryOutcomes()
      .then((entries) => { if (!cancelled) { setOutcomes(entries); setDirectoryState("ready"); } })
      .catch(() => { if (!cancelled) setDirectoryState("error"); });
    return () => { cancelled = true; };
  }, [outcomesFixture]);

  useEffect(() => {
    const syncFromUrl = () => {
      const parameters = new URLSearchParams(window.location.search);
      const urlCategory = parameters.get("category");
      const urlPage = Number.parseInt(parameters.get("page") ?? "1", 10);
      setQuery(parameters.get("q") ?? "");
      setCategory(isOutcomeCategory(urlCategory) ? urlCategory : "all");
      setSourceFilter(parameters.get("uses"));
      setPage(Number.isFinite(urlPage) ? Math.max(urlPage, 1) : 1);
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || (!event.metaKey && !event.ctrlKey)) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  function resetPage(url: URL) {
    setPage(1);
    url.searchParams.delete("page");
  }

  function changeQuery(nextQuery: string) {
    setQuery(nextQuery);
    updateLocation((url) => {
      if (nextQuery.trim()) url.searchParams.set("q", nextQuery.trim());
      else url.searchParams.delete("q");
      resetPage(url);
    });
  }

  function changeCategory(nextCategory: OutcomeCategory | "all") {
    setCategory(nextCategory);
    updateLocation((url) => {
      if (nextCategory === "all") url.searchParams.delete("category");
      else url.searchParams.set("category", nextCategory);
      resetPage(url);
    });
  }

  function changeSource(nextSource: DiscoverySource | null) {
    const nextFilter = nextSource ? sourceFilterKey(nextSource) : null;
    setSourceFilter(nextFilter);
    updateLocation((url) => {
      if (nextFilter) url.searchParams.set("uses", nextFilter);
      else url.searchParams.delete("uses");
      resetPage(url);
    }, "push");
  }

  function changePage(nextPage: number) {
    const bounded = Math.min(Math.max(nextPage, 1), pageCount);
    setPage(bounded);
    updateLocation((url) => {
      if (bounded === 1) url.searchParams.delete("page");
      else url.searchParams.set("page", String(bounded));
    }, "push");
    window.requestAnimationFrame(() => document.getElementById("discover")?.scrollIntoView?.({ behavior: "smooth", block: "start" }));
  }

  return (
    <SiteShell className="home-page">
      <section className="home-directory layout-reading" id="discover" aria-labelledby="home-heading">
        <header className="home-heading">
          <div>
            <span>{normalizedQuery ? "SEARCH RESULTS" : sourceFilter ? "FILTERED OUTCOMES" : hasUsageRanking ? "LEADERBOARD / ALL TIME" : "OUTCOME DIRECTORY"}</span>
            <h1 id="home-heading">{normalizedQuery ? "Search Results" : activeSource ? `${activeSource.name} Outcomes` : category === "all" ? "All Outcomes" : `${outcomeCategoryLabels[category]} Outcomes`}</h1>
            <p>{normalizedQuery ? "Results ranked by relevance, then use." : activeSource ? `Prompts that use ${activeSource.name}.` : hasUsageRanking ? "Prompts ranked by how often people use them." : "Browse the latest published Outcomes."}</p>
          </div>
          <strong>{directoryState === "loading" ? "—" : `${filteredOutcomes.length} ${filteredOutcomes.length === 1 ? "Outcome" : "Outcomes"}`}</strong>
        </header>

        <label className="home-search">
          <span aria-hidden="true">⌕</span>
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => changeQuery(event.target.value)}
            placeholder="What do you want an agent to make?"
            aria-label="What do you want an agent to make?"
          />
          {query ? <button type="button" onClick={() => changeQuery("")} aria-label="Clear search">Clear</button> : <kbd>⌘ K</kbd>}
        </label>

        <div className="home-controls">
          <nav className="home-category-filter" aria-label="Outcome categories">
            <button type="button" aria-pressed={category === "all"} onClick={() => changeCategory("all")}>All</button>
            {availableCategories.map((candidate) => <button type="button" aria-pressed={category === candidate} onClick={() => changeCategory(candidate)} key={candidate}>{outcomeCategoryLabels[candidate]}</button>)}
          </nav>
          {sourceFilter ? <button className="home-active-filter" type="button" onClick={() => changeSource(null)} aria-label="Clear Product or Skill filter">
            <span>{activeSource?.kind ?? sourceFilter.split(":", 1)[0]}</span>
            <strong>{activeSource?.name ?? sourceFilter.slice(sourceFilter.indexOf(":") + 1)}</strong>
            <i aria-hidden="true">×</i>
          </button> : null}
        </div>

        {directoryState === "loading" ? (
          <div className="home-empty" role="status"><h2>Loading Outcomes…</h2><p>Reading the public directory.</p></div>
        ) : directoryState === "error" ? (
          <div className="home-empty" role="alert"><h2>The directory is unavailable.</h2><p>Try again shortly. Published sources remain unchanged.</p></div>
        ) : visibleOutcomes.length ? (
          <div className="home-results" role="region" aria-label="Outcome results">
            {visibleOutcomes.map((outcome, index) => (
              <OutcomeResult
                outcome={outcome}
                rank={!normalizedQuery && hasUsageRanking ? (currentPage - 1) * pageSize + index + 1 : undefined}
                priority={currentPage === 1 && index < 3}
                featured={!normalizedQuery && hasUsageRanking && currentPage === 1 && index < 3}
                onSelectSource={changeSource}
                key={outcome.id}
              />
            ))}
          </div>
        ) : (
          <div className="home-empty">
            <h2>No exact match yet.</h2>
            <p>Try another description or browse a nearby category.</p>
            <div>{availableCategories.slice(0, 3).map((candidate) => <button type="button" onClick={() => { changeQuery(""); changeCategory(candidate); }} key={candidate}>{outcomeCategoryLabels[candidate]}</button>)}</div>
          </div>
        )}

        <Pagination page={currentPage} total={filteredOutcomes.length} onPageChange={changePage} />
        {filteredOutcomes.length ? (
          <p className="home-pagination-summary">
            {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredOutcomes.length)} of {filteredOutcomes.length}
          </p>
        ) : null}
      </section>
    </SiteShell>
  );
}

export default OutcomesPage;
