# Possible

**Skills are ingredients. Possible compiles the outcome.**

Skills.sh distributes individual agent skills. Possible publishes opinionated outcome packs: selected skills, workstream ownership, integration order, safety gates, and the definition of done for a complete result.

## Outcome packs

- **Hardware Launch** — launch site, programmatic film, prototype CAD, waitlist contract, and evidence report.
- **Software Launch** — production product, launch site, demo film, deployment plan, and evidence report.
- **Open-Source Release** — release-ready package, documentation, examples, hardened CI, changelog, and evidence report.

## The demo

`/demo` replays a real local Hardware Launch run for Still, a fictional palm-sized e-ink focus device. It shows the original brief, five installed skills, three parallel workstreams, the resulting website, launch film, prototype CAD, integrated launch room, and the independent review that found and verified a real asset-path repair.

The replay links directly to its evidence: 58/58 artifact checks, 50/50 browser checks, zero waitlist network writes, and the preserved initial failure trace.

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

The web surface keeps creation, discovery, and presentation separate: `/` is the outcome composer, `/packs` is the curated gallery, `/packs/:slug` explains and personalizes one complete pack, and `/demo` is the recorded Hardware Launch replay.

## Trust boundary

Reviewed revisions record the snapshots Possible inspected. The generated Skills CLI commands resolve external repositories at install time; users must inspect the resolved skill contents. Packs never authorize deployment, spending, publishing, outreach, fabrication, data collection, or unsupported real-world claims.
