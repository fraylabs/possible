"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Virtuoso, VirtuosoGrid } from "react-virtuoso";
import {
  fetchDiscoveryOutcomes,
  fetchWeeklySourceRankings,
  isOutcomeCategory,
  localDiscoveryOutcomes,
  outcomeCategories,
  outcomeCategoryLabels,
  recordOutcomeCopy,
  searchDiscoveryOutcomes,
} from "./discovery-data";
import type { DiscoveryOutcome, DiscoveryView, OutcomeCategory, WeeklySourceRanking } from "./discovery-data";
import { CopyButton, SiteShell } from "./shared";

const rankingPageSize = 10;

function formatCopies(copies: number) {
  return `${copies.toLocaleString("en-US")} ${copies === 1 ? "copy" : "copies"}`;
}

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
  if (!media) return <span className="home-outcome-placeholder">{outcomeCategoryLabels[outcome.category]}</span>;
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

function OutcomeSource({ outcome }: { outcome: DiscoveryOutcome }) {
  const source = outcome.source;
  if (!source) return <span className="home-outcome-source">Outcome</span>;
  return (
    <a className="home-outcome-source" href={source.href}>
      <span>{source.name}</span>
      <i>{source.kind}</i>
    </a>
  );
}

function OutcomeActions({ outcome }: { outcome: DiscoveryOutcome }) {
  return (
    <div className="home-outcome-actions">
      {outcome.requirements.map((requirement) => <span key={requirement}>{requirement}</span>)}
      <CopyButton
        label="Copy prompt"
        value={outcome.prompt}
        onCopied={() => recordOutcomeCopy(outcome.databaseId)}
      />
    </div>
  );
}

