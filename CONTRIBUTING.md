# Contributing to Possible

Possible accepts source-backed practical guides and focused improvements to
existing guides. A contribution should make one recurring subject easier for a
person or agent to understand before deciding what to do.

Possible is not a route catalog or project verifier. Contributions must not
claim that a guide is a complete project plan, that linked guides form a
workflow, or that Possible certified a consuming project.

## Before writing

Search the existing library and read the nearest related guides. Prefer
improving an existing guide when the subject and decision boundary already fit.
Create a new guide only when it teaches one coherent subject that is not already
covered clearly.

Start from `knowledge/GUIDE_TEMPLATE.md`. A useful guide states:

- what it helps with and when it applies;
- the decisions and inputs that remain project-specific;
- a practical approach and important counterconditions;
- related guides that may help alongside it;
- evidence practitioners inspect, measure, or test; and
- limits, alternatives, and facts requiring a fresh authoritative check.

Prefer primary or authoritative sources. Separate sourced facts from contributor
judgment and disclose material commercial or provider conflicts. Do not include
secrets, credentials, private artifacts, customer data, proprietary logs, or
absolute local paths.

## Metadata

Guide frontmatter contains only:

```yaml
slug: stable-kebab-case
title: Human-readable title
summary: One concise description
aliases: []
tags: []
reviewedAt: YYYY-MM-DD
sources:
  - title: Primary source title
    url: https://example.com/source
```

`reviewedAt` records when the contributor checked the guide and its sources. It
does not mean the guide or any consuming project was verified.

Link to another Possible guide with `/wiki/<slug>`. Links mean useful adjacent
reading only; they do not declare sequence, dependency, compatibility, or
completeness.

## Agent-authored drafts

Agents may research and draft a guide or patch. The human or host workflow must
show what would be shared and obtain separate authorization before opening a
pull request or publishing externally. Agent execution logs and project receipts
are editorial leads, not automatic evidence and not part of the guide corpus by
default.

## Review

Automated checks prove only repository contracts such as schema shape, valid
dates, HTTPS source form, link integrity, generated-data parity, and safe build
artifacts. Reviewers remain responsible for checking scope, clarity, source
support, counterconditions, and contributor conflicts.

Run:

```bash
npm run knowledge:validate
npm run test -w @possible/knowledge
npm run check
```

The complete check is required before merge.
