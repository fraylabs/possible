# KISS Field-Guide Library Contract

Possible has one canonical guide library and two projections: a human library
and a read-only agent interface. Neither projection carries separate
hand-authored knowledge.

## Canonical guide

Every source guide is Markdown with small frontmatter:

```text
slug
title
summary
aliases
tags
reviewedAt
sources: [{ title, url }]
body
```

Internal Markdown links use `/wiki/<slug>`. The compiler derives links,
validates every target, and generates backlinks and related-guide views. There
is no separately authored graph, route, workflow, capability, or proof model.

The preferred shared contract is:

```ts
type GuideSource = { title: string; url: string };

type Guide = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  aliases?: string[];
  tags: string[];
  reviewedAt: string;
  sources: GuideSource[];
  links: string[];
};

// `pages` is retained as the collection key for wire compatibility.
type GuideLibrary = { pages: Guide[] };

loadGuides(): Promise<GuideLibrary>;
searchGuides(library, query, options?): GuideSearchResult[];
getGuide(library, slug): Guide | undefined;
getGuideBacklinks(library, slug): Guide[];
getRelatedGuides(library, slug): Guide[];
```

Existing `WikiPage`, `WikiCorpus`, `loadWiki`, `/wiki/<slug>`, and public JSON
identifiers may remain as compatibility aliases. Compatibility does not preserve
obsolete route or proof semantics.

## Guide convention

A useful guide explains:

- what it helps with and when it applies;
- which decisions and inputs remain project-specific;
- a practical approach with relevant counterconditions;
- other guides that may be useful alongside it;
- evidence the consuming person or agent should inspect, measure, or test; and
- important limits and alternatives.

These are editorial expectations, not a machine planner ontology. Link
adjacency and related-guide order alone carry no dependency, compatibility,
invocation, or completeness semantics. Guide prose may explain a conditional
common sequence; the consuming agent decides whether it fits the project, and
Possible never composes it into a project plan.

## Human projection

The website imports the browser-safe library. Search results, articles, browser
URLs, graph nodes, links, backlinks, and related reading all derive from the
same guides. The atlas is a browsing and editorial-inspection surface, not a
workflow diagram.

## Agent projection

The MCP server exposes only:

- `search`
- `read`

Both are read-only. Search returns relevant guide candidates without selecting
a route or asserting completeness. Read returns one exact guide with its
sources and related reading.

The host agent owns understanding and decomposing the request, choosing which
guides matter, combining their guidance with the actual project, selecting
available skills and tools, planning, requesting authorization, executing, and
validating the result. Possible does none of those things.

## Public machine-readable projection

Production publishes an index and individual guide representations alongside
the human application. They are generated from the same validated library and
must not be maintained separately. Existing paths remain stable even when the
agent protocol schema version changes.

## Contribution projection

People and agents contribute ordinary reviewed source changes. Automated checks
validate metadata shape, review dates, HTTPS source URLs, internal links,
generated-data parity, and publication safety. Editorial review evaluates scope,
clarity, source support, and whether contributor judgment is labeled honestly.

An agent may draft a guide or patch, but opening a pull request or publishing a
change remains a separately authorized host action. Possible has no contribution
write API and no automatic status promotion.

## Trust boundary

Git records authorship and revisions. Guide sources and review dates make
guidance inspectable. `reviewedAt` means a contributor checked the guide and its
sources on that date; it is not project certification.

Project evidence, current repository state, live provider facts, actual host
capabilities, and user constraints outrank generic Possible guidance. A guide
may describe validation practices, but the consuming agent is responsible for
selecting and running them.

Possible intentionally has no planner, router, skill registry, provider ranker,
workflow engine, receipt or proof-state system, confidence formula, marketplace,
hosted LLM, credentials, or external-write path.
