"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { getPublishedOutcome, githubUrl, installCommand, outcomeHref, publishedOutcomes, searchPublishedOutcomes } from "./public-content";
import type { PublishedOutcomeSearchResult } from "./public-content";
import { OutcomeCard } from "./outcome-card";
import { SiteShell } from "./shared";

function OutcomeSearchResult({ result }: { result: PublishedOutcomeSearchResult }) {
  const { entry } = result;

  return (
    <a className="pack-search-result" href={outcomeHref(entry)}>
      <div className="pack-search-source">
        <span className="pack-search-favicon" aria-hidden="true">P</span>
        <span className="pack-search-source-copy">
          <span className="pack-search-source-title"><strong>{entry.outcome.author.name}</strong></span>
          <small>possible.sh <i>›</i> outcomes <i>›</i> {entry.slug}</small>
        </span>
      </div>
      <h3>{entry.outcome.title}</h3>
      <p>{entry.outcome.summary}</p>
      {entry.products.length ? <div className="pack-search-product">Uses {entry.products.map(({ name, company }) => `${name} by ${company.name}`).join(" · ")}</div> : null}
      <div className="pack-search-fit"><strong>Exact prompt</strong><span>Copy it, adapt the details, and give it to your agent.</span></div>
    </a>
  );
}

export const commonSearches = [
  "Build a functional hardware prototype",
  "Create an editable PowerPoint presentation",
  "Make a product launch film",
  "Compose an original soundtrack",
  "Prototype a robot digitally",
];
const packsPerPage = 6;

function PackSearchBox({ query, inputRef, onChange, compact = false }: {
  query: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (query: string) => void;
  compact?: boolean;
}) {
  return (
    <label className={`packs-search${compact ? " packs-search--compact" : ""}`}>
      <span className="sr-only">Search what agents can do</span>
      <i aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        aria-label="Search what agents can do"
        value={query}
        onChange={(event) => onChange(event.target.value)}
        placeholder="What do you want your agent to do?"
      />
      {query ? <button type="button" onClick={() => onChange("")} aria-label="Clear search">CLEAR</button> : <kbd>⌘ K</kbd>}
    </label>
  );
}

