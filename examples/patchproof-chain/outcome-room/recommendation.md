# Recommendation: pursue PatchProof

## Decision

Build the smallest local working version of **PatchProof**, a browser-only completion-receipt builder for AI-assisted code changes.

## Product hypothesis

Developers do not need another agent that says work is complete. They need a fast way to inspect which claims are backed by supplied evidence and which remain unsupported.

PatchProof accepts:

1. the requested task;
2. a unified diff;
3. command or test output;
4. optional screenshots or artifact notes.

It deterministically produces:

- changed-file and check summaries;
- explicit passed, failed, skipped, and unknown states;
- a claim-to-evidence ledger;
- warnings for unsupported completion claims;
- a portable Markdown and JSON receipt.

It must say what the evidence demonstrates and what it cannot demonstrate. It does not execute unknown code, upload a repository, judge semantic correctness, or cryptographically prove agent behavior.

## Why now

- The 2025 Stack Overflow survey provides strong directional evidence of trust and debugging friction around AI-assisted work (S01/S02).
- Existing checks expose results but not a complete claim/evidence interpretation (S03).
- Major platforms and new competitors are investing in session traces and receipts (S04–S07), validating the job while also warning that the category is active.

## Rejected alternatives

- **Repo Contract Doctor:** credible pain, but Driftless, EnvDrift, RepoReady, GitHub community profiles, and related tools make generic positioning weak.
- **ExampleLens:** useful technical niche, but existing validators and a smaller audience reduce first-run leverage.
- **RunnerGap:** valuable but technically expensive to do honestly without emulation; `act` and `actionlint` already own important parts.

## Decision boundary

`pursue` means “build and test a narrow MVP,” not “market validated,” “customers want it,” or “people will pay.” Direct developer testing remains required.
