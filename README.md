# Possible

See what AI can make, inspect the exact prompt, and remix it.

[Browse Outcomes](https://possible.sh) · [Read the docs](https://possible.sh/docs)

## One public contract

Every Outcome is owned by its publisher and lives in three required files:

```text
outcomes.json      # publisher identity and a thin list of Outcome manifests
outcomes/<slug>/
  outcome.json    # primary Product or Skill, secondary credits, models, provenance
  outcome.md      # title, summary, and human explanation
  prompt.md       # exact reusable execution prompt
  media/          # optional
  inputs/         # optional
  artifacts/      # optional
```

The repository or domain is the identity. A GitHub publisher keeps `outcomes.json` at the repository root; a domain publisher exposes the same index at `https://publisher.example/.well-known/possible/outcomes.json`. Possible stores an immutable snapshot for discovery but does not host publisher accounts or take ownership of canonical files.

## CLI

```bash
npx @fraylabs/possible@0.3.1 search "make a launch video"
npx @fraylabs/possible@0.3.1 fetch <outcome-id>
npx @fraylabs/possible@0.3.1 create my-outcome --product owner/product
npx @fraylabs/possible@0.3.1 validate
npx @fraylabs/possible@0.3.1 publish owner/repository
npx @fraylabs/possible@0.3.1 add owner/repository
npx @fraylabs/possible@0.3.1 use owner/repository@my-outcome
```

Install the optional `$possible` Skill through the standard agent-skill ecosystem:

```bash
npx skills add https://github.com/fraylabs/possible/tree/skill/skills/possible --skill possible
```

The Skill discovers relevant prior Outcomes, asks only consequential questions, and prepares one complete prompt for a fresh agent. It uses the Possible MCP when available and otherwise uses the public CLI. Local bookmarks remain account-free.

## Repository

- `packages/catalog` — public Outcome contract types
- `apps/web` — visual directory, Outcome pages, source publishing, and docs
- `apps/mcp` — read-only list, search, and fetch tools
- `apps/cli` — authoring, validation, publishing, discovery, use, and bookmarks
- `skills/possible` — Outcome discovery and execution-prompt preparation
- `convex` — source registry, immutable snapshots, deduplicated uses, likes, bookmarks, and reader authentication

Fray Labs publishes its seed Outcomes independently at [fraylabs/possible-outcomes](https://github.com/fraylabs/possible-outcomes). They enter Possible through the same public source path as every other publisher.

## Verify

```bash
npm install
npm run check
```

Local backend development uses `npx convex dev`. Publishing remains account-free and source-owned; a reader may sign in with GitHub only when they want to like or save an Outcome.
