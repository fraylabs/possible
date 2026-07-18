# @possible/web

Responsive human projection of the source-backed `@possible/knowledge` field
guide library. Search, guide text, sources, authored links, backlinks, related
reading, and atlas fields all derive from the same contributor-authored corpus.

The human surface supports two reading behaviors:

- **Discover** — search with a plain subject or browse every guide in the atlas.
- **Read** — inspect one guide, its review date, sources, and related reading.

Possible supplies context only. Atlas links are related reading, not ordered
steps, and the site does not plan, compose, execute, or validate projects.
People and host agents retain every project-specific decision and action.

Top-level folders in `knowledge/pages/` become atlas fields when each folder
contains a root guide with the same slug, such as `web/web.md` and
`manufacturing/manufacturing.md`. The deterministic graph adds no editorial
knowledge beyond authored links and folder placement.

Production builds retain stable public paths for people and agents:

- `/llms.txt`
- `/wiki/index.json`
- `/wiki/<slug>.json`
- `/agent/protocol.json`
- `/agent/search.json`
- `/agent/read/<slug>.json`
- `/agent/related/<slug>.json`

The agent publication is static. Consumers download the search index, apply its
documented normalization and ranking locally, then fetch exact guide or related-
guide representations. Search results are relevant reading, not project
recommendations or validation.

```bash
npm run test -w @possible/web
npm run build -w @possible/web
npm run dev -w @possible/web
```

The shared knowledge workspace must be built before a standalone production
build. The root verifier handles that dependency order and verifies the emitted
public files against the reviewed artifact.
