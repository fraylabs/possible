"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { SiteShell } from "./shared";
import { getSupabaseBrowserClient } from "./supabase";

type Company = {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
  verification_status: "unverified" | "verified";
};

type Product = {
  id: string;
  company_id: string;
  name: string;
  slug: string;
  official_description: string;
  logo_url: string | null;
  website_url: string;
  documentation_url: string | null;
  status: "draft" | "published" | "disabled";
};

type GallerySource = {
  id: string;
  product_id: string;
  source_url: string;
  status: "draft" | "scanning" | "review" | "active" | "paused" | "error" | "disconnected";
  last_error: string | null;
};

export type OutcomeReview = {
  id: string;
  product_id: string;
  gallery_source_id: string;
  source_key: string;
  source_url: string;
  title: string | null;
  prompt: string | null;
  result_media_url: string | null;
  poster_url: string | null;
  model: string | null;
  author_name: string | null;
  author_url: string | null;
  status: "draft" | "ready" | "published" | "excluded";
  is_published: boolean;
  is_publishable: boolean;
  missing_fields: string[];
  discovered_at: string;
  has_editorial_edits: boolean;
};

type OutcomeFilter = "all" | "published" | "unpublished" | "missing";
type WorkspaceTab = "outcomes" | "settings";
type ViewMode = "grid" | "table";
type Notice = { tone: "success" | "error" | "neutral"; text: string } | null;
type Counts = { all: number; published: number; unpublished: number; missing: number };

type GalleryImportItem = {
  sourceKey: string;
  title: string | null;
  prompt: string | null;
  resultMediaUrl: string | null;
};

type GalleryImportDocument = {
  items: GalleryImportItem[];
  warnings: Array<Record<string, string | null>>;
};

export type ImportReceipt = {
  received: number;
  added: number;
  updated: number;
  incomplete: number;
  warnings: number;
};

const PAGE_SIZE = 50;
const EMPTY_COUNTS: Counts = { all: 0, published: 0, unpublished: 0, missing: 0 };

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function getOutcomeState(outcome: Pick<OutcomeReview, "is_published" | "is_publishable">) {
  if (!outcome.is_publishable) return "Missing information";
  return outcome.is_published ? "Published" : "Unpublished";
}

export function summarizeGalleryImport(document: GalleryImportDocument, existingKeys: ReadonlySet<string>): ImportReceipt {
  const items = document.items;
  const keys = items.map((item) => item.sourceKey);
  const updated = keys.filter((key) => key !== "" && existingKeys.has(key)).length;
  const incomplete = items.filter((item) => {
    const has = (value: string | null) => (value ?? "").trim() !== "";
    return !has(item.title) || !has(item.prompt) || !has(item.resultMediaUrl);
  }).length;
  return {
    received: items.length,
    added: items.length - updated,
    updated,
    incomplete,
    warnings: document.warnings.length,
  };
}

function NoticeLine({ notice }: { notice: Notice }) {
  return notice ? <p className={`publish-notice ${notice.tone}`} role="status">{notice.text}</p> : null;
}

function SignInPanel({ onSubmit, busy, notice }: {
  onSubmit: (email: string) => Promise<void>;
  busy: boolean;
  notice: Notice;
}) {
  const [email, setEmail] = useState("");

  return (
    <section className="publish-access-card" aria-labelledby="publish-sign-in-title">
      <span className="publish-kicker">PRIVATE WORKSPACE</span>
      <h1 id="publish-sign-in-title">Publisher access</h1>
      <p>Sign in to import, curate, and publish Outcomes.</p>
      <form onSubmit={(event) => { event.preventDefault(); void onSubmit(email); }}>
        <label htmlFor="publisher-email">Email address</label>
        <div>
          <input id="publisher-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          <button type="submit" disabled={busy}>{busy ? "Sending…" : "Email me a sign-in link"}</button>
        </div>
      </form>
      <NoticeLine notice={notice} />
    </section>
  );
}

