# @possible/web

The interactive Possible surface.

A builder chooses Hardware Launch, Software Launch, or Open-Source Release, writes one brief, inspects the selected pack, and copies:

1. the external skill install commands;
2. a compiled Codex prompt containing their brief.

The page imports the canonical manifest and compiler from `@possible/packs`. Production builds also emit the pack as JSON, install text, run text, and `llms.txt`.

```bash
npm run test -w @possible/web
npm run build -w @possible/web
npm run dev -w @possible/web
```
