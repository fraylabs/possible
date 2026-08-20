"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

type Outcome = {
  id: string;
  product_id: string;
  source_url: string;
  title: string | null;
  prompt: string | null;
  result_media_url: string | null;
  poster_url: string | null;
  model: string | null;
  author_name: string | null;
  author_url: string | null;
  status: "draft" | "ready" | "published" | "excluded" | "removed";
};

type OutcomeEdit = Omit<Outcome, "id" | "product_id" | "source_url" | "status"> & { outcome_id: string };
type Notice = { tone: "success" | "error" | "neutral"; text: string } | null;

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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
      <p>Sign in to add companies, connect public galleries, and review extracted Outcomes.</p>
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

function CompanyForm({ onCreate, busy }: { onCreate: (input: { name: string; slug: string; websiteUrl: string | null }) => Promise<void>; busy: boolean }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  return (
    <form className="publish-form" onSubmit={(event) => {
      event.preventDefault();
      void onCreate({ name, slug: slug || slugify(name), websiteUrl: websiteUrl || null }).then(() => {
        setName(""); setSlug(""); setWebsiteUrl("");
      });
    }}>
      <label>Company name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="MiniMax" /></label>
      <label>Company slug<input required value={slug || slugify(name)} onChange={(event) => setSlug(event.target.value)} placeholder="minimax" /></label>
      <label>Official website<input type="url" value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://…" /></label>
      <button type="submit" disabled={busy}>Add company</button>
    </form>
  );
}

