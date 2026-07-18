# @possible/web

The interactive Possible surface has three layers:

- `/` — choose an outcome, write one brief, and compile it.
- `/packs` — compare the curated outcome catalog.
- `/packs/:slug` — inspect and personalize a complete pack.
- `/demo` — replay a real Hardware Launch run from one brief through parallel execution, integration, failure, repair, and verified evidence; inspect the full public Codex transcript or open the generated output.

A builder chooses Hardware Launch, Software Launch, or Open-Source Release, writes one brief, inspects the selected pack, and copies:

1. the external skill install commands;
2. a compiled Codex prompt containing their brief.

Every page imports the canonical manifest and compiler from `@possible/packs`. Production builds also emit every pack as JSON, install text, run text, and `llms.txt`.

```bash
npm run test -w @possible/web
npm run build -w @possible/web
npm run dev -w @possible/web
```
