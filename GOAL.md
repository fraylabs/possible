# Possible Field-Guide Library Goal

## User-facing promise

Possible provides contributor-authored, source-backed practical guides that
people and agents can consult before making implementation decisions. An agent
can find and read several relevant guides, combine their guidance with the
actual project context, choose from its own available skills and tools, do the
work, and validate the result itself.

Possible owns maintained guidance and deterministic discovery. It does not
plan, compose, execute, authorize, certify, or validate a project.

## Baseline

The production corpus is already a useful Markdown library with sources, review
dates, internal links, a human atlas, static agent publications, and exactly two
read-only MCP tools: `search` and `read`.

Recent outcome-first additions blur that boundary. Optional `kind`, `coverage`,
and `routeStatus` fields, outcome-intent ranking, route assessment, a scripted
execution demo, and route/proof language imply that Possible can identify a
complete route, produce a sourced plan, or establish project completion. It
cannot. The current skill and public surfaces also do not teach the clarified
workflow for decomposing a compound request and combining guides while leaving
planning and validation with the host agent.

## Supported scope

- One canonical library of ordinary Markdown guides under `knowledge/pages/`.
- Small guide metadata: slug, title, summary, aliases, tags, review date, and
  sources; internal Markdown links derive backlinks and related guides.
- A contributor convention covering applicability, decisions, practical
  approaches, complementary guides, validation guidance, limits, and
  alternatives without turning headings into a planner ontology.
- Deterministic guide search, exact guide reads, and progressive related-guide
  retrieval through the existing read-only MCP and static agent interfaces.
- An installable Possible skill that tells the host agent to decompose compound
  requests, retrieve only relevant guides, combine guidance using project
  context, choose from actual host capabilities, execute separately, validate
  independently, and cite material sources.
- A human search, atlas, and article experience that presents guides and related
  reading without route, execution, or project-proof claims.
- An ordinary source-control contribution path with a guide template, review
  checklist, and clear boundary between automated format checks and editorial
  source review.
- A locked paired pilot that tests whether Possible materially improves agent
  decisions on covered tasks while preserving uncertainty on partial coverage
  and abstaining when no relevant guide exists.

## Explicit non-scope

- Route solver, generated project plan, universal capability ontology, skill
  registry, skill availability matching, provider ranking, or recommendation
  engine.
- Possible-hosted LLM, tool invocation, skill installation, credentials,
  deployment, purchases, fabrication, email, external writes, or autonomous
  contribution submission.
- Project receipts, route digests, proof-state engine, confidence score,
  certification, or a claim that Possible validated the consuming agent's work.
- Treating graph adjacency as sequence, dependency, compatibility,
  recommendation, or completeness.
- Rewriting frozen historical evaluations as evidence for the new contract.
- Publishing or promoting a production release without the existing explicit
  authorization and artifact-verification boundaries.

## Guide trust contract

Every guide must state what it helps with, when it applies, which decisions and
inputs remain project-specific, a practical approach with important
counterconditions, useful adjacent guides, validation evidence the consuming
agent should seek, and relevant limits or alternatives. Primary or authoritative
sources are preferred for changing capability claims. Contributor judgment must
not be presented as a universal fact.

`reviewedAt` means a contributor checked the guide and its sources on that date.
It does not mean that Possible verified a project, certified an outcome, or
proved every claim independently. Automated validation proves only repository
contracts such as schema shape, dates, source URL form, link integrity, generated
data parity, and safe publication boundaries.

Project evidence, current repository state, live provider facts, actual host
capabilities, and user constraints outrank generic Possible guidance. Guides may
explain how practitioners validate work, but the host agent remains responsible
for selecting and running the relevant checks.

## Compatibility boundary

Keep existing slugs, `/wiki/<slug>` URLs, package names, static publication
paths, `llms.txt`, and MCP tool names. The public agent protocol may receive a
schema-version bump when obsolete routing fields are removed. Historical result,
review, worklog, and evaluation evidence remain auditable in repository history.

## Primary verifier

From a clean checkout:

```bash
npm ci
npm run check
```

The complete check must prove the reduced guide schema and compiler, deterministic
search/read runtime, exactly two read-only MCP tools, the Possible skill boundary,
human behavior and accessibility, static agent publication parity, production
build, and preview-artifact safety.

## Agent-behavior pilot

Lock at least eight paired tasks before treatment runs:

