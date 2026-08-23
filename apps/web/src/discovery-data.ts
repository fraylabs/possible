import type { OutcomeCatalogEntry, ProductCategory } from "@possible/catalog";
import {
  outcomeHref,
  productHref,
  publishedOutcomes,
  publishedProducts,
  publishedSkills,
  skillHref,
} from "./public-content";
import { getSupabaseBrowserClient } from "./supabase";

export const outcomeCategories = ["video", "images", "websites", "cad", "slides", "audio", "apps"] as const;
export type OutcomeCategory = (typeof outcomeCategories)[number];
export type DiscoveryView = "gallery" | "list";

export function isOutcomeCategory(value: string | null): value is OutcomeCategory {
  return outcomeCategories.some((category) => category === value);
}

export const outcomeCategoryLabels = {
  video: "Video",
  images: "Images",
  websites: "Websites",
  cad: "CAD",
  slides: "Slides",
  audio: "Audio",
  apps: "Apps",
} as const satisfies Record<OutcomeCategory, string>;

export interface DiscoverySource {
  kind: "product" | "skill";
  id: string;
  name: string;
  owner: string;
  href: string;
  logoUrl?: string;
}

export interface DiscoveryMedia {
  kind: "image" | "video";
  src: string;
  poster?: string;
  alt: string;
  fit: "cover" | "contain";
}

export interface DiscoveryOutcome {
  id: string;
  databaseId?: string;
  slug?: string;
  title: string;
  summary: string;
  prompt: string;
  href: string;
  sourceUrl?: string;
  category: OutcomeCategory;
  source?: DiscoverySource;
  media?: DiscoveryMedia;
  requirements: string[];
  publishedAt?: string;
  catalogNumber: number;
}

export interface WeeklySourceRanking {
  type: "product" | "skill";
  id: string;
  slug: string;
  name: string;
  owner: string;
  logoUrl?: string;
  href: string;
  copies: number;
}

interface PublicOutcomeRow {
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
  author_name: string | null;
  source_published_at: string | null;
  product_id: string | null;
  product_slug: string | null;
  product_name: string | null;
  company_name: string | null;
}

interface LinkedProductRow {
  id: string;
  linked_product_id: string;
  linked_product_slug: string;
  linked_product_name: string;
  linked_company_name: string;
}

interface RankingRow {
  source_type: "product" | "skill";
  source_id: string;
  source_slug: string;
  source_name: string;
  owner_name: string;
  logo_url: string | null;
  href: string;
  copy_count: number | string;
  total_count: number | string;
}

const CATEGORY_ALIASES = new Map<string, OutcomeCategory>([
  ["animation", "video"],
  ["cinematic", "video"],
  ["clip", "video"],
  ["film", "video"],
  ["movie", "video"],
  ["reel", "video"],
  ["video", "video"],
  ["image", "images"],
  ["illustration", "images"],
  ["photo", "images"],
  ["picture", "images"],
  ["portrait", "images"],
  ["landing", "websites"],
  ["site", "websites"],
  ["website", "websites"],
  ["cad", "cad"],
  ["3d", "cad"],
  ["model", "cad"],
  ["printable", "cad"],
  ["step", "cad"],
  ["stl", "cad"],
  ["deck", "slides"],
  ["powerpoint", "slides"],
  ["presentation", "slides"],
  ["slide", "slides"],
  ["bgm", "audio"],
  ["music", "audio"],
  ["song", "audio"],
  ["soundtrack", "audio"],
  ["app", "apps"],
  ["application", "apps"],
  ["game", "apps"],
]);

function productCategoryToOutcomeCategory(category: ProductCategory | undefined): OutcomeCategory | undefined {
  if (category === "video") return "video";
  if (category === "audio") return "audio";
  if (category === "3d" || category === "robotics") return "cad";
  return undefined;
}

