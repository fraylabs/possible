import {
  getBacklinks,
  getRelatedPages,
  type WikiCorpus,
  type WikiPage,
} from "@possible/knowledge";

export const AGENT_SCHEMA_VERSION = 1 as const;

const searchStopWords = [
  "a",
  "an",
  "and",
  "can",
  "do",
  "for",
  "how",
  "i",
  "is",
  "it",
  "make",
  "me",
  "my",
  "need",
  "of",
  "please",
  "the",
  "to",
  "want",
  "we",
  "with",
  "would",
  "you",
] as const;

type AgentOperation = "search" | "read" | "related";

export interface AgentPageReference {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  aliases: string[];
  kind?: WikiPage["kind"];
  coverage: string[];
  reviewedAt: string;
  sources: WikiPage["sources"];
  links: string[];
  humanUrl: string;
  jsonUrl: string;
  readUrl: string;
  relatedUrl: string;
}

export interface AgentReadDocument {
  schemaVersion: typeof AGENT_SCHEMA_VERSION;
  operation: "read";
  humanUrl: string;
  page: WikiPage;
  backlinks: AgentPageReference[];
  relatedPages: AgentPageReference[];
}

export interface AgentRelatedDocument {
  schemaVersion: typeof AGENT_SCHEMA_VERSION;
  operation: "related";
  slug: string;
  humanUrl: string;
  page: AgentPageReference;
  relatedPages: AgentPageReference[];
}

export interface AgentSearchDocument extends AgentPageReference {
  searchFields: {
    title: string;
    slug: string;
    aliases: string;
    tags: string;
    summary: string;
    body: string;
    sourceTitles: string;
  };
}

export interface AgentSearchIndex {
  schemaVersion: typeof AGENT_SCHEMA_VERSION;
  operation: "search";
  static: true;
  request: {
    method: "GET";
    path: "/agent/search.json";
    query: null;
    body: null;
  };
  corpus: {
    pageCount: number;
    sourceIndexUrl: "/wiki/index.json";
  };
  search: {
    normalization: {
      unicode: "NFKD";
      removeCombiningMarks: true;
      lowercase: true;
      allowedCharacters: "a-z0-9+#./-";
      separators: "all other characters";
      trimCharacters: "./-";
    };
    stopWords: readonly string[];
    match: "all query terms";
    ranking: readonly {
      field: string;
      weight: number;
    }[];
    phraseBonus: 20;
    defaultLimit: 20;
    maximumLimit: 100;
  };
  pages: AgentSearchDocument[];
}

interface AgentProtocolOperation {
  method: "GET";
  path: string;
  request: {
    query: null;
    body: null;
  };
  response: {
    contentType: "application/json";
    schema: string;
  };
  notes: string[];
}

export interface AgentProtocolDocument {
  schemaVersion: typeof AGENT_SCHEMA_VERSION;
  protocol: "possible-static-agent";
  title: "Possible static agent protocol";
  static: true;
  source: {
    corpusIndexUrl: "/wiki/index.json";
    humanPages: "/wiki/{slug}";
    repository: "https://github.com/fraylabs/possible";
  };
  operations: Record<AgentOperation, AgentProtocolOperation>;
  contracts: {
    pageReference: string[];
    read: string[];
    related: string[];
    search: string[];
  };
}

export interface AgentPublication {
  path: string;
  value: unknown;
}

const pageUrls = (slug: string) => ({
  humanUrl: `/wiki/${slug}`,
  jsonUrl: `/wiki/${slug}.json`,
  readUrl: `/agent/read/${slug}.json`,
  relatedUrl: `/agent/related/${slug}.json`,
});

export function toAgentPageReference(page: WikiPage): AgentPageReference {
  return {
    slug: page.slug,
    title: page.title,
    summary: page.summary,
    tags: page.tags,
    aliases: page.aliases ?? [],
    ...(page.kind ? { kind: page.kind } : {}),
    coverage: page.coverage ?? [],
    reviewedAt: page.reviewedAt,
    sources: page.sources,
    links: page.links,
    ...pageUrls(page.slug),
  };
}