- four tasks with clearly relevant Possible guides;
- two tasks where guidance is useful but incomplete and project facts must
  dominate; and
- two tasks with no relevant guide, where force-fitting adjacent knowledge is a
  failure.

For each task, compare the same host, model, tools, permissions, repository
state, and budget with and without Possible. The user prompt must not name a
guide or prescribe a route. Score objective artifact checks where available,
material constraints discovered and applied, unsupported assumptions, captain
decisions, approval handling, retrieval relevance, whether retrieved guidance
changes a later decision, citation support, abstention, and context overhead.

An agent-performance claim passes only when treatment materially improves at least three of the
four covered tasks, reduces missed critical constraints or unsupported decisions
by at least 25 percent across covered tasks, preserves uncertainty on both
partial tasks, abstains on both uncovered tasks, introduces no authorization or
safety regression, and keeps material citation support at or above 90 percent.
This establishes usefulness only in the evaluated scope, not universal agent
performance.

## Recorded pilot disposition

The locked 2026-07-18 pilot is a no-go for an agent-performance improvement
claim. Blinded review found material treatment improvement on one of four
covered tasks, not the required three, and no aggregate reduction in covered
critical misses plus unsupported decisions. Treatment did preserve uncertainty
on both partial tasks, abstain on both uncovered tasks, introduce no treatment
safety or authorization regression, and support 39 of 41 material cited claims
(95.1 percent).

This unfavorable result is retained. It narrows the current product promise:
Possible is a maintained field-guide library with deterministic retrieval, not
a proven way to improve general agent performance. A future uplift claim
requires a new versioned, precommitted pilot; the current task set and raw runs
must not be rewritten or discarded.

## Iteration loop

Inspect the narrowest failing contract or paired task, make one meaningful
correction, rerun its focused verifier, and record the evidence in `WORKLOG.md`.
Run the complete clean verifier at integration checkpoints. If a guide causes
anchoring or irrelevant retrieval, improve or narrow the guide before changing
the benchmark. If the treatment does not outperform ordinary model knowledge or
primary documentation, retain the result and reduce the product claim rather
than manufacturing a routing feature.

## Anti-cheating constraints

- Do not reintroduce route status, skill matching, receipt promotion, or project
  validation under different names.
- Do not score citations, named tools, or guide retrieval unless the guidance is
  applied to a later material decision.
- Do not make treatment prompts easier, provide hidden guide names, edit locked
  tasks after runs exist, discard unfavorable runs, or present fixtures as live
  agent evidence.
- Do not weaken schema, link, source, accessibility, MCP, artifact, or safety
  checks to obtain a pass.
- Do not let hard-coded UI copy or demo data carry knowledge absent from the
  canonical guide corpus.
- Do not call a guide, project, route, or outcome verified merely because tests
  compile or one contributor reports success.

## Review pressure

Independent lanes pressure-test the knowledge/runtime contract, agent behavior,
human product, and evaluation design. Before completion, a fresh-context reviewer
must inspect the exact candidate revision, rerun the clean verifier, probe covered
and uncovered requests through the real agent interface, and reject any surface
that assigns planning, skill choice, execution, or project validation to
Possible.

## Completion proof

Completion requires:

1. The canonical schema, runtime, MCP, static protocol, skill, and public copy
   contain no active route-status, skill-router, sourced-plan, execution, or
   project-validation contract.
2. Existing stable URLs and read-only retrieval paths remain compatible.
3. The guide template and contribution checklist exist, and representative
   guides demonstrate the convention without requiring an all-at-once corpus
   rewrite.
4. Human desktop, mobile, and keyboard flows present search, guides, sources,
   related reading, atlas navigation, and contribution without implying route
   selection or proof.
5. The locked paired pilot is run and reproducible with raw transcripts,
   annotations, artifact checks where applicable, and reviewer identity
   preserved. Its pass/no-go result controls the public claim. A no-go may close
   the field-guide pivot only when Possible makes no agent-performance uplift
   claim and retains the unfavorable evidence.
6. A clean `npm ci && npm run check` passes, the publication artifact is recorded
   as a local not-published candidate and independently audited, and `RESULT.md`
   states exactly what is trusted and what remains unproven.

## Blocker standard

A blocker requires concrete evidence that an external dependency or missing
authorization prevents all meaningful in-scope progress, plus the smallest
action needed from the user. Difficulty, design iteration, failing tests, or an
unfavorable evaluation result are not blockers.
