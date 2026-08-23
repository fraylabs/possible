"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QueryClient, QueryClientProvider, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { VirtuosoGrid } from "react-virtuoso";
import { getPublishedProduct, getPublishedSkill } from "./public-content";
import { recordOutcomeCopy } from "./discovery-data";
import { CopyButton, SiteShell } from "./shared";
import { getSupabaseBrowserClient } from "./supabase";

type GalleryKind = "image" | "video" | "audio" | "cad" | "prompt";
type GalleryFilter = "all" | GalleryKind;
type OutcomeSourceFilter = "all" | "official" | "community";
type ListingKind = "product" | "skill";

const kindOrder: GalleryKind[] = ["image", "video", "audio", "cad", "prompt"];
const pageSize = 24;

type ProductGalleryEntry = {
  id: string;
  databaseId?: string | undefined;
  title: string;
  summary?: string | undefined;
  prompt: string;
  sourceUrl?: string | undefined;
  outcomeUrl?: string | undefined;
  provider: string;
  model?: string | undefined;
  authorName?: string | undefined;
  authorUrl?: string | undefined;
  kind: GalleryKind;
  mediaUrl?: string | undefined;
  posterUrl?: string | undefined;
  mediaAlt?: string | undefined;
  sourceKind: "official" | "community";
  officialByName?: string | undefined;
  officialByHandle?: string | undefined;
};

type DirectoryOutcomeRow = {
  id: string;
  title: string;
  summary: string;
  prompt: string;
  result_media_url: string | null;
  poster_url: string | null;
  model: string | null;
  author_name: string | null;
  author_url: string | null;
  provider: string | null;
  publication_kind: "official" | "community";
};

type DirectoryPage = {
  outcomes: ProductGalleryEntry[];
  total: number;
  nextOffset?: number | undefined;
};

function inferMediaKind(url: string | null, productCategory: string): GalleryKind {
  const mediaUrl = url ?? "";
  if (/\.(?:mp4|webm|mov)(?:$|\?)/i.test(mediaUrl) || productCategory === "video") return "video";
  if (/\.(?:wav|mp3|m4a|ogg|flac)(?:$|\?)/i.test(mediaUrl) || productCategory === "audio") return "audio";
  if (/\.(?:step|stp|stl|3mf|glb|gltf)(?:$|\?)/i.test(mediaUrl) || productCategory === "3d" || productCategory === "robotics") return "cad";
  return "image";
}

