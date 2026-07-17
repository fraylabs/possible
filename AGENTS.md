# Possible Repository Guidelines

Possible is a standalone, agent-first operational knowledge base. It is not an
LLM planner and it does not execute privileged provider actions itself.

## Start

Run:

```bash
jj workspace update-stale
jj status
npm install
```

Read `GOAL.md` and the nearest package README before editing.

## Product contract

- Contributor-authored knowledge is the source of truth.
- The website and MCP interface must consume the same validated graph.
- Recommendations state when they apply, when they do not, alternatives,
  provenance, contributors, and review dates.
- Possible may describe or route to a provider integration, but credentials,
  payments, DNS, deployment writes, orders, and fabrication remain explicitly
  approval-gated in the user's agent host.
- Do not add an LLM call to Possible's retrieval path for the MVP.

## Work boundaries

- `knowledge/`, `schema/`, and `packages/knowledge/`: knowledge lane.
- `apps/mcp/`, `skills/possible/`, and `scripts/validate-skill.mjs`: agent lane.
- `apps/web/`: human website lane.
- `evals/` and `packages/evals/`: evaluation lane.
- Root integration files and durable goal artifacts remain parent-owned.

Preserve other agents' work. Do not edit outside your assigned lane without
explicit coordination.

## Verification

Use the narrowest relevant check while working. Before completion, run:

```bash
npm run check
```

Use Jujutsu for local history and do not weaken fixtures or validators to make
checks pass.
