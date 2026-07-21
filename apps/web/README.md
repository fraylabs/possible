# @possible/web

Possible gives non-experts access to reviewed operational judgment. People can name the outcome they want without already knowing every decision, workstream, safeguard, and quality check it requires. Possible packages that missing judgment into executable outcome packs for Codex.

**Skills are ingredients. Possible compiles the outcome.**

The interactive Possible surface has three layers:

- `/` — install Possible, invoke `$possible`, and understand the brainstorm-first journey.
- `/presentation` — view the coded visual explanation of agent skills, reusable execution prompts, Outcome Packs, and `$possible`.
- `/benchmarks` — compare what Direct, `/goal`, and `$possible` produce from the same rough prompt.
- `/docs` — learn the complete install, conversation, recommendation, confirmation, execution, and safety contract.
- `/packs` — inspect the outcome recipes Possible may recommend.
- `/packs/:slug` — inspect a pack's outputs, specialists, sources, guardrails, and verification before confirming it.
- `/demo` — see an explicitly illustrative intake followed by the preserved Hardware Launch execution, failure, repair, and verified artifacts.

A builder starts with only:

```bash
npx @fraylabs/possible@0.1.7 init
```

Then they invoke `$possible`, brainstorm one question at a time, inspect the linked recommendation, and explicitly confirm before any ingredient skill installation or local artifact work begins.

The published judge build is `0.1.7`; the current repository is the separately verified `0.1.8` candidate until that package is published.

Every page imports the canonical manifest and compiler from `@possible/packs`. Production builds also emit every pack as JSON, install text, run text, and `llms.txt`.

```bash
npm run test -w @possible/web
npm run build -w @possible/web
npm run dev -w @possible/web
```
