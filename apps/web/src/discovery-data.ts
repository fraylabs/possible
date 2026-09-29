import { visibleValue } from "../../cli/src/text-safety.mjs";
import { outcomeApiUrl } from "./backend";

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
  role?: "primary" | "secondary";
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
  likeCount: number;
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
  primary_attribution: AttributionRow | null;
  secondary_attributions: AttributionRow[];
  use_count: number;
  like_count: number;
}

type AttributionRow =
  | { kind: "product"; id: string }
  | { kind: "skill"; repository: string; directory: string; lastReviewedCommit: string };

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

function inferCategory(text: string, mediaUrl = ""): OutcomeCategory {
  const normalized = `${text} ${mediaUrl}`.toLowerCase();
  const explicitChecks: Array<[OutcomeCategory, RegExp]> = [
    ["slides", /\b(powerpoint|presentation|slide|slides|deck|pptx)\b/],
    ["audio", /\b(audio|bgm|music|song|soundtrack|strudel|wav)\b/],
    ["cad", /\b(cad|step|stl|3mf|3d[ -]?print|parametric|solid model)\b/],
    ["websites", /\b(website|landing page|web page|web app)\b/],
    ["apps", /\b(app|application|browser game|mobile game)\b/],
  ];
  for (const [category, pattern] of explicitChecks) if (pattern.test(normalized)) return category;
  if (/\b(image|illustration|photo|picture|portrait)\b/.test(normalized)) return "images";
  if (/\b(video|film|animation|cinematic|reel|clip)\b/.test(normalized)) return "video";
  if (/\.(mp4|mov|webm)(?:$|\?)/.test(normalized)) return "video";
  if (/\.(wav|mp3|m4a|ogg)(?:$|\?)/.test(normalized)) return "audio";
  if (/\.(step|stp|stl|3mf|glb|gltf)(?:$|\?)/.test(normalized)) return "cad";
  if (/\.(png|jpe?g|webp|gif|avif)(?:$|\?)/.test(normalized)) return "images";
  return "apps";
}

const attributionAcronyms = new Map([
  ["3d", "3D"],
  ["ai", "AI"],
  ["api", "API"],
  ["cad", "CAD"],
  ["pptx", "PPTX"],
  ["ui", "UI"],
  ["ux", "UX"],
]);

export function attributionDisplayName(value: string): string {
  const segment = value.split("/").filter(Boolean).at(-1) ?? value;
  return segment.split(/[-_]+/).filter(Boolean).map((part) => attributionAcronyms.get(part.toLowerCase())
    ?? `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(" ");
}

export function sourceFilterKey(source: Pick<DiscoverySource, "kind" | "id">): string {
  return `${source.kind}:${source.id}`;
}

export function sourceFilterHref(source: Pick<DiscoverySource, "kind" | "id">): string {
  return `/?uses=${encodeURIComponent(sourceFilterKey(source))}#discover`;
}

function attributionSource(attribution: AttributionRow, role: "primary" | "secondary"): DiscoverySource {
  if (attribution.kind === "product") {
    const [owner = attribution.id, product = attribution.id] = attribution.id.split("/");
    return { kind: "product", id: attribution.id, name: attributionDisplayName(product), owner: attributionDisplayName(owner), role };
  }
  const id = `${attribution.repository}/${attribution.directory}`;
  return { kind: "skill", id, name: attributionDisplayName(attribution.directory), owner: attribution.repository, role };
}

function fromPublicRow(
  row: PublicOutcomeRow,
  catalogNumber: number,
): DiscoveryOutcome {
  const sources = [
    ...(row.primary_attribution ? [attributionSource(row.primary_attribution, "primary")] : []),
    ...row.secondary_attributions.map((attribution) => attributionSource(attribution, "secondary")),
  ];
  const source = sources.find((item) => item.role === "primary") ?? sources[0];
  const category = inferCategory(
    [row.title, row.summary, row.provider, row.model, source?.name].filter(Boolean).join(" "),
    row.result_media_url ?? "",
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
    useCount: row.use_count,
    likeCount: row.like_count,
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
  const endpoint = outcomeApiUrl();
  if (!endpoint) return [];
  const response = await fetch(endpoint, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`Possible directory returned HTTP ${response.status}`);
  const body = await response.json() as { outcomes?: PublicOutcomeRow[] };
  return (body.outcomes ?? []).map((row, index) => fromPublicRow(visibleValue(row), index + 1));
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

export function searchDiscoveryOutcomes(
  outcomes: readonly DiscoveryOutcome[],
  query: string,
  category: OutcomeCategory | "all",
  source: string | null = null,
): DiscoveryOutcome[] {
  const terms = expandedTerms(query.trim());
  return outcomes
    .filter((outcome) => category === "all" || outcome.category === category)
    .filter((outcome) => source === null || outcome.sources.some((item) => sourceFilterKey(item) === source))
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
    .sort((left, right) => {
      const byPublishedAt = Date.parse(right.outcome.publishedAt ?? "") - Date.parse(left.outcome.publishedAt ?? "");
      return right.score - left.score
        || right.outcome.useCount - left.outcome.useCount
        || right.outcome.likeCount - left.outcome.likeCount
        || (Number.isFinite(byPublishedAt) ? byPublishedAt : 0)
        || left.outcome.catalogNumber - right.outcome.catalogNumber;
    })
    .map(({ outcome }) => outcome);
}

export async function findPublishedOutcomeId(slug: string): Promise<string | undefined> {
  const outcomes = await fetchDiscoveryOutcomes();
  const matches = outcomes.filter((outcome) => outcome.slug === slug);
  return matches.length === 1 ? matches[0]?.databaseId : undefined;
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

async function hashVisitorToken(token: string): Promise<string> {
  const digest = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function recordOutcomeUse(outcomeId: string | undefined): Promise<boolean> {
  if (!outcomeId) return false;
  const endpoint = outcomeApiUrl("/use");
  const clientToken = copyVisitorToken();
  if (!endpoint || !clientToken) return false;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ outcomeId, visitorHash: await hashVisitorToken(clientToken), source: "web", ci: false }),
  });
  if (!response.ok) return false;
  const body = await response.json() as { counted?: boolean };
  return body.counted === true;
}
