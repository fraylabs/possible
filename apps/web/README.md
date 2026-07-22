# @possible/web

The public Possible site has one judge journey:

- `/` — proposition, install, workflow, featured outcomes and technical explanation
- `/demo` — Still, Robot Snake, Fold and Web Presentation
- `/docs` — installation, intake, approval, execution and safety
- `/packs` — the four featured Outcome Pack specifications
- `/presentation` — the coded visual explainer

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
