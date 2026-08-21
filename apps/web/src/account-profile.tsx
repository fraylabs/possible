"use client";

import { useEffect, useMemo, useState } from "react";
import type { OutcomeCatalogEntry } from "@possible/catalog";
import { getPublishedOutcome, publishedOutcomes } from "./public-content";
import { SiteShell } from "./shared";
import { getSupabaseBrowserClient } from "./supabase";

type ProfileTab = "outcomes" | "products" | "skills";

type PublicAccount = {
  id: string;
  handle: string;
  name: string;
  website_url: string | null;
  avatar_url: string | null;
};

type PublicOutcome = {
  id: string;
  slug: string | null;
  source_url: string;
  title: string;
  summary: string | null;
  prompt: string;
  result_media_url: string;
  poster_url: string | null;
  provider: string | null;
  model: string | null;
};

type PublicProduct = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  company_name: string;
  outcome_count: number;
};

type PublicSkill = {
  id: string;
  name: string;
  repository: string;
  directory: string;
  outcome_count: number;
};

type ProfileData = {
  account: PublicAccount;
  outcomes: PublicOutcome[];
  products: PublicProduct[];
  skills: PublicSkill[];
};

function catalogMedia(entry: OutcomeCatalogEntry) {
  const preview = entry.outcome.preview;
  const image = preview?.images?.find(({ cover }) => cover) ?? preview?.images?.[0];
  return {
    result: preview?.video?.src ?? image?.src ?? preview?.audio?.src ?? preview?.cad?.preview ?? preview?.cad?.poster ?? "",
    poster: preview?.video?.poster ?? image?.src ?? preview?.audio?.poster ?? preview?.cad?.poster ?? null,
  };
}

function staticProfile(handle: string): ProfileData {
  const outcomes = publishedOutcomes.map((entry) => {
    const media = catalogMedia(entry);
    return {
      id: `catalog:${entry.slug}`,
      slug: entry.slug,
      source_url: entry.sourceUrl,
      title: entry.outcome.title,
      summary: entry.outcome.summary,
      prompt: entry.outcome.executionPrompt,
      result_media_url: media.result,
      poster_url: media.poster,
      provider: entry.outcome.execution.provider,
      model: entry.outcome.execution.model,
    };
  });
  const products = new Map<string, PublicProduct>();
  const skills = new Map<string, PublicSkill>();
  for (const entry of publishedOutcomes) {
    for (const product of entry.products) {
      const existing = products.get(product.id);
      products.set(product.id, {
        id: product.id,
        slug: product.id.split("/").at(-1) ?? product.id,
        name: product.name,
        logo_url: product.logoUrl,
        company_name: product.company.name,
        outcome_count: (existing?.outcome_count ?? 0) + 1,
      });
    }
    for (const skill of entry.outcome.skills ?? []) {
      const id = `${skill.repository}/${skill.directory}`;
      const existing = skills.get(id);
      skills.set(id, {
        id,
        name: skill.directory.split("/").at(-1) ?? skill.repository,
        repository: skill.repository,
        directory: skill.directory,
        outcome_count: (existing?.outcome_count ?? 0) + 1,
      });
    }
  }
  return {
    account: { id: "catalog:fray-labs", handle, name: "Fray Labs", website_url: "https://github.com/fraylabs", avatar_url: null },
    outcomes,
    products: [...products.values()].sort((a, b) => a.name.localeCompare(b.name)),
    skills: [...skills.values()].sort((a, b) => a.name.localeCompare(b.name)),
  };
}

function isVideo(url: string) {
  return /\.(?:mp4|webm|mov)(?:$|\?)/i.test(url);
}

function AccountOutcomeCard({ outcome, index }: { outcome: PublicOutcome; index: number }) {
  const localEntry = outcome.slug ? getPublishedOutcome(outcome.slug) : undefined;
  const href = localEntry ? `/outcomes/${outcome.slug}` : outcome.source_url;
  const external = !localEntry;
  const visual = outcome.poster_url || (isVideo(outcome.result_media_url) ? outcome.result_media_url : "");
  return (
    <a className="account-outcome-card" href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
      <span className="account-outcome-media">
        {visual ? outcome.poster_url ? <img src={visual} alt="" loading={index < 2 ? "eager" : "lazy"} /> : <video src={visual} muted loop playsInline preload="metadata" /> : <span>OUTCOME</span>}
      </span>
      <span className="account-outcome-copy">
        <small>{String(index + 1).padStart(2, "0")} / OUTCOME <i>↗</i></small>
        <strong>{outcome.title}</strong>
        <span>{outcome.summary ?? "Open the exact prompt and result."}</span>
        <em>{[outcome.provider, outcome.model].filter(Boolean).join(" · ")}</em>
      </span>
    </a>
  );
}