function CompanyForm({ onCreate, busy }: { onCreate: (input: { name: string; slug: string; websiteUrl: string | null }) => Promise<boolean>; busy: boolean }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  return (
    <form className="publish-form" onSubmit={(event) => {
      event.preventDefault();
      void onCreate({ name, slug: slug || slugify(name), websiteUrl: websiteUrl || null }).then((created) => {
        if (created) { setName(""); setSlug(""); setWebsiteUrl(""); }
      });
    }}>
      <label>Company name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="MiniMax" /></label>
      <label>Company slug<input required value={slug || slugify(name)} onChange={(event) => setSlug(event.target.value)} placeholder="minimax" /></label>
      <label>Official website<input type="url" value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://…" /></label>
      <button type="submit" disabled={busy}>Add company</button>
    </form>
  );
}

function ProductForm({ companies, onCreate, busy }: { companies: Company[]; onCreate: (input: Record<string, string | null>) => Promise<boolean>; busy: boolean }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  return (
    <form className="publish-form" onSubmit={(event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const data = new FormData(form);
      void onCreate({
        company_id: String(data.get("company_id")),
        name,
        slug: slug || slugify(name),
        official_description: String(data.get("official_description")),
        website_url: String(data.get("website_url")),
        logo_url: String(data.get("logo_url")) || null,
        documentation_url: String(data.get("documentation_url")) || null,
      }).then((created) => { if (created) { setName(""); setSlug(""); form.reset(); } });
    }}>
      <label>Company<select name="company_id" required defaultValue=""><option value="" disabled>Select company</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label>
      <label>Product name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Hailuo AI" /></label>
      <label>Product slug<input required value={slug || slugify(name)} onChange={(event) => setSlug(event.target.value)} placeholder="hailuo-ai" /></label>
      <label className="wide">Official product description<textarea name="official_description" required rows={3} placeholder="Paste the product’s own description, unchanged." /></label>
      <label>Official website<input name="website_url" type="url" required placeholder="https://…" /></label>
      <label>Logo URL<input name="logo_url" type="url" placeholder="https://…" /></label>
      <label>Documentation URL<input name="documentation_url" type="url" placeholder="https://…" /></label>
      <button type="submit" disabled={busy}>Add product</button>
    </form>
  );
}

