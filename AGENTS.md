# Possible

Possible is an open-source directory of inspectable results and exact reusable prompts.

Before editing:

```bash
jj status
npm run outcomes:check
```

One Outcome owns one folder under `packages/catalog/src/outcomes/<slug>/` with required `outcome.json`, `outcome.md`, and `prompt.md`. Optional media, inputs, and artifacts live beside them and must be referenced.

Keep the separation exact: human title and explanation in `outcome.md`; full prompt in `prompt.md`; models, Products, Skills, requirements, provenance, and file metadata in `outcome.json`. Do not reintroduce a pack compiler, authored expectations, workstreams, lifecycle, or execution ceremony.

Publishers own their canonical public GitHub repository or domain source. Possible stores immutable discovery snapshots but does not host publisher accounts. The optional `$possible` Skill may prepare a new prompt at run time; it must not rewrite a published prompt.

Run `npm run outcomes:generate` after catalog edits and `npm run check` before handoff. Use Jujutsu. Do not push or deploy unless explicitly requested.
