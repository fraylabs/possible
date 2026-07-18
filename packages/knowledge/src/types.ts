export interface PageSource {
  title: string;
  url: string;
}

export type WikiPageKind = "outcome" | "method" | "project" | "provider" | "concept";

export interface WikiPage {
  slug: string;
  title: string;
  summary: string;
  body: string;
  tags: string[];
  aliases?: string[];
  kind?: WikiPageKind;
  coverage?: string[];
  reviewedAt: string;
  sources: PageSource[];
  links: string[];
}

export interface WikiCorpus {
  pages: WikiPage[];
}

export interface PageSearchOptions {
  limit?: number;
  tags?: string[];
  kind?: WikiPageKind;
  coverage?: string[];
}

export interface PageSearchResult {
  page: WikiPage;
  score: number;
  matchedTerms: string[];
}
