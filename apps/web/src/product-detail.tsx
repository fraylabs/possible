"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QueryClient, QueryClientProvider, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { OutcomeCatalogEntry } from "@possible/catalog";
import { VirtuosoGrid } from "react-virtuoso";
import { getProductOutcomes, getPublishedProduct, getPublishedSkill, getSkillOutcomes, outcomeHref } from "./public-content";
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
  title: string;
  summary?: string | undefined;
  prompt: string;
  sourceUrl: string;
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
  source_url: string;
  title: string;
  prompt: string;
  result_media_url: string;
  poster_url: string | null;
  model: string | null;
  author_name: string | null;
  author_url: string | null;
  linked_company_name: string;
};

type DirectoryPage = {
  outcomes: ProductGalleryEntry[];
  total: number;
  nextOffset?: number | undefined;
};

function inferMediaKind(url: string, productCategory: string): GalleryKind {
  if (/\.(?:mp4|webm|mov)(?:$|\?)/i.test(url) || productCategory === "video") return "video";
  if (/\.(?:wav|mp3|m4a|ogg|flac)(?:$|\?)/i.test(url) || productCategory === "audio") return "audio";
  if (/\.(?:step|stp|stl|3mf|glb|gltf)(?:$|\?)/i.test(url) || productCategory === "3d" || productCategory === "robotics") return "cad";
  return "image";
}

