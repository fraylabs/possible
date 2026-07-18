# Possible

**Skills are ingredients. Possible compiles the outcome.**

Skills.sh distributes individual agent skills. Possible publishes opinionated outcome packs: selected skills, workstream ownership, integration order, safety gates, and the definition of done for a complete result.

## Outcome packs

- **Hardware Launch** — launch site, programmatic film, prototype CAD, waitlist contract, and evidence report.
- **Software Launch** — production product, launch site, demo film, deployment plan, and evidence report.
- **Open-Source Release** — release-ready package, documentation, examples, hardened CI, changelog, and evidence report.

## The demo

1. Choose an outcome and describe what you want to ship.
2. Possible compiles the selected pack around that brief.
3. Inspect every external skill source and copy the grouped install commands.
4. Reload Codex, then copy the personalized run prompt.
5. Codex runs isolated workstreams, integrates their receipts, and assigns a fresh reviewer.

Possible is the composition layer between capability discovery and accountable execution. A pack is named after a finished outcome, never a technology or visual style.

## Repository

- `packages/packs` — typed manifests, registry, and deterministic compiler
- `apps/web` — interactive composer and static pack publications
- `apps/mcp` — read-only `list_packs` and `compile_pack` tools
- `skills/possible` — Codex workflow for safely choosing and running packs

## Verify

```bash
npm install
npm run check
```

Production builds emit `/packs/index.json`, plus JSON, install text, and run text for every pack.

## Trust boundary

Reviewed revisions record the snapshots Possible inspected. The generated Skills CLI commands resolve external repositories at install time; users must inspect the resolved skill contents. Packs never authorize deployment, spending, publishing, outreach, fabrication, data collection, or unsupported real-world claims.
