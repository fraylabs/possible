# Possible

Possible is an open-source directory of exact prompts and representative outcomes.

Before editing:

```bash
jj status
npm run outcomes:check
```

Keep each Outcome in `packages/catalog/src/outcomes/<slug>/outcome.json` with optional media beside it. `outcome.json` is the only authored source for title, summary, exact prompt, author, optional Products, optional Skills, and optional preview media.

Do not add a compiler, expectations, workstreams, lifecycle, trust, evidence, snapshots, a separate registry, or execution ceremony. The website, MCP, publications, and optional `$possible` skill are discovery surfaces over the same generated catalog.

Run `npm run outcomes:generate` after catalog edits and `npm run check` before handoff. Use Jujutsu. Do not push or deploy unless explicitly requested.
