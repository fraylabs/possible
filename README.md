# Possible

Discover what AI agents can do, see what people originally asked, and inspect the complete prompts their agents received.

[Browse Outcomes](https://possible.sh) · [Read the docs](https://possible.sh/docs)

The long-term product and scaling plan is recorded in
[PRODUCT_DIRECTION.md](./PRODUCT_DIRECTION.md).

## What an Outcome contains

Every Outcome has:

- a clear title;
- a one-sentence summary;
- the original prompt;
- the full execution prompt;
- the provider, agent, model, and timestamp;
- its author.

An Outcome may also name the Products and agent Skills it uses and include up to five images, one video, one audio preview, and CAD files.

There is no hidden pack compiler, trust lifecycle, or authored workflow schema. Published execution prompts remain visible and unchanged. The optional `$possible` skill prepares a new prompt at run time from the user's request, relevant Outcomes, and current information.

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
