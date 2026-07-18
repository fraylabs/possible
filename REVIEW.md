# Possible Field-Guide Library Review

Review status: **ACCEPTED**.

The independent fresh-context review accepted exact candidate commit
`6845404dc729183c20b62ef000318a66c88237f7`, tree
`2b3223c1c1aef4cb13265211a72daa24556b6657`, and local artifact
`3afbd4c5e0c40de6d7cf5b15d9eaf89f1d37786ed34d77f6ce02db0f9be14e55`.
The candidate remains local and `not-published`.

## Provenance and clean verification

- All 256 tracked files and modes matched a fresh archive of the exact commit.
  The only additional clean-review files were generated dependency and build
  outputs.
- Independent artifact recomputation produced 193 regular files totaling
  2,657,229 bytes and the expected aggregate SHA-256.
- `npm ci` installed 233 packages, audited 238, reported zero vulnerabilities,
  and exited successfully under Node `v25.2.1` and npm `11.6.2`.
- `npm run check` exited successfully. It validated 61 guides and 201 authored
  links, reproduced the locked eight-task/16-run pilot, and passed 20 knowledge,
  8 MCP, 27 web, 1 data-contract, 1 real-agent-helper, and 5 preview-safety
  tests, as well as all builds and artifact verification.

## Real interface probes

- `search 'robotic arm'` returned five focused results with `robotic-arms`
  first.
- `read robotic-arms` returned the canonical parsed guide and complete prose,
  four sources, twelve links, one backlink, and twelve related guides.
  Rendered frontmatter is normalized, so this is structured-content and prose
  identity rather than authored YAML byte identity.
- `search 'gene therapy'` returned zero results and invented nothing.
- Live MCP discovery exposed exactly `search` and `read`. Both declared
  read-only, non-destructive, idempotent, closed-world behavior.

## Ownership boundary

The reviewer found the clarified product boundary intact:

- The closed schema permits ordinary guide fields and derived links only. The
  compiler rejects unsupported frontmatter and stale generated data.
- Search is deterministic textual retrieval, read is an exact-slug lookup, and
  related reading derives only from authored links and backlinks.
- MCP instructions and the installable skill leave decomposition, guide
  combination, skill and tool choice, planning, authorization, execution, and
  consuming-project validation with the host.
- Human and agent copy present Possible as source-backed reading, not a router,
  planner, executor, proof engine, skill registry, or project validator.

## Pilot disposition

The paired pilot reproduced its honest **no-go** result: 1/4 covered tasks
materially improved, covered issue reduction was 0%, uncertainty was preserved
on 2/2 partial tasks, treatment abstained on 2/2 uncovered tasks, no treatment
authorization or safety regression occurred, and 39/41 material citations were
supported. The current product makes no general agent-performance uplift claim.

## Publication integrity and prior rejections

The candidate remains local and `not-published`; publication requires separate
authorization. Historical artifact
`57945bd9ed262d2cf4d411c9787394cee1d1f76282d111268adc68fe9010117f`
genuinely appears in `deployment/PRODUCTION.md` and is separated from the
current artifact in `deployment/preview-artifact.json`.

Three earlier exact revisions were rejected rather than waived:

1. `fd14c405a76ebabf5405275b710b3c60dfeb3559` mixed live/published wording
   with a not-published manifest and cited an orphaned historical digest.
2. `796f4278cbd341dfc579040441ae4fbc7d0bb8d5` retained current-corpus
   published/public wording in active copy and receipts.
3. `fca761ed7ab6ce562b15f3c53c06ee643353221f` sent agents to the existing
   production origin, which still served the obsolete version-1 routing
   contract.

The accepted candidate closes those failures. The agent prompt derives
`/llms.txt` from the page origin and requires schema version 2. The bundled
`llms.txt` requires schema version 2 and uses root-relative agent and wiki paths.
Neither surface hard-codes `https://possible.sh` for agent, wiki, or discovery
retrieval. `robots.txt` disallows `/`, and the artifact contains no sitemap. A
point-in-time probe confirmed that `possible.sh` still served schema version 1,
so the same-origin rule and mandatory version stop prevent silent fallthrough
to that incompatible contract.

## Goal assessment and limits

The reviewer found all six completion criteria in `GOAL.md` met. Acceptance
proves repository and artifact integrity, deterministic retrieval, boundary
copy, and reproducible recorded evidence. It does not establish every guide's
editorial truth, general agent-performance uplift, a deployed candidate, or
authorization to publish.

Review commands included:

```bash
git archive 6845404dc729183c20b62ef000318a66c88237f7
npm ci
npm run check
node scripts/query-possible.mjs search 'robotic arm'
node scripts/query-possible.mjs read robotic-arms
node scripts/query-possible.mjs search 'gene therapy'
```

The independent reviewer modified no tracked files.
