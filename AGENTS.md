# Possible

Possible is an open-source directory connecting original requests, full execution prompts, execution provenance, and representative outcomes.

Before editing:

```bash
jj status
npm run outcomes:check
```

Keep each Outcome in `packages/catalog/src/outcomes/<slug>/outcome.json` with optional media beside it. `outcome.json` is the only authored source for title, summary, original prompt, full execution prompt, execution provenance, author, optional Products, optional Skills, and optional preview media.

Do not add a pack compiler, authored expectations, workstreams, lifecycle, trust, evidence, snapshots, a separate registry, or execution ceremony. The website, MCP, and publications are projections of the same generated catalog. The optional `$possible` skill may prepare a new execution prompt at run time; it must not mutate published records.

Run `npm run outcomes:generate` after catalog edits and `npm run check` before handoff. Use Jujutsu. Do not push or deploy unless explicitly requested.
