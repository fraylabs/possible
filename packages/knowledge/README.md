# @possible/knowledge

This package validates contributor-authored Markdown in `knowledge/pages/` and
compiles it into the field-guide library consumed by Possible's human and agent
surfaces. Runtime code contains no LLM, network, filesystem, credential,
provider-write, route-solving, or skill-selection path.

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
data module after reviewed guide changes.

## Runtime API

- `loadGuides()` returns an isolated copy of the compiled `GuideLibrary`.
- `searchGuides()` performs deterministic weighted text search with optional tag
  filtering.
- `getGuide()` retrieves one exact slug.
- `getGuideBacklinks()` derives incoming links from guide bodies.
- `getRelatedGuides()` returns the direct outgoing and incoming neighbors.
- `@possible/knowledge/data` exports `wikiCorpusData` without Node-only imports.

`loadWiki()`, `searchPages()`, `getPage()`, `getBacklinks()`, and
`getRelatedPages()` remain compatibility names over the same data and behavior.
The stable collection and result keys remain `pages` and `page` so existing web,
MCP, and static consumers do not need a data migration.

The public guide model contains a slug, title, summary, body, tags, optional
aliases, review date, sources, and links extracted from Markdown. Links support
discovery only: they do not encode a prescribed route, workflow, skill choice,
or proof status. The consuming agent decides which guides to combine, chooses
its available skills, executes, and validates the work.
