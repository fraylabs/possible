# Independent verifier contract

The verifier is a fresh Codex task with no implementation ownership. It receives
this file, `brief.md`, each task transcript, and the five absolute output paths.
It may run read-only commands and local servers but must not edit any run.

Write one `results/<run-id>.json` object conforming to `result.schema.json` and
one concise `RESULT.md` comparison. Never repair a run during verification.

## Per-run procedure

1. Record whether the absolute output directory and each required artifact
   exists.
2. Inspect the enclosing Fray worktree with `jj status`. Fail isolation if a
   task changed any tracked path outside `repos/daymark`. The ignored owned
   directory is expected not to appear in Fray's status.
3. Record the app's package scripts and dependency count. Run `npm test`, then
   `npm run build`, exactly as documented. Preserve exit codes and concise
   output summaries.
4. Inspect the production artifact and source. Check every requirement below
   against code or executable evidence; a self-authored test alone is supporting
   evidence, not independent proof.
5. Start the documented local server. When browser tooling is available,
   exercise the app at 1280 px and 390 px, preserving screenshots and checking
   keyboard submission, the three-item cap, toggle, removal, reset confirmation,
   reload persistence, focus visibility, console errors, and network writes.
6. Read `BENCHMARK-RECEIPT.json` only after the checks. Record contradictions.
7. Read the task transcript and check that the named condition was followed.

## Required acceptance checks

Use exactly these identifiers:

- `empty-invitation`
- `nonempty-add-keyboard-pointer`
- `three-item-cap-explained`
- `toggle-complete-incomplete`
- `remove-priority`
- `progress-count-and-visual`
- `reload-persistence`
- `confirmed-reset`
- `local-day-rollover`
- `versioned-storage-key`
- `malformed-storage-recovery`
- `responsive-390-1280`
- `semantic-controls-and-names`
- `visible-keyboard-focus`
- `no-network-writes`
- `quiet-coherent-visual-states`
- `readme-commands`
- `meaningful-required-tests`
- `production-build`
- `honest-receipt`

Every check is `pass`, `fail`, `skipped`, or `unproven` with a short evidence
string. `skipped` means the required capability was unavailable. `unproven`
means the run supplied insufficient evidence. Neither counts as a pass.

## Condition checks

- Direct: no `SPEC.md`, `.possible`, goal artifact, or persistent plan artifact;
  transcript contains no plan/goal/Possible invocation.
- Spec: `SPEC.md` predates implementation in the transcript and maps every brief
  requirement to acceptance; no plan/goal/Possible invocation.
- Plan: transcript shows the plan tool created before implementation and updated
  through verification; no `SPEC.md`, goal, or Possible.
- Goal: transcript shows a goal created before implementation, a verifier in its
  completion standard, and completion only after evidence; no `SPEC.md` or
  Possible.
- Possible: published CLI installation exists, transcript follows intake and
  explicit approval, `.possible/outcome-brief.md`, pack snapshot, skills lock,
  workstream evidence, and a fresh verification receipt exist. Missing upstream
  skills or plugin capabilities must be reported honestly rather than imitated.

## Outcome decision

`verified` requires passing `npm test`, passing `npm run build`, no isolation
violation, and passes for all twenty required checks. A run with any failure,
skip, or unproven required check is `not_verified`; report its elapsed time as
time-to-stop, not time-to-verified-outcome.

Do not rank aesthetic preference. Record concrete usability defects and visual
incoherence, with screenshots when possible.

