# KISS Wiki Contract

Possible has one canonical page corpus and two projections: a human atlas and a
read-only agent interface. Neither projection carries separate hand-authored
knowledge.

## Canonical page

Every source page is Markdown with small frontmatter:

```text
slug
title
summary
tags
reviewedAt
sources: [{ title, url }]
body
```

Internal Markdown links use `/wiki/<slug>`. The compiler derives each page's
links, validates every target, and generates backlinks and related-page views.
There is no separately authored edge file.

The browser and server runtime share this contract:

```ts
type PageSource = { title: string; url: string };

type WikiPage = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  tags: string[];
  reviewedAt: string;
  sources: PageSource[];
  links: string[];
};

type WikiCorpus = { pages: WikiPage[] };

loadWiki(): Promise<WikiCorpus>;
searchPages(corpus, query, options?): PageSearchResult[];
getPage(corpus, slug): WikiPage | undefined;
getBacklinks(corpus, slug): WikiPage[];
getRelatedPages(corpus, slug): WikiPage[];
```

## Human projection

The website imports the browser-safe corpus. Search results, the selected
article, browser URL, graph nodes, graph links, backlinks, and related pages all
come from those pages. Selecting a result, article link, or graph node performs
the same navigation action.

## Agent projection

The MCP server exposes only:

- `search`
- `read`

Both are read-only. Possible does not plan, choose tools on the user's behalf,
hold credentials, or execute external actions.

## Public machine-readable projection

Production publishes an index and individual page representations alongside
the human application. They are generated from the same validated corpus and
must not be maintained separately.

## Trust boundary

Git records authorship and revisions. Page sources and review dates make claims
inspectable. Validation rejects duplicate slugs, invalid metadata, missing or
insecure sources, malformed internal links, and links to nonexistent pages.

Possible intentionally has no capability planner, provider ranker, workflow
engine, confidence formula, marketplace, or hosted LLM.