export function OutcomesPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [introOpen, setIntroOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const launchFilmOutcome = getPublishedOutcome("html-css-animated-product-launch-film");
  const launchFilm = launchFilmOutcome?.outcome.preview?.video;
  const normalizedQuery = query.trim();
  const searchResults = normalizedQuery ? searchPublishedOutcomes(normalizedQuery) : [];
  const pageCount = Math.max(1, Math.ceil(publishedOutcomes.length / packsPerPage));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * packsPerPage;
  const visibleOutcomes = publishedOutcomes.slice(pageStart, pageStart + packsPerPage);
  function updateQuery(nextQuery: string) {
    setQuery(nextQuery);
    setPage(1);
    const url = new URL(window.location.href);
    if (nextQuery.trim()) url.searchParams.set("q", nextQuery.trim());
    else url.searchParams.delete("q");
    url.searchParams.delete("page");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }
  function updatePage(nextPage: number) {
    const boundedPage = Math.min(Math.max(nextPage, 1), pageCount);
    setPage(boundedPage);
    const url = new URL(window.location.href);
    url.searchParams.delete("q");
    if (boundedPage === 1) url.searchParams.delete("page");
    else url.searchParams.set("page", String(boundedPage));
    window.history.pushState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    window.requestAnimationFrame(() => document.getElementById("outcomes")?.scrollIntoView?.({ behavior: "smooth", block: "start" }));
  }
  function resetFilters() {
    updateQuery("");
  }

  function toggleIntro() {
    const nextOpen = !introOpen;
    const video = introVideoRef.current;
    setIntroOpen(nextOpen);
    if (!video) return;
    if (!nextOpen) {
      video.pause();
      return;
    }
    video.muted = false;
    video.volume = 1;
    video.currentTime = 0;
    void video.play().catch(() => undefined);
  }

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || (!event.metaKey && !event.ctrlKey)) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  useEffect(() => {
    const syncFromUrl = () => {
      const parameters = new URLSearchParams(window.location.search);
      const nextPage = Number.parseInt(parameters.get("page") ?? "1", 10);
      setQuery(parameters.get("q") ?? "");
      setPage(Number.isFinite(nextPage) ? Math.min(Math.max(nextPage, 1), pageCount) : 1);
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [pageCount]);

  return (
    <SiteShell className={`packs-library-page${normalizedQuery ? " is-searching" : ""}`}>

      <section className="packs-library-hero" aria-labelledby="packs-library-heading">
        {!normalizedQuery ? <><h1 id="packs-library-heading">Anything is <em>possible</em></h1>
        <p className="packs-library-subtitle">Discover what agents can do.</p>
        <button
          className="packs-intro-toggle"
          type="button"
          aria-expanded={introOpen}
          aria-controls="packs-intro-panel"
          onClick={toggleIntro}
        >
          <span>What is Possible?</span>
          <i aria-hidden="true" />
        </button>
        <div
          className={`packs-intro-collapse${introOpen ? " is-open" : ""}`}
          id="packs-intro-panel"
          role="region"
          aria-label="About Possible"
          aria-hidden={!introOpen}
        >
          <div>
            <section className="packs-intro-panel">
              <header className="packs-intro-panel-header">
                <span>HOW POSSIBLE WORKS</span>
                <strong>OPEN SOURCE / FOR CODEX</strong>
              </header>
              <div className="packs-intro-content">
                <div className="packs-intro-copy">
                  <p><strong>See more of what your agent can do</strong>AI agents can build websites, videos, CAD, presentations, games, and much more. The hard part is knowing what to ask for and how to guide them there.</p>
                  <p>Possible.sh is an open-source directory of exact prompts. Browse something worth making, copy the prompt behind it, and adapt the details for your own project.</p>
                  <div className="packs-intro-steps">
                    <article>
                      <span>01 / INSTALL</span>
                      <pre><code>{installCommand}</code></pre>
                    </article>
                    <article>
                      <span>02 / ASK CODEX</span>
                      <code>$possible</code>
                    </article>
                  </div>
                </div>
                {launchFilm ? (
                  <figure className="packs-intro-film" aria-hidden={!introOpen}>
                    <video
                      ref={introVideoRef}
                      controls={introOpen}
                      loop
                      playsInline
                      preload="metadata"
                      poster={launchFilm.poster}
                      tabIndex={introOpen ? 0 : -1}
                    >
                      <source src={launchFilm.src} type="video/mp4" />
                      <a href={launchFilm.src}>Watch the Possible launch film</a>
                    </video>
                    <figcaption><span>THE WORLD INSIDE CODEX</span><strong>SOUND ON / MADE WITH POSSIBLE</strong></figcaption>
                  </figure>
                ) : null}
              </div>
            </section>
          </div>
        </div></> : <h1 className="sr-only" id="packs-library-heading">Outcome search results for {normalizedQuery}</h1>}
        <PackSearchBox query={query} inputRef={searchRef} onChange={updateQuery} compact={Boolean(normalizedQuery)} />
        {!normalizedQuery ? <div className="packs-search-examples"><span>COMMON SEARCHES</span>{commonSearches.map((example) => <button type="button" onClick={() => updateQuery(example)} key={example}>{example}</button>)}</div> : null}
      </section>

      <section className={`packs-results${normalizedQuery ? " is-search-results" : ""}`} id="outcomes" aria-labelledby="packs-results-heading">
        {normalizedQuery ? <header className="packs-search-summary">
          <h2 className="sr-only" id="packs-results-heading">Results for {normalizedQuery}</h2>
          <p>{searchResults.length} {searchResults.length === 1 ? "result" : "results"} for <strong>“{normalizedQuery}”</strong></p>
        </header> : <header className="packs-results-bar">
          <div><h2 id="packs-results-heading">What agents can do</h2><span>{publishedOutcomes.length} {publishedOutcomes.length === 1 ? "OUTCOME" : "OUTCOMES"}</span></div>
          <span>EXACT PROMPTS / REAL PREVIEWS</span>
        </header>}
        {normalizedQuery && searchResults.length ? (
          <div className="packs-search-list" role="region" aria-label="Agent outcome search results">
            {searchResults.map((result) => <OutcomeSearchResult result={result} key={result.entry.slug} />)}
          </div>
        ) : !normalizedQuery ? (
          <div className="packs-results-grid" role="region" aria-label="Outcome prompt directory">
            {visibleOutcomes.map((entry, index) => <OutcomeCard entry={entry} priority={index < 3} key={entry.slug} />)}
          </div>
        ) : (
          <div className="packs-empty">
            <span aria-hidden="true">00</span>
            <h3>No outcome matches that yet.</h3>
            <p>Try a broader search, or browse everything agents can do.</p>
            <button type="button" onClick={resetFilters}>Show all outcomes</button>
          </div>
        )}
        {!normalizedQuery && pageCount > 1 ? <div className="packs-pagination" role="navigation" aria-label="Outcome pages">
          <button type="button" onClick={() => updatePage(currentPage - 1)} disabled={currentPage === 1}>← PREVIOUS</button>
          <div>{Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => <button
            type="button"
            aria-current={pageNumber === currentPage ? "page" : undefined}
            aria-label={`Page ${pageNumber}`}
            onClick={() => updatePage(pageNumber)}
            key={pageNumber}
          >{String(pageNumber).padStart(2, "0")}</button>)}</div>
          <button type="button" onClick={() => updatePage(currentPage + 1)} disabled={currentPage === pageCount}>NEXT →</button>
          <span aria-live="polite">PAGE {currentPage} OF {pageCount} / SHOWING {pageStart + 1}–{pageStart + visibleOutcomes.length}</span>
        </div> : null}
      </section>

      {!normalizedQuery ? <section className="packs-library-note">
        <p><strong>Made something worth sharing?</strong> Publish the exact prompt, a clear summary, and an optional preview.</p>
        <a href={`${githubUrl}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer">Share an Outcome <span>↗</span></a>
      </section> : null}

    </SiteShell>
  );
}


export default OutcomesPage;
