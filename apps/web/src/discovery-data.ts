import type { ProductCategory } from "@possible/catalog";
import {
  productHref,
  publishedProducts,
  publishedSkills,
  skillHref,
} from "./public-content";
import { getSupabaseBrowserClient } from "./supabase";

const outcomeUsageTrackingEnabled = process.env.NEXT_PUBLIC_OUTCOME_USAGE_TRACKING === "true";
const outcomeReviewsEnabled = process.env.NEXT_PUBLIC_OUTCOME_REVIEWS_ENABLED === "true";

export const outcomeCategories = ["video", "images", "websites", "cad", "slides", "audio", "apps"] as const;
export type OutcomeCategory = (typeof outcomeCategories)[number];

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
  sources: DiscoverySource[];
  media?: DiscoveryMedia;
  requirements: string[];
  publicationKind: "official" | "community";
  useCount: number;
  averageRating: number;
  reviewCount: number;
  publishedAt?: string;
  catalogNumber: number;
}

interface PublicOutcomeRow {
  id: string;
  slug: string | null;
  title: string;
  summary: string | null;
  prompt: string;
  result_media_url: string | null;
  poster_url: string | null;
  provider: string | null;
  model: string | null;
  author_name: string | null;
  requirements: string[];
  published_at: string;
  publication_kind: "official" | "community";
  source_url: string;
}

interface LinkedProductRow {
  id: string;
  linked_product_id: string;
  linked_product_slug: string;
  linked_product_name: string;
  linked_company_name: string;
}

interface LinkedSkillRow {
  id: string;
  linked_skill_id: string;
  linked_skill_name: string;
  linked_skill_repository: string;
  linked_skill_directory: string;
}

interface OutcomeUsageRow {
  outcome_id: string;
  use_count: number;
}