export function AccountProfilePage({ handle }: { handle: string }) {
  const client = useMemo(() => getSupabaseBrowserClient(), []);
  const fallback = useMemo(() => staticProfile(handle), [handle]);
  const [profile, setProfile] = useState<ProfileData>(fallback);
  const [tab, setTab] = useState<ProfileTab>("outcomes");

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    void (async () => {
      const accountResult = await client.from("accounts").select("id,handle,name,website_url,avatar_url").eq("handle", handle).maybeSingle();
      if (accountResult.error || !accountResult.data) return;
      const [outcomeResult, productResult, skillResult] = await Promise.all([
        client.from("outcome_directory").select("id,slug,source_url,title,summary,prompt,result_media_url,poster_url,provider,model").eq("account_handle", handle).eq("attribution_type", "account").order("source_published_at", { ascending: false, nullsFirst: false }),
        client.from("account_product_directory").select("id,slug,name,logo_url,company_name,outcome_count").eq("account_handle", handle).order("name"),
        client.from("account_skill_directory").select("id,name,repository,directory,outcome_count").eq("account_handle", handle).order("name"),
      ]);
      if (cancelled || outcomeResult.error || productResult.error || skillResult.error) return;
      // SAFETY: every assertion below is backed by the corresponding explicit
      // Supabase select list, whose columns match the local public view records.
      setProfile({
        account: accountResult.data as PublicAccount,
        outcomes: (outcomeResult.data ?? []) as PublicOutcome[],
        products: (productResult.data ?? []) as PublicProduct[],
        skills: (skillResult.data ?? []) as PublicSkill[],
      });
    })();
    return () => { cancelled = true; };
  }, [client, handle]);

  return (
    <SiteShell className="account-profile-page">
      <section className="account-profile">
        <header className="account-profile-header">
          <span className="account-avatar">{profile.account.avatar_url ? <img src={profile.account.avatar_url} alt="" /> : profile.account.name.slice(0, 1)}</span>
          <div><h1>{profile.account.name}</h1><p>@{profile.account.handle}</p></div>
          {profile.account.website_url ? <a href={profile.account.website_url} target="_blank" rel="noreferrer">Website ↗</a> : null}
        </header>
        <nav className="account-profile-tabs" aria-label="Account directory">
          {(["outcomes", "products", "skills"] as const).map((value) => <button type="button" key={value} aria-pressed={tab === value} onClick={() => setTab(value)}>{value}<span>{profile[value].length}</span></button>)}
        </nav>
        {tab === "outcomes" ? (
          <section className="account-outcome-grid" aria-label={`${profile.account.name} Outcomes`}>
            {profile.outcomes.map((outcome, index) => <AccountOutcomeCard outcome={outcome} index={index} key={outcome.id} />)}
          </section>
        ) : tab === "products" ? (
          <section className="account-reference-grid" aria-label={`${profile.account.name} Products`}>
            {profile.products.map((product) => <a href={`/products/${product.slug}`} key={product.id}><span>{product.logo_url ? <img src={product.logo_url} alt="" /> : product.name.slice(0, 1)}</span><div><strong>{product.name}</strong><small>By {product.company_name}</small></div><em>{product.outcome_count} {product.outcome_count === 1 ? "Outcome" : "Outcomes"} ↗</em></a>)}
          </section>
        ) : (
          <section className="account-reference-grid" aria-label={`${profile.account.name} Skills`}>
            {profile.skills.map((skill) => <a href={`https://github.com/${skill.repository}/tree/HEAD/${skill.directory}`} target="_blank" rel="noreferrer" key={skill.id}><span>SK</span><div><strong>{skill.name}</strong><small>{skill.repository}/{skill.directory}</small></div><em>{skill.outcome_count} {skill.outcome_count === 1 ? "Outcome" : "Outcomes"} ↗</em></a>)}
          </section>
        )}
      </section>
    </SiteShell>
  );
}
