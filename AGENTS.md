# Possible Repository Guidelines

Possible is a sourced wiki of what people and agents can make possible.
It is not an LLM planner, execution engine, or capability marketplace.

## Start

Run:

```bash
jj workspace update-stale
jj status
npm install
```

Read `GOAL.md` and the nearest package README before editing.

## Product contract

- Contributor-authored pages are the source of truth.
- A page contains prose, links, sources, and a review date. Do not introduce a
  second ontology for outcomes, tools, providers, workflows, or capabilities.
- Internal page links derive the graph, backlinks, and related-page views.
- The website and MCP interface consume the same validated page corpus.
- The MCP surface is read-only and limited to search and exact page reads.
- Do not add an LLM call to Possible's retrieval path for the MVP.

## Work boundaries

- `knowledge/`, `schema/`, and `packages/knowledge/`: page-corpus lane.
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
