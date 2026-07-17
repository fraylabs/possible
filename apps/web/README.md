# @possible/web

Responsive human projection of the validated `@possible/knowledge` wiki.
The atlas adds no editorial knowledge of its own: search, articles, graph
neighbors, sources, and routes all derive from the shared page corpus. The
top-level folders in `knowledge/pages/` become atlas fields when each folder
contains a root page with the same slug, such as `web/web.md` and
`manufacturing/manufacturing.md`.

The interface has two modes:

- **Explore** — `/` shows sibling top-level fields; selecting one opens its
  concise page context and a small related map scoped to that field.
- **Read** — the full selected article, review date, sources, and one return to
  the map.

Desktop and mobile use the same full-page model. Selecting a search result,
article link, graph node, or browser-history entry performs the same page
navigation action and preserves the active mode.

Production builds also generate public agent-readable files from that corpus:

- `/llms.txt`
- `/wiki/index.json`
- `/wiki/<slug>.json`

```bash
npm run test -w @possible/web
npm run build -w @possible/web
npm run dev -w @possible/web
```

The shared knowledge workspace must be built before a standalone production
build. The root verifier handles that dependency order and verifies every
generated page representation against the reviewed artifact.
