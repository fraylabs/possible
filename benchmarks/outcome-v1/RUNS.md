# outcome-v1 run ledger

The protocol and brief are frozen. Task identifiers, timestamps, intervention
receipts, output paths, transcript exports, and independent results are appended
here after dispatch. An empty result means the run has not yet completed.

| Run | Condition | Task | Dispatched (UTC) | Follow-ups | Operator words | Approvals | Output | Result |
| --- | --- | --- | --- | ---: | ---: | ---: | --- | --- |
| direct-r1 | Direct | `019f80b8-a70b-7b81-afd0-b59dffeed908` | 2026-07-20 18:10:12 | 0 | 0 | 0 | `<direct-worktree>/repos/daymark` | **not verified** · 19/20 · treatment pass · 715s to stop |
| spec-r1 | Spec | `019f80b8-a714-76c1-a989-d9ef315e8625` | 2026-07-20 18:10:12 | 0 | 0 | 0 | `<spec-worktree>/repos/daymark` | verified · 20/20 · **treatment fail** · 1,101s |
| plan-r1 | Plan | `019f80b8-a70c-7a91-b293-9c1a2bd3a237` | 2026-07-20 18:10:12 | 0 | 0 | 0 | `<plan-worktree>/repos/daymark` | verified · 20/20 · **treatment fail** · 1,332s |
| goal-r1 | Goal | `019f80b8-a70e-76f3-b3d9-2ed75b39cda6` | 2026-07-20 18:10:12 | 0 | 0 | 0 | `<goal-worktree>/repos/daymark` | verified · 20/20 · treatment pass · 1,511s |
| possible-r1 | Possible | `019f80b8-a717-7d12-a7c4-6531b4120a9b` | 2026-07-20 18:10:12 | 2 | 14 | 1 | `<possible-worktree>/repos/daymark` | verified · 20/20 · treatment pass · 1,850s |

## Operator follow-ups

- `possible-r1` · 2026-07-20 18:12:06 UTC · approval · 2 words:
  `Yes, proceed.`
- `possible-r1` · 2026-07-20 18:39:50 UTC · neutral continuation · 12 words:
  `The fresh verifier task is idle with a completed result. Please continue.`

## Subject completion timestamps

- `direct-r1`: 2026-07-20 18:22:07 UTC
- `spec-r1`: 2026-07-20 18:28:33 UTC
- `plan-r1`: 2026-07-20 18:32:24 UTC
- `goal-r1`: 2026-07-20 18:35:23 UTC
- `possible-r1`: 2026-07-20 18:41:02 UTC

The five runs were dispatched together. Their elapsed times are useful for this
pilot's workflow trace, but shared browser, port, package-cache, and agent
capacity contention prevents treating this single parallel batch as a clean
relative-speed result.

## Independent verification

- Task: `019f80d5-9f3c-7c80-96e2-904f45381303`
- Result: [independent/RESULT.md](independent/RESULT.md)
- Machine results: [independent/results](independent/results)
- Verifier transcript: [independent/verifier-transcript.json](independent/verifier-transcript.json)
- Independent screenshots: [independent/screenshots](independent/screenshots)

All five result files pass the frozen JSON Schema and the exact-check/decision
consistency audit. This pilot cannot support changing the public performance
chart: it has one run per condition, shared parallel resource contention, one
failed outcome, and two failed condition treatments.
