# @possible/web

The public site has three product surfaces:

- `/` — the searchable, paginated active Outcome Pack library and primary product surface;
- `/packs/<identity>` — product-facing details with optional showcase media, contract contents, fit, trust, and run actions;
- `/docs/**` — multi-page human documentation.

The site imports the generated catalog, compiler, and bundled showcases from `@possible/packs`. Do not create separate example or demo catalogs. Representative media belongs in the owning pack folder as optional `showcase.json` plus `media/`; the build copies those assets into the static site. Showcase media is not evidence or verification.

Production builds export bundled and federated pack pages from immutable catalog snapshots. Namespaced routes prevent external-author slug collisions. A listed contract is valid and discoverable but is not a Possible-maintainer endorsement.

```bash
npm run test -w @possible/web
npm run build -w @possible/web
npm run dev -w @possible/web
```
