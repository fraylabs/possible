export interface GuideSource {
  title: string;
  url: string;
}

export interface Guide {
  slug: string;
  title: string;
  summary: string;
  body: string;
  tags: string[];
  aliases?: string[];
  reviewedAt: string;
  sources: GuideSource[];
  links: string[];
}

/**
 * `pages` remains the collection key so existing browser and MCP consumers can
 * adopt guide terminology without a data migration.
 */
export interface GuideLibrary {
  pages: Guide[];
}

export interface GuideSearchOptions {
  limit?: number;
  tags?: string[];
}

/** `page` is retained as the result key for wire compatibility. */
export interface GuideSearchResult {
  page: Guide;
  score: number;
  matchedTerms: string[];
}

// Compatibility names for existing consumers and stable public paths.
export type PageSource = GuideSource;
export type WikiPage = Guide;
export type WikiCorpus = GuideLibrary;
export type PageSearchOptions = GuideSearchOptions;
export type PageSearchResult = GuideSearchResult;
