# Possible

Possible is an open-source directory of inspectable results and exact reusable prompts.

Before editing:

```bash
jj status
npm run test -w @possible/catalog
```

Outcome publishers own canonical `outcome.json`, `outcome.md`, and `prompt.md` files in their public repository or domain. This repository owns the directory clients, public contract, Products, and lightweight Skill links; do not add canonical Outcomes here.

Keep the separation exact: human title and explanation in `outcome.md`; full prompt in `prompt.md`; models, Products, Skills, requirements, provenance, and file metadata in `outcome.json`. Do not reintroduce a pack compiler, authored expectations, workstreams, lifecycle, or execution ceremony.

Publishers own their canonical public GitHub repository or domain source. Possible stores immutable discovery snapshots but does not host publisher accounts. The optional `$possible` Skill may prepare a new prompt at run time; it must not rewrite a published prompt.

Run `npm run check` before handoff. Use Jujutsu. Do not push or deploy unless explicitly requested.
