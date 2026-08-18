"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { PublicCatalogEntry } from "@possible/packs";
import { getPackShowcase, getPublishedPack, githubUrl, installCommand, packHref, publishedPacks, searchPublishedPacks } from "./public-content";
import type { PublishedPackSearchResult } from "./public-content";
import { SiteFooter, SiteNav } from "./shared";

function LibraryPackCard({ entry, priority = false }: { entry: PublicCatalogEntry; priority?: boolean }) {
  const { pack } = entry;
  const showcase = getPackShowcase(entry);
  const cover = showcase?.images?.find((image) => image.cover) ?? showcase?.images?.[0];
  const poster = cover ?? (showcase?.video ? { src: showcase.video.poster, alt: showcase.video.caption ?? `${pack.name} video poster` } : undefined) ?? (showcase?.cad?.poster ? { src: showcase.cad.poster, alt: showcase.cad.caption ?? `${pack.name} CAD preview` } : undefined);
  const mediaLabels = [showcase?.video ? "VIDEO" : undefined, showcase?.cad ? "CAD" : undefined].filter(Boolean);

  return (
    <a className={`library-pack-card ${poster ? "has-media" : "is-text-only"}`} data-variant={entry.catalogNumber % 4} href={packHref(entry)}>
      {poster ? <div className="library-pack-visual" aria-hidden="true"><img className="library-pack-cover" src={poster.src} alt="" loading={priority ? "eager" : "lazy"} decoding="async" /></div> : null}
      <div className="library-pack-copy">
        <header><span>{String(entry.catalogNumber).padStart(2, "0")}</span><span>{mediaLabels.length ? mediaLabels.join(" + ") : "OUTCOME"}</span><i>↗</i></header>
        {entry.products.length ? <div className="library-pack-product">FOR {entry.products.map(({ name }) => name).join(" + ")}</div> : null}
        <h3>{pack.name}</h3>
        <p>{pack.promise}</p>
        <div className="library-pack-fit"><strong>FINISHED WHEN</strong><span>{pack.expectations[0]}</span></div>
      </div>
    </a>
  );
}

function PackSearchResult({ result }: { result: PublishedPackSearchResult }) {
  const { entry, publisher, repository } = result;

  return (
    <a className="pack-search-result" href={packHref(entry)}>
      <div className="pack-search-source">
        <span className="pack-search-favicon" aria-hidden="true">P</span>
        <span className="pack-search-source-copy">
          <span className="pack-search-source-title"><strong>{publisher}</strong></span>
          <small>possible.sh <i>›</i> {publisher} <i>›</i> {repository} <i>›</i> {entry.slug}</small>
        </span>
      </div>
      <h3>{entry.pack.name}</h3>
      <p>{entry.pack.promise}</p>
      {entry.products.length ? <div className="pack-search-product">For {entry.products.map(({ name, company }) => `${name} by ${company.name}`).join(" · ")}</div> : null}
      <div className="pack-search-fit"><strong>Finished when</strong><span>{entry.pack.expectations[0]}</span></div>
    </a>
  );
}

