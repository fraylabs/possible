# Possible — Build Week provenance

This file separates repository evidence from submission-owner attestations. It is not a claim that every historical commit is eligible Build Week work.

## Repository-observed boundary

The clearest product boundary in local history is:

```text
afb5fc1c1e01d746753712ddc79f456df0984826
2026-07-18T21:35:19+08:00
Reset Possible as a Hardware Launch outcome compiler
```

Its parent describes Possible as “a library of source-backed practical guides” that “does not plan, choose tools, execute, authorize, certify, or validate a project.” Commit `afb5fc1` introduces `packages/packs`, changes the product to an outcome compiler, and removes most of the earlier guide-library implementation.

To inspect the before/after boundary:

```bash
git show afb5fc1^:README.md
git show --stat afb5fc1
git diff --stat afb5fc1^..afb5fc1
```

To inspect all work after that reset through the checked-out submission revision:

```bash
git log --date=iso-strict --format='%H %ad %s' afb5fc1^..HEAD
git diff --stat afb5fc1^..HEAD
```

The exact submitted end commit should be recorded here or in the Devpost entry after the submission snapshot is frozen. At the time this document was written, the checked-out parent revision was `5e8cfe3fc52b1d42b85b666410457987d84d27ba` (2026-07-21T12:48:00+08:00, “Shorten homepage outcome prompt”); concurrent submission work was still in progress.

## Before and after

Before `afb5fc1`, Possible was a sourced guide library with read-only search and retrieval. It explicitly left planning, skill choice, execution, and verification to the host agent.

From `afb5fc1` onward, the repository record adds:

- typed outcome-pack manifests and a deterministic compiler under `packages/packs`;
- the interview-first, confirmation-gated `$possible` workflow under `skills/possible`;
- the repo-local npm installer under `apps/cli`;
- read-only `list_packs` and `compile_pack` MCP tools under `apps/mcp`;
- outcome pages and static publications generated from the same registry;
- preserved Hardware Launch, Software Launch, Open-Source Release, and game demos with transcripts and receipts;
- a frozen five-condition pilot with raw transcripts, subject receipts, independent machine results, screenshots, and explicit protocol limitations under `benchmarks/outcome-v1`.

The dated implementation narrative is in [WORKLOG.md](WORKLOG.md). Current architectural boundaries are in [ARCHITECTURE.md](ARCHITECTURE.md).

## Codex and human contributions

Repository evidence shows Codex execution directly in the preserved public demo transcripts and benchmark transcripts:

- [Still Hardware Launch transcript](apps/web/public/demo/still/CODEX-THREAD.md)
- [Open-Source Release transcript](apps/web/public/demo/tiny-slug/CODEX-THREAD.md)
- [Possible benchmark transcript](benchmarks/outcome-v1/transcripts/possible-r1.json)
- [Independent verifier transcript](benchmarks/outcome-v1/independent/verifier-transcript.json)

Those records expose user/assistant messages, tool-facing execution evidence where retained, artifacts, failures, repairs, and verification. The benchmark protocol records that its tasks inherited the parent task's model and reasoning configuration, but the repository does not independently attest the exact `GPT-5.6` label. The submission owner should link the official Codex task/session record that proves the model used.

Human product and architecture decisions recorded in [WORKLOG.md](WORKLOG.md) include rejecting the universal-skill and marketplace framings, defining Possible as the composition layer above individual skills, choosing Hardware Launch as the hero demonstration, requiring interview-first intake and explicit confirmation, and preserving approval gates for external actions. Codex carried those decisions through implementation, artifact generation, testing, recorded execution, and independent verification; the preserved transcripts are the inspectable evidence, not a claim that the model chose the product strategy unaided.

## Measured proof and limitations

- The [Still receipt](apps/web/public/demo/still/OUTCOME-RECEIPT.md) records 58/58 artifact checks and a fresh 50-response browser trace after a verifier found broken root-relative assets and the captain repaired them.
- The [outcome-v1 independent report](benchmarks/outcome-v1/independent/RESULT.md) records one run per workflow condition. `possible-r1` passed all 20 outcome checks and its prescribed treatment; `direct-r1` passed 19/20 and was not verified.
- The same report says the pilot cannot establish typical performance or a causal speed advantage: there is one run per condition, shared parallel resource contention, and two non-Possible treatments failed their assigned treatment contract.
- No claim should describe this pilot as proof that Possible is generally faster or better across repositories. It is evidence that the workflow compiled, executed, preserved failures, and reached a verified outcome in this run.

## Submission-owner confirmation required

Before submission, record and link:

1. the official Build Week eligibility start and end timestamps;
2. the first eligible commit and frozen submission commit;
3. the Codex task/session showing GPT-5.6 usage;
4. any pre-event Possible work that must be excluded from the “built during Build Week” claim.
5. the npm version judges should install and proof that it matches the frozen source. On 2026-07-21, `npm view @fraylabs/possible version` returned `0.1.6` while this checkout declared the not-yet-published `0.1.7` candidate.

Until those facts are supplied, `afb5fc1^..HEAD` is a traceable product-reset range, not an independently proven eligibility range.
