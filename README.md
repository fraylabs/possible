# Possible

**Skills are ingredients. Possible compiles the outcome.**

Skills.sh distributes individual agent skills. Possible publishes opinionated outcome packs: the selected skills, workstream ownership, integration order, safety gates, and definition of done needed to turn one goal into a coordinated result.

The Buildweek MVP contains one pack: **Hardware Launch**. It turns a hardware product brief into a launch site, programmatic film, prototype CAD package, waitlist contract, and evidence report.

## The demo

1. Open possible.sh and inspect the Hardware Launch sources.
2. Copy four Skills CLI install commands.
3. Reload Codex so the five installed skills are visible.
4. Copy the compiled run prompt and replace its product-brief placeholder.
5. Codex creates three independent workstreams, integrates their receipts, then assigns a fresh browser reviewer.

Possible is not a skill registry, a universal mega-skill, or a claim that installing skills guarantees an outcome. It is the missing composition layer between capability discovery and accountable execution.

## Repository

- `packages/packs` — typed pack manifest and deterministic compiler
- `apps/web` — possible.sh experience and static pack publications
- `apps/mcp` — read-only `list_packs` and `compile_pack` tools
- `skills/possible` — Codex workflow for safely using packs

The older `knowledge/`, `evals/`, and `packages/knowledge` directories are retained research from the pre-reset field-guide prototype. They are not part of the active product contract or build.

## Verify

```bash
npm install
npm run check
```

Generated web artifacts include:

- `/packs/hardware-launch.json`
- `/packs/hardware-launch/install.txt`
- `/packs/hardware-launch/run.txt`
- `/llms.txt`

## Trust boundary

Reviewed revisions record the snapshots Possible inspected. The generated Skills CLI commands resolve external repositories at install time; users must inspect the resolved skill contents. Packs never authorize deployment, spending, outreach, fabrication, data collection, or unsupported real-world claims.
