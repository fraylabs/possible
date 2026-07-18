# @possible/web

The interactive Possible surface has three layers:

- `/` — install Possible, invoke `$possible`, and understand the brainstorm-first journey.
- `/packs` — inspect the outcome recipes Possible may recommend.
- `/packs/:slug` — inspect a pack's outputs, specialists, sources, guardrails, and verification before confirming it.
- `/demo` — see an explicitly illustrative intake followed by the preserved Hardware Launch execution, failure, repair, and verified artifacts.

A builder starts with only:

```bash
npx @possible/cli init
```

Then they invoke `$possible`, brainstorm one question at a time, inspect the linked recommendation, and explicitly confirm before any ingredient skill installation or local artifact work begins.

Every page imports the canonical manifest and compiler from `@possible/packs`. Production builds also emit every pack as JSON, install text, run text, and `llms.txt`.

```bash
npm run test -w @possible/web
npm run build -w @possible/web
npm run dev -w @possible/web
```
