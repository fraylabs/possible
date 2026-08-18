# Possible

Codex can build far more than most people know to ask for. Possible is an open-source library of Outcome Packs that shows what is possible and gives Codex a proven starting point for making it real.

Every Outcome Pack contains only:

- one structured `prompt`;
- an `expectations` checklist for what finished means;
- optional `skills` when specialized capabilities are needed, with the source and last-reviewed commit recorded;
- optional `products` that credit the Products and Companies used by the outcome without changing how it runs;
- an optional `notFor` boundary that prevents bad recommendations.

The `$possible` skill understands a rough request, searches locally saved packs and the current catalog, shows fitting choices, and waits for selection and approval. A new catalog entry becomes discoverable without editing the skill.

[Browse Outcome Packs](https://possible.sh) · [Read the docs](https://possible.sh/docs)

## Install

Requirements: Codex with project skills enabled and Node.js 22 or newer.

```bash
npx @fraylabs/possible@0.1.11 init
```

Open or reload the project in Codex, then enter:

```text
$possible
I want to explain my product with a short launch film.
```

Possible clarifies the result, shows fitting packs, and lets you choose before it presents the checklist and any additional Skills and waits for an explicit yes. A pack is direction, not permission: deployment, publishing, spending, outreach, fabrication, and other external actions require separate approval.

Save useful public packs locally without an account:

```bash
possible bookmark add fraylabs/possible/playable-web-game
possible bookmark list
possible bookmark remove fraylabs/possible/playable-web-game
```

## One source folder per bundled pack

```text
packages/packs/src/packs/<slug>/
  pack.json          # prompt + Skills + expectations + optional Product references
  discovery.json     # ordinary-language selection cases
  showcase.json      # optional presentation metadata
  media/             # optional images, video, or CAD
```

The folder name supplies the slug. The registry supplies source identity, revision, content hash, trust, and accepted evidence. Those fields never belong in `pack.json`.

Showcase media is optional and illustrative, not verification. It may include up to five images, one video, and one CAD group with a GLB preview and STEP/STL/3MF downloads.

Everything downstream is generated from the pack folders: the runtime catalog, immutable bundled snapshots, website, MCP, discovery evaluation, offline reference, and CLI skill snapshot.

Companies and Products have their own small records under `packages/packs/src/companies/` and `packages/packs/src/products/`. A Product records attribution, official links, availability, and checkout compatibility. It never duplicates a Skill or grants permission to spend.

## Author a local pack

```bash
possible pack init my-pack
possible pack validate my-pack
possible pack inspect my-pack
possible pack compile my-pack
```

The starter is intentionally incomplete. Fill its structured prompt and expectations, add Skills only when the outcome needs them, then validate it. Project-local packs remain local unless explicitly exported and submitted.

Public authors keep `pack.json` in their own GitHub repositories. An export creates a source record pinned to an exact commit and SHA-256 content hash for a normal GitHub pull request. A valid merged submission starts as `listed`; only maintainers can assign `experimental` or `verified`, and verified requires accepted run evidence. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Repository

- `packages/packs` — canonical pack folders, schema, compiler, and catalog
- `apps/cli` — installer and local authoring commands
- `apps/mcp` — read-only catalog listing, search, and fetch
- `apps/web` — pack library, detail pages, and documentation
- `skills/possible` — generic discovery and execution skill
- `registry` — source-pinned submissions and maintainer-owned trust

## Verify

```bash
npm install
npm run packs:check
npm run check
```

`packs:check` is the fast pack-contract loop. `check` is the full release gate.