interface OutcomeReviewSummaryRow {
  outcome_id: string;
  average_rating: number;
  review_count: number;
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

function productSource(linkedProduct: LinkedProductRow): DiscoverySource {
  const slug = linkedProduct.linked_product_slug;
  const catalogProduct = publishedProducts.find((product) => product.id.split("/").at(-1) === slug);
  const source: DiscoverySource = {
    kind: "product",
    id: linkedProduct.linked_product_id,
    name: catalogProduct?.name ?? linkedProduct.linked_product_name,
    owner: catalogProduct?.company.name ?? linkedProduct.linked_company_name,
    href: catalogProduct ? productHref(catalogProduct) : `/products/${slug}`,
  };
  if (catalogProduct?.logoUrl) source.logoUrl = catalogProduct.logoUrl;
  return source;
}

function skillSource(linkedSkill: LinkedSkillRow): DiscoverySource {
  const catalogSkill = publishedSkills.find((skill) => skill.id === linkedSkill.linked_skill_id);
  return {
    kind: "skill",
    id: linkedSkill.linked_skill_id,
    name: catalogSkill?.name ?? linkedSkill.linked_skill_name,
    owner: linkedSkill.linked_skill_repository,
    href: catalogSkill
      ? skillHref(catalogSkill)
      : `https://github.com/${linkedSkill.linked_skill_repository}/tree/HEAD/${linkedSkill.linked_skill_directory}`,
  };
}

function fromPublicRow(
  row: PublicOutcomeRow,
  sources: DiscoverySource[],
  catalogNumber: number,
  useCount: number,
  averageRating: number,
  reviewCount: number,
): DiscoveryOutcome {
  const source = sources[0];
  const productCategory = source
    ? publishedProducts.find((product) => product.id.split("/").at(-1) === source.href.split("/").at(-1))?.category
    : undefined;
  const category = inferCategory(
    [row.title, row.summary, row.provider, row.model, source?.name].filter(Boolean).join(" "),
    row.result_media_url ?? "",
    productCategory,
  );
  const isVideo = Boolean(row.result_media_url && /\.(mp4|mov|webm)(?:$|\?)/i.test(row.result_media_url));
  const media: DiscoveryMedia | undefined = row.result_media_url ? {
    kind: isVideo ? "video" : "image",
    src: row.result_media_url,
    alt: `${row.title} result`,
    fit: category === "slides" || category === "cad" ? "contain" : "cover",
    ...(row.poster_url ? { poster: row.poster_url } : {}),
  } : undefined;
  const outcome: DiscoveryOutcome = {
    id: `directory:${row.id}`,
    databaseId: row.id,
    title: row.title,
    summary: row.summary?.trim() || "Open the original result and copy its prompt.",
    prompt: row.prompt,
    href: `/outcomes/view/?id=${row.id}`,
    category,
    sources,
    requirements: row.requirements,
    publicationKind: row.publication_kind,
    useCount,
    averageRating,
    reviewCount,
    catalogNumber,
  };
  if (media) outcome.media = media;
  outcome.sourceUrl = row.source_url;
  if (row.slug) outcome.slug = row.slug;
  if (source) outcome.source = source;
  outcome.publishedAt = row.published_at;
  return outcome;
}

export async function fetchDiscoveryOutcomes(): Promise<DiscoveryOutcome[]> {
  const client = getSupabaseBrowserClient();
  if (!client) return [];

  const [outcomeResult, productResult, skillResult, usageResult, reviewResult] = await Promise.all([
    client
      .from("outcome_directory")
      .select("id,slug,title,summary,prompt,result_media_url,poster_url,provider,model,author_name,requirements,published_at,publication_kind,source_url")
      .order("published_at", { ascending: false })
      .order("id")
      .range(0, 999),
    client
      .from("product_outcome_directory")
      .select("id,linked_product_id,linked_product_slug,linked_product_name,linked_company_name")
      .range(0, 999),
    client
      .from("skill_outcome_directory")
      .select("id,linked_skill_id,linked_skill_name,linked_skill_repository,linked_skill_directory")
      .range(0, 999),
    outcomeUsageTrackingEnabled
      ? client.rpc("get_outcome_usage_counts")
      : Promise.resolve({ data: [] as OutcomeUsageRow[], error: null }),
    outcomeReviewsEnabled
      ? client.rpc("get_outcome_review_summaries", { target_outcome_id: null })
      : Promise.resolve({ data: [] as OutcomeReviewSummaryRow[], error: null }),
  ]);
  if (outcomeResult.error) throw outcomeResult.error;

  const linkedSources = new Map<string, DiscoverySource[]>();
  if (!productResult.error) {
    // SAFETY: the explicit product_outcome_directory select list matches LinkedProductRow.
    const productRows = (productResult.data ?? []) as LinkedProductRow[];
    for (const row of productRows) linkedSources.set(row.id, [...(linkedSources.get(row.id) ?? []), productSource(row)]);
  }
  if (!skillResult.error) {
    const skillRows = (skillResult.data ?? []) as LinkedSkillRow[];
    for (const row of skillRows) linkedSources.set(row.id, [...(linkedSources.get(row.id) ?? []), skillSource(row)]);
  }
  const usageCounts = new Map<string, number>();
  if (!usageResult.error) {
    // SAFETY: get_outcome_usage_counts returns one public aggregate row per published Outcome.
    const usageRows = (usageResult.data ?? []) as OutcomeUsageRow[];
    for (const row of usageRows) usageCounts.set(row.outcome_id, Number(row.use_count));
  }
  const reviewSummaries = new Map<string, OutcomeReviewSummaryRow>();
  if (!reviewResult.error) {
    // SAFETY: get_outcome_review_summaries returns public aggregate rows without reviewer identities.
    const reviewRows = (reviewResult.data ?? []) as OutcomeReviewSummaryRow[];
    for (const row of reviewRows) reviewSummaries.set(row.outcome_id, row);
  }
  // SAFETY: the explicit outcome_directory select list matches PublicOutcomeRow.
  const rows = (outcomeResult.data ?? []) as PublicOutcomeRow[];
  const directoryOutcomes: DiscoveryOutcome[] = [];

  for (const [index, row] of rows.entries()) {
    const reviewSummary = reviewSummaries.get(row.id);
    directoryOutcomes.push(fromPublicRow(
      row,
      linkedSources.get(row.id) ?? [],
      index + 1,
      usageCounts.get(row.id) ?? 0,
      Number(reviewSummary?.average_rating ?? 0),
      Number(reviewSummary?.review_count ?? 0),
    ));
  }

  return directoryOutcomes;
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
      const source = outcome.sources.flatMap((item) => [item.name, item.owner, item.kind]).join(" ").toLowerCase();
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

export async function recordOutcomeCopy(outcomeId: string | undefined): Promise<boolean> {
  if (!outcomeId || !outcomeUsageTrackingEnabled) return false;
  const client = getSupabaseBrowserClient();
  const clientToken = copyVisitorToken();
  if (!client || !clientToken) return false;
  const result = await client.rpc("record_outcome_copy", { target_outcome_id: outcomeId, client_token: clientToken });
  return result.error === null && result.data === true;
}
