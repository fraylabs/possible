# @possible/web

The public Possible site has one judge journey:

- `/` — proposition, install, visual Outcome Pack gallery and featured outcomes
- `/examples` — one gallery where every example switches between finished outputs and its process record
- `/docs` — overview and getting started
- `/docs/how-to-use`, `/docs/outcome-packs`, `/docs/expectations`, `/docs/authoring`, `/docs/reference`, `/docs/glossary` — the human documentation sections
- `/packs/<slug>` — individual Outcome Pack specifications linked from the homepage gallery
- `/presentation` — the coded visual explainer

`/demo/**` is retained only as the raw artifact namespace for films, CAD, simulations and evidence. Exact retired Demo pages redirect to the corresponding example’s Process view.

Canonical install:

```bash
npx @fraylabs/possible@0.1.11 init
```

The site imports the generated public catalog and compiler from `@possible/packs`. Production builds export bundled and federated pack pages from immutable snapshots; namespaced routes prevent external-author slug collisions. A listed contract is a valid source submission but not a Possible-maintainer endorsement; the page exposes that trust boundary explicitly.

```bash
npm run test -w @possible/web
npm run build -w @possible/web
npm run dev -w @possible/web
```
