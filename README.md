# Possible

See what AI can make, find the exact prompt, and remix it.

[Browse Outcomes](https://possible.sh) · [Read the docs](https://possible.sh/docs)

The long-term product and scaling plan is recorded in
[PRODUCT_DIRECTION.md](./PRODUCT_DIRECTION.md).

## What an Outcome contains

Every Outcome has:

- a clear title;
- a one-sentence summary;
- the exact prompt connected to the result;
- the provider and model;
- its author.

An Outcome may also preserve the prior rough request, link the original source and publication date, name the Products and agent Skills it uses, and include up to five images, one video, one audio preview, and CAD files.

Public accounts own Outcomes. Products and Skills are linked attribution: an
Outcome may use several of either without transferring ownership to them. Fray
Labs' public account is available at [possible.sh/fray-labs](https://possible.sh/fray-labs),
and maintainers manage it through the private `/dashboard` route.

There is no hidden pack compiler, trust lifecycle, or authored workflow schema. Published prompts remain visible and unchanged. The optional `$possible` skill prepares a new prompt at run time from the user's request, relevant Outcomes, and current information.

## Optional $possible skill

Possible works directly on the web. To search it from Codex:

```bash
npx @fraylabs/possible@0.1.11 init
```

Then ask:

```text
$possible What can agents do with CAD?
```

The skill searches prior Outcomes, gathers current primary information, asks only consequential questions, and prepares a self-contained execution prompt for a fresh agent. It hands work off only after you approve the prompt.

Local bookmarks do not require an account:

```bash
possible bookmark add robot-digital-prototype
possible bookmark list
possible bookmark remove robot-digital-prototype
```

## One folder per Outcome

```text
packages/catalog/src/outcomes/<slug>/
  outcome.json
  media/          # optional
```

The same generated catalog powers the website, static JSON publications, and MCP.

## Repository

- `packages/catalog` — Outcomes, Products, schema, validation, and search
- `apps/web` — visual directory, Outcome pages, Products, and docs
- `apps/mcp` — read-only list, search, and fetch tools
- `apps/cli` — optional discovery-skill installer and local bookmarks
- `skills/possible` — request research and execution-prompt preparation

## Verify

```bash
npm install
npm run outcomes:generate
npm run check
```