function sanitizeDirectorySearch(value: string) {
  return value.trim().replace(/[^\p{L}\p{N}\s'-]/gu, " ").replace(/\s+/g, " ");
}

function fromCatalogEntry(entry: OutcomeCatalogEntry): ProductGalleryEntry {
  const { outcome } = entry;
  const preview = outcome.preview;
  const image = preview?.images?.find(({ cover }) => cover) ?? preview?.images?.[0];
  const kind: GalleryKind = preview?.video ? "video" : image ? "image" : preview?.audio ? "audio" : preview?.cad ? "cad" : "prompt";
  return {
    id: `catalog:${entry.slug}`,
    title: outcome.title,
    summary: outcome.summary,
    prompt: outcome.executionPrompt,
    sourceUrl: entry.sourceUrl,
    outcomeUrl: outcomeHref(entry),
    provider: outcome.execution.provider,
    model: outcome.execution.model,
    authorName: outcome.author.name,
    authorUrl: outcome.author.url,
    kind,
    mediaUrl: preview?.video?.src ?? image?.src ?? preview?.audio?.src ?? preview?.cad?.poster,
    posterUrl: preview?.video?.poster ?? preview?.audio?.poster ?? preview?.cad?.poster,
    mediaAlt: image?.alt ?? preview?.cad?.caption,
    sourceKind: "community",
  };
}

function fromDirectoryRow(row: DirectoryOutcomeRow, productCategory: string): ProductGalleryEntry {
  return {
    id: row.id,
    title: row.title,
    prompt: row.prompt,
    sourceUrl: row.source_url,
    provider: row.linked_company_name,
    model: row.model ?? undefined,
    authorName: row.author_name ?? undefined,
    authorUrl: row.author_url ?? undefined,
    kind: inferMediaKind(row.result_media_url, productCategory),
    mediaUrl: row.result_media_url,
    posterUrl: row.poster_url ?? undefined,
    sourceKind: "community",
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
            <header><h3 id="product-viewer-prompt-heading">Exact prompt</h3><CopyButton label="Copy prompt" value={entry.prompt} /></header>
            <pre><code>{entry.prompt}</code></pre>
          </section>
          <nav className="product-viewer-links" aria-label="Outcome links">{entry.outcomeUrl ? <a href={entry.outcomeUrl}>Open Outcome <span>↗</span></a> : null}<a href={entry.sourceUrl} target="_blank" rel="noreferrer">View source <span>↗</span></a></nav>
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
  const listing = product ? {
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
  } : undefined;
  const client = useMemo(() => getSupabaseBrowserClient(), []);
  const managerQuery = useQuery({
    queryKey: ["listing-manager", kind, product?.company.id, skill?.repository, skill?.directory],
    enabled: Boolean(client && listing),
    queryFn: async () => {
      if (!client) return null;
      let request = client.from("listing_claim_directory").select("account_handle,account_name").eq("status", "claimed").eq("target_type", kind === "product" ? "company" : "skill");
      request = kind === "product" && product ? request.eq("company_slug", product.company.id) : skill ? request.eq("skill_repository", skill.repository).eq("skill_directory", skill.directory) : request;
      const { data, error } = await request.maybeSingle();
      if (error) return null;
      // SAFETY: the explicit listing_claim_directory select list matches this manager summary.
      return data as { account_handle: string; account_name: string } | null;
    },
  });
  const bundledOutcomes = useMemo(() => product ? getProductOutcomes(product.id).map(fromCatalogEntry) : skill ? getSkillOutcomes(skill.id).map(fromCatalogEntry) : [], [product, skill]);
  const [query, setQuery] = useState("");
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<OutcomeSourceFilter>("all");
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedFromDirectory, setSelectedFromDirectory] = useState<ProductGalleryEntry | null>(null);
  const openedHere = useRef(false);

  const directoryAvailability = useQuery({
    queryKey: ["product-outcome-count", product?.id],
    enabled: Boolean(client && product),
    queryFn: async () => {
      if (!client || !product) throw new Error("The public Outcome directory is unavailable.");
      const productSlug = product.id.split("/").at(-1);
      const { count, error } = await client.from("product_outcome_directory").select("id", { count: "exact", head: true }).eq("linked_product_slug", productSlug);
      if (error) throw new Error(error.message);
      return count ?? 0;
    },
  });

  const directoryFeed = useInfiniteQuery({
    queryKey: ["product-outcomes", product?.id, directoryQuery],
    enabled: Boolean(client && product),
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<DirectoryPage> => {
      if (!client || !product) throw new Error("The public Outcome directory is unavailable.");
      const productSlug = product.id.split("/").at(-1);
      let request = client.from("product_outcome_directory").select("id,source_url,title,prompt,result_media_url,poster_url,model,author_name,author_url,linked_company_name", { count: "exact" }).eq("linked_product_slug", productSlug);
      const safeSearch = sanitizeDirectorySearch(directoryQuery);
      if (safeSearch) request = request.or(`title.ilike.%${safeSearch}%,prompt.ilike.%${safeSearch}%,model.ilike.%${safeSearch}%,author_name.ilike.%${safeSearch}%`);
      const { data, count, error } = await request.order("source_published_at", { ascending: false, nullsFirst: false }).order("id").range(pageParam, pageParam + pageSize - 1);
      if (error) throw new Error(error.message);
      // SAFETY: the explicit product_outcome_directory select list matches DirectoryOutcomeRow.
      const rows = (data ?? []) as DirectoryOutcomeRow[];
      const total = count ?? 0;
      const nextOffset = pageParam + rows.length;
      return {
        outcomes: rows.map((row) => fromDirectoryRow(row, product.category)),
        total,
        nextOffset: rows.length > 0 && nextOffset < total ? nextOffset : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });

  const directoryPages = directoryFeed.data?.pages;
  const directoryOutcomes = useMemo(() => directoryPages?.flatMap((page) => page.outcomes) ?? [], [directoryPages]);
  const endorsementQuery = useQuery({
    queryKey: ["outcome-endorsements", directoryOutcomes.map(({ id }) => id).join(",")],
    enabled: Boolean(client && directoryOutcomes.length),
    queryFn: async () => {
      if (!client || !directoryOutcomes.length) return [];
      const { data, error } = await client.from("outcome_endorsement_directory").select("outcome_id,official_by_name,official_by_handle").in("outcome_id", directoryOutcomes.map(({ id }) => id));
      // The public gallery remains Community-only until the additive claims migration exists.
      if (error) return [];
      // SAFETY: the explicit outcome_endorsement_directory select list matches this endorsement summary.
      return data as Array<{ outcome_id: string; official_by_name: string; official_by_handle: string }>;
    },
  });
  const endorsedDirectoryOutcomes = useMemo(() => {
    const endorsements = new Map((endorsementQuery.data ?? []).map((endorsement) => [endorsement.outcome_id, endorsement]));
    return directoryOutcomes.map((entry) => {
      const endorsement = endorsements.get(entry.id);
      return endorsement ? { ...entry, sourceKind: "official" as const, officialByName: endorsement.official_by_name, officialByHandle: endorsement.official_by_handle } : entry;
    });
  }, [directoryOutcomes, endorsementQuery.data]);
  const directoryTotal = directoryFeed.data?.pages[0]?.total ?? 0;
  const unfilteredDirectoryTotal = directoryAvailability.data ?? (directoryQuery === "" ? directoryTotal : undefined);
  const hasDirectoryOutcomes = !product || !client ? false : unfilteredDirectoryTotal === undefined ? directoryAvailability.isError ? false : null : unfilteredDirectoryTotal > 0;
  const directoryLoading = Boolean(product) && (directoryAvailability.isPending || directoryFeed.isPending);

  const outcomes = useMemo(() => hasDirectoryOutcomes === true ? endorsedDirectoryOutcomes : hasDirectoryOutcomes === false ? bundledOutcomes : [], [bundledOutcomes, endorsedDirectoryOutcomes, hasDirectoryOutcomes]);
  const availableKinds = useMemo(() => kindOrder.filter((kind) => outcomes.some((entry) => entry.kind === kind)), [outcomes]);
  const filteredOutcomes = useMemo(() => outcomes.filter((entry) => {
    if (sourceFilter !== "all" && entry.sourceKind !== sourceFilter) return false;
    if (filter !== "all" && entry.kind !== filter) return false;
    if (hasDirectoryOutcomes) return true;
    const haystack = [entry.title, entry.summary, entry.model, entry.authorName].join(" ").toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  }), [filter, hasDirectoryOutcomes, outcomes, query, sourceFilter]);
  const visibleOutcomes = useMemo(() => hasDirectoryOutcomes ? filteredOutcomes : filteredOutcomes.slice(0, visibleCount), [filteredOutcomes, hasDirectoryOutcomes, visibleCount]);
  const resultCount = hasDirectoryOutcomes && filter === "all" && sourceFilter === "all" ? directoryTotal : filteredOutcomes.length;
  const selected = selectedId ? outcomes.find((entry) => entry.id === selectedId) ?? selectedFromDirectory : null;

  useEffect(() => {
    const timer = window.setTimeout(() => { setVisibleCount(pageSize); setDirectoryQuery(query); }, 250);
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
    if (!selectedId || outcomes.some((entry) => entry.id === selectedId) || !client || !product || !hasDirectoryOutcomes) {
      setSelectedFromDirectory(null);
      return;
    }
    let cancelled = false;
    const productSlug = product.id.split("/").at(-1);
    void client.from("product_outcome_directory").select("id,source_url,title,prompt,result_media_url,poster_url,model,author_name,author_url,linked_company_name").eq("linked_product_slug", productSlug).eq("id", selectedId).maybeSingle().then(({ data, error }) => {
      if (cancelled || error || !data) return;
      // SAFETY: the explicit product_outcome_directory select list matches DirectoryOutcomeRow.
      setSelectedFromDirectory(fromDirectoryRow(data as DirectoryOutcomeRow, product.category));
    });
    return () => { cancelled = true; };
  }, [client, hasDirectoryOutcomes, outcomes, product, selectedId]);

  const loadNextPage = useCallback(() => {
    if (hasDirectoryOutcomes === true) {
      if (directoryFeed.hasNextPage && !directoryFeed.isFetchingNextPage) void directoryFeed.fetchNextPage();
      return;
    }
    if (hasDirectoryOutcomes === false) setVisibleCount((count) => Math.min(count + pageSize, filteredOutcomes.length));
  }, [directoryFeed.fetchNextPage, directoryFeed.hasNextPage, directoryFeed.isFetchingNextPage, filteredOutcomes.length, hasDirectoryOutcomes]);

  if (!listing) return null;

  const outcomeTotal = hasDirectoryOutcomes ? unfilteredDirectoryTotal ?? directoryTotal : bundledOutcomes.length;
  const officialCount = outcomes.filter((entry) => entry.sourceKind === "official").length;
  const communityCount = outcomes.filter((entry) => entry.sourceKind === "community").length;
  const manager = managerQuery.data;
  const claimTarget = kind === "product" && product ? `company:${product.company.id}` : skill ? `skill:${skill.id}` : "";

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
      <article className="product-profile">
        <a className="product-back-link" href={kind === "product" ? "/products" : "/skills"}><span aria-hidden="true">←</span> All {kind === "product" ? "products" : "skills"}</a>

        <header className="product-profile-header">
          <div className="product-profile-identity">{listing.logoUrl ? <img src={listing.logoUrl} alt={`${listing.name} logo`} /> : <span className="product-profile-skill-mark">SK</span>}<div><p>BY <a href={listing.ownerUrl} target="_blank" rel="noreferrer">{listing.ownerName} ↗</a></p><h1>{listing.name}</h1></div></div>
          <div className="product-profile-information"><p>{listing.summary}</p><a className="product-summary-source" href={listing.summarySourceUrl} target="_blank" rel="noreferrer">{kind === "product" ? "Official description" : "Reviewed source"} ↗</a></div>
          <div className="product-profile-actions">
            <nav className="product-profile-links" aria-label={`${listing.name} links`}><a href={listing.website} target="_blank" rel="noreferrer">{kind === "product" ? "Website" : "Open Skill"} <span>↗</span></a>{listing.docsUrl !== listing.website ? <a href={listing.docsUrl} target="_blank" rel="noreferrer">Documentation <span>↗</span></a> : null}</nav>
            <div className="product-access-note"><span>{listing.category}</span><span>{outcomeTotal} Outcome{outcomeTotal === 1 ? "" : "s"}</span></div>
            {manager ? <a className="product-manager-link" href={`/${manager.account_handle}`}>Managed by {manager.account_name} <span>↗</span></a> : <a className="product-claim-link" href={`/dashboard?tab=claims&target=${encodeURIComponent(claimTarget)}`}>Claim this {kind} <span>↗</span></a>}
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
          {visibleOutcomes.length ? <VirtuosoGrid className="product-gallery-virtual" listClassName="product-gallery-grid" itemClassName="product-gallery-grid-item" useWindowScroll data={visibleOutcomes} computeItemKey={(_, entry) => entry.id} endReached={loadNextPage} increaseViewportBy={{ top: 300, bottom: 500 }} itemContent={(index, entry) => <GalleryTile entry={entry} priority={index < 5} onOpen={openOutcome} />} /> : <p className="product-outcomes-empty">{directoryLoading ? "Loading published Outcomes…" : directoryFeed.isError && hasDirectoryOutcomes ? "The published Outcomes could not be loaded." : outcomes.length ? "No Outcomes match this search." : `No published Outcomes use this ${kind} yet.`}</p>}
          <span className="sr-only" aria-live="polite">{directoryFeed.isFetchingNextPage ? "Loading more Outcomes." : ""}</span>
        </section>
      </article>
      {selected ? <OutcomeViewer entry={selected} onClose={closeOutcome} /> : null}
    </SiteShell>
  );
}
