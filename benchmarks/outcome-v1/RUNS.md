# outcome-v1 run ledger

The protocol and brief are frozen. Task identifiers, timestamps, intervention
receipts, output paths, transcript exports, and independent results are appended
here after dispatch. An empty result means the run has not yet completed.

| Run | Condition | Task | Dispatched (UTC) | Follow-ups | Operator words | Approvals | Output | Result |
| --- | --- | --- | --- | ---: | ---: | ---: | --- | --- |
| direct-r1 | Direct | `019f80b8-a70b-7b81-afd0-b59dffeed908` | 2026-07-20 18:10:12 | 0 | 0 | 0 | `/Users/brianlim/.codex/worktrees/3986/fray/repos/daymark` | subject complete in 715s; verification pending |
| spec-r1 | Spec | `019f80b8-a714-76c1-a989-d9ef315e8625` | 2026-07-20 18:10:12 | 0 | 0 | 0 | `/Users/brianlim/.codex/worktrees/97a9/fray/repos/daymark` | subject complete in 1,101s; verification pending |
| plan-r1 | Plan | `019f80b8-a70c-7a91-b293-9c1a2bd3a237` | 2026-07-20 18:10:12 | 0 | 0 | 0 | `/Users/brianlim/.codex/worktrees/9dc6/fray/repos/daymark` | subject complete in 1,332s; verification pending |
| goal-r1 | Goal | `019f80b8-a70e-76f3-b3d9-2ed75b39cda6` | 2026-07-20 18:10:12 | 0 | 0 | 0 | `/Users/brianlim/.codex/worktrees/ce23/fray/repos/daymark` | subject complete in 1,511s; verification pending |
| possible-r1 | Possible | `019f80b8-a717-7d12-a7c4-6531b4120a9b` | 2026-07-20 18:10:12 | 2 | 14 | 1 | `/Users/brianlim/.codex/worktrees/322d/fray/repos/daymark` | subject complete in 1,850s; verification pending |

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
