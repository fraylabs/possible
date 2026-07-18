# Possible Repository Guidelines

Possible is a source-backed field-guide library for people and agents.
It is not a planner, router, execution engine, verifier, or capability
marketplace.

## Start

Run:

```bash
jj workspace update-stale
jj status
npm install
```

Read `GOAL.md` and the nearest package README before editing.

## Product contract

- Contributor-authored Markdown guides are the source of truth.
- A guide contains prose, aliases, tags, links, sources, and a review date. Do
  not introduce a second ontology for routes, skills, workflows, capabilities,
  receipts, or proof states.
- A guide explains applicability, project-specific decisions, practical
  approaches, useful adjacent reading, validation evidence the consuming agent
  should seek, and important limits or alternatives.
- Internal links derive the graph, backlinks, and related-guide views. Link
  adjacency and display order alone carry no dependency, compatibility,
  recommendation, or completeness semantics. Guide prose may describe a
  conditional common sequence; the host decides whether it applies.
- The website and agent interfaces consume the same validated guide library.
- The agent surface is read-only and limited to deterministic search and exact
  guide reads. Do not add an LLM to Possible's retrieval path.
- The host agent owns decomposition, guide selection and composition, skill and
  tool choice, execution, authorization, and project validation.
- Automated repository validation proves format and publication contracts, not
  the truth of a guide or the completion of a consuming project.
- Contributions use ordinary reviewed source-control changes. Possible exposes
  no write, submission, installation, deployment, purchase, or fabrication API.

## Work boundaries

- `knowledge/`, `schema/`, and `packages/knowledge/`: guide-library lane.
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