function GalleryForm({ products, sources, onCreate, busy }: { products: Product[]; sources: GallerySource[]; onCreate: (productId: string, sourceUrl: string) => Promise<boolean>; busy: boolean }) {
  const availableProducts = products.filter((product) => !sources.some((source) => source.product_id === product.id));
  return (
    <form className="publish-form compact" onSubmit={(event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const data = new FormData(form);
      void onCreate(String(data.get("product_id")), String(data.get("source_url"))).then((created) => { if (created) form.reset(); });
    }}>
      <label>Product<select name="product_id" required defaultValue=""><option value="" disabled>Select product</option>{availableProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
      <label className="wide">Public gallery URL<input name="source_url" type="url" required placeholder="https://…/gallery" /></label>
      <button type="submit" disabled={busy || availableProducts.length === 0}>Connect gallery</button>
    </form>
  );
}

function OutcomeMedia({ outcome }: { outcome: OutcomeReview }) {
  const mediaUrl = outcome.poster_url ?? outcome.result_media_url;
  if (!mediaUrl) return <span className="publish-media-empty">NO MEDIA</span>;
  const looksLikeVideo = !outcome.poster_url && /\.(mp4|webm|mov)(?:$|\?)/i.test(mediaUrl);
  return looksLikeVideo
    ? <video src={mediaUrl} muted playsInline preload="metadata" aria-label={outcome.title ?? "Outcome preview"} />
    : <img src={mediaUrl} alt="" loading="lazy" />;
}

function SelectionMark({ selected }: { selected: boolean }) {
  return <span className={`publish-selection-mark${selected ? " selected" : ""}`} aria-hidden="true">{selected ? "✓" : ""}</span>;
}

function OutcomeGrid({ outcomes, selecting, selected, onActivate }: {
  outcomes: OutcomeReview[];
  selecting: boolean;
  selected: Record<string, OutcomeReview>;
  onActivate: (outcome: OutcomeReview) => void;
}) {
  return (
    <div className="publish-gallery" role="list" aria-label="Imported Outcomes">
      {outcomes.map((outcome) => {
        const isSelected = Boolean(selected[outcome.id]);
        return (
          <button key={outcome.id} type="button" className={`publish-tile${isSelected ? " is-selected" : ""}`} onClick={() => onActivate(outcome)} role="listitem" aria-pressed={selecting ? isSelected : undefined}>
            <span className="publish-tile-media"><OutcomeMedia outcome={outcome} /><SelectionMark selected={isSelected} /></span>
            <span className="publish-tile-copy">
              <strong>{outcome.title || "Untitled Outcome"}</strong>
              <small className={outcome.is_publishable ? "" : "missing"}>{getOutcomeState(outcome)}</small>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function OutcomeTable({ outcomes, selecting, selected, onActivate }: {
  outcomes: OutcomeReview[];
  selecting: boolean;
  selected: Record<string, OutcomeReview>;
  onActivate: (outcome: OutcomeReview) => void;
}) {
  return (
    <div className="publish-table" role="table" aria-label="Imported Outcomes">
      <div className="publish-table-head" role="row"><span /><span>Outcome</span><span>Creator</span><span>Model</span><span>Status</span></div>
      {outcomes.map((outcome) => {
        const isSelected = Boolean(selected[outcome.id]);
        return (
          <button key={outcome.id} type="button" className={`publish-table-row${isSelected ? " is-selected" : ""}`} onClick={() => onActivate(outcome)} role="row" aria-pressed={selecting ? isSelected : undefined}>
            <span className="publish-table-thumb"><OutcomeMedia outcome={outcome} /><SelectionMark selected={isSelected} /></span>
            <span className="publish-table-title"><strong>{outcome.title || "Untitled Outcome"}</strong><small>{outcome.prompt || "Prompt missing"}</small></span>
            <span>{outcome.author_name || "—"}</span><span>{outcome.model || "—"}</span>
            <span className={outcome.is_publishable ? "" : "missing"}>{getOutcomeState(outcome)}</span>
          </button>
        );
      })}
    </div>
  );
}

function OutcomeDrawer({ outcome, busy, onClose, onSave, onPublication }: {
  outcome: OutcomeReview;
  busy: boolean;
  onClose: () => void;
  onSave: (values: Record<string, string | null>) => Promise<void>;
  onPublication: (makePublic: boolean) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [onClose]);

  return (
    <div className="publish-drawer-layer">
      <button className="publish-drawer-backdrop" type="button" aria-label="Close Outcome editor" onClick={onClose} />
      <aside className="publish-drawer" role="dialog" aria-modal="true" aria-labelledby="outcome-drawer-title">
        <header><div><span className="publish-kicker">OUTCOME</span><h2 id="outcome-drawer-title">{outcome.title || "Untitled Outcome"}</h2></div><button ref={closeRef} type="button" aria-label="Close Outcome editor" onClick={onClose}>×</button></header>
        <div className="publish-drawer-preview"><OutcomeMedia outcome={outcome} /></div>
        <div className="publish-drawer-meta"><span className={outcome.is_publishable ? "" : "missing"}>{getOutcomeState(outcome)}</span>{outcome.has_editorial_edits ? <span>Edited</span> : null}<a href={outcome.source_url} target="_blank" rel="noreferrer">Open source ↗</a></div>
        {!outcome.is_publishable ? <p className="publish-missing-note">Add {outcome.missing_fields.join(", ")} before publishing.</p> : null}
        <form className="publish-drawer-form" onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const fields = ["title", "prompt", "result_media_url", "poster_url", "model", "author_name", "author_url"];
          void onSave(Object.fromEntries(fields.map((field) => [field, String(data.get(field) ?? "").trim() || null])));
        }}>
          <label>Title<input name="title" defaultValue={outcome.title ?? ""} /></label>
          <label>Exact prompt<textarea name="prompt" rows={8} defaultValue={outcome.prompt ?? ""} /></label>
          <label>Result media URL<input name="result_media_url" type="url" defaultValue={outcome.result_media_url ?? ""} /></label>
          <label>Poster URL<input name="poster_url" type="url" defaultValue={outcome.poster_url ?? ""} /></label>
          <div className="publish-drawer-pair"><label>Model<input name="model" defaultValue={outcome.model ?? ""} /></label><label>Creator<input name="author_name" defaultValue={outcome.author_name ?? ""} /></label></div>
          <label>Creator URL<input name="author_url" type="url" defaultValue={outcome.author_url ?? ""} /></label>
          <button className="publish-primary-button" type="submit" disabled={busy}>Save changes</button>
        </form>
        <div className="publish-drawer-action">
          <button type="button" disabled={busy || (!outcome.is_published && !outcome.is_publishable)} onClick={() => onPublication(!outcome.is_published)}>{outcome.is_published ? "Unpublish Outcome" : "Publish Outcome"}</button>
        </div>
      </aside>
    </div>
  );
}

function ConfirmationDialog({ makePublic, outcomes, publishedCount, busy, onCancel, onConfirm }: {
  makePublic: boolean;
  outcomes: OutcomeReview[];
  publishedCount: number;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const selectedPublished = outcomes.filter((outcome) => outcome.is_published).length;
  const hidesProduct = !makePublic && selectedPublished >= publishedCount;
  return (
    <div className="publish-dialog-layer" role="presentation">
      <button className="publish-drawer-backdrop" type="button" aria-label="Cancel publication change" onClick={onCancel} />
      <section className="publish-dialog" role="alertdialog" aria-modal="true" aria-labelledby="publish-confirm-title">
        <span className="publish-kicker">CONFIRM</span>
        <h2 id="publish-confirm-title">{makePublic ? `Publish ${outcomes.length} Outcome${outcomes.length === 1 ? "" : "s"}?` : `Unpublish ${outcomes.length} Outcome${outcomes.length === 1 ? "" : "s"}?`}</h2>
        <p>{makePublic ? "These Outcomes and their product page will become publicly visible." : hidesProduct ? "This removes every published Outcome, so the product page will also become private." : "These Outcomes will disappear from the public directory."}</p>
        <div><button type="button" onClick={onCancel}>Cancel</button><button className="publish-primary-button" type="button" disabled={busy} onClick={onConfirm}>{busy ? "Working…" : makePublic ? "Publish" : "Unpublish"}</button></div>
      </section>
    </div>
  );
}

function ImportReceiptPanel({ receipt, onClose, onReviewMissing }: { receipt: ImportReceipt; onClose: () => void; onReviewMissing: () => void }) {
  return (
    <section className="publish-import-receipt" aria-labelledby="import-receipt-title">
      <header><div><span className="publish-kicker">IMPORT COMPLETE</span><h2 id="import-receipt-title">Review what changed</h2></div><button type="button" aria-label="Close import receipt" onClick={onClose}>×</button></header>
      <dl><div><dt>Received</dt><dd>{receipt.received}</dd></div><div><dt>New</dt><dd>{receipt.added}</dd></div><div><dt>Updated</dt><dd>{receipt.updated}</dd></div><div><dt>Incomplete</dt><dd>{receipt.incomplete}</dd></div><div><dt>Warnings</dt><dd>{receipt.warnings}</dd></div></dl>
      <div><button type="button" onClick={onClose}>Done</button>{receipt.incomplete > 0 ? <button className="publish-primary-button" type="button" onClick={onReviewMissing}>Review missing information</button> : null}</div>
    </section>
  );
}

function sanitizeSearch(search: string) {
  return search.trim().replace(/[^\p{L}\p{N}\s'-]/gu, " ").replace(/\s+/g, " ");
}

export function PublishPage() {
  const client = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null | undefined>();
  const [access, setAccess] = useState<"loading" | "granted" | "denied">("loading");
  const [busy, setBusy] = useState(false);
  const [loadingOutcomes, setLoadingOutcomes] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sources, setSources] = useState<GallerySource[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [outcomes, setOutcomes] = useState<OutcomeReview[]>([]);
  const [counts, setCounts] = useState<Counts>(EMPTY_COUNTS);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("outcomes");
  const [filter, setFilter] = useState<OutcomeFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Record<string, OutcomeReview>>({});
  const [openOutcome, setOpenOutcome] = useState<OutcomeReview | null>(null);
  const [confirmation, setConfirmation] = useState<{ makePublic: boolean; outcomes: OutcomeReview[] } | null>(null);
  const [importReceipt, setImportReceipt] = useState<ImportReceipt | null>(null);

  const selectedProduct = products.find(({ id }) => id === selectedProductId) ?? null;
  const selectedSource = sources.find(({ product_id }) => product_id === selectedProductId) ?? null;
  const selectedOutcomes = Object.values(selected);
  const selectedHasIncomplete = selectedOutcomes.some((outcome) => !outcome.is_publishable);

  const refreshMetadata = useCallback(async () => {
    if (!client || !session) return;
    const companyResult = await client.from("companies").select("id,name,slug,website_url,verification_status").order("name");
    if (companyResult.error) throw companyResult.error;
    // SAFETY: the explicit select list matches the Company record above.
    const nextCompanies = (companyResult.data ?? []) as Company[];
    setCompanies(nextCompanies);
    const companyIds = nextCompanies.map(({ id }) => id);
    const productResult = companyIds.length
      ? await client.from("products").select("id,company_id,name,slug,official_description,logo_url,website_url,documentation_url,status").in("company_id", companyIds).order("name")
      : { data: [], error: null };
    if (productResult.error) throw productResult.error;
    // SAFETY: the explicit select list matches the Product record above.
    const nextProducts = (productResult.data ?? []) as Product[];
    setProducts(nextProducts);
    setSelectedProductId((current) => current && nextProducts.some(({ id }) => id === current) ? current : nextProducts[0]?.id ?? "");
    const productIds = nextProducts.map(({ id }) => id);
    if (!productIds.length) { setSources([]); return; }
    const sourceResult = await client.from("gallery_sources").select("id,product_id,source_url,status,last_error").in("product_id", productIds).order("created_at");
    if (sourceResult.error) throw sourceResult.error;
    // SAFETY: the explicit select list matches the GallerySource record above.
    setSources((sourceResult.data ?? []) as GallerySource[]);
  }, [client, session]);

  const refreshOutcomes = useCallback(async () => {
    if (!client || !session || !selectedProductId) { setOutcomes([]); setCounts(EMPTY_COUNTS); setFilteredTotal(0); return; }
    setLoadingOutcomes(true);
    try {
      const baseCount = () => client.from("outcome_review").select("id", { count: "exact", head: true }).eq("product_id", selectedProductId);
      const [allResult, publishedResult, unpublishedResult, missingResult] = await Promise.all([
        baseCount(), baseCount().eq("is_published", true), baseCount().eq("is_published", false), baseCount().eq("is_publishable", false),
      ]);
      const countError = [allResult, publishedResult, unpublishedResult, missingResult].find(({ error }) => error)?.error;
      if (countError) throw countError;
      setCounts({ all: allResult.count ?? 0, published: publishedResult.count ?? 0, unpublished: unpublishedResult.count ?? 0, missing: missingResult.count ?? 0 });

      let query = client.from("outcome_review").select("id,product_id,gallery_source_id,source_key,source_url,title,prompt,result_media_url,poster_url,model,author_name,author_url,status,is_published,is_publishable,missing_fields,discovered_at,has_editorial_edits", { count: "exact" }).eq("product_id", selectedProductId);
      if (filter === "published") query = query.eq("is_published", true);
      if (filter === "unpublished") query = query.eq("is_published", false);
      if (filter === "missing") query = query.eq("is_publishable", false);
      const safeSearch = sanitizeSearch(search);
      if (safeSearch) query = query.or(`title.ilike.%${safeSearch}%,prompt.ilike.%${safeSearch}%,author_name.ilike.%${safeSearch}%,model.ilike.%${safeSearch}%`);
      const result = await query.order("discovered_at", { ascending: false }).range(0, limit - 1);
      if (result.error) throw result.error;
      setFilteredTotal(result.count ?? 0);
      // SAFETY: the explicit outcome_review select list matches OutcomeReview.
      setOutcomes((result.data ?? []) as OutcomeReview[]);
    } finally {
      setLoadingOutcomes(false);
    }
  }, [client, filter, limit, search, selectedProductId, session]);

  useEffect(() => {
    if (!client) { setSession(null); return; }
    void client.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = client.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, [client]);

  useEffect(() => {
    if (!client || !session) return;
    setAccess("loading");
    void client.rpc("claim_first_platform_admin").then(async ({ error }) => {
      if (error) { setAccess("denied"); setNotice({ tone: "error", text: error.message }); return; }
      setAccess("granted");
      try { await refreshMetadata(); } catch (loadError) { setNotice({ tone: "error", text: loadError instanceof Error ? loadError.message : String(loadError) }); }
    });
  }, [client, refreshMetadata, session]);

  useEffect(() => { if (access === "granted") void refreshOutcomes().catch((error: Error) => setNotice({ tone: "error", text: error.message })); }, [access, refreshOutcomes]);
  useEffect(() => { const timer = window.setTimeout(() => { setLimit(PAGE_SIZE); setSearch(searchInput); }, 250); return () => window.clearTimeout(timer); }, [searchInput]);
  useEffect(() => { const saved = window.localStorage?.getItem("possible-publish-view"); if (saved === "table") setViewMode("table"); }, []);
  useEffect(() => { setSelected({}); setSelecting(false); setOpenOutcome(null); setLimit(PAGE_SIZE); }, [selectedProductId]);

  async function run(action: () => Promise<void>, success: string, refreshReview = false) {
    setBusy(true); setNotice(null);
    try {
      await action();
      await refreshMetadata();
      if (refreshReview) await refreshOutcomes();
      setNotice({ tone: "success", text: success });
      return true;
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : String(error) });
      return false;
    } finally { setBusy(false); }
  }

  async function signIn(email: string) {
    if (!client) return;
    setBusy(true); setNotice(null);
    const redirectTo = `${window.location.origin}/publish/`;
    const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    setBusy(false);
    setNotice(error ? { tone: "error", text: error.message } : { tone: "success", text: "Check your email for the private sign-in link." });
  }

  function setView(nextView: ViewMode) {
    setViewMode(nextView);
    window.localStorage?.setItem("possible-publish-view", nextView);
  }

  function activateOutcome(outcome: OutcomeReview) {
    if (!selecting) { setOpenOutcome(outcome); return; }
    setSelected((current) => {
      const next = { ...current };
      if (next[outcome.id]) delete next[outcome.id]; else next[outcome.id] = outcome;
      return next;
    });
  }

  function beginConfirmation(makePublic: boolean, chosen = selectedOutcomes) {
    if (!chosen.length) return;
    if (makePublic && chosen.some((outcome) => !outcome.is_publishable)) {
      setNotice({ tone: "error", text: "Complete the missing title, prompt, or result media before publishing." });
      return;
    }
    setConfirmation({ makePublic, outcomes: chosen });
  }

  async function confirmPublication() {
    if (!client || !confirmation || !selectedProductId) return;
    const { makePublic, outcomes: chosen } = confirmation;
    const changed = await run(async () => {
      const { error } = await client.rpc("set_outcome_publication", { target_product_id: selectedProductId, target_outcome_ids: chosen.map(({ id }) => id), make_public: makePublic });
      if (error) throw error;
    }, `${chosen.length} Outcome${chosen.length === 1 ? "" : "s"} ${makePublic ? "published" : "unpublished"}.`, true);
    if (changed) { setConfirmation(null); setSelected({}); setSelecting(false); setOpenOutcome(null); }
  }

  async function saveOutcome(outcome: OutcomeReview, values: Record<string, string | null>) {
    if (!client || !session) return;
    const saved = await run(async () => {
      const { error } = await client.from("outcome_edits").upsert({ ...values, outcome_id: outcome.id, updated_by: session.user.id }, { onConflict: "outcome_id" });
      if (error) throw error;
    }, "Outcome saved.", true);
    if (saved) setOpenOutcome(null);
  }

  async function importGallery(file: File, source: GallerySource) {
    if (!client) return;
    setBusy(true); setNotice(null);
    try {
      // SAFETY: the importer accepts only the versioned gallery-import schema and
      // the database validates the complete document again before writing rows.
      const document: GalleryImportDocument = JSON.parse(await file.text());
      const existingResult = await client.from("outcomes").select("source_key").eq("gallery_source_id", source.id);
      if (existingResult.error) throw existingResult.error;
      const existingKeys = new Set((existingResult.data ?? []).map(({ source_key }: { source_key: string }) => source_key));
      const receipt = summarizeGalleryImport(document, existingKeys);
      const { error } = await client.rpc("import_gallery_draft", { target_gallery_source_id: source.id, import_document: document });
      if (error) throw error;
      setImportReceipt(receipt);
      await refreshMetadata(); await refreshOutcomes();
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : String(error) });
    } finally { setBusy(false); }
  }

  if (!client) return <SiteShell className="publish-page" showFooter={false}><section className="publish-access-card"><span className="publish-kicker">SETUP REQUIRED</span><h1>Publisher workspace</h1><p>Add the public Supabase URL and publishable key to the ignored workspace environment file.</p></section></SiteShell>;
  if (session === undefined) return <SiteShell className="publish-page" showFooter={false}><p className="publish-loading">Loading publisher workspace…</p></SiteShell>;
  if (!session) return <SiteShell className="publish-page" showFooter={false}><SignInPanel onSubmit={signIn} busy={busy} notice={notice} /></SiteShell>;
  if (access !== "granted") return <SiteShell className="publish-page" showFooter={false}><section className="publish-access-card"><span className="publish-kicker">{access === "loading" ? "CHECKING ACCESS" : "ACCESS DENIED"}</span><h1>{access === "loading" ? "Opening workspace…" : "This workspace is private"}</h1><NoticeLine notice={notice} /><button type="button" onClick={() => void client.auth.signOut()}>Sign out</button></section></SiteShell>;

  const visibleTotal = filteredTotal;
  return (
    <SiteShell className="publish-page" showFooter={false}>
      <section className="publish-workspace">
        <header className="publish-workspace-header">
          <div className="publish-product-switcher">
            {selectedProduct?.logo_url ? <img src={selectedProduct.logo_url} alt="" /> : <span>{selectedProduct?.name.slice(0, 1) ?? "P"}</span>}
            <label><small>CURATING</small><select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)} aria-label="Product to curate">{products.length ? products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>) : <option value="">No products</option>}</select></label>
          </div>
          <nav className="publish-workspace-tabs" aria-label="Publisher workspace"><button className={workspaceTab === "outcomes" ? "active" : ""} type="button" onClick={() => setWorkspaceTab("outcomes")}>Outcomes</button><button className={workspaceTab === "settings" ? "active" : ""} type="button" onClick={() => setWorkspaceTab("settings")}>Products &amp; sources</button></nav>
          <button className="publish-signout" type="button" onClick={() => void client.auth.signOut()}>Sign out</button>
        </header>
        <NoticeLine notice={notice} />

        {workspaceTab === "outcomes" ? (
          <section className="publish-review-workspace">
            <header className="publish-review-heading">
              <div><h1>Outcomes</h1><p>{counts.all.toLocaleString()} imported · {counts.published.toLocaleString()} published</p></div>
              <div>
                {selectedSource ? <label className="publish-import-button">Import JSON<input type="file" accept="application/json,.json" disabled={busy} onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) void importGallery(file, selectedSource); event.currentTarget.value = ""; }} /></label> : null}
                <button type="button" className={selecting ? "active" : ""} onClick={() => { setSelecting((value) => !value); setSelected({}); }}>{selecting ? "Cancel" : "Select"}</button>
              </div>
            </header>

            <div className="publish-review-toolbar">
              <label className="publish-search"><span aria-hidden="true">⌕</span><input type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search title, prompt, creator, or model" aria-label="Search imported Outcomes" /></label>
              <div className="publish-filters" role="group" aria-label="Filter Outcomes">{(["all", "published", "unpublished", "missing"] as const).map((value) => <button key={value} type="button" className={filter === value ? "active" : ""} onClick={() => { setFilter(value); setLimit(PAGE_SIZE); }}>{value === "all" ? "All" : value === "missing" ? "Missing info" : value}<span>{counts[value]}</span></button>)}</div>
              <div className="publish-view-toggle" role="group" aria-label="Outcome view"><button type="button" className={viewMode === "grid" ? "active" : ""} aria-label="Gallery view" onClick={() => setView("grid")}>▦</button><button type="button" className={viewMode === "table" ? "active" : ""} aria-label="Table view" onClick={() => setView("table")}>☷</button></div>
            </div>

            {outcomes.length ? viewMode === "grid" ? <OutcomeGrid outcomes={outcomes} selecting={selecting} selected={selected} onActivate={activateOutcome} /> : <OutcomeTable outcomes={outcomes} selecting={selecting} selected={selected} onActivate={activateOutcome} /> : <div className="publish-empty"><strong>{loadingOutcomes ? "Loading Outcomes…" : "No Outcomes found."}</strong><span>{search || filter !== "all" ? "Try another search or filter." : "Connect a gallery and import its extracted JSON."}</span></div>}
            {outcomes.length < visibleTotal ? <button className="publish-load-more" type="button" disabled={loadingOutcomes} onClick={() => setLimit((value) => value + PAGE_SIZE)}>{loadingOutcomes ? "Loading…" : `Load ${Math.min(PAGE_SIZE, visibleTotal - outcomes.length)} more`}</button> : null}
          </section>
        ) : (
          <section className="publish-settings">
            <header><span className="publish-kicker">WORKSPACE SETTINGS</span><h1>Products &amp; sources</h1><p>Create publisher records and connect each product to its public gallery. Publication is controlled from the Outcomes tab.</p></header>
            <details><summary><span><strong>Companies</strong><small>{companies.length} connected</small></span><i>+</i></summary><div><CompanyForm busy={busy} onCreate={(input) => run(async () => { const { error } = await client.rpc("create_company", { company_name: input.name, company_slug: input.slug, company_website_url: input.websiteUrl }); if (error) throw error; }, "Company added.")} /><div className="publish-settings-records">{companies.map((company) => <span key={company.id}><strong>{company.name}</strong><small>{company.website_url ?? company.slug}</small></span>)}</div></div></details>
            <details><summary><span><strong>Products</strong><small>{products.length} connected</small></span><i>+</i></summary><div><ProductForm companies={companies} busy={busy} onCreate={(input) => run(async () => { const { error } = await client.from("products").insert(input); if (error) throw error; }, "Product added.")} /><div className="publish-settings-records">{products.map((product) => <span key={product.id}><strong>{product.name}</strong><small>{companies.find(({ id }) => id === product.company_id)?.name} · {product.status === "published" ? "Public" : "Private"}</small></span>)}</div></div></details>
            <details><summary><span><strong>Gallery sources</strong><small>{sources.length} connected</small></span><i>+</i></summary><div><GalleryForm products={products} sources={sources} busy={busy} onCreate={(productId, sourceUrl) => run(async () => { const { error } = await client.from("gallery_sources").insert({ product_id: productId, source_url: sourceUrl }); if (error) throw error; }, "Gallery connected.")} /><div className="publish-settings-records">{sources.map((source) => <span key={source.id}><strong>{products.find(({ id }) => id === source.product_id)?.name}</strong><a href={source.source_url} target="_blank" rel="noreferrer">{source.source_url} ↗</a></span>)}</div></div></details>
          </section>
        )}
      </section>

      {selecting && selectedOutcomes.length ? <div className="publish-selection-bar"><strong>{selectedOutcomes.length} selected</strong><button type="button" onClick={() => setSelected(Object.fromEntries(outcomes.map((outcome) => [outcome.id, outcome])))}>Select loaded</button><span /><button type="button" onClick={() => beginConfirmation(false)}>Unpublish</button><button className="publish-primary-button" type="button" disabled={selectedHasIncomplete} onClick={() => beginConfirmation(true)}>Publish</button></div> : null}
      {openOutcome ? <OutcomeDrawer outcome={openOutcome} busy={busy} onClose={() => setOpenOutcome(null)} onSave={(values) => saveOutcome(openOutcome, values)} onPublication={(makePublic) => beginConfirmation(makePublic, [openOutcome])} /> : null}
      {confirmation ? <ConfirmationDialog makePublic={confirmation.makePublic} outcomes={confirmation.outcomes} publishedCount={counts.published} busy={busy} onCancel={() => setConfirmation(null)} onConfirm={() => void confirmPublication()} /> : null}
      {importReceipt ? <div className="publish-dialog-layer"><button className="publish-drawer-backdrop" type="button" aria-label="Close import receipt" onClick={() => setImportReceipt(null)} /><ImportReceiptPanel receipt={importReceipt} onClose={() => setImportReceipt(null)} onReviewMissing={() => { setImportReceipt(null); setWorkspaceTab("outcomes"); setFilter("missing"); }} /></div> : null}
    </SiteShell>
  );
}