function OutcomeGalleryCard({ outcome, priority }: { outcome: DiscoveryOutcome; priority: boolean }) {
  const external = outcome.href.startsWith("https://");
  return (
    <article className="home-outcome-card">
      <a
        className="home-outcome-visual"
        data-fit={outcome.media?.fit ?? "cover"}
        href={outcome.href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        aria-label={`Open ${outcome.title}`}
      >
        <OutcomeMedia outcome={outcome} priority={priority} />
        <span>{outcomeCategoryLabels[outcome.category]}</span>
      </a>
      <div className="home-outcome-card-copy">
        <OutcomeSource outcome={outcome} />
        <h3><a href={outcome.href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>{outcome.title}</a></h3>
        <p>{outcome.summary}</p>
        <OutcomeActions outcome={outcome} />
      </div>
    </article>
  );
}

function OutcomeListRow({ outcome }: { outcome: DiscoveryOutcome }) {
  const external = outcome.href.startsWith("https://");
  return (
    <article className="home-outcome-list-row">
      <a
        className="home-outcome-list-media"
        data-fit={outcome.media?.fit ?? "cover"}
        href={outcome.href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        aria-label={`Open ${outcome.title}`}
      >
        <OutcomeMedia outcome={outcome} />
      </a>
      <div className="home-outcome-list-copy">
        <OutcomeSource outcome={outcome} />
        <h3><a href={outcome.href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>{outcome.title}</a></h3>
        <p>{outcome.summary}</p>
      </div>
      <OutcomeActions outcome={outcome} />
    </article>
  );
}

function WeeklyRanking({
  entries,
  page,
  total,
  loading,
  onPageChange,
}: {
  entries: WeeklySourceRanking[];
  page: number;
  total: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}) {
  const pageCount = Math.ceil(total / rankingPageSize);
  const pages = visiblePages(page, pageCount);
  return (
    <section className="home-ranking" aria-labelledby="home-ranking-heading">
      <header><h1 id="home-ranking-heading">Most copied this week</h1><span>Last 7 days</span></header>
      {entries.length ? (
        <ol start={(page - 1) * rankingPageSize + 1}>
          {entries.map((entry, index) => (
            <li key={`${entry.type}:${entry.id}`}>
              <a href={entry.href}>
                <span className="home-ranking-number">{String((page - 1) * rankingPageSize + index + 1).padStart(2, "0")}</span>
                <span className="home-ranking-identity">
                  {entry.logoUrl ? <img src={entry.logoUrl} alt="" /> : <i aria-hidden="true">{entry.type === "skill" ? "SK" : entry.name.slice(0, 1)}</i>}
                  <strong>{entry.name}</strong>
                  <small>{entry.owner}</small>
                </span>
                <span className="home-ranking-type">{entry.type}</span>
                <span className="home-ranking-copies">{formatCopies(entry.copies)}</span>
                <span className="home-ranking-arrow" aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ol>
      ) : <p className="home-ranking-empty">{loading ? "Loading this week’s ranking…" : "No copied prompts yet this week."}</p>}
      {pageCount > 1 ? (
        <nav className="home-ranking-pagination" aria-label="Weekly ranking pages">
          <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Previous ranking page">←</button>
          {pages[0] && pages[0] > 1 ? <span aria-hidden="true">…</span> : null}
          {pages.map((pageNumber) => <button type="button" key={pageNumber} aria-current={pageNumber === page ? "page" : undefined} onClick={() => onPageChange(pageNumber)}>{pageNumber}</button>)}
          {pages.at(-1) && pages.at(-1)! < pageCount ? <span aria-hidden="true">…</span> : null}
          <button type="button" onClick={() => onPageChange(page + 1)} disabled={page === pageCount} aria-label="Next ranking page">→</button>
        </nav>
      ) : null}
    </section>
  );
}

export function OutcomesPage({ rankingFixture }: { rankingFixture?: WeeklySourceRanking[] } = {}) {
  const [outcomes, setOutcomes] = useState<DiscoveryOutcome[]>(localDiscoveryOutcomes);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<OutcomeCategory | "all">("all");
  const [view, setView] = useState<DiscoveryView>("gallery");
  const [rankingPage, setRankingPage] = useState(1);
  const [rankings, setRankings] = useState<WeeklySourceRanking[]>(rankingFixture?.slice(0, rankingPageSize) ?? []);
  const [rankingTotal, setRankingTotal] = useState(rankingFixture?.length ?? 0);
  const [rankingLoading, setRankingLoading] = useState(rankingFixture === undefined);
  const searchRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = query.trim();
  const filteredOutcomes = useMemo(() => searchDiscoveryOutcomes(outcomes, query, category), [category, outcomes, query]);
  const availableCategories = useMemo(() => outcomeCategories.filter((candidate) => outcomes.some((outcome) => outcome.category === candidate)), [outcomes]);

  useEffect(() => {
    let cancelled = false;
    void fetchDiscoveryOutcomes().then((entries) => { if (!cancelled) setOutcomes(entries); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (rankingFixture) {
      const start = (rankingPage - 1) * rankingPageSize;
      setRankings(rankingFixture.slice(start, start + rankingPageSize));
      setRankingTotal(rankingFixture.length);
      setRankingLoading(false);
      return;
    }
    let cancelled = false;
    setRankingLoading(true);
    void fetchWeeklySourceRankings(rankingPage, rankingPageSize).then((result) => {
      if (cancelled) return;
      setRankings(result.entries);
      setRankingTotal(result.total);
      setRankingLoading(false);
    });
    return () => { cancelled = true; };
  }, [rankingFixture, rankingPage]);

  useEffect(() => {
    const syncFromUrl = () => {
      const parameters = new URLSearchParams(window.location.search);
      const urlCategory = parameters.get("category");
      const urlView = parameters.get("view");
      const urlRankingPage = Number.parseInt(parameters.get("rankingPage") ?? "1", 10);
      const storedView = window.localStorage?.getItem("possible.discovery-view");
      setQuery(parameters.get("q") ?? "");
      setCategory(isOutcomeCategory(urlCategory) ? urlCategory : "all");
      setView(urlView === "list" || urlView === "gallery" ? urlView : storedView === "list" ? "list" : "gallery");
      setRankingPage(Number.isFinite(urlRankingPage) ? Math.max(urlRankingPage, 1) : 1);
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

  function changeQuery(nextQuery: string) {
    setQuery(nextQuery);
    updateLocation((url) => {
      if (nextQuery.trim()) url.searchParams.set("q", nextQuery.trim());
      else url.searchParams.delete("q");
    });
  }

  function changeCategory(nextCategory: OutcomeCategory | "all") {
    setCategory(nextCategory);
    updateLocation((url) => {
      if (nextCategory === "all") url.searchParams.delete("category");
      else url.searchParams.set("category", nextCategory);
    });
  }

  function changeView(nextView: DiscoveryView) {
    setView(nextView);
    window.localStorage?.setItem("possible.discovery-view", nextView);
    updateLocation((url) => {
      if (nextView === "gallery") url.searchParams.delete("view");
      else url.searchParams.set("view", nextView);
    });
  }

  function changeRankingPage(nextPage: number) {
    const pageCount = Math.max(1, Math.ceil(rankingTotal / rankingPageSize));
    const bounded = Math.min(Math.max(nextPage, 1), pageCount);
    setRankingPage(bounded);
    updateLocation((url) => {
      if (bounded === 1) url.searchParams.delete("rankingPage");
      else url.searchParams.set("rankingPage", String(bounded));
    }, "push");
    window.requestAnimationFrame(() => document.getElementById("weekly-ranking")?.scrollIntoView?.({ behavior: "smooth", block: "start" }));
  }

  return (
    <SiteShell className="home-page">
      {!normalizedQuery ? <div className="layout-standard" id="weekly-ranking"><WeeklyRanking entries={rankings} page={rankingPage} total={rankingTotal} loading={rankingLoading} onPageChange={changeRankingPage} /></div> : null}

      <section className="home-discover layout-wide" id="discover" aria-labelledby="home-discover-heading">
        <header className="home-discover-heading">
          <div><p>Discover</p><h2 id="home-discover-heading">What can agents make?</h2></div>
          <span>{filteredOutcomes.length} {filteredOutcomes.length === 1 ? "outcome" : "outcomes"}</span>
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

        <div className="home-discovery-controls">
          <nav className="home-category-filter" aria-label="Outcome categories">
            <button type="button" aria-pressed={category === "all"} onClick={() => changeCategory("all")}>All</button>
            {availableCategories.map((candidate) => <button type="button" aria-pressed={category === candidate} onClick={() => changeCategory(candidate)} key={candidate}>{outcomeCategoryLabels[candidate]}</button>)}
          </nav>
          <div className="home-view-switcher" role="group" aria-label="Result view">
            <button type="button" aria-pressed={view === "gallery"} onClick={() => changeView("gallery")}>Gallery</button>
            <button type="button" aria-pressed={view === "list"} onClick={() => changeView("list")}>List</button>
          </div>
        </div>

        {normalizedQuery ? <p className="home-search-summary">Results related to <strong>“{normalizedQuery}”</strong></p> : null}
        {filteredOutcomes.length ? view === "gallery" ? filteredOutcomes.length > 30 ? (
          <VirtuosoGrid
            className="home-outcome-virtual"
            listClassName="home-outcome-grid"
            itemClassName="home-outcome-grid-item"
            useWindowScroll
            data={filteredOutcomes}
            computeItemKey={(_, outcome) => outcome.id}
            increaseViewportBy={{ top: 300, bottom: 600 }}
            itemContent={(index, outcome) => <OutcomeGalleryCard outcome={outcome} priority={index < 3} />}
            role="region"
            aria-label="Outcome gallery"
          />
        ) : (
          <div className="home-outcome-grid" role="region" aria-label="Outcome gallery">
            {filteredOutcomes.map((outcome, index) => <OutcomeGalleryCard outcome={outcome} priority={index < 3} key={outcome.id} />)}
          </div>
        ) : filteredOutcomes.length > 30 ? (
          <Virtuoso
            className="home-outcome-virtual"
            useWindowScroll
            data={filteredOutcomes}
            computeItemKey={(_, outcome) => outcome.id}
            increaseViewportBy={{ top: 300, bottom: 600 }}
            itemContent={(_, outcome) => <OutcomeListRow outcome={outcome} />}
            role="region"
            aria-label="Outcome list"
          />
        ) : (
          <div className="home-outcome-list" role="region" aria-label="Outcome list">
            {filteredOutcomes.map((outcome) => <OutcomeListRow outcome={outcome} key={outcome.id} />)}
          </div>
        ) : (
          <div className="home-empty">
            <h2>No exact match yet.</h2>
            <p>Try another description or browse a nearby category.</p>
            <div>{availableCategories.slice(0, 3).map((candidate) => <button type="button" onClick={() => { changeQuery(""); changeCategory(candidate); }} key={candidate}>{outcomeCategoryLabels[candidate]}</button>)}</div>
          </div>
        )}
      </section>
    </SiteShell>
  );
}

export default OutcomesPage;