export const commonSearches = [
  "Review a mechanical CAD design",
  "Build me a working web app",
  "Create an editable PowerPoint presentation",
  "Make a product launch film",
  "Prototype a browser game",
  "Compose an original soundtrack",
  "Find my first customer",
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

export function PacksPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [introOpen, setIntroOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const launchFilmPack = getPublishedPack("html-css-animated-product-launch-film");
  const launchFilm = launchFilmPack ? getPackShowcase(launchFilmPack)?.video : undefined;
  const normalizedQuery = query.trim();
  const searchResults = normalizedQuery ? searchPublishedPacks(normalizedQuery) : [];
  const pageCount = Math.max(1, Math.ceil(publishedPacks.length / packsPerPage));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * packsPerPage;
  const visiblePacks = publishedPacks.slice(pageStart, pageStart + packsPerPage);
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
    window.requestAnimationFrame(() => document.getElementById("packs")?.scrollIntoView?.({ behavior: "smooth", block: "start" }));
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
    <main className={`packs-library-page${normalizedQuery ? " is-searching" : ""}`}>
      <SiteNav />

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
                  <p>Possible.sh is an open-source library of Outcome Packs. Each pack turns those capabilities into something you can search and choose, with a structured prompt, a checklist for what finished means, and specialized skills when needed.</p>
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
        </div></> : <h1 className="sr-only" id="packs-library-heading">Outcome Pack search results for {normalizedQuery}</h1>}
        <PackSearchBox query={query} inputRef={searchRef} onChange={updateQuery} compact={Boolean(normalizedQuery)} />
        {!normalizedQuery ? <div className="packs-search-examples"><span>COMMON SEARCHES</span>{commonSearches.map((example) => <button type="button" onClick={() => updateQuery(example)} key={example}>{example}</button>)}</div> : null}
      </section>

      <section className={`packs-results${normalizedQuery ? " is-search-results" : ""}`} id="packs" aria-labelledby="packs-results-heading">
        {normalizedQuery ? <header className="packs-search-summary">
          <h2 className="sr-only" id="packs-results-heading">Results for {normalizedQuery}</h2>
          <p>{searchResults.length} {searchResults.length === 1 ? "result" : "results"} for <strong>“{normalizedQuery}”</strong></p>
        </header> : <header className="packs-results-bar">
          <div><h2 id="packs-results-heading">What agents can do</h2><span>{publishedPacks.length} {publishedPacks.length === 1 ? "OUTCOME" : "OUTCOMES"}</span></div>
          <span>CURATED BY POSSIBLE / SOURCE-PINNED</span>
        </header>}
        {normalizedQuery && searchResults.length ? (
          <div className="packs-search-list" role="region" aria-label="Agent outcome search results">
            {searchResults.map((result) => <PackSearchResult result={result} key={result.entry.id} />)}
          </div>
        ) : !normalizedQuery ? (
          <div className="packs-results-grid" role="region" aria-label="Active Outcome Pack catalog">
            {visiblePacks.map((entry, index) => <LibraryPackCard entry={entry} priority={index < 3} key={entry.id} />)}
          </div>
        ) : (
          <div className="packs-empty">
            <span aria-hidden="true">00</span>
            <h3>No outcome matches that yet.</h3>
            <p>Try a broader search, or browse everything agents can do.</p>
            <button type="button" onClick={resetFilters}>Show all outcomes</button>
          </div>
        )}
        {!normalizedQuery && pageCount > 1 ? <div className="packs-pagination" role="navigation" aria-label="Outcome Pack pages">
          <button type="button" onClick={() => updatePage(currentPage - 1)} disabled={currentPage === 1}>← PREVIOUS</button>
          <div>{Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => <button
            type="button"
            aria-current={pageNumber === currentPage ? "page" : undefined}
            aria-label={`Page ${pageNumber}`}
            onClick={() => updatePage(pageNumber)}
            key={pageNumber}
          >{String(pageNumber).padStart(2, "0")}</button>)}</div>
          <button type="button" onClick={() => updatePage(currentPage + 1)} disabled={currentPage === pageCount}>NEXT →</button>
          <span aria-live="polite">PAGE {currentPage} OF {pageCount} / SHOWING {pageStart + 1}–{pageStart + visiblePacks.length}</span>
        </div> : null}
      </section>

      {!normalizedQuery ? <section className="packs-library-note">
        <p><strong>Can’t find the outcome?</strong> Possible is an open library. Authors keep packs in their own GitHub repositories and submit immutable, source-pinned contracts for review.</p>
        <a href={`${githubUrl}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer">Author an Outcome Pack <span>↗</span></a>
      </section> : null}

      <SiteFooter />
    </main>
  );
}


export default PacksPage;
