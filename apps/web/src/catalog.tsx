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
import type { DiscoveryOutcome, DiscoverySource, OutcomeCategory, PortfolioPreview } from "./discovery-data";
import { OutcomeReactions } from "./outcome-reactions";
import { CopyButton, SiteShell } from "./shared";
import { agentProfiles, cardTaglines, BUNDLE_PRICE_USD, BUNDLE_SLUG } from "./agents-data";
import { BuyBox, paymentLink } from "./buy";

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

export function OutcomeMedia({ outcome, priority = false }: { outcome: DiscoveryOutcome; priority?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const media = outcome.media;
  if (!media) {
    const label = outcomeCategoryLabels[outcome.category];
    return <span className="home-outcome-fallback" data-category={outcome.category}>
      <small>{label}</small>
      <b aria-hidden="true">{label.slice(0, 1).toUpperCase()}</b>
      <em>Result preview</em>
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

function OutcomeResult({ outcome, rank, priority, featured, onSelectSource }: { outcome: DiscoveryOutcome; rank: number | undefined; priority: boolean; featured: boolean; onSelectSource: (source: DiscoverySource) => void }) {
  const external = outcome.href.startsWith("https://");
  async function recordCopy() { await recordOutcomeUse(outcome.databaseId); }

  return (
    <article className="home-result-row" data-featured={featured ? "true" : undefined} data-rank={rank}>
      <span className="home-result-rank" aria-label={rank ? `Rank ${rank}` : "Unranked result"}>{rank ? `#${rank}` : "—"}</span>
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
          <em className="home-result-kind" data-kind={outcome.recipe ? "recipe" : "prompt"}>{outcome.recipe ? "Result" : "Prompt"}</em>
          <span>{outcome.publicationKind === "official" ? "Official · " : ""}{outcomeCategoryLabels[outcome.category]}</span>
        </div>
        <h2><a href={outcome.href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>{outcome.title}</a></h2>
        <p>{outcome.summary}</p>
        <footer>
          <div className="home-result-signals">
            
            <OutcomeReactions outcomeId={outcome.databaseId} likeCount={outcome.likeCount} />
          </div>
          {outcome.recipe
            ? <CopyButton label="Copy details" ariaLabel={`Copy details for ${outcome.title}`} value={outcome.recipe} onCopied={recordCopy} />
            : <CopyButton label="Copy prompt" ariaLabel={`Copy prompt for ${outcome.title}`} value={outcome.prompt} onCopied={recordCopy} />}
        </footer>
      </div>
    </article>
  );
}

function Pagination({ page, total, onPageChange, label = "Result pages" }: { page: number; total: number; onPageChange: (page: number) => void; label?: string }) {
  const pageCount = Math.ceil(total / pageSize);
  if (pageCount <= 1) return null;
  const pages = visiblePages(page, pageCount);
  return (
    <nav className="home-pagination" aria-label={label}>
      <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label={`Previous ${label === "Result pages" ? "Result" : "leaderboard"} page`}>←</button>
      {pages[0] && pages[0] > 1 ? <span aria-hidden="true">…</span> : null}
      {pages.map((pageNumber) => <button type="button" key={pageNumber} aria-current={pageNumber === page ? "page" : undefined} onClick={() => onPageChange(pageNumber)}>{pageNumber}</button>)}
      {pages.at(-1) && pages.at(-1)! < pageCount ? <span aria-hidden="true">…</span> : null}
      <button type="button" onClick={() => onPageChange(page + 1)} disabled={page === pageCount} aria-label={`Next ${label === "Result pages" ? "Result" : "leaderboard"} page`}>→</button>
    </nav>
  );
}

export function OutcomesPage({ outcomesFixture, staticPortfolio = [] }: { outcomesFixture?: DiscoveryOutcome[]; staticPortfolio?: PortfolioPreview[] } = {}) {
  const [outcomes, setOutcomes] = useState<DiscoveryOutcome[]>(outcomesFixture ?? []);
  const [directoryState, setDirectoryState] = useState<"loading" | "ready" | "error">(outcomesFixture === undefined ? "loading" : "ready");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<OutcomeCategory | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [recipesOnly, setRecipesOnly] = useState(false);
  const [page, setPage] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = query.trim();
  const hasUsageRanking = outcomes.some((outcome) => outcome.useCount > 0);
  const hasRecipes = outcomes.some((outcome) => outcome.recipe !== undefined);
  const availableCategories = useMemo(() => outcomeCategories.filter((candidate) => outcomes.some((outcome) => outcome.category === candidate)), [outcomes]);
  const activeSource = useMemo(() => outcomes.flatMap((outcome) => outcome.sources).find((source) => sourceFilterKey(source) === sourceFilter), [outcomes, sourceFilter]);
  const directoryTitle = normalizedQuery
    ? "Search results"
    : activeSource
      ? `${activeSource.name} ${recipesOnly ? "results" : "Results"}`
      : category === "all"
        ? recipesOnly ? "Results with details" : "All results"
        : `${outcomeCategoryLabels[category]} ${recipesOnly ? "results" : "Results"}`;
  const directoryContext = normalizedQuery
    ? "Ranked by relevance"
    : sourceFilter || category !== "all" || recipesOnly
      ? "Filtered directory"
      : hasUsageRanking
        ? "Results"
        : "Latest published";

  const filteredOutcomes = useMemo(() => {
    const matches = searchDiscoveryOutcomes(outcomes, query, category, sourceFilter, recipesOnly);
    if (normalizedQuery) return matches;
    const owned = new Set(agentProfiles.flatMap((agent) => agent.portfolio));
    return [...matches].sort((left, right) => {
      const leftIncomplete = /\b(incomplete|needs repair|repair.required)\b/i.test(`${left.title} ${left.summary}`);
      const rightIncomplete = /\b(incomplete|needs repair|repair.required)\b/i.test(`${right.title} ${right.summary}`);
      if (leftIncomplete !== rightIncomplete) return Number(leftIncomplete) - Number(rightIncomplete);
      const bySkill = Number(Boolean(right.slug && owned.has(right.slug))) - Number(Boolean(left.slug && owned.has(left.slug)));
      if (bySkill) return bySkill;
      const byDate = Date.parse(right.publishedAt ?? "") - Date.parse(left.publishedAt ?? "");
      if (Number.isFinite(byDate) && byDate !== 0) return byDate;
      return left.catalogNumber - right.catalogNumber;
    });
  }, [category, hasUsageRanking, normalizedQuery, outcomes, query, recipesOnly, sourceFilter]);

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
      setRecipesOnly(parameters.get("recipe") === "1");
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

  function changeRecipesOnly(next: boolean) {
    setRecipesOnly(next);
    updateLocation((url) => {
      if (next) url.searchParams.set("recipe", "1");
      else url.searchParams.delete("recipe");
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
      <section className="home-offer layout-reading">
        <span>Skills for Claude Code and Codex</span>
        <h1>Skills our agents run. Yours can too.</h1>
        <p>Each skill is shown by what it made. Download one for US$19, run it in your own Claude Code or Codex, and it makes yours.</p>
        <div className="home-offer-actions"><a href="/skills/" className="button-link">See the skills</a><BuyBox slug={BUNDLE_SLUG} priceUsd={BUNDLE_PRICE_USD} label="Buy every skill on sale" what="Every skill on sale." /></div>
        <p>or US$19 each. You also get any skill that opens later.</p>
      </section>
      <section className="home-skill-grid layout-reading" aria-label="Skills">
        {[...agentProfiles].sort((a, b) => Number(Boolean(paymentLink(b.slug))) - Number(Boolean(paymentLink(a.slug)))).map((agent) => {
          const lead = agent.portfolio.map((slug) => outcomes.find((outcome) => outcome.slug === slug)).find(Boolean);
          const preview = agent.portfolio.map((slug) => staticPortfolio.find((entry) => entry.slug === slug && entry.src)).find(Boolean);
          return <a className="home-skill-card" href={`/skills/${agent.slug}/`} key={agent.slug}>
            {preview?.src ? <span className="home-skill-media"><img src={preview.src} alt={`${preview.title} result`} /></span> : lead ? <span className="home-skill-media"><OutcomeMedia outcome={lead} /></span> : agent.slug === "browser-game-maker" ? <img src="/media/possible-demo-poster.png" alt="Browser Game Maker result" /> : null}
            <strong>{agent.name}</strong><span>{cardTaglines[agent.slug] ?? agent.tagline}</span><b>{paymentLink(agent.slug) ? "US$19" : "Opening soon"}</b>
          </a>;
        })}
      </section>
      <section className="home-directory layout-reading" id="discover" aria-labelledby="home-heading">
        <header className="home-heading">
          <div>
            <h2 id="home-heading">Results</h2>
            <p>Everything our skills and our agents made, with the exact prompt.</p>
          </div>
          <strong>{directoryState === "loading" ? "—" : `${filteredOutcomes.length} ${filteredOutcomes.length === 1 ? "Result" : "Results"}`}</strong>
        </header>


        <label className="home-search">
          <span aria-hidden="true">⌕</span>
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => changeQuery(event.target.value)}
            placeholder="What would you like to make?"
            aria-label="What would you like to make?"
          />
          {query ? <button type="button" onClick={() => changeQuery("")} aria-label="Clear search">Clear</button> : <kbd>⌘ K</kbd>}
        </label>

        <div className="home-controls">
          <nav className="home-category-filter" aria-label="Result categories">
            <button type="button" aria-pressed={category === "all"} onClick={() => changeCategory("all")}>All</button>
            {availableCategories.map((candidate) => <button type="button" aria-pressed={category === candidate} onClick={() => changeCategory(candidate)} key={candidate}>{outcomeCategoryLabels[candidate]}</button>)}
          </nav>
          {hasRecipes || recipesOnly ? <button className="home-recipe-filter" type="button" aria-pressed={recipesOnly} onClick={() => changeRecipesOnly(!recipesOnly)}>
            <i aria-hidden="true" />With details
          </button> : null}
          {sourceFilter ? <button className="home-active-filter" type="button" onClick={() => changeSource(null)} aria-label="Clear Product or Skill filter">
            <span>{activeSource?.kind ?? sourceFilter.split(":", 1)[0]}</span>
            <strong>{activeSource?.name ?? sourceFilter.slice(sourceFilter.indexOf(":") + 1)}</strong>
            <i aria-hidden="true">×</i>
          </button> : null}
        </div>

        <header className="home-board-heading">
          <div><span>{normalizedQuery ? "SEARCH" : "DIRECTORY"}</span><h2>{directoryTitle}</h2></div>
          <p>{directoryContext}<small>{!normalizedQuery && !sourceFilter && category === "all" && hasUsageRanking ? "All time" : null}</small></p>
        </header>

        {directoryState === "loading" ? (
          <div className="home-empty" role="status"><h2>Loading results…</h2><p>Reading the public directory.</p></div>
        ) : directoryState === "error" ? (
          <div className="home-empty" role="alert"><h2>The directory is unavailable.</h2><p>Try again shortly. Published sources remain unchanged.</p></div>
        ) : visibleOutcomes.length ? (
          <div className="home-results" role="region" aria-label="Result list">
            {visibleOutcomes.map((outcome, index) => (
              <OutcomeResult
                outcome={outcome}
                rank={undefined}
                priority={currentPage === 1 && index < 3}
                featured={currentPage === 1 && index < 3}
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
