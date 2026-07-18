# Possible Persistent Knowledge Universe Goal

## User-facing promise

Possible presents its complete sourced wiki as one persistent knowledge
universe. People can zoom from top-level fields into individual pages, select a
node without losing the wider map, inspect its context, read it, and return to
the same place. Zoom changes the level of visible detail; selection never
replaces the global graph with a smaller graph.

The canonical knowledge model remains KISS: pages, internal links, and sources.
The graph, clusters, focus paths, search, HTML, and machine-readable responses
are derived projections of that same corpus.

## Baseline

The production atlas renders all 49 pages globally on `/`, but selecting a page
swaps the global atlas for a small local graph. Entering Read unmounts the graph
and loses its camera. The minimum zoom is too close to communicate the whole
universe, distant detail does not resolve semantically, and returning to wider
context relies on page-style navigation rather than persistent spatial context.

## Supported scope

- One global graph remains mounted throughout Explore.
- Selecting a page highlights it and its authored neighbors while the rest of
  the universe stays spatially visible.
- A concise inspector exposes the selected page and an explicit Read action.
- Semantic zoom reveals fields, prominent hubs, ordinary pages, labels, and
  edges progressively without removing canonical pages from the graph.
- Folder-derived fields receive subtle cloud/nebula regions as orientation,
  never as a second ontology or inaccessible hidden state.
- Pan, zoom, fit-all, clear-focus, search, browser history, keyboard use, and
  touch use the same page-selection contract.
- Returning from Read restores the prior graph camera and selection.
- Stable `/wiki/<slug>` URLs, generated wiki JSON, `llms.txt`, and the two-tool
  read-only MCP contract remain unchanged.

## Explicit non-scope

- Typed-edge ontology, route planner, recommendation engine, trust score,
  accounts, personalization, marketplace, or autonomous execution.
- Invented nodes, links, or unsourced content added to make the universe look
  fuller.
- Decorative 3D navigation that reduces label clarity, keyboard access, or
  performance.
- Rewriting the seven unrelated manufacturing drafts already in the captain's
  working copy.

## Primary verifier

From a clean checkout:

```bash
npm ci
npm run check
```

The web suite must additionally prove that node and label selection keeps the
global atlas present, focus highlights authored neighbors, zoom crosses
semantic detail bands, history restores selection/camera state, Read returns to
the preserved map, mobile and keyboard interactions remain operable, and the
agent data contract is unchanged.

## Iteration loop

Inspect the narrowest failing behavior, make one meaningful correction, rerun
its focused test, then run the clean primary verifier at integration and release
checkpoints. Preserve exact production artifacts and verify both custom domains
before completion.

## Anti-cheating constraints

- Do not simulate persistence by rebuilding an equivalent graph after every
  selection while discarding the user's camera.
- Do not hide pages from the data model or hand-author cluster relationships.
- Do not weaken accessibility, history, source, MCP, or artifact checks.
- Do not treat visual screenshots as proof of navigation behavior.
- Do not include the captain's unrelated manufacturing drafts in the release.

## Review pressure

Independent UX, architecture, semantic-zoom, and verification lanes pressure-
test the implementation. Before completion, a fresh-context verifier audits the
exact release and production artifact against this goal.

## Completion proof

Completion requires focused interaction tests, a clean `npm run check`, an
independent review with no blocking finding, a committed production artifact,
a Ready production deployment, and exact live-file matches on both
`possible.sh` and `www.possible.sh`.

## Blocker standard

A blocker requires concrete evidence that an external dependency or missing
authorization prevents all meaningful in-scope progress, plus the smallest
action needed from the user. Difficulty, design iteration, or failing tests are
not blockers.
