# Possible outcome-v1 — independent cross-run verification

Per-run JSON, screenshots, and the complete verifier transcript are retained
alongside this report.

This report applies the frozen outcome-v1 decision rule exactly. Condition-treatment compliance is reported separately and does not change the outcome decision.

## Common comparison

| Run | Outcome decision | Required checks | Condition treatment | Elapsed | Follow-ups / words / approvals | Timing classification |
| --- | --- | ---: | --- | ---: | ---: | --- |
| `direct-r1` | **not_verified** | 19/20 pass | Pass | 715 s | 0 / 0 / 0 | Time-to-stop |
| `spec-r1` | **verified** | 20/20 pass | **Fail** | 1,101 s | 0 / 0 / 0 | Time-to-verified-outcome |
| `plan-r1` | **verified** | 20/20 pass | **Fail** | 1,332 s | 0 / 0 / 0 | Time-to-verified-outcome |
| `goal-r1` | **verified** | 20/20 pass | Pass | 1,511 s | 0 / 0 / 0 | Time-to-verified-outcome |
| `possible-r1` | **verified** | 20/20 pass | Pass | 1,850 s | 2 / 14 / 1 | Time-to-verified-outcome |

All five independent `npm test` and `npm run build` runs passed, and all five isolation checks passed using the mandated Git fallback. Four runs meet the frozen outcome definition. `direct-r1` does not: pointer addition worked, but three independent Enter attempts left the non-empty production textbox unchanged, so `nonempty-add-keyboard-pointer` failed.

The treatment findings are separate:

- `spec-r1`: `SPEC.md` predates implementation, but it does not map every frozen brief requirement to acceptance; the quiet/typographic/high-contrast coherent visual treatment and README exact-command artifact are unmapped.
- `plan-r1`: the complete transcript shows no plan-tool creation before the first implementation change or maintenance through verification. Commentary and internal planning labels do not establish the required plan-tool lifecycle.
- `goal-r1`: the transcript explicitly establishes an active externally verifiable goal before implementation, applies external audit pressure, and completes only after test/build/receipt evidence.
- `possible-r1`: the two-page transcript and artifacts show published Possible 0.1.6 initialization, intake, a stopped confirmation gate, exact approval `Yes, proceed.`, audited ingredients, compiled pack state, disjoint workstreams, preserved failures, and a fresh verification-only workstream.

## Decisions by run

### direct-r1 — not_verified

Tests, build, isolation, pointer flow, cap, state transitions, persistence, reset, rollover, responsive behavior, accessibility, network boundary, visual states, README, required tests, build artifact, and receipt all pass. Keyboard addition fails in the executable production check. The elapsed 715 seconds is therefore time-to-stop, not time-to-verified-outcome.

### spec-r1 — verified

All 20 outcome checks pass at 1,101 seconds. The Spec condition treatment fails independently because its acceptance mapping is incomplete.

### plan-r1 — verified

All 20 outcome checks pass at 1,332 seconds. The Plan condition treatment fails independently because the complete readable transcript does not establish the required plan-tool lifecycle.

### goal-r1 — verified

All 20 outcome checks and the Goal treatment pass at 1,511 seconds.

### possible-r1 — verified

All 20 outcome checks and the Possible treatment pass at 1,850 seconds. It required two operator follow-ups totaling 14 words and one explicit approval. The transcript does not expose item-level timestamps sufficient to separate an exact Possible installation interval from total wall-clock time; initialization is only bounded within the pre-approval turn.

## Preserved verifier failures and fallbacks

- The required `jj status` command failed for every assigned worktree with `There is no jj repo in "."`. Each failure is preserved. Enclosing-Fray Git status/diff checks found only the owned untracked `repos/daymark/` tree and no tracked or cached change outside it.
- A native confirmation during the early interactive checks left the in-app Browser surface wedged, and the Chrome-extension surface was unavailable. `plan-r1`, `goal-r1`, and `possible-r1` therefore used the operator-authorized cached Playwright 1.61.1 / local headless-Chromium fallback for the same frozen production checks. Acceptance status was not weakened or changed.
- The first independent `plan-r1` state probe failed because the verifier incorrectly expected a full-list blank add to return `limit`; the implementation validly rejects the blank value first. That harness failure is preserved, a corrected probe passed, and no subject check was failed for it.
- Some full-page browser captures inherited focus/scroll or transition intermediates. Scroll-normalized recaptures were made where still sequentially available; DOM measurements and other preserved state captures support the findings. The `plan-r1` completed-state image remains top-cropped but retains the completion count, checks, rows, and styling.
- Final schema validation first failed because the bundled Python runtime lacked `jsonschema`, then failed because the first resolved Ajv was version 6 and lacked the 2020 entry point. Validation was rerun without installation using an already-present Ajv 8.20.0 draft-2020-12 implementation. All five files passed. A second audit confirmed the exact 20 frozen identifiers, uniqueness, and decision-rule consistency.

## Protocol limitations

- One run per condition is a pilot, not an estimate of typical performance, variance, or causal workflow effect. There is no replication, randomization, confidence interval, or control for run-order/model/environment variation.
- Four outcome decisions are verified, but two of those runs failed their assigned treatment. Treatment fidelity and outcome success must not be conflated.
- Timing includes environment friction such as occupied ports, browser-surface failures, verification waits, and condition-specific setup. The Possible install interval cannot be isolated exactly from the available item timestamps.
- Browser evidence is Chromium-only. No Firefox, WebKit, physical-device, screen-reader, or real-user validation was performed. A real wall-clock midnight was not awaited; rollover used deterministic date transitions plus source inspection.
- Runtime request observation covered the isolated local browser sessions. Source inspection was also used for network-write conclusions; receipts and subject-authored screenshots were not treated as independent proof.
- Visual checks record concrete responsiveness, contrast, focus, overflow, and state coherence. They do not rank aesthetic taste.

## Public performance chart

**No—this one-run pilot cannot support changing the public performance chart.** The frozen protocol explicitly says one clean run per condition remains a hypothesis until repeated runs establish within-condition variation. Here, `direct-r1` is not verified and the Spec and Plan runs also fail their named treatment, adding further reason not to infer or publish comparative performance from these five observations.

Machine-readable results are in `results/*.json`; independent screenshots are in `screenshots/<run-id>/`.
