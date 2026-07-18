# @possible/knowledge

This package validates contributor-authored Markdown in `knowledge/pages/` and
compiles it into the single wiki corpus consumed by Possible's human and agent
surfaces. Runtime code contains no LLM, network, filesystem, credential, or
provider-write path.

## Commands

```bash
npm run generate -w @possible/knowledge
npm run validate -w @possible/knowledge
npm run test -w @possible/knowledge
npm run build -w @possible/knowledge
```

`validate` checks frontmatter against `schema/wiki-page.schema.json`, rejects
duplicate slugs and broken internal links, and compares the committed
browser-safe data module with the canonical Markdown. `generate` updates that
data module after reviewed page changes.

## Runtime API

- `loadWiki()` returns an isolated copy of the compiled `WikiCorpus`.
- `searchPages()` performs deterministic weighted text search.
- `assessSearchResults()` labels retrieved outcomes as `verified`, `partial`, or
  `no-maintained-route` without treating related pages as a solution.
- `getPage()` retrieves one exact slug.
- `getBacklinks()` derives incoming links from page bodies.
- `getRelatedPages()` returns the direct outgoing and incoming neighbors.
- `@possible/knowledge/data` exports `wikiCorpusData` without Node-only imports.

The public model has only `PageSource`, `WikiPage`, and `WikiCorpus`. Pages may
also carry explicitly authored `aliases`, an existing page `kind` (`outcome`,
`method`, `project`, `provider`, or `concept`), and `coverage` strings for
deterministic agent routing. Links are directional slug strings extracted from
Markdown; no separately authored graph or planner ontology exists. An outcome
may carry `routeStatus: verified` only when its complete route has contributor
evidence; otherwise `partial` keeps the gap explicit.