function sanitizeDirectorySearch(value: string) {
  return value.trim().replace(/[^\p{L}\p{N}\s'-]/gu, " ").replace(/\s+/g, " ");
}

function fromDirectoryRow(row: DirectoryOutcomeRow, category: string, ownerName: string): ProductGalleryEntry {
  return {
    id: row.id,
    databaseId: row.id,
    title: row.title,
    summary: row.summary,
    prompt: row.prompt,
    outcomeUrl: `/outcomes/view/?id=${row.id}`,
    provider: row.provider ?? ownerName,
    model: row.model ?? undefined,
    authorName: row.author_name ?? undefined,
    authorUrl: row.author_url ?? undefined,
    kind: inferMediaKind(row.result_media_url, category),
    mediaUrl: row.result_media_url ?? undefined,
    posterUrl: row.poster_url ?? undefined,
    sourceKind: row.publication_kind,
  };
}

function GalleryMedia({ entry, expanded = false, priority = false }: { entry: ProductGalleryEntry; expanded?: boolean; priority?: boolean }) {
  if (entry.kind === "video" && entry.mediaUrl) return <video autoPlay={expanded} controls={expanded} muted={!expanded} loop={!expanded} playsInline preload={expanded ? "metadata" : "none"} poster={entry.posterUrl}><source src={entry.mediaUrl} /></video>;
  if (entry.kind === "image" && entry.mediaUrl) return <img src={entry.mediaUrl} alt={expanded ? entry.mediaAlt ?? entry.title : ""} loading={priority ? "eager" : "lazy"} decoding="async" />;
  if (entry.kind === "audio" && entry.mediaUrl) return <div className="product-gallery-audio">{entry.posterUrl ? <img src={entry.posterUrl} alt="" /> : <span className="product-gallery-wave" aria-hidden="true">▂▅▇▄▆▃▁▃▆▄▇▅▂</span>}{expanded ? <audio controls preload="metadata"><source src={entry.mediaUrl} /></audio> : null}</div>;
  if (entry.kind === "cad" && (entry.posterUrl || entry.mediaUrl)) return <img src={entry.posterUrl ?? entry.mediaUrl} alt={expanded ? entry.mediaAlt ?? `${entry.title} CAD preview` : ""} loading={priority ? "eager" : "lazy"} decoding="async" />;
  return <div className="product-gallery-placeholder"><span>POSSIBLE</span><strong>{entry.title}</strong></div>;
}

function GalleryTile({ entry, priority, onOpen }: { entry: ProductGalleryEntry; priority: boolean; onOpen: (entry: ProductGalleryEntry) => void }) {
  const playPreview = (element: HTMLButtonElement) => { const video = element.querySelector("video"); if (video) void video.play().catch(() => undefined); };
  const pausePreview = (element: HTMLButtonElement) => { const video = element.querySelector("video"); if (video) video.pause(); };
  return (
    <button className={`product-gallery-tile is-${entry.kind}`} type="button" onMouseEnter={(event) => playPreview(event.currentTarget)} onMouseLeave={(event) => pausePreview(event.currentTarget)} onFocus={(event) => playPreview(event.currentTarget)} onBlur={(event) => pausePreview(event.currentTarget)} onClick={() => onOpen(entry)} aria-label={`Open ${entry.title}`}>
      <span className="product-gallery-tile-media"><GalleryMedia entry={entry} priority={priority} /></span>
      <span className="product-gallery-tile-overlay"><span>{entry.sourceKind} · {entry.kind}</span><strong>{entry.title}</strong>{entry.model ? <small>{entry.model}</small> : null}</span>
    </button>
  );
}

function OutcomeViewer({ entry, onClose }: { entry: ProductGalleryEntry; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const scrollPosition = window.scrollY;
    closeRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    const preventBackgroundScroll = (event: WheelEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) { event.preventDefault(); return; }
      const scrollableViewer = window.matchMedia("(max-width: 760px)").matches ? target.closest(".product-viewer") : target.closest(".product-viewer-information");
      if (!scrollableViewer) event.preventDefault();
    };
    window.addEventListener("keydown", closeOnEscape);
    document.addEventListener("wheel", preventBackgroundScroll, { passive: false });
    document.addEventListener("touchmove", preventBackgroundScroll, { passive: false });
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("wheel", preventBackgroundScroll);
      document.removeEventListener("touchmove", preventBackgroundScroll);
      window.scrollTo(0, scrollPosition);
    };
  }, [onClose]);

  return (
    <div className="product-viewer-layer">
      <button className="product-viewer-backdrop" type="button" aria-label="Close Outcome viewer" onClick={onClose} />
      <section className="product-viewer" role="dialog" aria-modal="true" aria-labelledby="product-viewer-title">
        <button ref={closeRef} className="product-viewer-close" type="button" aria-label="Close Outcome viewer" onClick={onClose}>×</button>
        <div className="product-viewer-media"><GalleryMedia entry={entry} expanded /></div>
        <aside className="product-viewer-information">
          <div className="product-viewer-meta"><span>{entry.sourceKind === "official" ? `Official by ${entry.officialByName}` : "Community"}</span><span>{entry.kind}</span><span>{entry.provider}</span>{entry.model ? <span>{entry.model}</span> : null}</div>
          <h2 id="product-viewer-title">{entry.title}</h2>
          {entry.summary ? <p>{entry.summary}</p> : null}
          {entry.authorName ? <div className="product-viewer-author">BY {entry.authorUrl ? <a href={entry.authorUrl} target="_blank" rel="noreferrer">{entry.authorName} ↗</a> : <span>{entry.authorName}</span>}</div> : null}
          <section className="product-viewer-prompt" aria-labelledby="product-viewer-prompt-heading">
            <header><h3 id="product-viewer-prompt-heading">Exact prompt</h3><CopyButton label="Copy prompt" value={entry.prompt} onCopied={() => recordOutcomeCopy(entry.databaseId)} /></header>
            <pre><code>{entry.prompt}</code></pre>
          </section>
          <nav className="product-viewer-links" aria-label="Outcome links">{entry.outcomeUrl ? <a href={entry.outcomeUrl}>Open Outcome <span>↗</span></a> : null}{entry.sourceUrl ? <a href={entry.sourceUrl} target="_blank" rel="noreferrer">View source <span>↗</span></a> : null}</nav>
        </aside>
      </section>
    </div>
  );
}

