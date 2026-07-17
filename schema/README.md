# Possible wiki schema

`wiki-page.schema.json` validates the compiled projection of each canonical
Markdown file under `knowledge/pages/`. A page has one stable slug, prose,
optional tags, a review date, at least one HTTPS source, and links derived from
its Markdown body.

Cross-page constraints cannot be expressed by JSON Schema. The
`@possible/knowledge` compiler additionally rejects duplicate slugs,
non-canonical internal link paths, and `/wiki/<slug>` links that do not resolve.
No graph edges or planner-specific node types are authored separately.