export function buildAgentSearchIndex(corpus: WikiCorpus): AgentSearchIndex {
  return {
    schemaVersion: AGENT_SCHEMA_VERSION,
    operation: "search",
    static: true,
    request: {
      method: "GET",
      path: "/agent/search.json",
      query: null,
      body: null,
    },
    corpus: {
      pageCount: corpus.pages.length,
      sourceIndexUrl: "/wiki/index.json",
    },
    search: {
      normalization: {
        unicode: "NFKD",
        removeCombiningMarks: true,
        lowercase: true,
        allowedCharacters: "a-z0-9+#./-",
        separators: "all other characters",
        trimCharacters: "./-",
      },
      stopWords: searchStopWords,
      match: "all query terms",
      ranking: [
        { field: "title", weight: 16 },
        { field: "slug", weight: 12 },
        { field: "aliases", weight: 14 },
        { field: "tags", weight: 10 },
        { field: "summary", weight: 8 },
        { field: "body", weight: 2 },
        { field: "sourceTitles", weight: 1 },
      ],
      phraseBonus: 20,
      defaultLimit: 20,
      maximumLimit: 100,
    },
    pages: corpus.pages.map((page) => ({
      ...toAgentPageReference(page),
      searchFields: {
        title: page.title,
        slug: page.slug,
        aliases: (page.aliases ?? []).join(" "),
        tags: page.tags.join(" "),
        summary: page.summary,
        body: page.body,
        sourceTitles: page.sources.map((source) => source.title).join(" "),
      },
    })),
  };
}

export function buildAgentReadDocument(corpus: WikiCorpus, page: WikiPage): AgentReadDocument {
  return {
    schemaVersion: AGENT_SCHEMA_VERSION,
    operation: "read",
    humanUrl: pageUrls(page.slug).humanUrl,
    page,
    backlinks: getBacklinks(corpus, page.slug).map(toAgentPageReference),
    relatedPages: getRelatedPages(corpus, page.slug).map(toAgentPageReference),
  };
}

export function buildAgentRelatedDocument(corpus: WikiCorpus, page: WikiPage): AgentRelatedDocument {
  return {
    schemaVersion: AGENT_SCHEMA_VERSION,
    operation: "related",
    slug: page.slug,
    humanUrl: pageUrls(page.slug).humanUrl,
    page: toAgentPageReference(page),
    relatedPages: getRelatedPages(corpus, page.slug).map(toAgentPageReference),
  };
}

export function buildAgentProtocol(): AgentProtocolDocument {
  return {
    schemaVersion: AGENT_SCHEMA_VERSION,
    protocol: "possible-static-agent",
    title: "Possible static agent protocol",
    static: true,
    source: {
      corpusIndexUrl: "/wiki/index.json",
      humanPages: "/wiki/{slug}",
      repository: "https://github.com/fraylabs/possible",
    },
    operations: {
      search: {
        method: "GET",
        path: "/agent/search.json",
        request: { query: null, body: null },
        response: {
          contentType: "application/json",
          schema: "AgentSearchIndex",
        },
        notes: [
          "This is a static search index; query parameters are not evaluated by the deployment.",
          "Normalize and rank locally using the search configuration and fields in the response.",
          "Require every meaningful query term to match, then apply the documented weights and limit.",
          "Treat aliases as contributor-authored vocabulary, not generated synonyms.",
          "Report no-maintained-route when no exact or authored route is supported by the retrieved pages; do not turn similarity into a claim.",
        ],
      },
      read: {
        method: "GET",
        path: "/agent/read/{slug}.json",
        request: { query: null, body: null },
        response: {
          contentType: "application/json",
          schema: "AgentReadDocument",
        },
        notes: [
          "The slug must be one returned by the search index or the canonical wiki index.",
          "The page body, review date, sources, links, backlinks, and related pages come from the validated corpus.",
        ],
      },
      related: {
        method: "GET",
        path: "/agent/related/{slug}.json",
        request: { query: null, body: null },
        response: {
          contentType: "application/json",
          schema: "AgentRelatedDocument",
        },
        notes: [
          "Related pages are derived only from the page's outgoing links and backlinks.",
          "Each related page includes its review date and source URLs for inspection.",
        ],
      },
    },
    contracts: {
      pageReference: [
        "slug",
        "title",
        "summary",
        "tags",
        "aliases",
        "kind",
        "coverage",
        "reviewedAt",
        "sources",
        "links",
        "humanUrl",
        "jsonUrl",
        "readUrl",
        "relatedUrl",
      ],
      read: ["schemaVersion", "operation", "humanUrl", "page", "backlinks", "relatedPages"],
      related: ["schemaVersion", "operation", "slug", "humanUrl", "page", "relatedPages"],
      search: ["schemaVersion", "operation", "static", "request", "corpus", "search", "pages"],
    },
  };
}

export function buildAgentPublications(corpus: WikiCorpus): AgentPublication[] {
  const publications: AgentPublication[] = [
    { path: "agent/protocol.json", value: buildAgentProtocol() },
    { path: "agent/search.json", value: buildAgentSearchIndex(corpus) },
  ];

  for (const page of corpus.pages) {
    publications.push(
      { path: `agent/read/${page.slug}.json`, value: buildAgentReadDocument(corpus, page) },
      { path: `agent/related/${page.slug}.json`, value: buildAgentRelatedDocument(corpus, page) },
    );
  }

  return publications;
}
