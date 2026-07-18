# Possible contributor knowledge

`knowledge/pages/` is the source of truth for Possible. Each canonical page is
one reviewed Markdown file with prose, internal links, and sources. The website
and agent interface consume the same compiled corpus and must not maintain a
second knowledge model.

## Page format

```markdown
---
slug: make-a-static-site
title: Make a static site
summary: Publish a small website without a server-side application.
tags: [web, publishing]
reviewedAt: 2026-07-18
sources:
  - title: MDN — Publishing your website
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Your_first_website/Publishing_your_website
---

Write useful, sourced prose here. Continue through [hosting options](/wiki/choose-web-hosting).
```

Frontmatter keys are `slug`, optional `parent`, `title`, `summary`, `tags`,
`reviewedAt`, and `sources`. `parent` names the page one level above this page.
When omitted, the compiler infers the first knowledge folder as the parent, so
pages under `knowledge/pages/web/` belong to `web` by default. Slugs use
lowercase kebab-case. Tags may be empty; sources may not.
Every source has only a title and an HTTPS URL. `reviewedAt` is a real calendar
date in `YYYY-MM-DD` form.

Only Markdown links whose destination is exactly `/wiki/<slug>` generate
authored graph edges. All such links must resolve to another canonical page.
Parent relationships generate hierarchy edges and power the atlas card's
level-up and level-down groups. Backlinks and related pages are still derived
from authored links; contributors never author a second edge list.

Run after editing:

```bash
npm run generate -w @possible/knowledge
npm run validate -w @possible/knowledge
npm run test -w @possible/knowledge
```
