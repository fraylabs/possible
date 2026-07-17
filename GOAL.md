# Possible MVP Goal

## User-facing promise

An existing agent can receive an outcome-only request, consult Possible, inherit
maintained contributor knowledge, and choose an appropriate technical starting
point or provider capability without pushing implementation choices onto the
user. Humans can inspect the same knowledge and its provenance in a polished
graph explorer.

## Baseline

The repository began empty on 2026-07-17. Agents currently rely on model priors,
ad hoc search, scattered documentation, or private knowledge silos. No shared
Possible graph, agent interface, contribution format, or controlled comparison
exists yet.

## Supported MVP scope

### Web branch

- Browser applications, dashboards, and 3D web experiences.
- Practical framework, UI, rendering, hosting, and verification knowledge.
- Read-only capability records and an approval-gated deployment handoff.

### Custom-parts branch

- Parametric CAD, interchange formats, manufacturing-process selection,
  tolerances, manufacturability, and inspection.
- Read-only manufacturer capability records and an approval-gated quote/order
  handoff.

### Product surfaces

- Version-controlled contributor knowledge with deterministic validation.
- A read-only, remote-ready MCP server and installable Agent Skill.
- A responsive graph website generated from the same validated source.
- Controlled baseline-versus-Possible evaluations and two golden demos.

## Explicit non-scope

- A universal ontology or broad AI-generated encyclopedia.
- A Possible-hosted LLM, planner, autonomous agent, or credential proxy.
- Accounts, payments, marketplace rankings, automated orders, DNS changes, or
  production deployment without explicit user approval.
- Claims that popularity alone means a tool is best.

## Knowledge trust contract

Every recommendation must state its applicability, counterconditions,
alternatives, provenance, contributor, and review date. Every provider record
must distinguish supported capabilities from unverified or unknown claims.
Generated prose without traceable sources does not count as seeded knowledge.

## Primary verifier

From a clean checkout:

```bash
npm install
npm run check
```

The command must validate the graph and skill, test MCP retrieval and package
logic, build the website and server, verify the exact production-preview bundle
and its runtime route contract, and run deterministic evaluation fixtures.

## Independent completion proof

The MVP is complete only when all of the following exist:

1. At least 24 validated knowledge nodes across both supported branches.
2. Working MCP operations for search, node retrieval, graph expansion, and
   capability discovery, with tests proving read-only behavior.
3. An Agent Skill that tells compatible agents when and how to consult Possible.
4. A visually reviewed website where users can search, navigate, and inspect
   recommendations, alternatives, contributors, sources, and freshness.
5. Baseline and Possible-assisted runs for:
   - "Build and deploy an inventory dashboard."
   - "Design a custom motor bracket and find a suitable manufacturer."
6. A scored receipt showing whether Possible reduced implementation-level user
   questions and improved use of relevant contributor knowledge.
7. A fresh-context reviewer confirms the claims in `RESULT.md` against the
   commands and artifacts rather than trusting the implementing agents.

## Iteration loop

Inspect the narrowest failing verifier, change one meaningful thing, rerun that
verifier, and record evidence in `WORKLOG.md`. Run the full primary verifier at
integration checkpoints and before completion.

## Anti-cheating constraints

- Do not weaken schemas, fixtures, scoring rubrics, or minimum node counts.
- Do not substitute mocked knowledge results for the actual graph in demos.
- Do not describe a hand-authored ideal response as an agent run.
- Do not hide failed or unsupported provider conditions.
- Do not mark completion from screenshots alone.

## Blocker standard

A blocker requires concrete evidence that an external dependency or missing
authorization prevents all meaningful in-scope progress, plus the smallest next
action needed from the user. Difficulty, incomplete polish, or a failing check
is not a blocker.

## Completion receipt

The supported MVP promise was completed on 2026-07-17. `RESULT.md` records the
claim boundary and evaluation evidence; `deployment/PRODUCTION.md` records the
public repository, exact production artifact, custom-domain delivery, and live
desktop/tablet/mobile acceptance. The explicit non-scope above remains in force.
