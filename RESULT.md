# Possible Field-Guide Library Result

Status: independently accepted as a local publication candidate; not published.

## Supported trust claim

Possible is now a maintained field-guide library with deterministic discovery,
not a project router.

- The canonical corpus contains 61 ordinary Markdown guides and 201 resolved
  authored links. A guide has only a stable slug, title, summary, optional
  aliases and tags, review date, sources, body, and derived links.
- Search finds textually relevant guides. Read returns one exact guide with its
  sources and related reading. The MCP server exposes exactly those two
  read-only tools: `search` and `read`.
- Stable `/wiki/<slug>` pages, wiki JSON, `/llms.txt`, and static agent
  artifacts remain bundled. The static agent schema is version 2 and no
  longer publishes kind, coverage, route-status, capability-matching, or
  project-proof fields.
- The installable Possible skill teaches a host agent to decompose a compound
  request, retrieve focused reading, combine it with actual project evidence,
  and cite material sources. Planning, skill and tool choice, authorization,
  execution, and project validation remain with the host agent.
- The human experience presents search, articles, sources, related reading,
  and the atlas. Link adjacency alone carries no order, dependency,
  compatibility, or completeness meaning; a guide may still explain a
  conditional practice in prose.
- `CONTRIBUTING.md`, `knowledge/GUIDE_TEMPLATE.md`, and the pull-request
  checklist define an ordinary source-control contribution path. Automated
  checks establish repository shape and publication integrity, not editorial
  truth or project success.

## Evaluation disposition

The locked eight-task paired pilot is a **no-go** for claiming that Possible
generally improves agent performance. All 16 raw runs, exact transcripts,
blinded pairs, reveal key, independent adjudication, citation audit, and the
reproducible scorer are retained in `evals/guide-library-v1/`.

- Treatment materially improved 1 of 4 covered tasks; the threshold was 3.
- Covered critical misses plus unsupported decisions were 2 at baseline and 2
  with treatment, a 0% reduction; the threshold was at least 25%.
- Treatment preserved uncertainty on both partial tasks and abstained on both
  uncovered tasks.
- No treatment safety or authorization regression was found.
- 39 of 41 material cited claims were supported, or 95.1%, above the 90%
  citation threshold.

The unfavorable result narrows the promise. It does not invalidate the library
and retrieval contract, but it provides no evidence for a general performance
uplift. Any later uplift claim needs a new versioned, precommitted pilot; this
pilot must not be rewritten or discarded.

## Verification receipt

The repository verifier covers the reduced guide schema and compiler,
deterministic retrieval, the two-tool MCP boundary, host-owned skill workflow,
human behavior and accessibility, static-publication parity, production builds,
the locked pilot, and local artifact safety:

```bash
npm ci
npm run check
```

The independently accepted implementation candidate is commit
`6845404dc729183c20b62ef000318a66c88237f7`. Its exact artifact is recorded in
`deployment/preview-artifact.json`, with publication state
`not-published`: 193 regular files totaling 2,657,229 bytes match aggregate
SHA-256 `3afbd4c5e0c40de6d7cf5b15d9eaf89f1d37786ed34d77f6ce02db0f9be14e55`.
`deployment/PRODUCTION.md` and the separately retained historical digest
describe an earlier authorized release, not this candidate.

## What is trusted

- Canonical guide format, link integrity, source URL shape, review-date shape,
  generated-data parity, and deterministic search/read behavior.
- Exactly two read-only MCP operations and compatible stable read paths.
- The human-facing and skill copy assign consequential project decisions and
  actions to the consuming agent and user.
- The paired pilot record and its no-go score are reproducible from the retained
  evidence.
- The recorded local artifact matches the built files and respects the
  publication boundary.

The fresh-context disposition and its exact-revision evidence are retained in
`REVIEW.md`.

## What remains unproven

Possible has not proved that its guides improve general agent performance, that
every guide is complete or correct for a particular project, or that linked
guides form a plan. It does not know a host's installed skills, choose tools,
execute work, authorize external actions, validate a consuming project,
certify an outcome, or fill gaps outside the maintained corpus. The current
candidate has not been deployed or promoted to production.
