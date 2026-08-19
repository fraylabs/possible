# Possible

Discover what AI agents can do, inspect real outcomes, and copy the exact prompts behind them.

[Browse Outcomes](https://possible.sh) · [Read the docs](https://possible.sh/docs)

## What an Outcome contains

Every Outcome has:

- a clear title;
- a one-sentence summary;
- the exact prompt;
- its author.

An Outcome may also name the Products and agent Skills it uses and include up to five images, one video, one audio preview, and CAD files.

There is no prompt compiler, execution framework, trust lifecycle, or hidden orchestration layer. The prompt shown on the page is the prompt people copy.

## Optional Codex discovery skill

Possible works directly on the web. To search it from Codex:

```bash
npx @fraylabs/possible@0.1.11 init
```

Then ask:

```text
$possible What can agents do with CAD?
```

The skill searches the directory and returns the exact prompt you choose. It does not run the prompt unless you explicitly ask.

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
- `skills/possible` — generic discovery skill

## Verify

```bash
npm install
npm run outcomes:generate
npm run check
```
