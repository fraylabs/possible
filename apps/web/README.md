# @possible/web

The public Possible site has one judge journey:

- `/` — proposition, install, visual Outcome Pack gallery and featured outcomes
- `/examples` — one gallery where every example switches between finished outputs and its process record
- `/docs` — installation, intake, approval, execution and safety
- `/packs/<slug>` — individual Outcome Pack specifications linked from the homepage gallery
- `/presentation` — the coded visual explainer

`/demo/**` is retained only as the raw artifact namespace for films, CAD, simulations and evidence. Exact retired Demo pages redirect to the corresponding example’s Process view.

Canonical install:

```bash
npx @fraylabs/possible@0.1.11 init
```

The site imports canonical JSON manifests and the compiler from `@possible/packs`. Production builds export only the featured pack pages and their JSON and text contracts.

```bash
npm run test -w @possible/web
npm run build -w @possible/web
npm run dev -w @possible/web
```
