# @possible/web

Responsive human projection of the validated `@possible/knowledge/data` graph.
The explorer adds no editorial knowledge of its own: it adapts shared nodes and
typed edges into search, path navigation, a focused constellation, and a detail
view for recommendations, applicability, counterconditions, alternatives,
provider capabilities, safe handoffs, provenance, and freshness.

```bash
npm run test -w @possible/web
npm run build -w @possible/web
npm run dev -w @possible/web
```

The shared knowledge workspace must be built before a standalone production
build. The root verifier handles that dependency order.
