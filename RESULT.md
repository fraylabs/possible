# Possible KISS Wiki Result

Status: implementation and local rendered acceptance pass on 2026-07-18;
production promotion of this reviewed artifact is pending.

## Supported trust claim

Possible is a sourced, linked wiki that humans and agents can read without a
separate planning ontology.

- The canonical corpus contains 49 Markdown pages and 146 resolved internal
  links across Web and custom-part manufacturing.
- A page has a stable slug, readable prose, tags, a review date, and at least
  one HTTPS source. Links derive graph edges, backlinks, and related pages.
- The human atlas uses one page-selection action across search, article links,
  and graph nodes. Desktop keeps a readable article beside a viewport-stable
  related-page graph; mobile uses the graph plus an accessible article sheet.
- The MCP server exposes exactly two read-only operations: `search` and `read`.
- Production builds generate `/llms.txt`, `/wiki/index.json`, and one
  `/wiki/<slug>.json` representation per page from the same corpus.

## Verification receipt

`npm run check` passes with:

- 49 pages and 146 internal links validated from 49 Markdown files;
- 14 knowledge tests, including malformed metadata, source, date, and link
  negatives;
- 7 real MCP tests across in-memory, stdio, and Streamable HTTP transports;
- 9 website behavior/accessibility tests and 1 real-corpus integration test;
- 1 real stdio helper test using the plain outcome “I want to make a robot
  arm.”;
- 5 preview-boundary tests;
- all TypeScript and production builds;
- exact verification of 54 production files totaling 801,787 bytes with
  aggregate SHA-256
  `6aa2ddd85417656cb683eb3746b77d13b89401edeee7363077a6392f70fa088a`.

The artifact verifier serves every reviewed file, checks exact bytes and
content types, proves the `/wiki/web` SPA fallback, validates all 49 generated
page documents and their backlinks/related pages, rejects symbolic links and
unsafe paths, and confirms no source maps are published.

A separate fresh-context agent received only “I want to make a robot arm.” and
the two query operations. Its one verbatim search returned `Robotic arms`
first; it read that page, followed `Parametric CAD master`, cited both review
dates and source URLs, and returned `ACCEPT` without legacy schema vocabulary.

## Rendered acceptance

The in-app Browser exercised the reviewed local production build at desktop
`1440 × 1000` and mobile `390 × 844`. Outcome search, result selection,
article-link navigation, graph refocus, stable URLs, the mobile sheet, and
graph-to-sheet navigation passed. The mobile graph was tightened after the
first pass exposed label overlap. The accepted pass had no horizontal overflow
and no browser warnings or errors.

## What this does not claim

Possible supplies maintained starting knowledge. It does not plan a project,
rank providers, hold credentials, execute deployments, make purchases, order
parts, or prove that a website, CAD model, robot arm, quote, or fabricated part
has been completed. The host agent remains responsible for reasoning, current
external checks, user decisions, execution, and artifact verification.

The original 2026-07-17 typed-graph MVP and controlled evaluations remain in
Git history and under `evals/`; the earlier deployment receipt remains in
`deployment/PRODUCTION.md`. They are historical evidence, not the active
page-only contract.
