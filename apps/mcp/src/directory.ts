export interface DirectoryOutcome {
  id: string;
  slug: string;
  title: string;
  summary: string;
  aboutMarkdown: string;
  prompt: string;
  requirements: string[];
  models: Array<Record<string, unknown>>;
  products: string[];
  skills: Array<Record<string, unknown>>;
  primary: Record<string, unknown> | null;
  secondary: Array<Record<string, unknown>>;
  inputs: Array<Record<string, unknown>>;
  artifacts: Array<Record<string, unknown>>;
  preview: Record<string, unknown> | null;
  author: { name: string | null; url: string | null };
  publishedAt: string;
  publicationKind: "official" | "community";
  sourceLocator: string;
  sourceUrl: string;
  sourceRevision: string;
  manifestUrl: string;
  resultMediaUrl: string | null;
  posterUrl: string | null;
  provider: string | null;
  model: string | null;
  agent: string | null;
  useCount: number;
  likeCount: number;
}

export interface OutcomeDirectory {
  list(): Promise<DirectoryOutcome[]>;
}

interface OutcomeRow {
  id: string;
  slug: string;
  title: string;
  summary: string;
  about_markdown: string;
  prompt: string;
  requirements: string[];
  models: Array<Record<string, unknown>>;
  products: string[];
  skills: Array<Record<string, unknown>>;
  primary_attribution?: Record<string, unknown> | null;
  secondary_attributions?: Array<Record<string, unknown>>;
  inputs: Array<Record<string, unknown>>;
  artifacts: Array<Record<string, unknown>>;
  preview: Record<string, unknown> | null;
  author_name: string | null;
  author_url: string | null;
  published_at: string;
  publication_kind: "official" | "community";
  source_locator: string;
  source_url: string;
  source_revision: string;
  manifest_url: string;
  result_media_url: string | null;
  poster_url: string | null;
  provider: string | null;
  model: string | null;
  agent: string | null;
  use_count: number;
  like_count: number;
}

function legacyAttributions(row: OutcomeRow) {
  const attributions = [
    ...row.products.map((id) => ({ kind: "product", id })),
    ...row.skills.map((skill) => ({ kind: "skill", ...skill })),
  ];
  return { primary: attributions[0] ?? null, secondary: attributions.slice(1) };
}

function fromRow(row: OutcomeRow): DirectoryOutcome {
  const fallback = legacyAttributions(row);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    aboutMarkdown: row.about_markdown,
    prompt: row.prompt,
    requirements: row.requirements,
    models: row.models,
    products: row.products,
    skills: row.skills,
    primary: row.primary_attribution ?? fallback.primary,
    secondary: row.secondary_attributions ?? fallback.secondary,
    inputs: row.inputs,
    artifacts: row.artifacts,
    preview: row.preview,
    author: { name: row.author_name, url: row.author_url },
    publishedAt: row.published_at,
    publicationKind: row.publication_kind,
    sourceLocator: row.source_locator,
    sourceUrl: row.source_url,
    sourceRevision: row.source_revision,
    manifestUrl: row.manifest_url,
    resultMediaUrl: row.result_media_url,
    posterUrl: row.poster_url,
    provider: row.provider,
    model: row.model,
    agent: row.agent,
    useCount: row.use_count,
    likeCount: row.like_count,
  };
}

const DEFAULT_ENDPOINT = "https://reminiscent-lark-333.convex.site/api/outcomes";

export function createConvexOutcomeDirectory(options: { endpoint?: string; fetch?: typeof globalThis.fetch } = {}): OutcomeDirectory {
  const endpoint = options.endpoint ?? process.env.POSSIBLE_DIRECTORY_ENDPOINT ?? DEFAULT_ENDPOINT;
  const request = options.fetch ?? globalThis.fetch;
  return {
    async list() {
      const response = await request(endpoint, { headers: { accept: "application/json" } });
      if (!response.ok) throw new Error(`Possible directory returned HTTP ${response.status}`);
      const body = await response.json() as { outcomes?: OutcomeRow[] };
      return (body.outcomes ?? []).map(fromRow);
    },
  };
}

function words(value: string): string[] {
  return [...new Set(value.toLowerCase().match(/[a-z0-9]+/g) ?? [])];
}

export function searchDirectory(outcomes: readonly DirectoryOutcome[], query: string): DirectoryOutcome[] {
  const terms = words(query);
  if (!terms.length) return [...outcomes];
  return outcomes.map((outcome) => {
    const title = outcome.title.toLowerCase();
    const summary = outcome.summary.toLowerCase();
    const prompt = outcome.prompt.toLowerCase();
    const context = JSON.stringify([outcome.primary, outcome.secondary, outcome.models]).toLowerCase();
    const score = terms.reduce((total, term) => total
      + (title.includes(term) ? 10 : 0)
      + (summary.includes(term) ? 5 : 0)
      + (context.includes(term) ? 3 : 0)
      + (prompt.includes(term) ? 1 : 0), 0);
    return { outcome, score };
  }).filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.outcome.title.localeCompare(right.outcome.title))
    .map(({ outcome }) => outcome);
}