function inferCategory(text: string, mediaUrl = "", productCategory?: ProductCategory): OutcomeCategory {
  const normalized = `${text} ${mediaUrl}`.toLowerCase();
  const explicitChecks: Array<[OutcomeCategory, RegExp]> = [
    ["slides", /\b(powerpoint|presentation|slide|slides|deck|pptx)\b/],
    ["audio", /\b(audio|bgm|music|song|soundtrack|strudel|wav)\b/],
    ["cad", /\b(cad|step|stl|3mf|3d[ -]?print|parametric|solid model)\b/],
    ["websites", /\b(website|landing page|web page|web app)\b/],
    ["apps", /\b(app|application|browser game|mobile game)\b/],
  ];
  for (const [category, pattern] of explicitChecks) if (pattern.test(normalized)) return category;
  const fromProduct = productCategoryToOutcomeCategory(productCategory);
  if (fromProduct) return fromProduct;
  if (/\b(image|illustration|photo|picture|portrait)\b/.test(normalized)) return "images";
  if (/\b(video|film|animation|cinematic|reel|clip)\b/.test(normalized)) return "video";
  if (/\.(mp4|mov|webm)(?:$|\?)/.test(normalized)) return "video";
  if (/\.(wav|mp3|m4a|ogg)(?:$|\?)/.test(normalized)) return "audio";
  if (/\.(step|stp|stl|3mf|glb|gltf)(?:$|\?)/.test(normalized)) return "cad";
  if (/\.(png|jpe?g|webp|gif|avif)(?:$|\?)/.test(normalized)) return "images";
  return "apps";
}

function localSource(entry: OutcomeCatalogEntry): DiscoverySource | undefined {
  const product = entry.products[0];
  if (product) return {
    kind: "product",
    id: product.id,
    name: product.name,
    owner: product.company.name,
    href: productHref(product),
    logoUrl: product.logoUrl,
  };
  const reference = entry.outcome.skills?.[0];
  if (!reference) return undefined;
  const id = `${reference.repository}/${reference.directory}`;
  const skill = publishedSkills.find((candidate) => candidate.id === id);
  return skill ? {
    kind: "skill",
    id: skill.id,
    name: skill.name,
    owner: skill.repository,
    href: skillHref(skill),
  } : undefined;
}

function localMedia(entry: OutcomeCatalogEntry, category: OutcomeCategory): DiscoveryMedia | undefined {
  const preview = entry.outcome.preview;
  const cover = preview?.images?.find((image) => image.cover) ?? preview?.images?.[0];
  if (preview?.video) {
    const media: DiscoveryMedia = {
      kind: "video",
      src: preview.video.src,
      alt: preview.video.caption ?? `${entry.outcome.title} preview`,
      fit: category === "slides" || category === "cad" ? "contain" : "cover",
    };
    const poster = preview.video.poster ?? cover?.src;
    if (poster) media.poster = poster;
    return media;
  }
  if (cover) return {
    kind: "image",
    src: cover.src,
    alt: cover.alt,
    fit: category === "slides" || category === "cad" ? "contain" : "cover",
  };
  if (preview?.cad?.poster) return {
    kind: "image",
    src: preview.cad.poster,
    alt: preview.cad.caption ?? `${entry.outcome.title} CAD preview`,
    fit: "contain",
  };
  return undefined;
}

function localRequirements(entry: OutcomeCatalogEntry): string[] {
  const labels = new Set<string>();
  for (const input of entry.outcome.inputs ?? []) {
    if (input.type === "image") labels.add("Needs an image");
    else if (input.type === "video") labels.add("Needs a video");
    else if (input.type === "cad") labels.add("Needs CAD");
    else if (input.type === "document") labels.add("Needs a document");
    else labels.add(`Needs ${input.type}`);
  }
  return [...labels].slice(0, 2);
}

function fromCatalogEntry(entry: OutcomeCatalogEntry): DiscoveryOutcome {
  const source = localSource(entry);
  const productCategory = entry.products[0]?.category;
  const category = inferCategory(
    [entry.outcome.title, entry.outcome.summary, source?.name].filter(Boolean).join(" "),
    entry.outcome.preview?.video?.src ?? entry.outcome.preview?.images?.[0]?.src ?? "",
    productCategory,
  );
  const media = localMedia(entry, category);
  const publishedAt = entry.outcome.source?.publishedAt ?? entry.outcome.execution.timestamp;
  const outcome: DiscoveryOutcome = {
    id: `catalog:${entry.slug}`,
    slug: entry.slug,
    title: entry.outcome.title,
    summary: entry.outcome.summary,
    prompt: entry.outcome.executionPrompt,
    href: outcomeHref(entry),
    category,
    requirements: localRequirements(entry),
    catalogNumber: entry.catalogNumber,
  };
  if (entry.outcome.source?.url) outcome.sourceUrl = entry.outcome.source.url;
  if (source) outcome.source = source;
  if (media) outcome.media = media;
  if (publishedAt) outcome.publishedAt = publishedAt;
  return outcome;
}

