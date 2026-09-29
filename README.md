# Possible

See what AI can make, explore how it was made, and reuse the recipe.

[Browse Outcomes](https://possible.sh) · [Read the docs](https://possible.sh/docs)

## One public contract

Every Outcome is owned by its publisher and lives in three required files:

```text
outcomes.json      # publisher identity and a thin list of Outcome manifests
outcomes/<slug>/
  outcome.json    # primary Product or Skill, secondary credits, models, optional recipe, provenance
  outcome.md      # title, summary, and human explanation
  prompt.md       # exact reusable execution prompt
  media/          # optional
  inputs/         # optional
  artifacts/      # optional
```

The repository or domain is the identity. A GitHub publisher keeps `outcomes.json` at the repository root; a domain publisher exposes the same index at `https://publisher.example/.well-known/possible/outcomes.json`. Possible stores an immutable snapshot for discovery but does not host publisher accounts or take ownership of canonical files.

## CLI

```bash
npx https://github.com/fraylabs/possible/releases/download/v0.4.0/fraylabs-possible-0.4.0.tgz search "make a launch video"
npx https://github.com/fraylabs/possible/releases/download/v0.4.0/fraylabs-possible-0.4.0.tgz fetch <outcome-id> --json
npx https://github.com/fraylabs/possible/releases/download/v0.4.0/fraylabs-possible-0.4.0.tgz create my-outcome --product owner/product
npx https://github.com/fraylabs/possible/releases/download/v0.4.0/fraylabs-possible-0.4.0.tgz validate
npx https://github.com/fraylabs/possible/releases/download/v0.4.0/fraylabs-possible-0.4.0.tgz publish owner/repository
npx https://github.com/fraylabs/possible/releases/download/v0.4.0/fraylabs-possible-0.4.0.tgz add owner/repository
npx https://github.com/fraylabs/possible/releases/download/v0.4.0/fraylabs-possible-0.4.0.tgz use owner/repository@my-outcome
```

Install the optional `$possible` Skill through the standard agent-skill ecosystem:

```bash
npx skills add https://github.com/fraylabs/possible/tree/skill/skills/possible --skill possible
```

The Skill discovers relevant prior Outcomes, asks only consequential questions, and prepares one complete prompt for a fresh agent. It uses the Possible MCP when available and otherwise uses the public CLI. Local bookmarks remain account-free.

## Recipes

An Outcome still starts with a result and a reusable `prompt.md`. An optional `recipe`
in `outcome.json` records the disclosed agent/harness, multiple skills pinned to exact
commits, references, tools/APIs with their purpose, and ordered steps with key prompts
and follow-ups. Existing `models` records model provenance; `primary` and `secondary`
remain attribution, not a limit on the recipe's ingredients.

[Recipe format and example](packages/catalog/README.md#optional-recipes-cli-040) · [JSON Schema](packages/catalog/src/outcome.schema.json)

The site shows **How it was made**, with **Copy recipe** for handing the disclosed
instructions to an agent. Entries without a recipe say **Prompt only**. Missing
information remains unknown. Copying does not install tools, grant access, capture
sessions or guarantee reproduction. `fetch --json` and `use --json` retain the recipe;
plain `fetch` and `use` continue printing only the unchanged prompt.

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

CLI 0.4.0 is available as the [verified GitHub release package](https://github.com/fraylabs/possible/releases/tag/v0.4.0). The commands above use that package directly. The npm registry remains on 0.3.1 until publisher authentication is restored.
