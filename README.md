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
npx @fraylabs/possible@0.1.11 init
npx @fraylabs/possible@0.1.11 create my-outcome
npx @fraylabs/possible@0.1.11 validate
npx @fraylabs/possible@0.1.11 publish owner/repository
npx @fraylabs/possible@0.1.11 add owner/repository
npx @fraylabs/possible@0.1.11 use owner/repository@my-outcome
```

The optional `$possible` Skill discovers relevant prior Outcomes, asks only consequential questions, and prepares one complete prompt for a fresh agent. Local bookmarks remain account-free.

## Repository

- `packages/catalog` — bundled seed Outcomes, Products, validation, and search
- `apps/web` — visual directory, Outcome pages, source publishing, and docs
- `apps/mcp` — read-only list, search, and fetch tools
- `apps/cli` — authoring, validation, publishing, discovery, use, and bookmarks
- `skills/possible` — Outcome discovery and execution-prompt preparation
- `supabase` — source registry, immutable snapshots, copies, and reviews

The six bundled Outcomes are Fray Labs seed content. They use the same public contract as every outside publisher and can move to a standalone public source without a special migration.

## Verify

```bash
npm install
npm run outcomes:generate
npm run check
```
