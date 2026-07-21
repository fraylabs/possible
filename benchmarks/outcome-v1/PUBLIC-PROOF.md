# Possible outcome-v1 — public proof summary

## What this pilot observed

In one controlled five-condition pilot, the Possible run reached the frozen
verified-outcome threshold: all 20 required checks passed, its assigned
workflow treatment passed, and an independent verifier accepted the result.
The direct-prompt run stopped with 19 of 20 checks passing because keyboard
submission failed in the production app.

This is evidence from one run per condition, not evidence that Possible is
typically faster, more reliable, or causally better than another workflow.

## Fair conditions

The protocol was frozen before the results were known. Every run:

- started in a fresh Codex worktree at the same Fray revision;
- inherited the same model and reasoning configuration;
- received the same complete [product brief](https://github.com/fraylabs/possible/blob/main/benchmarks/outcome-v1/brief.md);
- owned only a new `repos/daymark` directory;
- was barred from inspecting Possible, sibling runs, or the benchmark;
- had the same local-only scope and no authorization to deploy or publish; and
- was evaluated against the same 20-check decision rule by a fresh verifier
  that could inspect but not repair the output.

Only the coordination treatment changed: direct prompting, a persistent spec,
a maintained plan, a verifier-backed goal, or Possible. The exact treatments,
clarification packet, timing rules, and anti-cheating constraints are in the
[frozen protocol](https://github.com/fraylabs/possible/blob/main/benchmarks/outcome-v1/PROTOCOL.md). The [verifier contract](https://github.com/fraylabs/possible/blob/main/benchmarks/outcome-v1/VERIFIER.md) defines the
20 checks and the all-or-nothing outcome decision.

## Exact results

| Condition | Outcome | Checks | Treatment | Elapsed | Operator follow-ups / words / approvals |
| --- | --- | ---: | --- | ---: | ---: |
| Direct | **Not verified** | 19/20 | Pass | 715 s to stop | 0 / 0 / 0 |
| Spec | Verified | 20/20 | **Fail** | 1,101 s | 0 / 0 / 0 |
| Plan | Verified | 20/20 | **Fail** | 1,332 s | 0 / 0 / 0 |
| Goal | Verified | 20/20 | Pass | 1,511 s | 0 / 0 / 0 |
| Possible | **Verified** | **20/20** | **Pass** | 1,850 s | 2 / 14 / 1 |

`verified` required passing `npm test`, passing `npm run build`, no isolation
violation, and a pass on every frozen check. A skip or unproven check would also
have prevented verification.

The Spec run's outcome passed, but its `SPEC.md` did not map every frozen brief
requirement to acceptance. The Plan run's outcome passed, but its transcript did
not establish the required plan-tool lifecycle before implementation and through
verification. These are treatment failures, not outcome failures, and they
must not be hidden or counted as evidence for their named workflows.

Elapsed time is included only as a workflow trace. All five runs were dispatched
together and shared agent, browser, port, and package-cache capacity. This pilot
does not support a relative-speed claim.

## What independent verification changed

The direct run had passing tests and a passing production build, but that did not
make the outcome verified. In the production app, pointer addition worked while
three independent Enter-key attempts left a non-empty textbox unchanged. The
verifier therefore failed `nonempty-add-keyboard-pointer` and classified the run
as `not_verified` rather than accepting the subject's completion report.

The Possible run did not mark the outcome complete after implementation or its
captain test/build pass. It waited for a separate verification-only workstream
to exercise the production build at 390 px and 1280 px, check the full flow and
network boundary, preserve screenshots, and return a written evidence matrix.
That fresh review passed all frozen outcome checks.

## The recorded correction inside the Possible run

The Possible transcript preserves a real pre-integration inconsistency: a
product-contract draft used the wrong storage key/schema and over-specified the
reset UI. Integration was held, the contract was corrected to the confirmed
`daymark:v1` / `date` interface, and the corrected workstream was rechecked before
captain integration and fresh verification. The final independent result passed
all 20 checks.

Two proof-suite runs and the first fresh browser assertion also failed before
passing reruns. Those were diagnosed as test-environment, assertion-contract,
and transition-timing defects—not material application defects—and are retained
in the subject receipt.

**Important presentation limit:** the fresh Possible verifier did not discover
and trigger repair of a material product defect in this run. A demo may honestly
show the contract inconsistency being caught, corrected, and subsequently
verified, or the independent verifier rejecting the completed Direct output. It
must not combine those events into a claim that Possible's fresh verifier found
and repaired a production bug.

## What the pilot supports

> In this controlled pilot, Possible produced a verified outcome and the direct
> prompt did not. Possible also preserved its coordination state, intermediate
> failures, and fresh verification evidence.

The pilot does **not** establish typical performance, statistical significance,
causality, a speed advantage, user impact, or superiority over goal-led work. It
has no replication, randomization, confidence interval, cross-model comparison,
or real-user validation. Two of the other three structured-workflow runs also
failed their assigned treatment, further limiting comparison.

For these reasons, the pilot cannot support replacing a public performance
hypothesis chart with measured comparative claims. Replicated treatment-faithful
runs are required first.

## Raw evidence

- Study definition: [protocol](https://github.com/fraylabs/possible/blob/main/benchmarks/outcome-v1/PROTOCOL.md), [brief](https://github.com/fraylabs/possible/blob/main/benchmarks/outcome-v1/brief.md),
  [run ledger](https://github.com/fraylabs/possible/blob/main/benchmarks/outcome-v1/RUNS.md), and [verifier contract](https://github.com/fraylabs/possible/blob/main/benchmarks/outcome-v1/VERIFIER.md)
- Independent synthesis: [verifier report](https://github.com/fraylabs/possible/blob/main/benchmarks/outcome-v1/independent/RESULT.md) and
  [complete verifier transcript](https://github.com/fraylabs/possible/blob/main/benchmarks/outcome-v1/independent/verifier-transcript.json)
- Machine decisions: [Direct](https://github.com/fraylabs/possible/blob/main/benchmarks/outcome-v1/independent/results/direct-r1.json),
  [Spec](https://github.com/fraylabs/possible/blob/main/benchmarks/outcome-v1/independent/results/spec-r1.json),
  [Plan](https://github.com/fraylabs/possible/blob/main/benchmarks/outcome-v1/independent/results/plan-r1.json),
  [Goal](https://github.com/fraylabs/possible/blob/main/benchmarks/outcome-v1/independent/results/goal-r1.json), and
  [Possible](https://github.com/fraylabs/possible/blob/main/benchmarks/outcome-v1/independent/results/possible-r1.json)
- Complete subject transcripts: [Direct](https://github.com/fraylabs/possible/blob/main/benchmarks/outcome-v1/transcripts/direct-r1.json),
  [Spec](https://github.com/fraylabs/possible/blob/main/benchmarks/outcome-v1/transcripts/spec-r1.json), [Plan](https://github.com/fraylabs/possible/blob/main/benchmarks/outcome-v1/transcripts/plan-r1.json),
  [Goal](https://github.com/fraylabs/possible/blob/main/benchmarks/outcome-v1/transcripts/goal-r1.json), and
  [Possible](https://github.com/fraylabs/possible/blob/main/benchmarks/outcome-v1/transcripts/possible-r1.json)
- Subject receipts: [Direct](https://github.com/fraylabs/possible/blob/main/benchmarks/outcome-v1/subject-receipts/direct-r1.json),
  [Spec](https://github.com/fraylabs/possible/blob/main/benchmarks/outcome-v1/subject-receipts/spec-r1.json),
  [Plan](https://github.com/fraylabs/possible/blob/main/benchmarks/outcome-v1/subject-receipts/plan-r1.json),
  [Goal](https://github.com/fraylabs/possible/blob/main/benchmarks/outcome-v1/subject-receipts/goal-r1.json), and
  [Possible](https://github.com/fraylabs/possible/blob/main/benchmarks/outcome-v1/subject-receipts/possible-r1.json)
- Independent browser evidence: [screenshots by run](https://github.com/fraylabs/possible/tree/main/benchmarks/outcome-v1/independent/screenshots)

The machine-readable results passed the frozen JSON Schema and a second audit
for the exact 20 identifiers, uniqueness, and outcome-decision consistency. The
verifier report preserves browser-tool fallbacks, a corrected verifier-harness
probe, schema-tool resolution failures, and the full study limitations.
