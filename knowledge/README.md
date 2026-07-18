# Possible field guides

`knowledge/pages/` is the source of truth for Possible. Each canonical guide is
one reviewed Markdown file with practical prose, ordinary internal links, and
sources. The website and agent interface consume the same compiled library and
must not maintain a second knowledge model.

## Guide format

```markdown
---
slug: make-a-static-site
title: Make a static site
summary: Publish a small website without a server-side application.
tags: [web, publishing]
aliases: [static website]
reviewedAt: 2026-07-18
sources:
  - title: MDN — Publishing your website
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Your_first_website/Publishing_your_website
---

## What this helps with

Explain the maintained subject and its useful boundary.

## A practical approach

Describe decisions and guidance another person or agent can apply.

## Validate the work

State the checks the consuming agent should perform in its own environment.

## Limits and alternatives

Say when the guide does not apply and link useful adjacent guides.
```

Frontmatter keys are `slug`, `title`, `summary`, `tags`, optional `aliases`,
`reviewedAt`, and `sources`. Slugs use lowercase kebab-case. Tags and aliases
may be empty; sources may not. Every source has only a title and an HTTPS URL.
`reviewedAt` is a real calendar date in `YYYY-MM-DD` form.

Only Markdown links whose destination is exactly `/wiki/<slug>` generate
directional discovery links. All such links must resolve to another canonical
guide. Outgoing links and backlinks expose adjacent reading; they do not encode
an ordered route, required dependency, tool invocation, or completeness claim.

Use [`GUIDE_TEMPLATE.md`](GUIDE_TEMPLATE.md) when adding a guide. The headings
are a contribution aid rather than a second schema: adapt them to the subject
while retaining applicability, practical guidance, validation, and limits.

Run after editing:

```bash
npm run generate -w @possible/knowledge
npm run validate -w @possible/knowledge
npm run test -w @possible/knowledge
```
