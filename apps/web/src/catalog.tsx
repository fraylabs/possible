"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchDiscoveryOutcomes,
  isOutcomeCategory,
  localDiscoveryOutcomes,
  outcomeCategories,
  outcomeCategoryLabels,
  recordOutcomeCopy,
  searchDiscoveryOutcomes,
} from "./discovery-data";
import type { DiscoveryOutcome, OutcomeCategory } from "./discovery-data";
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
  if (!source) return <span className="home-outcome-source">No Product or Skill attached</span>;
  return (
    <a className="home-outcome-source" href={source.href}>
      <span>Made with {source.name}{outcome.sources.length > 1 ? ` +${outcome.sources.length - 1}` : ""}</span>
      <i>{source.kind}</i>
    </a>
  );
}

function usageLabel(count: number): string {
  return `${count.toLocaleString()} ${count === 1 ? "copy" : "copies"}`;
}

function OutcomeResult({ outcome, position, priority, featured }: { outcome: DiscoveryOutcome; position: number; priority: boolean; featured: boolean }) {
  const external = outcome.href.startsWith("https://");
  const [useCount, setUseCount] = useState(outcome.useCount);

  useEffect(() => setUseCount(outcome.useCount), [outcome.id, outcome.useCount]);

  async function recordUse() {
    if (await recordOutcomeCopy(outcome.databaseId)) setUseCount((count) => count + 1);
  }

  return (
    <article className="home-result-row" data-featured={featured ? "true" : undefined}>
      <span className="home-result-rank" aria-label={`Result ${position}`}>#{position}</span>
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
          <OutcomeSource outcome={outcome} />
          <span>{outcome.publicationKind} · {outcomeCategoryLabels[outcome.category]}</span>
        </div>
        <h2><a href={outcome.href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>{outcome.title}</a></h2>
        <p>{outcome.summary}</p>
        <footer>
          <div className="home-result-requirements">
            <strong><i aria-hidden="true" /> {usageLabel(useCount)}</strong>
            <span className="home-result-rating" aria-label={`${outcome.averageRating.toFixed(1)} out of 5 stars from ${outcome.reviewCount} reviews`}>
              ★ {outcome.averageRating.toFixed(1)} · {outcome.reviewCount} {outcome.reviewCount === 1 ? "review" : "reviews"}
            </span>
            {outcome.requirements.map((requirement) => <span key={requirement}>{requirement}</span>)}
          </div>
          <CopyButton label="Copy prompt" value={outcome.prompt} onCopied={recordUse} />
        </footer>
      </div>
    </article>
  );
}

function Leaderboard({ outcomes, page, onPageChange }: { outcomes: DiscoveryOutcome[]; page: number; onPageChange: (page: number) => void }) {
  const ranked = [...outcomes].sort((left, right) => right.useCount - left.useCount || right.reviewCount - left.reviewCount || left.catalogNumber - right.catalogNumber);
  const pageCount = Math.max(1, Math.ceil(ranked.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = ranked.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return (
    <section className="home-leaderboard layout-reading" aria-labelledby="leaderboard-heading">
      <header><div><span>ALL TIME</span><h1 id="leaderboard-heading">Most copied Outcomes</h1></div><p>Prompts people return to and reuse.</p></header>
      <ol start={(currentPage - 1) * pageSize + 1}>{visible.map((outcome, index) => <li key={outcome.id} data-top={currentPage === 1 && index < 3 ? "true" : undefined}>
        <span>{String((currentPage - 1) * pageSize + index + 1).padStart(2, "0")}</span>
        <a className="home-leaderboard-media" href={outcome.href}><OutcomeMedia outcome={outcome} priority={currentPage === 1 && index < 3} /></a>
        <div><a href={outcome.href}>{outcome.title}</a><small>{outcome.publicationKind}{outcome.source ? ` · Made with ${outcome.source.name}` : ""}</small></div>
        <strong>{usageLabel(outcome.useCount)}</strong>
      </li>)}</ol>
      <Pagination page={currentPage} total={ranked.length} onPageChange={onPageChange} label="Leaderboard pages" />
    </section>
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
  const [outcomes, setOutcomes] = useState<DiscoveryOutcome[]>(outcomesFixture ?? localDiscoveryOutcomes);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<OutcomeCategory | "all">("all");
  const [page, setPage] = useState(1);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = query.trim();
  const availableCategories = useMemo(() => outcomeCategories.filter((candidate) => outcomes.some((outcome) => outcome.category === candidate)), [outcomes]);

  const filteredOutcomes = useMemo(() => {
    const matches = searchDiscoveryOutcomes(outcomes, query, category);
    if (normalizedQuery) return matches;
    return [...matches].sort((left, right) => {
      const byDate = Date.parse(right.publishedAt ?? "") - Date.parse(left.publishedAt ?? "");
      if (Number.isFinite(byDate) && byDate !== 0) return byDate;
      return left.catalogNumber - right.catalogNumber;
    });
  }, [category, normalizedQuery, outcomes, query]);

  const pageCount = Math.max(1, Math.ceil(filteredOutcomes.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleOutcomes = filteredOutcomes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (outcomesFixture) return;
    let cancelled = false;
    void fetchDiscoveryOutcomes().then((entries) => { if (!cancelled) setOutcomes(entries); });
    return () => { cancelled = true; };
  }, [outcomesFixture]);

  useEffect(() => {
    const syncFromUrl = () => {
      const parameters = new URLSearchParams(window.location.search);
      const urlCategory = parameters.get("category");
      const urlPage = Number.parseInt(parameters.get("page") ?? "1", 10);
      setQuery(parameters.get("q") ?? "");
      setCategory(isOutcomeCategory(urlCategory) ? urlCategory : "all");
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
      <Leaderboard outcomes={outcomes} page={leaderboardPage} onPageChange={setLeaderboardPage} />
      <section className="home-directory layout-reading" id="discover" aria-labelledby="home-heading">
        <header className="home-heading">
          <span>DISCOVER</span>
          <h1 id="home-heading">What do you want an agent to make?</h1>
          <p>Search real Outcomes. Copy the prompt. Remix it for your job.</p>
        </header>

        <label className="home-search">
          <span aria-hidden="true">⌕</span>
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => changeQuery(event.target.value)}
            placeholder="Describe the result you want"
            aria-label="What do you want an agent to make?"
          />
          {query ? <button type="button" onClick={() => changeQuery("")} aria-label="Clear search">Clear</button> : <kbd>⌘ K</kbd>}
        </label>

        <div className="home-controls">
          <nav className="home-category-filter" aria-label="Outcome categories">
            <button type="button" aria-pressed={category === "all"} onClick={() => changeCategory("all")}>All</button>
            {availableCategories.map((candidate) => <button type="button" aria-pressed={category === candidate} onClick={() => changeCategory(candidate)} key={candidate}>{outcomeCategoryLabels[candidate]}</button>)}
          </nav>
        </div>

        <div className="home-result-summary">
          <p>{normalizedQuery ? <>Results for <strong>“{normalizedQuery}”</strong></> : category === "all" ? "All Outcomes" : `${outcomeCategoryLabels[category]} Outcomes`}</p>
          <span>{filteredOutcomes.length} {filteredOutcomes.length === 1 ? "result" : "results"}</span>
        </div>

        {visibleOutcomes.length ? (
          <div className="home-results" role="region" aria-label="Outcome results">
            {visibleOutcomes.map((outcome, index) => (
              <OutcomeResult
                outcome={outcome}
                position={(currentPage - 1) * pageSize + index + 1}
                priority={currentPage === 1 && index < 3}
                featured={false}
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