export const localDiscoveryOutcomes = publishedOutcomes.map(fromCatalogEntry);

function productSource(row: PublicOutcomeRow, linkedProduct?: LinkedProductRow): DiscoverySource | undefined {
  const slug = linkedProduct?.linked_product_slug ?? row.product_slug;
  const name = linkedProduct?.linked_product_name ?? row.product_name;
  if (!slug || !name) return undefined;
  const catalogProduct = publishedProducts.find((product) => product.id.split("/").at(-1) === slug);
  const source: DiscoverySource = {
    kind: "product",
    id: linkedProduct?.linked_product_id ?? row.product_id ?? slug,
    name,
    owner: linkedProduct?.linked_company_name ?? row.company_name ?? "",
    href: `/products/${slug}`,
  };
  if (catalogProduct?.logoUrl) source.logoUrl = catalogProduct.logoUrl;
  return source;
}

function fromPublicRow(row: PublicOutcomeRow, linkedProduct: LinkedProductRow | undefined, catalogNumber: number): DiscoveryOutcome {
  const source = productSource(row, linkedProduct);
  const productCategory = source
    ? publishedProducts.find((product) => product.id.split("/").at(-1) === source.href.split("/").at(-1))?.category
    : undefined;
  const category = inferCategory(
    [row.title, row.summary, row.provider, row.model, source?.name].filter(Boolean).join(" "),
    row.result_media_url,
    productCategory,
  );
  const isVideo = /\.(mp4|mov|webm)(?:$|\?)/i.test(row.result_media_url);
  const media: DiscoveryMedia = {
    kind: isVideo ? "video" : "image",
    src: row.result_media_url,
    alt: `${row.title} result`,
    fit: category === "slides" || category === "cad" ? "contain" : "cover",
  };
  if (row.poster_url) media.poster = row.poster_url;
  const outcome: DiscoveryOutcome = {
    id: `directory:${row.id}`,
    databaseId: row.id,
    title: row.title,
    summary: row.summary?.trim() || "Open the original result and copy its prompt.",
    prompt: row.prompt,
    href: row.source_url,
    sourceUrl: row.source_url,
    category,
    media,
    requirements: [],
    catalogNumber,
  };
  if (row.slug) outcome.slug = row.slug;
  if (source) outcome.source = source;
  if (row.source_published_at) outcome.publishedAt = row.source_published_at;
  return outcome;
}

export async function fetchDiscoveryOutcomes(): Promise<DiscoveryOutcome[]> {
  const client = getSupabaseBrowserClient();
  if (!client) return localDiscoveryOutcomes;

  const [outcomeResult, productResult] = await Promise.all([
    client
      .from("outcome_directory")
      .select("id,slug,source_url,title,summary,prompt,result_media_url,poster_url,provider,model,author_name,source_published_at,product_id,product_slug,product_name,company_name")
      .order("source_published_at", { ascending: false, nullsFirst: false })
      .order("id")
      .range(0, 999),
    client
      .from("product_outcome_directory")
      .select("id,linked_product_id,linked_product_slug,linked_product_name,linked_company_name")
      .range(0, 999),
  ]);
  if (outcomeResult.error) return localDiscoveryOutcomes;

  const linkedProducts = new Map<string, LinkedProductRow>();
  if (!productResult.error) {
    // SAFETY: the explicit product_outcome_directory select list matches LinkedProductRow.
    const productRows = (productResult.data ?? []) as LinkedProductRow[];
    for (const row of productRows) if (!linkedProducts.has(row.id)) linkedProducts.set(row.id, row);
  }
  // SAFETY: the explicit outcome_directory select list matches PublicOutcomeRow.
  const rows = (outcomeResult.data ?? []) as PublicOutcomeRow[];
  const localBySlug = new Map(localDiscoveryOutcomes.map((entry) => [entry.slug, entry]));
  const hydratedLocal = new Map(localDiscoveryOutcomes.map((entry) => [entry.id, entry]));
  const directoryOutcomes: DiscoveryOutcome[] = [];

  for (const [index, row] of rows.entries()) {
    const local = row.slug ? localBySlug.get(row.slug) : undefined;
    if (local) {
      const publishedAt = row.source_published_at ?? local.publishedAt;
      const hydrated: DiscoveryOutcome = {
        ...local,
        databaseId: row.id,
      };
      if (publishedAt) hydrated.publishedAt = publishedAt;
      hydratedLocal.set(local.id, hydrated);
      continue;
    }
    directoryOutcomes.push(fromPublicRow(row, linkedProducts.get(row.id), localDiscoveryOutcomes.length + index + 1));
  }

  return [...directoryOutcomes, ...hydratedLocal.values()];
}

