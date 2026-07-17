# Possible KISS Wiki Goal

## User-facing promise

Possible is a sourced, linked wiki of what people and agents can make possible.
A human can search or click through a calm map in Explore mode, then open the
selected page in a focused Read mode. An agent can search and read the same
canonical pages without learning a separate ontology.

Possible has one content primitive: a page. Pages contain links and sources.
The graph, backlinks, related pages, search index, HTML, and machine-readable
responses are derived projections of that corpus.

## Baseline

The completed first MVP is live and verified, but its canonical model contains
five node types, six relationship types, nested recommendation contracts,
provider capability matching, action semantics, and four MCP tools. That model
proves retrieval, but it asks Possible to formalize planning work that capable
agents can already perform from clear, maintained prose.

## Supported scope

- One version-controlled page format with stable slug, title, summary, body,
  review date, sources, and optional tags.
- Internal page links are the source of graph edges and backlinks.
- Existing useful Web and custom-part knowledge is preserved as pages or
  intentionally consolidated without losing its sourced guidance.
- The website has one page-selection action across search, graph nodes, article
  links, and browser history.
- The human interface has only two presentation modes: Explore shows search,
  concise selected-page context, and a related-page map; Read shows the full
  article, review date, and sources with one obvious return to the map.
- Desktop and mobile use the same full-page Explore/Read model. There is no
  modal, drawer, metadata rail, agent panel, or separate mobile interaction.
- Public pages have stable, shareable URLs and machine-readable content.
- The read-only MCP surface contains only `search` and `read` operations over
  the same page corpus.
- Contributions remain ordinary source-controlled page edits reviewed through
  GitHub.

## Explicit non-scope

- A planner, chat interface, workflow builder, marketplace, execution engine,
  credential proxy, or agent-hosted LLM.
- Capability contracts, artifact typing, provider ranking, trust scores,
  formal decision engines, or a universal ontology.
- Accounts, payments, autonomous purchases, deployments, fabrication, or
  physical actions.
- Unsourced generated filler added only to make the graph appear comprehensive.

## Primary verifier

From a clean checkout:

```bash
npm install
npm run check
```

The check must validate page metadata and sources, reject broken internal
links, prove graph/backlink derivation, test search and exact page reads through
the real MCP transports, build the website, and verify the reviewed production
artifact.

## Completion proof

The reset is complete only when all of the following are true:

1. The canonical runtime model exposes pages, links, and sources without the
   previous capability-planner contract.
2. All retained pages have stable slugs, readable prose, a review date, and at
   least one source; every internal link resolves.
3. The website search and graph both navigate the same pages. Explore remains
   sparse and map-first; Read presents the selected article and provenance
   without dashboard chrome, and both modes work the same way on mobile.
4. Every page has a stable browser URL and a machine-readable representation.
5. The MCP server exposes exactly `search` and `read`, and real-client tests
   prove both use the canonical corpus and remain read-only.
6. A fresh agent given only an outcome can retrieve and cite relevant Possible
   pages without requiring knowledge of legacy node types or capability fields.
7. A fresh-context reviewer confirms that Possible is materially simpler,
   useful sourced knowledge was not silently discarded, and public claims match
   the shipped behavior.
8. The reviewed build is deployed to `possible.sh` and passes live desktop and
   mobile acceptance without console errors.

## Iteration loop

Inspect the narrowest failing check, make one meaningful correction, rerun that
check, and record material evidence in `WORKLOG.md`. Run the full verifier at
integration checkpoints and before deployment.

## Anti-cheating constraints

- Do not keep legacy complexity behind renamed types while claiming a page-only
  model.
- Do not hand-author graph edges separately from page links.
- Do not weaken source, broken-link, accessibility, MCP, or artifact checks.
- Do not delete difficult knowledge merely to simplify the schema; consolidate
  it explicitly and preserve provenance.
- Do not use screenshots or visual polish as a substitute for readable content
  and working agent retrieval.

## Review pressure

Knowledge, web, and agent surfaces receive independent lane checks. Before
completion, a fresh-context reviewer audits the final repository and live site
against this file rather than trusting implementation summaries.

## Blocker standard

A blocker requires concrete evidence that an external dependency or missing
authorization prevents all meaningful in-scope progress, plus the smallest
action needed from the user. Difficulty, migration work, failing tests, or
design uncertainty are not blockers.
