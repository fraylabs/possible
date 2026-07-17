export interface PageSource {
  title: string;
  url: string;
}

export interface WikiPage {
  slug: string;
  title: string;
  summary: string;
  body: string;
  tags: string[];
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
}

export interface PageSearchResult {
  page: WikiPage;
  score: number;
  matchedTerms: string[];
}
