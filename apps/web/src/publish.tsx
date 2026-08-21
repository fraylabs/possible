"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { CopyButton, SiteShell } from "./shared";
import { getSupabaseBrowserClient } from "./supabase";

type Account = {
  id: string;
  handle: string;
  name: string;
  website_url: string | null;
  avatar_url: string | null;
};

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
  account_id: string;
  product_id: string;
  source_url: string;
  status: "draft" | "scanning" | "review" | "active" | "paused" | "error" | "disconnected";
  last_error: string | null;
};

export type OutcomeReview = {
  id: string;
  account_id: string;
  product_id: string | null;
  gallery_source_id: string | null;
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

type SelectedOutcome = Pick<OutcomeReview, "id" | "is_published" | "is_publishable">;

type AccountSkill = {
  id: string;
  account_id: string;
  name: string;
  repository: string;
  directory: string;
  outcome_count: number;
};

type ListingClaim = {
  id: string;
  account_id: string;
  account_handle: string;
  account_name: string;
  target_type: "company" | "skill";
  company_id: string | null;
  company_name: string | null;
  skill_id: string | null;
  skill_name: string | null;
  proof_method: "dns_txt" | "github_file" | "manual";
  proof_location: string;
  status: "pending" | "claimed";
  token_expires_at: string | null;
  verified_at: string | null;
};

type ClaimChallenge = {
  claimId: string;
  targetType: "company" | "skill";
  proofMethod: "dns_txt" | "github_file";
  proofLocation: string;
  proofValue: string;
  expiresAt: string;
};

type ClaimTransfer = {
  id: string;
  claim_id: string;
  from_account_id: string;
  to_account_id: string;
  status: "pending" | "accepted" | "cancelled";
  created_at: string;
};

type EndorsementOption = { claim: ListingClaim; endorsed: boolean };

type OutcomeFilter = "all" | "published" | "unpublished" | "publishable" | "missing";
type WorkspaceTab = "outcomes" | "products" | "skills" | "sources" | "claims" | "account";
type ViewMode = "grid" | "table";
type Notice = { tone: "success" | "error" | "neutral"; text: string } | null;
type Counts = { all: number; published: number; unpublished: number; publishable: number; missing: number };

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
const EMPTY_COUNTS: Counts = { all: 0, published: 0, unpublished: 0, publishable: 0, missing: 0 };
const workspaceTabs: WorkspaceTab[] = ["outcomes", "products", "skills", "sources", "claims", "account"];

function isWorkspaceTab(value: string): value is WorkspaceTab {
  return workspaceTabs.some((tab) => tab === value);
}

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
  selected: Record<string, SelectedOutcome>;
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
  selected: Record<string, SelectedOutcome>;
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

function OutcomeDrawer({ outcome, busy, endorsementOptions, onClose, onSave, onPublication, onOfficial }: {
  outcome: OutcomeReview;
  busy: boolean;
  endorsementOptions: EndorsementOption[];
  onClose: () => void;
  onSave: (values: Record<string, string | null>) => Promise<void>;
  onPublication: (makePublic: boolean) => void;
  onOfficial: (claimId: string, makeOfficial: boolean) => Promise<void>;
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
        {endorsementOptions.length ? <section className="publish-official-controls"><strong>Publisher approval</strong>{endorsementOptions.map(({ claim, endorsed }) => <div key={claim.id}><span>{claim.company_name ?? claim.skill_name}</span><button type="button" disabled={busy} onClick={() => void onOfficial(claim.id, !endorsed)}>{endorsed ? "Remove official" : "Approve as official"}</button></div>)}</section> : null}
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
  outcomes: SelectedOutcome[];
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

function ClaimTransferForm({ claim, busy, onTransfer }: { claim: ListingClaim; busy: boolean; onTransfer: (claimId: string, handle: string) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [handle, setHandle] = useState("");
  if (!open) return <button type="button" onClick={() => setOpen(true)}>Transfer</button>;
  return (
    <form className="claim-transfer-form" onSubmit={(event) => { event.preventDefault(); void onTransfer(claim.id, handle).then(() => { setHandle(""); setOpen(false); }); }}>
      <input required value={handle} onChange={(event) => setHandle(event.target.value)} placeholder="Receiving account handle" aria-label="Receiving account handle" />
      <button type="submit" disabled={busy}>Send</button>
      <button type="button" onClick={() => setOpen(false)}>Cancel</button>
    </form>
  );
}

function ClaimsPanel({ account, companies, skills, claims, transfers, challenge, requestedTarget, busy, onRequest, onVerify, onTransfer, onAcceptTransfer }: {
  account: Account | null;
  companies: Company[];
  skills: AccountSkill[];
  claims: ListingClaim[];
  transfers: ClaimTransfer[];
  challenge: ClaimChallenge | null;
  requestedTarget: string | null;
  busy: boolean;
  onRequest: (targetType: "company" | "skill", targetId: string) => Promise<void>;
  onVerify: (claimId: string) => Promise<void>;
  onTransfer: (claimId: string, handle: string) => Promise<void>;
  onAcceptTransfer: (transferId: string) => Promise<void>;
}) {
  const [targetType, setTargetType] = useState<"company" | "skill">("company");
  const [targetId, setTargetId] = useState("");
  const options = targetType === "company" ? companies : skills;
  const managedClaims = claims.filter((claim) => claim.account_id === account?.id);

  useEffect(() => {
    if (!requestedTarget) return;
    if (requestedTarget.startsWith("company:")) {
      const company = companies.find(({ slug }) => slug === requestedTarget.slice("company:".length));
      if (company) { setTargetType("company"); setTargetId(company.id); }
      return;
    }
    if (requestedTarget.startsWith("skill:")) {
      const source = requestedTarget.slice("skill:".length);
      const skill = skills.find((item) => `${item.repository}/${item.directory}` === source);
      if (skill) { setTargetType("skill"); setTargetId(skill.id); }
    }
  }, [companies, requestedTarget, skills]);

  return (
    <section className="publish-settings claims-settings">
      <header><span className="publish-kicker">CLAIMS</span><h1>Claims</h1><p>Prove that this account manages a company or Skill. A claim never grants control over anyone else’s Outcomes.</p></header>
      {transfers.some((transfer) => transfer.to_account_id === account?.id && transfer.status === "pending") ? <section className="claim-incoming">
        <strong>Incoming transfers</strong>
        {transfers.filter((transfer) => transfer.to_account_id === account?.id && transfer.status === "pending").map((transfer) => {
          const claim = claims.find(({ id }) => id === transfer.claim_id);
          return <div key={transfer.id}><span>{claim?.company_name ?? claim?.skill_name ?? "Claim"}</span><button type="button" disabled={busy} onClick={() => void onAcceptTransfer(transfer.id)}>Accept</button></div>;
        })}
      </section> : null}
      <form className="claim-request-form" onSubmit={(event) => { event.preventDefault(); if (targetId) void onRequest(targetType, targetId); }}>
        <label>Type<select value={targetType} onChange={(event) => { setTargetType(event.target.value === "skill" ? "skill" : "company"); setTargetId(""); }}><option value="company">Company</option><option value="skill">Skill</option></select></label>
        <label>{targetType === "company" ? "Company" : "Skill"}<select required value={targetId} onChange={(event) => setTargetId(event.target.value)}><option value="" disabled>Select {targetType}</option>{options.map((option) => <option value={option.id} key={option.id}>{option.name}</option>)}</select></label>
        <button type="submit" disabled={busy || !targetId}>Start claim</button>
      </form>

      {challenge ? <section className="claim-challenge" aria-labelledby="claim-challenge-heading">
        <header><div><span className="publish-kicker">VERIFY OWNERSHIP</span><h2 id="claim-challenge-heading">Add one verification record</h2></div><span>EXPIRES {new Date(challenge.expiresAt).toLocaleDateString()}</span></header>
        <div><small>{challenge.proofMethod === "dns_txt" ? "DNS TXT NAME" : "FILE LOCATION"}</small><code>{challenge.proofLocation}</code><CopyButton label="Copy location" value={challenge.proofLocation} /></div>
        <div><small>{challenge.proofMethod === "dns_txt" ? "DNS TXT VALUE" : "FILE CONTENT"}</small><code>{challenge.proofValue}</code><CopyButton label="Copy verification value" value={challenge.proofValue} /></div>
        <footer><p>{challenge.proofMethod === "dns_txt" ? "Add the TXT record at the company’s official domain." : "Commit the file inside the exact Skill directory on the repository’s default branch."}</p><button type="button" disabled={busy} onClick={() => void onVerify(challenge.claimId)}>Verify now</button></footer>
      </section> : null}

      <div className="claims-list">
        <header><span>Listing</span><span>Proof</span><span>Status</span><span /></header>
        {managedClaims.map((claim) => <article key={claim.id}>
          <div><strong>{claim.company_name ?? claim.skill_name}</strong><small>{claim.target_type}</small></div>
          <code>{claim.proof_location}</code>
          <span className={`claim-status is-${claim.status}`}>{claim.status}</span>
          <div>{claim.status === "pending" ? <button type="button" disabled={busy} onClick={() => void onVerify(claim.id)}>Verify</button> : <ClaimTransferForm claim={claim} busy={busy} onTransfer={onTransfer} />}</div>
        </article>)}
        {!managedClaims.length ? <p>No claims yet.</p> : null}
      </div>
    </section>
  );
}

export function DashboardPage() {
  const client = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null | undefined>();
  const [access, setAccess] = useState<"loading" | "granted" | "denied">("loading");
  const [busy, setBusy] = useState(false);
  const [loadingOutcomes, setLoadingOutcomes] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sources, setSources] = useState<GallerySource[]>([]);
  const [skills, setSkills] = useState<AccountSkill[]>([]);
  const [claims, setClaims] = useState<ListingClaim[]>([]);
  const [claimTransfers, setClaimTransfers] = useState<ClaimTransfer[]>([]);
  const [claimChallenge, setClaimChallenge] = useState<ClaimChallenge | null>(null);
  const [requestedClaimTarget, setRequestedClaimTarget] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [outcomes, setOutcomes] = useState<OutcomeReview[]>([]);
  const [counts, setCounts] = useState<Counts>(EMPTY_COUNTS);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("outcomes");
  const [filter, setFilter] = useState<OutcomeFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selecting, setSelecting] = useState(false);
  const [selectingAll, setSelectingAll] = useState(false);
  const [selected, setSelected] = useState<Record<string, SelectedOutcome>>({});
  const [openOutcome, setOpenOutcome] = useState<OutcomeReview | null>(null);
  const [endorsementOptions, setEndorsementOptions] = useState<EndorsementOption[]>([]);
  const [confirmation, setConfirmation] = useState<{ makePublic: boolean; outcomes: SelectedOutcome[] } | null>(null);
  const [importReceipt, setImportReceipt] = useState<ImportReceipt | null>(null);

  const selectedAccount = accounts.find(({ id }) => id === selectedAccountId) ?? null;
  const selectedSource = sources.find(({ product_id }) => product_id === selectedProductId) ?? null;
  const selectedOutcomes = Object.values(selected);
  const selectedHasIncomplete = selectedOutcomes.some((outcome) => !outcome.is_publishable);
  const allPageOutcomesSelected = outcomes.length > 0 && outcomes.every((outcome) => Boolean(selected[outcome.id]));
  const allMatchingOutcomesSelected = filteredTotal > 0 && selectedOutcomes.length === filteredTotal;

  const refreshMetadata = useCallback(async () => {
    if (!client || !session) return;
    const membershipResult = await client.from("account_members").select("account_id").eq("user_id", session.user.id);
    if (membershipResult.error) throw membershipResult.error;
    const accountIds = (membershipResult.data ?? []).map(({ account_id }: { account_id: string }) => account_id);
    const accountResult = accountIds.length
      ? await client.from("accounts").select("id,handle,name,website_url,avatar_url").in("id", accountIds).order("name")
      : { data: [], error: null };
    if (accountResult.error) throw accountResult.error;
    // SAFETY: the explicit accounts select list matches the Account record.
    const nextAccounts = (accountResult.data ?? []) as Account[];
    setAccounts(nextAccounts);
    const nextAccountId = selectedAccountId && nextAccounts.some(({ id }) => id === selectedAccountId) ? selectedAccountId : nextAccounts[0]?.id ?? "";
    setSelectedAccountId(nextAccountId);

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
    setSelectedProductId((current) => current && nextProducts.some(({ id }) => id === current) ? current : "");
    const productIds = nextProducts.map(({ id }) => id);
    if (!productIds.length || !nextAccountId) setSources([]);
    else {
      const sourceResult = await client.from("gallery_sources").select("id,account_id,product_id,source_url,status,last_error").eq("account_id", nextAccountId).in("product_id", productIds).order("created_at");
      if (sourceResult.error) throw sourceResult.error;
      // SAFETY: the explicit gallery_sources select list matches GallerySource.
      setSources((sourceResult.data ?? []) as GallerySource[]);
    }

    if (!nextAccountId) setSkills([]);
    else {
      const skillResult = await client.from("account_skill_directory").select("id,account_id,name,repository,directory,outcome_count").eq("account_id", nextAccountId).order("name");
      if (skillResult.error) throw skillResult.error;
      // SAFETY: the explicit account_skill_directory select list matches AccountSkill.
      setSkills((skillResult.data ?? []) as AccountSkill[]);
    }

    if (!nextAccountId) { setClaims([]); setClaimTransfers([]); }
    else {
      const claimResult = await client.from("listing_claim_directory").select("id,account_id,account_handle,account_name,target_type,company_id,company_name,skill_id,skill_name,proof_method,proof_location,status,token_expires_at,verified_at").or(`account_id.eq.${nextAccountId},status.eq.claimed`).order("created_at", { ascending: false });
      // The UI remains compatible until the additive claims migration is deployed.
      if (!claimResult.error) {
        // SAFETY: the explicit listing_claim_directory select list matches ListingClaim.
        setClaims((claimResult.data ?? []) as ListingClaim[]);
      }
      const transferResult = await client.from("claim_transfers").select("id,claim_id,from_account_id,to_account_id,status,created_at").or(`from_account_id.eq.${nextAccountId},to_account_id.eq.${nextAccountId}`).eq("status", "pending").order("created_at", { ascending: false });
      if (!transferResult.error) {
        // SAFETY: the explicit claim_transfers select list matches ClaimTransfer.
        setClaimTransfers((transferResult.data ?? []) as ClaimTransfer[]);
      }
    }
  }, [client, selectedAccountId, session]);

  const refreshOutcomes = useCallback(async () => {
    if (!client || !session || !selectedAccountId) { setOutcomes([]); setCounts(EMPTY_COUNTS); setFilteredTotal(0); return; }
    setLoadingOutcomes(true);
    try {
      let productOutcomeIds: string[] | null = null;
      if (selectedProductId) {
        const linkResult = await client.from("outcome_products").select("outcome_id").eq("product_id", selectedProductId);
        if (linkResult.error) throw linkResult.error;
        productOutcomeIds = (linkResult.data ?? []).map(({ outcome_id }: { outcome_id: string }) => outcome_id);
        if (!productOutcomeIds.length) {
          setOutcomes([]); setCounts(EMPTY_COUNTS); setFilteredTotal(0); return;
        }
      }
      const baseCount = () => {
        let query = client.from("outcome_review").select("id", { count: "exact", head: true }).eq("account_id", selectedAccountId);
        if (productOutcomeIds) query = query.in("id", productOutcomeIds);
        return query;
      };
      const [allResult, publishedResult, unpublishedResult, publishableResult, missingResult] = await Promise.all([
        baseCount(), baseCount().eq("is_published", true), baseCount().eq("is_published", false), baseCount().eq("is_publishable", true), baseCount().eq("is_publishable", false),
      ]);
      const countError = [allResult, publishedResult, unpublishedResult, publishableResult, missingResult].find(({ error }) => error)?.error;
      if (countError) throw countError;
      setCounts({ all: allResult.count ?? 0, published: publishedResult.count ?? 0, unpublished: unpublishedResult.count ?? 0, publishable: publishableResult.count ?? 0, missing: missingResult.count ?? 0 });

      let query = client.from("outcome_review").select("id,account_id,product_id,gallery_source_id,source_key,source_url,title,prompt,result_media_url,poster_url,model,author_name,author_url,status,is_published,is_publishable,missing_fields,discovered_at,has_editorial_edits", { count: "exact" }).eq("account_id", selectedAccountId);
      if (productOutcomeIds) query = query.in("id", productOutcomeIds);
      if (filter === "published") query = query.eq("is_published", true);
      if (filter === "unpublished") query = query.eq("is_published", false);
      if (filter === "publishable") query = query.eq("is_publishable", true);
      if (filter === "missing") query = query.eq("is_publishable", false);
      const safeSearch = sanitizeSearch(search);
      if (safeSearch) query = query.or(`title.ilike.%${safeSearch}%,prompt.ilike.%${safeSearch}%,author_name.ilike.%${safeSearch}%,model.ilike.%${safeSearch}%`);
      const pageStart = (page - 1) * PAGE_SIZE;
      const result = await query.order("discovered_at", { ascending: false }).range(pageStart, pageStart + PAGE_SIZE - 1);
      if (result.error) throw result.error;
      const nextTotal = result.count ?? 0;
      const nextPageCount = Math.max(1, Math.ceil(nextTotal / PAGE_SIZE));
      setFilteredTotal(nextTotal);
      if (page > nextPageCount) { setPage(nextPageCount); return; }
      // SAFETY: the explicit outcome_review select list matches OutcomeReview.
      setOutcomes((result.data ?? []) as OutcomeReview[]);
    } finally {
      setLoadingOutcomes(false);
    }
  }, [client, filter, page, search, selectedAccountId, selectedProductId, session]);

  useEffect(() => {
    if (!client) { setSession(null); return; }
    void client.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = client.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, [client]);

  useEffect(() => {
    if (!client || !session) return;
    setAccess("loading");
    void (async () => {
      const membershipResult = await client.from("account_members").select("account_id", { count: "exact", head: true }).eq("user_id", session.user.id);
      if (membershipResult.error) { setAccess("denied"); setNotice({ tone: "error", text: membershipResult.error.message }); return; }
      if ((membershipResult.count ?? 0) === 0) {
        const claimResult = await client.rpc("claim_first_platform_admin");
        if (claimResult.error) { setAccess("denied"); setNotice({ tone: "error", text: "This sign-in does not belong to a Possible account." }); return; }
      }
      setAccess("granted");
      try { await refreshMetadata(); } catch (loadError) { setNotice({ tone: "error", text: loadError instanceof Error ? loadError.message : String(loadError) }); }
    })();
  }, [client, refreshMetadata, session]);

  useEffect(() => { if (access === "granted") void refreshOutcomes().catch((error: Error) => setNotice({ tone: "error", text: error.message })); }, [access, refreshOutcomes]);
  useEffect(() => { const timer = window.setTimeout(() => { setPage(1); setSearch(searchInput); }, 250); return () => window.clearTimeout(timer); }, [searchInput]);
  useEffect(() => { const saved = window.localStorage?.getItem("possible-publish-view"); if (saved === "table") setViewMode("table"); }, []);
  useEffect(() => {
    const parameters = new URL(window.location.href).searchParams;
    const requestedTab = parameters.get("tab");
    setRequestedClaimTarget(parameters.get("target"));
    if (requestedTab && isWorkspaceTab(requestedTab)) setWorkspaceTab(requestedTab);
  }, []);
  useEffect(() => { setSelected({}); setSelecting(false); setOpenOutcome(null); setPage(1); }, [selectedAccountId, selectedProductId]);
  useEffect(() => { setSelected({}); }, [filter, search]);
  useEffect(() => {
    if (!client || !openOutcome || !selectedAccountId) { setEndorsementOptions([]); return; }
    let cancelled = false;
    void (async () => {
      const managedClaims = claims.filter((claim) => claim.account_id === selectedAccountId && claim.status === "claimed");
      if (!managedClaims.length) { setEndorsementOptions([]); return; }
      const [productLinks, skillLinks] = await Promise.all([
        client.from("outcome_products").select("product_id").eq("outcome_id", openOutcome.id),
        client.from("outcome_skills").select("skill_id").eq("outcome_id", openOutcome.id),
      ]);
      if (productLinks.error || skillLinks.error || cancelled) return;
      const linkedProductIds = (productLinks.data ?? []).map(({ product_id }: { product_id: string }) => product_id);
      const linkedCompanyIds = new Set(products.filter(({ id }) => linkedProductIds.includes(id)).map(({ company_id }) => company_id));
      const linkedSkillIds = new Set((skillLinks.data ?? []).map(({ skill_id }: { skill_id: string }) => skill_id));
      const eligible = managedClaims.filter((claim) => claim.company_id ? linkedCompanyIds.has(claim.company_id) : claim.skill_id ? linkedSkillIds.has(claim.skill_id) : false);
      if (!eligible.length) { setEndorsementOptions([]); return; }
      const endorsementResult = await client.from("outcome_endorsements").select("claim_id").eq("outcome_id", openOutcome.id).in("claim_id", eligible.map(({ id }) => id));
      if (endorsementResult.error || cancelled) return;
      const endorsed = new Set((endorsementResult.data ?? []).map(({ claim_id }: { claim_id: string }) => claim_id));
      setEndorsementOptions(eligible.map((claim) => ({ claim, endorsed: endorsed.has(claim.id) })));
    })();
    return () => { cancelled = true; };
  }, [claims, client, openOutcome, products, selectedAccountId]);

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
    const redirectTo = `${window.location.origin}/dashboard/`;
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

  function toggleCurrentPageSelection() {
    setSelected((current) => {
      const next = { ...current };
      for (const outcome of outcomes) {
        if (allPageOutcomesSelected) delete next[outcome.id];
        else next[outcome.id] = outcome;
      }
      return next;
    });
  }

  async function selectAllMatchingOutcomes() {
    if (!client || !session || !selectedAccountId || !filteredTotal) return;
    setSelectingAll(true);
    setNotice(null);
    try {
      let productOutcomeIds: string[] | null = null;
      if (selectedProductId) {
        const linkResult = await client.from("outcome_products").select("outcome_id").eq("product_id", selectedProductId);
        if (linkResult.error) throw linkResult.error;
        productOutcomeIds = (linkResult.data ?? []).map(({ outcome_id }: { outcome_id: string }) => outcome_id);
      }
      const matching: SelectedOutcome[] = [];
      const batchSize = 1000;
      for (let offset = 0; offset < filteredTotal; offset += batchSize) {
        let query = client.from("outcome_review").select("id,is_published,is_publishable").eq("account_id", selectedAccountId);
        if (productOutcomeIds) query = query.in("id", productOutcomeIds);
        if (filter === "published") query = query.eq("is_published", true);
        if (filter === "unpublished") query = query.eq("is_published", false);
        if (filter === "publishable") query = query.eq("is_publishable", true);
        if (filter === "missing") query = query.eq("is_publishable", false);
        const safeSearch = sanitizeSearch(search);
        if (safeSearch) query = query.or(`title.ilike.%${safeSearch}%,prompt.ilike.%${safeSearch}%,author_name.ilike.%${safeSearch}%,model.ilike.%${safeSearch}%`);
        const result = await query.order("id").range(offset, offset + batchSize - 1);
        if (result.error) throw result.error;
        // SAFETY: the explicit select list matches the three fields in SelectedOutcome.
        matching.push(...((result.data ?? []) as SelectedOutcome[]));
      }
      setSelected(Object.fromEntries(matching.map((outcome) => [outcome.id, outcome])));
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : String(error) });
    } finally {
      setSelectingAll(false);
    }
  }

  function requestPublication(makePublic: boolean, chosen: SelectedOutcome[] = selectedOutcomes) {
    if (!chosen.length) return;
    if (makePublic && chosen.some((outcome) => !outcome.is_publishable)) {
      setNotice({ tone: "error", text: "Complete the missing title, prompt, or result media before publishing." });
      return;
    }
    if (makePublic) { void changePublication(true, chosen); return; }
    setConfirmation({ makePublic: false, outcomes: chosen });
  }

  async function changePublication(makePublic: boolean, chosen: SelectedOutcome[]) {
    if (!client || !selectedAccountId) return;
    const changed = await run(async () => {
      const { error } = await client.rpc("set_account_outcome_publication", { target_account_id: selectedAccountId, target_outcome_ids: chosen.map(({ id }) => id), make_public: makePublic });
      if (error) throw error;
    }, `${chosen.length} Outcome${chosen.length === 1 ? "" : "s"} ${makePublic ? "published" : "unpublished"}.`, true);
    if (changed) { setConfirmation(null); setSelected({}); setSelecting(false); setOpenOutcome(null); }
  }

  async function confirmPublication() {
    if (!confirmation) return;
    await changePublication(confirmation.makePublic, confirmation.outcomes);
  }

  async function saveOutcome(outcome: OutcomeReview, values: Record<string, string | null>) {
    if (!client || !session) return;
    const saved = await run(async () => {
      const { error } = await client.from("outcome_edits").upsert({ ...values, outcome_id: outcome.id, updated_by: session.user.id }, { onConflict: "outcome_id" });
      if (error) throw error;
    }, "Outcome saved.", true);
    if (saved) setOpenOutcome(null);
  }

  async function requestListingClaim(targetType: "company" | "skill", targetId: string) {
    if (!client || !selectedAccountId) return;
    setBusy(true); setNotice(null);
    const { data, error } = await client.rpc("request_listing_claim", { target_account_id: selectedAccountId, requested_target_type: targetType, requested_target_id: targetId });
    if (error) setNotice({ tone: "error", text: error.message });
    else {
      // SAFETY: request_listing_claim returns the ClaimChallenge JSON contract defined by the migration.
      setClaimChallenge(data as ClaimChallenge);
      await refreshMetadata();
      setNotice({ tone: "success", text: "Verification record created." });
    }
    setBusy(false);
  }

  async function verifyListingClaim(claimId: string) {
    if (!client) return;
    setBusy(true); setNotice(null);
    const { data, error } = await client.functions.invoke("verify-listing-claim", { body: { claimId } });
    if (error || !data?.verified) setNotice({ tone: "error", text: data?.error ?? error?.message ?? "The verification record was not found yet." });
    else {
      setClaimChallenge(null);
      await refreshMetadata();
      setNotice({ tone: "success", text: "Ownership verified." });
    }
    setBusy(false);
  }

  async function transferListingClaim(claimId: string, handle: string) {
    if (!client) return;
    await run(async () => {
      const { error } = await client.rpc("request_claim_transfer", { target_claim_id: claimId, recipient_handle: handle });
      if (error) throw error;
    }, `Transfer sent to @${handle}.`);
  }

  async function acceptClaimTransfer(transferId: string) {
    if (!client) return;
    await run(async () => {
      const { error } = await client.rpc("accept_claim_transfer", { target_transfer_id: transferId });
      if (error) throw error;
    }, "Claim transfer accepted.");
  }

  async function setOutcomeOfficial(claimId: string, makeOfficial: boolean) {
    if (!client || !openOutcome) return;
    const changed = await run(async () => {
      const { error } = await client.rpc("set_outcome_official", { target_outcome_id: openOutcome.id, target_claim_id: claimId, make_official: makeOfficial });
      if (error) throw error;
    }, makeOfficial ? "Outcome approved as official." : "Official approval removed.");
    if (changed) setEndorsementOptions((current) => current.map((option) => option.claim.id === claimId ? { ...option, endorsed: makeOfficial } : option));
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

  const pageCount = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));
  const firstVisibleOutcome = filteredTotal ? (page - 1) * PAGE_SIZE + 1 : 0;
  const lastVisibleOutcome = Math.min(page * PAGE_SIZE, filteredTotal);
  return (
    <SiteShell className="publish-page" showFooter={false}>
      <section className="publish-workspace">
        <header className="publish-workspace-header">
          <div className="publish-product-switcher">
            {selectedAccount?.avatar_url ? <img src={selectedAccount.avatar_url} alt="" /> : <span>{selectedAccount?.name.slice(0, 1) ?? "P"}</span>}
            <label><small>ACCOUNT</small><select value={selectedAccountId} onChange={(event) => setSelectedAccountId(event.target.value)} aria-label="Account workspace">{accounts.length ? accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>) : <option value="">No accounts</option>}</select></label>
          </div>
          <nav className="publish-workspace-tabs" aria-label="Publisher workspace">{(["outcomes", "products", "skills", "sources", "claims", "account"] as const).map((tab) => <button className={workspaceTab === tab ? "active" : ""} type="button" onClick={() => { setWorkspaceTab(tab); const url = new URL(window.location.href); url.searchParams.set("tab", tab); window.history.replaceState(window.history.state, "", url); }} key={tab}>{tab}</button>)}</nav>
          <button className="publish-signout" type="button" onClick={() => void client.auth.signOut()}>Sign out</button>
        </header>
        <NoticeLine notice={notice} />

        {workspaceTab === "outcomes" ? (
          <section className="publish-review-workspace">
            <header className="publish-review-heading">
              <div><h1>Outcomes</h1><p>{counts.all.toLocaleString()} imported · {counts.published.toLocaleString()} published</p></div>
              <div>
                <label className="publish-product-filter"><span>PRODUCT</span><select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)} aria-label="Filter Outcomes by Product"><option value="">All Outcomes</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
                {selectedSource ? <label className="publish-import-button">Import JSON<input type="file" accept="application/json,.json" disabled={busy} onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) void importGallery(file, selectedSource); event.currentTarget.value = ""; }} /></label> : null}
                <button type="button" className={selecting ? "active" : ""} onClick={() => { setSelecting((value) => !value); setSelected({}); }}>{selecting ? "Cancel" : "Select"}</button>
              </div>
            </header>

            <div className="publish-review-toolbar">
              <label className="publish-search"><span aria-hidden="true">⌕</span><input type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search title, prompt, creator, or model" aria-label="Search imported Outcomes" /></label>
              <div className="publish-filters" role="group" aria-label="Filter Outcomes">{(["all", "published", "unpublished", "publishable", "missing"] as const).map((value) => <button key={value} type="button" className={filter === value ? "active" : ""} onClick={() => { setFilter(value); setPage(1); }}>{value === "all" ? "All" : value === "missing" ? "Missing info" : value}<span>{counts[value]}</span></button>)}</div>
              <div className="publish-view-toggle" role="group" aria-label="Outcome view"><button type="button" className={viewMode === "grid" ? "active" : ""} aria-label="Gallery view" onClick={() => setView("grid")}>▦</button><button type="button" className={viewMode === "table" ? "active" : ""} aria-label="Table view" onClick={() => setView("table")}>☷</button></div>
            </div>

            {filteredTotal ? <div className="publish-page-position"><span>Showing <strong>{firstVisibleOutcome}–{lastVisibleOutcome}</strong> of {filteredTotal}</span><nav className="publish-pagination" aria-label="Outcome pages"><button type="button" disabled={page === 1 || loadingOutcomes} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button><span>Page <strong>{page}</strong> of {pageCount}</span><button type="button" disabled={page === pageCount || loadingOutcomes} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Next</button></nav></div> : null}
            {outcomes.length ? viewMode === "grid" ? <OutcomeGrid outcomes={outcomes} selecting={selecting} selected={selected} onActivate={activateOutcome} /> : <OutcomeTable outcomes={outcomes} selecting={selecting} selected={selected} onActivate={activateOutcome} /> : <div className="publish-empty"><strong>{loadingOutcomes ? "Loading Outcomes…" : "No Outcomes found."}</strong><span>{search || filter !== "all" ? "Try another search or filter." : "Connect a gallery and import its extracted JSON."}</span></div>}
          </section>
        ) : workspaceTab === "products" ? (
          <section className="publish-settings">
            <header><span className="publish-kicker">PRODUCTS</span><h1>Products</h1><p>Manage the companies and official Products that Outcomes can reference.</p></header>
            <details><summary><span><strong>Companies</strong><small>{companies.length} connected</small></span><i>+</i></summary><div><CompanyForm busy={busy} onCreate={(input) => run(async () => { const { error } = await client.rpc("create_company", { company_name: input.name, company_slug: input.slug, company_website_url: input.websiteUrl }); if (error) throw error; }, "Company added.")} /><div className="publish-settings-records">{companies.map((company) => <span key={company.id}><strong>{company.name}</strong><small>{company.website_url ?? company.slug}</small></span>)}</div></div></details>
            <details><summary><span><strong>Products</strong><small>{products.length} connected</small></span><i>+</i></summary><div><ProductForm companies={companies} busy={busy} onCreate={(input) => run(async () => { const { error } = await client.from("products").insert(input); if (error) throw error; }, "Product added.")} /><div className="publish-settings-records">{products.map((product) => <span key={product.id}><strong>{product.name}</strong><small>{companies.find(({ id }) => id === product.company_id)?.name} · {product.status === "published" ? "Public" : "Private"}</small></span>)}</div></div></details>
          </section>
        ) : workspaceTab === "skills" ? (
          <section className="publish-settings">
            <header><span className="publish-kicker">SKILLS</span><h1>Skills</h1><p>Skills are linked capabilities, not Outcome owners. This list is derived from the published Outcomes in this account.</p></header>
            <div className="publish-directory-list">{skills.map((skill) => <a href={`https://github.com/${skill.repository}/tree/HEAD/${skill.directory}`} target="_blank" rel="noreferrer" key={skill.id}><span><strong>{skill.name}</strong><small>{skill.repository}/{skill.directory}</small></span><em>{skill.outcome_count} {skill.outcome_count === 1 ? "Outcome" : "Outcomes"} ↗</em></a>)}</div>
          </section>
        ) : workspaceTab === "sources" ? (
          <section className="publish-settings">
            <header><span className="publish-kicker">SOURCES</span><h1>Gallery sources</h1><p>Connect a Product’s public gallery, then import extracted results into this account for review.</p></header>
            <GalleryForm products={products} sources={sources} busy={busy} onCreate={(productId, sourceUrl) => run(async () => { const { error } = await client.from("gallery_sources").insert({ account_id: selectedAccountId, product_id: productId, source_url: sourceUrl }); if (error) throw error; }, "Gallery connected.")} />
            <div className="publish-settings-records">{sources.map((source) => <span key={source.id}><strong>{products.find(({ id }) => id === source.product_id)?.name}</strong><a href={source.source_url} target="_blank" rel="noreferrer">{source.source_url} ↗</a></span>)}</div>
          </section>
        ) : workspaceTab === "claims" ? (
          <ClaimsPanel account={selectedAccount} companies={companies} skills={skills} claims={claims} transfers={claimTransfers} challenge={claimChallenge} requestedTarget={requestedClaimTarget} busy={busy} onRequest={requestListingClaim} onVerify={verifyListingClaim} onTransfer={transferListingClaim} onAcceptTransfer={acceptClaimTransfer} />
        ) : (
          <section className="publish-settings">
            <header><span className="publish-kicker">ACCOUNT</span><h1>{selectedAccount?.name ?? "Account"}</h1><p>This public identity owns the Outcomes in this workspace. Products and Skills remain linked attribution.</p></header>
            {selectedAccount ? <form className="publish-form" key={selectedAccount.id} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void run(async () => { const { error } = await client.from("accounts").update({ name: String(data.get("name")), handle: String(data.get("handle")), website_url: String(data.get("website_url")) || null }).eq("id", selectedAccount.id); if (error) throw error; }, "Account updated."); }}>
              <label>Public name<input name="name" required defaultValue={selectedAccount.name} /></label>
              <label>Handle<input name="handle" required defaultValue={selectedAccount.handle} /></label>
              <label>Website<input name="website_url" type="url" defaultValue={selectedAccount.website_url ?? ""} /></label>
              <button type="submit" disabled={busy}>Save account</button>
            </form> : null}
            {selectedAccount ? <a className="publish-public-profile" href={`/${selectedAccount.handle}`}>Open public profile <span>↗</span></a> : null}
          </section>
        )}
      </section>

      {workspaceTab === "outcomes" && selecting ? <div className="publish-selection-bar" aria-live="polite"><strong>{selectedOutcomes.length} selected</strong><button type="button" disabled={!outcomes.length || selectingAll} onClick={toggleCurrentPageSelection}>{allPageOutcomesSelected ? "Clear page" : "Select page"}</button><button type="button" disabled={!filteredTotal || selectingAll} onClick={() => { if (allMatchingOutcomesSelected) setSelected({}); else void selectAllMatchingOutcomes(); }}>{selectingAll ? "Selecting…" : allMatchingOutcomesSelected ? "Clear all" : "Select all"}</button><span /><button type="button" disabled={!selectedOutcomes.length || busy || selectingAll} onClick={() => requestPublication(false, selectedOutcomes)}>Unpublish</button><button className="publish-primary-button" type="button" disabled={!selectedOutcomes.length || busy || selectingAll || selectedHasIncomplete} title={selectedHasIncomplete ? "Complete missing information before publishing" : undefined} onClick={() => void changePublication(true, selectedOutcomes)}>Publish</button></div> : null}
      {openOutcome ? <OutcomeDrawer outcome={openOutcome} busy={busy} endorsementOptions={endorsementOptions} onClose={() => setOpenOutcome(null)} onSave={(values) => saveOutcome(openOutcome, values)} onPublication={(makePublic) => requestPublication(makePublic, [openOutcome])} onOfficial={setOutcomeOfficial} /> : null}
      {confirmation ? <ConfirmationDialog makePublic={confirmation.makePublic} outcomes={confirmation.outcomes} publishedCount={counts.published} busy={busy} onCancel={() => setConfirmation(null)} onConfirm={() => void confirmPublication()} /> : null}
      {importReceipt ? <div className="publish-dialog-layer"><button className="publish-drawer-backdrop" type="button" aria-label="Close import receipt" onClick={() => setImportReceipt(null)} /><ImportReceiptPanel receipt={importReceipt} onClose={() => setImportReceipt(null)} onReviewMissing={() => { setImportReceipt(null); setWorkspaceTab("outcomes"); setFilter("missing"); }} /></div> : null}
    </SiteShell>
  );
}

export const PublishPage = DashboardPage;
