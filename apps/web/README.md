# @possible/web

The public Possible site has one judge journey:

- `/` — proposition, install, workflow, featured outcomes and technical explanation
- `/examples` — one gallery where every example switches between finished outputs and its process record
- `/docs` — installation, intake, approval, execution and safety
- `/packs` — the four featured Outcome Pack specifications
- `/presentation` — the coded visual explainer

`/demo/**` is retained only as the raw artifact namespace for films, CAD, simulations and evidence. Exact retired Demo pages redirect to the corresponding example’s Process view.

Canonical install:

```bash
npx @fraylabs/possible@0.1.10 init
```

The site imports typed manifests and the compiler from `@possible/packs`. Production builds export only the featured pack pages and their JSON and text contracts.

```bash
npm run test -w @possible/web
npm run build -w @possible/web
npm run dev -w @possible/web
```