function ProductForm({ companies, onCreate, busy }: { companies: Company[]; onCreate: (input: Record<string, string | null>) => Promise<void>; busy: boolean }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  return (
    <form className="publish-form" onSubmit={(event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const data = new FormData(event.currentTarget);
      void onCreate({
        company_id: String(data.get("company_id")),
        name,
        slug: slug || slugify(name),
        official_description: String(data.get("official_description")),
        website_url: String(data.get("website_url")),
        logo_url: String(data.get("logo_url")) || null,
        documentation_url: String(data.get("documentation_url")) || null,
      }).then(() => { setName(""); setSlug(""); form.reset(); });
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

function GalleryForm({ products, sources, onCreate, busy }: { products: Product[]; sources: GallerySource[]; onCreate: (productId: string, sourceUrl: string) => Promise<void>; busy: boolean }) {
  const availableProducts = products.filter((product) => !sources.some((source) => source.product_id === product.id));
  return (
    <form className="publish-form compact" onSubmit={(event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const data = new FormData(event.currentTarget);
      void onCreate(String(data.get("product_id")), String(data.get("source_url"))).then(() => form.reset());
    }}>
      <label>Product<select name="product_id" required defaultValue=""><option value="" disabled>Select product</option>{availableProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
      <label className="wide">Public gallery URL<input name="source_url" type="url" required placeholder="https://…/gallery" /></label>
      <button type="submit" disabled={busy || availableProducts.length === 0}>Connect gallery</button>
    </form>
  );
}

function OutcomeEditor({ outcome, edit, onSave, busy }: { outcome: Outcome; edit: OutcomeEdit | undefined; onSave: (outcomeId: string, values: Record<string, string | null>) => Promise<void>; busy: boolean }) {
  const value = (key: keyof OutcomeEdit, fallback: string | null) => edit?.[key] ?? fallback ?? "";
  return (
    <details className="publish-outcome">
      <summary>
        <span><i>{outcome.status}</i><strong>{value("title", outcome.title) || "Untitled Outcome"}</strong></span>
        <small>{outcome.model || "Model not supplied"}</small>
      </summary>
      <form onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const fields = ["title", "prompt", "result_media_url", "poster_url", "model", "author_name", "author_url", "status"];
        void onSave(outcome.id, Object.fromEntries(fields.map((field) => [field, String(data.get(field) ?? "").trim() || null])));
      }}>
        <a className="publish-source-link" href={outcome.source_url} target="_blank" rel="noreferrer">Open source ↗</a>
        <label>Title<input name="title" defaultValue={value("title", outcome.title)} /></label>
        <label className="wide">Exact prompt<textarea name="prompt" rows={7} defaultValue={value("prompt", outcome.prompt)} /></label>
        <label>Result media URL<input name="result_media_url" type="url" defaultValue={value("result_media_url", outcome.result_media_url)} /></label>
        <label>Poster URL<input name="poster_url" type="url" defaultValue={value("poster_url", outcome.poster_url)} /></label>
        <label>Model<input name="model" defaultValue={value("model", outcome.model)} /></label>
        <label>Author name<input name="author_name" defaultValue={value("author_name", outcome.author_name)} /></label>
        <label>Author URL<input name="author_url" type="url" defaultValue={value("author_url", outcome.author_url)} /></label>
        <label>Status<select name="status" defaultValue={outcome.status}><option value="draft">Draft</option><option value="ready">Ready</option><option value="published">Published</option><option value="excluded">Excluded</option></select></label>
        <button type="submit" disabled={busy}>Save Outcome</button>
      </form>
    </details>
  );
}

export function PublishPage() {
  const client = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null | undefined>();
  const [access, setAccess] = useState<"loading" | "granted" | "denied">("loading");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sources, setSources] = useState<GallerySource[]>([]);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [edits, setEdits] = useState<OutcomeEdit[]>([]);

  const refresh = useCallback(async () => {
    if (!client || !session) return;
    const companyResult = await client.from("companies").select("id,name,slug,website_url,verification_status").order("name");
    if (companyResult.error) throw companyResult.error;
    // SAFETY: the select list above exactly matches the local Company record.
    const nextCompanies = (companyResult.data ?? []) as Company[];
    setCompanies(nextCompanies);

    const companyIds = nextCompanies.map(({ id }) => id);
    const productResult = companyIds.length
      ? await client.from("products").select("id,company_id,name,slug,official_description,logo_url,website_url,documentation_url,status").in("company_id", companyIds).order("name")
      : { data: [], error: null };
    if (productResult.error) throw productResult.error;
    // SAFETY: the select list above exactly matches the local Product record.
    const nextProducts = (productResult.data ?? []) as Product[];
    setProducts(nextProducts);

    const productIds = nextProducts.map(({ id }) => id);
    if (productIds.length === 0) {
      setSources([]); setOutcomes([]); setEdits([]); return;
    }
    const [sourceResult, outcomeResult] = await Promise.all([
      client.from("gallery_sources").select("id,product_id,source_url,status,last_error").in("product_id", productIds).order("created_at"),
      client.from("outcomes").select("id,product_id,source_url,title,prompt,result_media_url,poster_url,model,author_name,author_url,status").in("product_id", productIds).order("discovered_at", { ascending: false }),
    ]);
    if (sourceResult.error) throw sourceResult.error;
    if (outcomeResult.error) throw outcomeResult.error;
    // SAFETY: both select lists above exactly match their local records.
    const nextOutcomes = (outcomeResult.data ?? []) as Outcome[];
    // SAFETY: the gallery source select list above exactly matches GallerySource.
    const nextSources = (sourceResult.data ?? []) as GallerySource[];
    setSources(nextSources);
    setOutcomes(nextOutcomes);

    const outcomeIds = nextOutcomes.map(({ id }) => id);
    if (outcomeIds.length === 0) { setEdits([]); return; }
    const editResult = await client.from("outcome_edits").select("outcome_id,title,prompt,result_media_url,poster_url,model,author_name,author_url").in("outcome_id", outcomeIds);
    if (editResult.error) throw editResult.error;
    // SAFETY: the select list above exactly matches the local OutcomeEdit record.
    setEdits((editResult.data ?? []) as OutcomeEdit[]);
  }, [client, session]);

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
      try { await refresh(); } catch (loadError) { setNotice({ tone: "error", text: loadError instanceof Error ? loadError.message : String(loadError) }); }
    });
  }, [client, refresh, session]);

  async function run(action: () => Promise<void>, success: string) {
    setBusy(true); setNotice(null);
    try { await action(); await refresh(); setNotice({ tone: "success", text: success }); }
    catch (error) { setNotice({ tone: "error", text: error instanceof Error ? error.message : String(error) }); }
    finally { setBusy(false); }
  }

  async function signIn(email: string) {
    if (!client) return;
    setBusy(true); setNotice(null);
    const redirectTo = `${window.location.origin}/publish/`;
    const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    setBusy(false);
    setNotice(error ? { tone: "error", text: error.message } : { tone: "success", text: "Check your email for the private sign-in link." });
  }

  if (!client) return <SiteShell className="publish-page"><section className="publish-access-card"><span className="publish-kicker">SETUP REQUIRED</span><h1>Publisher workspace</h1><p>Add the public Supabase URL and publishable key to the ignored workspace environment file.</p></section></SiteShell>;
  if (session === undefined) return <SiteShell className="publish-page"><p className="publish-loading">Loading publisher workspace…</p></SiteShell>;
  if (!session) return <SiteShell className="publish-page"><SignInPanel onSubmit={signIn} busy={busy} notice={notice} /></SiteShell>;
  if (access !== "granted") return <SiteShell className="publish-page"><section className="publish-access-card"><span className="publish-kicker">{access === "loading" ? "CHECKING ACCESS" : "ACCESS DENIED"}</span><h1>{access === "loading" ? "Opening workspace…" : "This workspace is private"}</h1><NoticeLine notice={notice} /><button type="button" onClick={() => void client.auth.signOut()}>Sign out</button></section></SiteShell>;

  return (
    <SiteShell className="publish-page">
      <section className="publish-workspace">
        <header className="publish-heading">
          <div><span className="publish-kicker">POSSIBLE / PUBLISH</span><h1>Gallery onboarding</h1><p>Add the source once. Extracted Outcomes stay private until you review and publish them.</p></div>
          <button type="button" onClick={() => void client.auth.signOut()}>Sign out</button>
        </header>
        <NoticeLine notice={notice} />

        <section className="publish-step"><header><span>01</span><div><h2>Companies</h2><p>One account can manage any number of companies.</p></div></header><CompanyForm busy={busy} onCreate={(input) => run(async () => { const { error } = await client.rpc("create_company", { company_name: input.name, company_slug: input.slug, company_website_url: input.websiteUrl }); if (error) throw error; }, "Company added.")} />
          <div className="publish-chips">{companies.map((company) => <span key={company.id}>{company.name}<i>{company.verification_status}</i></span>)}</div>
        </section>

        <section className="publish-step"><header><span>02</span><div><h2>Products</h2><p>Use the product’s official description and links. Possible does not rewrite them.</p></div></header><ProductForm companies={companies} busy={busy} onCreate={(input) => run(async () => { const { error } = await client.from("products").insert(input); if (error) throw error; }, "Product added.")} />
          <div className="publish-records">{products.map((product) => <article key={product.id}><div><strong>{product.name}</strong><span>{companies.find(({ id }) => id === product.company_id)?.name}</span></div><a href={product.website_url} target="_blank" rel="noreferrer">Official site ↗</a><button type="button" disabled={busy} onClick={() => void run(async () => { const status = product.status === "published" ? "draft" : "published"; const { error } = await client.from("products").update({ status }).eq("id", product.id); if (error) throw error; }, product.status === "published" ? "Product returned to draft." : "Product published.")}>{product.status}</button></article>)}</div>
        </section>

        <section className="publish-step"><header><span>03</span><div><h2>Gallery sources</h2><p>Connect one public gallery URL per product. The importer records source-backed drafts for review.</p></div></header><GalleryForm products={products} sources={sources} busy={busy} onCreate={(productId, sourceUrl) => run(async () => { const { error } = await client.from("gallery_sources").insert({ product_id: productId, source_url: sourceUrl }); if (error) throw error; }, "Gallery connected. Run $gallery-import on this URL to prepare its draft records.")} />
          <div className="publish-records">{sources.map((source) => <article key={source.id}><div><strong>{products.find(({ id }) => id === source.product_id)?.name}</strong><span>{source.status}</span></div><a href={source.source_url} target="_blank" rel="noreferrer">Open gallery ↗</a><label className="publish-import">Import JSON<input type="file" accept="application/json,.json" disabled={busy} onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (!file) return;
            void run(async () => {
              const importDocument: unknown = JSON.parse(await file.text());
              const { data, error } = await client.rpc("import_gallery_draft", { target_gallery_source_id: source.id, import_document: importDocument });
              if (error) throw error;
              setNotice({ tone: "success", text: `${String(data)} draft Outcome${data === 1 ? "" : "s"} imported.` });
            }, "Gallery draft imported.");
            event.currentTarget.value = "";
          }} /></label></article>)}</div>
        </section>

        <section className="publish-step"><header><span>04</span><div><h2>Outcome review</h2><p>Correct incomplete extraction here. Publishing requires a title, exact prompt, and result media.</p></div></header>
          {outcomes.length ? <div className="publish-outcomes">{outcomes.map((outcome) => <OutcomeEditor key={outcome.id} outcome={outcome} edit={edits.find(({ outcome_id }) => outcome_id === outcome.id)} busy={busy} onSave={(outcomeId, values) => run(async () => {
            const { status, ...overrides } = values;
            const editPayload = { ...overrides, outcome_id: outcomeId, updated_by: session.user.id };
            const { error: editError } = await client.from("outcome_edits").upsert(editPayload, { onConflict: "outcome_id" });
            if (editError) throw editError;
            const { error: outcomeError } = await client.from("outcomes").update({ status }).eq("id", outcomeId);
            if (outcomeError) throw outcomeError;
          }, "Outcome saved.")} />)}</div> : <div className="publish-empty"><strong>No imported Outcomes yet.</strong><span>Connect a gallery, run <code>$gallery-import</code>, then load its reviewed JSON into the draft queue.</span></div>}
        </section>
      </section>
    </SiteShell>
  );
}
