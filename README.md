# Possible

See what AI can make, inspect the exact prompt, and remix it.

[Browse Outcomes](https://possible.sh) · [Read the docs](https://possible.sh/docs)

## One public contract

Every Outcome is owned by its publisher and lives in three required files:

```text
outcomes.json      # publisher identity and a thin list of Outcome manifests
outcomes/<slug>/
  outcome.json    # models, Products, Skills, requirements, provenance, files
  outcome.md      # title, summary, and human explanation
  prompt.md       # exact reusable execution prompt
  media/          # optional
  inputs/         # optional
  artifacts/      # optional
```

The repository or domain is the identity. A GitHub publisher keeps `outcomes.json` at the repository root; a domain publisher exposes the same index at `https://publisher.example/.well-known/possible/outcomes.json`. Possible stores an immutable snapshot for discovery but does not host publisher accounts or take ownership of canonical files.

## CLI

```bash
npx @fraylabs/possible@0.2.0 init
npx @fraylabs/possible@0.2.0 create my-outcome
npx @fraylabs/possible@0.2.0 validate
npx @fraylabs/possible@0.2.0 publish owner/repository
npx @fraylabs/possible@0.2.0 add owner/repository
npx @fraylabs/possible@0.2.0 use owner/repository@my-outcome
```

The optional `$possible` Skill discovers relevant prior Outcomes, asks only consequential questions, and prepares one complete prompt for a fresh agent. Local bookmarks remain account-free.

## Repository

- `packages/catalog` — Product definitions, lightweight Skill links, and public contract types
- `apps/web` — visual directory, Outcome pages, source publishing, and docs
- `apps/mcp` — read-only list, search, and fetch tools
- `apps/cli` — authoring, validation, publishing, discovery, use, and bookmarks
- `skills/possible` — Outcome discovery and execution-prompt preparation
- `supabase` — source registry, immutable snapshots, copies, and reviews

Fray Labs publishes its seed Outcomes independently at [fraylabs/possible-outcomes](https://github.com/fraylabs/possible-outcomes). They enter Possible through the same public source path as every other publisher.

## Verify

```bash
npm install
npm run check
```
