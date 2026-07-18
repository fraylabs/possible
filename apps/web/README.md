# @possible/web

Responsive human projection of the validated `@possible/knowledge` wiki.
The atlas adds no editorial knowledge of its own: search, articles, graph
neighbors, sources, and routes all derive from the shared page corpus. The
top-level folders in `knowledge/pages/` become atlas fields when each folder
contains a root page with the same slug, such as `web/web.md` and
`manufacturing/manufacturing.md`.

The interface has two modes:

- **Explore** — `/` shows every sourced page in one force-settled global graph,
  clustered under sibling top-level fields. Selecting a node opens its concise
  context and a local related-page graph scoped to that field.
- **Read** — the full selected article, review date, sources, and one return to
  the map.

Desktop and mobile use the same full-page model. Selecting a search result,
article link, graph node, or browser-history entry performs the same page
navigation action and preserves the active mode.

The map uses a Three.js canvas for subtle depth, link lines, and colored node
glows. The force layout is deterministic from authored wiki links and folder
fields. Obsidian-style pan, zoom, neighbor tracing, labels, and selection remain
semantic HTML above the canvas; static SVG links remain available when WebGL 2
is unavailable, and reduced-motion users receive a still scene.

Production builds also generate public agent-readable files from that corpus:

- `/llms.txt`
- `/wiki/index.json`
- `/wiki/<slug>.json`
- `/agent/protocol.json`
- `/agent/search.json`
- `/agent/read/<slug>.json`
- `/agent/related/<slug>.json`

The agent publication is deliberately static. `GET /agent/search.json` returns
the complete searchable index and its normalization/ranking rules; it does not
evaluate a `q` query parameter. Consumers search that response locally, then
fetch an exact read or related representation for a slug from the published
index. Every page representation is generated from the validated corpus and
retains its review date, sources, and authored links.

```bash
npm run test -w @possible/web
npm run build -w @possible/web
npm run dev -w @possible/web
```

The shared knowledge workspace must be built before a standalone production
build. The root verifier handles that dependency order and verifies every
generated page representation against the reviewed artifact.