function tokenize(value: string): string[] {
  return [...new Set(value.toLowerCase().match(/[a-z0-9]+/g) ?? [])];
}

function expandedTerms(query: string): string[] {
  const terms = tokenize(query);
  return [...new Set(terms.flatMap((term) => {
    const alias = CATEGORY_ALIASES.get(term);
    return alias ? [term, alias, outcomeCategoryLabels[alias].toLowerCase()] : [term];
  }))];
}

export function searchDiscoveryOutcomes(outcomes: readonly DiscoveryOutcome[], query: string, category: OutcomeCategory | "all"): DiscoveryOutcome[] {
  const terms = expandedTerms(query.trim());
  return outcomes
    .filter((outcome) => category === "all" || outcome.category === category)
    .map((outcome) => {
      if (terms.length === 0) return { outcome, score: 0 };
      const title = outcome.title.toLowerCase();
      const summary = outcome.summary.toLowerCase();
      const prompt = outcome.prompt.toLowerCase();
      const source = [outcome.source?.name, outcome.source?.owner, outcome.source?.kind].filter(Boolean).join(" ").toLowerCase();
      const categoryText = `${outcome.category} ${outcomeCategoryLabels[outcome.category].toLowerCase()}`;
      const score = terms.reduce((total, term) => total
        + (title.includes(term) ? 10 : 0)
        + (summary.includes(term) ? 5 : 0)
        + (categoryText.includes(term) ? 4 : 0)
        + (source.includes(term) ? 3 : 0)
        + (prompt.includes(term) ? 1 : 0), 0);
      return { outcome, score };
    })
    .filter(({ score }) => terms.length === 0 || score > 0)
    .sort((left, right) => right.score - left.score || left.outcome.catalogNumber - right.outcome.catalogNumber)
    .map(({ outcome }) => outcome);
}

export async function fetchWeeklySourceRankings(page: number, pageSize = 10): Promise<{ entries: WeeklySourceRanking[]; total: number }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { entries: [], total: 0 };
  const offset = (Math.max(page, 1) - 1) * pageSize;
  const { data, error } = await client.rpc("get_source_copy_rankings_7d", { page_size: pageSize, page_offset: offset });
  if (error) return { entries: [], total: 0 };
  // SAFETY: the RPC return contract is defined by get_source_copy_rankings_7d.
  const rows = (data ?? []) as RankingRow[];
  return {
    entries: rows.map((row) => {
      const ranking: WeeklySourceRanking = {
        type: row.source_type,
        id: row.source_id,
        slug: row.source_slug,
        name: row.source_name,
        owner: row.owner_name,
        href: row.href,
        copies: Number(row.copy_count),
      };
      if (row.logo_url) ranking.logoUrl = row.logo_url;
      return ranking;
    }),
    total: rows.length ? Number(rows[0]?.total_count ?? 0) : 0,
  };
}

export async function findPublishedOutcomeId(slug: string): Promise<string | undefined> {
  const client = getSupabaseBrowserClient();
  if (!client) return undefined;
  const { data, error } = await client.from("outcome_directory").select("id").eq("slug", slug).limit(2);
  if (error || !data || data.length !== 1) return undefined;
  // SAFETY: the explicit outcome_directory select list contains one UUID id.
  const row = data[0] as { id: string };
  return row.id;
}

const COPY_VISITOR_KEY = "possible.copy-visitor.v1";

function copyVisitorToken(): string | undefined {
  try {
    const existing = window.localStorage.getItem(COPY_VISITOR_KEY);
    if (existing) return existing;
    const created = window.crypto.randomUUID();
    window.localStorage.setItem(COPY_VISITOR_KEY, created);
    return created;
  } catch {
    return undefined;
  }
}

export async function recordOutcomeCopy(outcomeId: string | undefined): Promise<void> {
  if (!outcomeId) return;
  const client = getSupabaseBrowserClient();
  const clientToken = copyVisitorToken();
  if (!client || !clientToken) return;
  await client.rpc("record_outcome_copy", { target_outcome_id: outcomeId, client_token: clientToken });
}