export function ProductDetailPage({ id }: { id: string }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 60_000 } },
  }));
  return <QueryClientProvider client={queryClient}><ListingDetailContent id={id} kind="product" /></QueryClientProvider>;
}

export function SkillDetailPage({ id }: { id: string }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 60_000 } },
  }));
  return <QueryClientProvider client={queryClient}><ListingDetailContent id={id} kind="skill" /></QueryClientProvider>;
}

function ListingDetailContent({ id, kind }: { id: string; kind: ListingKind }) {
  const product = kind === "product" ? getPublishedProduct(id) : undefined;
  const skill = kind === "skill" ? getPublishedSkill(id) : undefined;
  const listing = useMemo(() => product ? {
    id: product.id,
    name: product.name,
    ownerName: product.company.name,
    ownerUrl: product.company.website,
    summary: product.summary,
    summarySourceUrl: product.summarySourceUrl,
    logoUrl: product.logoUrl,
    website: product.website,
    docsUrl: product.docsUrl,
    category: product.category,
  } : skill ? {
    id: skill.id,
    name: skill.name,
    ownerName: skill.repository.split("/")[0] ?? skill.repository,
    ownerUrl: `https://github.com/${skill.repository}`,
    summary: skill.directory,
    summarySourceUrl: skill.sourceUrl,
    logoUrl: null,
    website: skill.sourceUrl,
    docsUrl: skill.sourceUrl,
    category: "skill",
  } : undefined, [product, skill]);
  const client = useMemo(() => getSupabaseBrowserClient(), []);
  const directoryView = kind === "product" ? "product_outcome_directory" : "skill_outcome_directory";
  const linkColumn = kind === "product" ? "linked_product_id" : "linked_skill_id";
  const [query, setQuery] = useState("");
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<OutcomeSourceFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedFromDirectory, setSelectedFromDirectory] = useState<ProductGalleryEntry | null>(null);
  const openedHere = useRef(false);

  const directoryAvailability = useQuery({
    queryKey: ["listing-outcome-count", kind, listing?.id],
    enabled: Boolean(client && listing),
    queryFn: async () => {
      if (!client || !listing) throw new Error("The public Outcome directory is unavailable.");
      const { count, error } = await client.from(directoryView).select("id", { count: "exact", head: true }).eq(linkColumn, listing.id);
      if (error) throw new Error(error.message);
      return count ?? 0;
    },
  });

  const directoryFeed = useInfiniteQuery({
    queryKey: ["listing-outcomes", kind, listing?.id, directoryQuery],
    enabled: Boolean(client && listing),
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<DirectoryPage> => {
      if (!client || !listing) throw new Error("The public Outcome directory is unavailable.");
      let request = client.from(directoryView).select("id,title,summary,prompt,result_media_url,poster_url,provider,model,author_name,author_url,publication_kind", { count: "exact" }).eq(linkColumn, listing.id);
      const safeSearch = sanitizeDirectorySearch(directoryQuery);
      if (safeSearch) request = request.or(`title.ilike.%${safeSearch}%,prompt.ilike.%${safeSearch}%,model.ilike.%${safeSearch}%,author_name.ilike.%${safeSearch}%`);
      const { data, count, error } = await request.order("published_at", { ascending: false }).order("id").range(pageParam, pageParam + pageSize - 1);
      if (error) throw new Error(error.message);
      // SAFETY: the explicit product_outcome_directory select list matches DirectoryOutcomeRow.
      const rows = (data ?? []) as DirectoryOutcomeRow[];
      const total = count ?? 0;
      const nextOffset = pageParam + rows.length;
      return {
        outcomes: rows.map((row) => fromDirectoryRow(row, listing.category, listing.ownerName)),
        total,
        nextOffset: rows.length > 0 && nextOffset < total ? nextOffset : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });

  const directoryPages = directoryFeed.data?.pages;
  const directoryOutcomes = useMemo(() => directoryPages?.flatMap((page) => page.outcomes) ?? [], [directoryPages]);
  const directoryTotal = directoryFeed.data?.pages[0]?.total ?? 0;
  const unfilteredDirectoryTotal = directoryAvailability.data ?? (directoryQuery === "" ? directoryTotal : undefined);
  const directoryLoading = Boolean(listing) && (directoryAvailability.isPending || directoryFeed.isPending);

  const outcomes = directoryOutcomes;
  const availableKinds = useMemo(() => kindOrder.filter((kind) => outcomes.some((entry) => entry.kind === kind)), [outcomes]);
  const filteredOutcomes = useMemo(() => outcomes.filter((entry) => {
    if (sourceFilter !== "all" && entry.sourceKind !== sourceFilter) return false;
    if (filter !== "all" && entry.kind !== filter) return false;
    return true;
  }), [filter, outcomes, sourceFilter]);
  const visibleOutcomes = filteredOutcomes;
  const resultCount = filter === "all" && sourceFilter === "all" ? directoryTotal : filteredOutcomes.length;
  const selected = selectedId ? outcomes.find((entry) => entry.id === selectedId) ?? selectedFromDirectory : null;

  useEffect(() => {
    const timer = window.setTimeout(() => setDirectoryQuery(query), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const syncFromUrl = () => {
      const outcomeId = new URL(window.location.href).searchParams.get("outcome");
      setSelectedId(outcomeId);
      if (!outcomeId) openedHere.current = false;
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [outcomes]);

  useEffect(() => {
    if (!selectedId || outcomes.some((entry) => entry.id === selectedId) || !client || !listing) {
      setSelectedFromDirectory(null);
      return;
    }
    let cancelled = false;
    void client.from(directoryView).select("id,title,summary,prompt,result_media_url,poster_url,provider,model,author_name,author_url,publication_kind").eq(linkColumn, listing.id).eq("id", selectedId).maybeSingle().then(({ data, error }) => {
      if (cancelled || error || !data) return;
      // SAFETY: the explicit product_outcome_directory select list matches DirectoryOutcomeRow.
      setSelectedFromDirectory(fromDirectoryRow(data as DirectoryOutcomeRow, listing.category, listing.ownerName));
    });
    return () => { cancelled = true; };
  }, [client, directoryView, linkColumn, listing, outcomes, selectedId]);

  const loadNextPage = useCallback(() => {
    if (directoryFeed.hasNextPage && !directoryFeed.isFetchingNextPage) void directoryFeed.fetchNextPage();
  }, [directoryFeed.fetchNextPage, directoryFeed.hasNextPage, directoryFeed.isFetchingNextPage]);

  if (!listing) return null;

  const outcomeTotal = unfilteredDirectoryTotal ?? directoryTotal;
  const officialCount = outcomes.filter((entry) => entry.sourceKind === "official").length;
  const communityCount = outcomes.filter((entry) => entry.sourceKind === "community").length;

  function openOutcome(entry: ProductGalleryEntry) {
    const url = new URL(window.location.href);
    url.searchParams.set("outcome", entry.id);
    openedHere.current = true;
    window.history.pushState({}, "", url);
    setSelectedId(entry.id);
  }

  function closeOutcome() {
    if (openedHere.current) {
      openedHere.current = false;
      window.history.back();
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("outcome");
    window.history.replaceState({}, "", url);
    setSelectedId(null);
  }

  return (
    <SiteShell className="product-detail-page">
      <article className="product-profile layout-standard">
        <a className="product-back-link" href="/#discover"><span aria-hidden="true">←</span> Discover Outcomes</a>

        <header className="product-profile-header">
          <div className="product-profile-identity">{listing.logoUrl ? <img src={listing.logoUrl} alt={`${listing.name} logo`} /> : <span className="product-profile-skill-mark">SK</span>}<div><p>BY <a href={listing.ownerUrl} target="_blank" rel="noreferrer">{listing.ownerName} ↗</a></p><h1>{listing.name}</h1></div></div>
          <div className="product-profile-information"><p>{listing.summary}</p><a className="product-summary-source" href={listing.summarySourceUrl} target="_blank" rel="noreferrer">{kind === "product" ? "Official description" : "Reviewed source"} ↗</a></div>
          <div className="product-profile-actions">
            <nav className="product-profile-links" aria-label={`${listing.name} links`}><a href={listing.website} target="_blank" rel="noreferrer">{kind === "product" ? "Website" : "Open Skill"} <span>↗</span></a>{listing.docsUrl !== listing.website ? <a href={listing.docsUrl} target="_blank" rel="noreferrer">Documentation <span>↗</span></a> : null}</nav>
            <div className="product-access-note"><span>{listing.category}</span><span>{outcomeTotal} Outcome{outcomeTotal === 1 ? "" : "s"}</span></div>
          </div>
        </header>

        <section className="product-outcomes" id="outcomes" aria-labelledby="product-outcomes-heading">
          <header className="product-gallery-header"><div><h2 id="product-outcomes-heading">Outcomes</h2><p>{directoryLoading ? "Loading…" : `${resultCount} result${resultCount === 1 ? "" : "s"}`}</p></div><label className="product-gallery-search"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search outcomes" aria-label={`Search ${listing.name} Outcomes`} /></label></header>
          <div className="product-source-tabs" role="group" aria-label="Filter by publisher approval">
            <button type="button" className={sourceFilter === "all" ? "active" : ""} aria-pressed={sourceFilter === "all"} onClick={() => setSourceFilter("all")}>All <span>{outcomes.length}</span></button>
            <button type="button" className={sourceFilter === "official" ? "active" : ""} aria-pressed={sourceFilter === "official"} onClick={() => setSourceFilter("official")}>Official <span>{officialCount}</span></button>
            <button type="button" className={sourceFilter === "community" ? "active" : ""} aria-pressed={sourceFilter === "community"} onClick={() => setSourceFilter("community")}>Community <span>{communityCount}</span></button>
          </div>
          {availableKinds.length > 1 ? <div className="product-gallery-filters" role="group" aria-label="Filter by media"><button type="button" className={filter === "all" ? "active" : ""} aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All</button>{availableKinds.map((kind) => <button type="button" className={filter === kind ? "active" : ""} aria-pressed={filter === kind} onClick={() => setFilter(kind)} key={kind}>{kind}</button>)}</div> : null}
          {visibleOutcomes.length ? <VirtuosoGrid className="product-gallery-virtual" listClassName="product-gallery-grid" itemClassName="product-gallery-grid-item" useWindowScroll data={visibleOutcomes} computeItemKey={(_, entry) => entry.id} endReached={loadNextPage} increaseViewportBy={{ top: 300, bottom: 500 }} itemContent={(index, entry) => <GalleryTile entry={entry} priority={index < 5} onOpen={openOutcome} />} /> : <p className="product-outcomes-empty">{directoryLoading ? "Loading published Outcomes…" : directoryFeed.isError || directoryAvailability.isError ? "The published Outcomes could not be loaded." : outcomes.length ? "No Outcomes match this search." : `No published Outcomes use this ${kind} yet.`}</p>}
          <span className="sr-only" aria-live="polite">{directoryFeed.isFetchingNextPage ? "Loading more Outcomes." : ""}</span>
        </section>
      </article>
      {selected ? <OutcomeViewer entry={selected} onClose={closeOutcome} /> : null}
    </SiteShell>
  );
}
