# Possible workflow benchmark — outcome-v1

Status: frozen pilot protocol  
Frozen: 2026-07-21  
Operator: root Codex task `019f7517-658f-7723-8686-2ecda930c00a`

## Question

How much elapsed time and human coordination does each workflow require to turn
the same product brief into a locally verified outcome?

This pilot compares five coordination conditions:

1. direct prompting;
2. spec-driven development;
3. plan-led development;
4. goal-led development;
5. Possible.

One clean run per condition is a pilot, not a performance claim. The public page
must continue to identify its chart as a hypothesis until repeated runs show the
variation within each condition.

## Controlled setup

- Each run starts in a fresh Codex worktree made from the same Fray revision.
- The product directory is absent at the start. Each task owns only
  `repos/daymark` inside its worktree.
- Every task inherits the calling task's model and reasoning configuration.
- Every task receives the exact brief in [brief.md](brief.md).
- No task may inspect `repos/possible`, another run, this protocol, or the public
  benchmark while working.
- No deployment, account creation, publishing, outreach, or other external
  mutation is part of the outcome.
- The operator does not offer unsolicited implementation help.
- If a task asks a product question, the operator answers only from the frozen
  clarification packet below. If the answer is already in the brief, it is
  quoted without adding a preference.
- A condition may not silently adopt another condition's named mechanism.

## Condition treatments

Only the coordination method changes.

| Condition | Required treatment | Forbidden treatment |
| --- | --- | --- |
| Direct | Implement from the brief with ordinary local judgment. | Persistent spec, plan tool, goal, or Possible. |
| Spec | Write `SPEC.md` with an acceptance mapping before implementation, then build against it. | Plan tool, goal, or Possible. |
| Plan | Create and maintain a plan with the plan tool before implementation. | Persistent spec, goal, or Possible. |
| Goal | Create an active goal with an external verifier before implementation and pursue it to proof. | Persistent spec or Possible. |
| Possible | Install the published Possible skill, invoke `$possible`, and follow its intake, confirmation, compilation, execution, and fresh-review workflow. | Replacing Possible with a handwritten imitation. |

The Possible installation interval is reported separately from outcome execution
where the task timestamps expose it. It is not erased from total wall-clock time.

## Frozen clarification packet

These answers may be supplied only when a task asks:

- Audience: one person using their own laptop or phone browser.
- Visual direction: quiet, typographic, high-contrast, and usable; no supplied
  brand assets.
- Data: local browser storage only; no network writes.
- Scope: one complete daily planning flow, not accounts, collaboration,
  notifications, analytics, or deployment.
- Proof: the required local commands pass and a fresh reviewer can exercise the
  flow at desktop and mobile widths.
- External actions: none are authorized.

## Timing and coordination receipts

The operator records timestamps from task dispatch, every follow-up, and final
completion. The primary coordination measures are:

- number of operator follow-up messages;
- number of operator words after the initial frozen prompt;
- number of explicit approvals;
- wall-clock time from dispatch to final response.

Human minutes are not inferred from agent waiting time. If an active-human-time
number is reported later, its conversion rule must be published beside it.

## Independent verification

A fresh verifier receives only the frozen brief and the five output paths. It
must not modify any output. For every condition it will:

1. confirm the product directory exists and the task did not edit the frozen
   Fray baseline outside its owned directory;
2. run `npm test` and `npm run build` from a clean process;
3. inspect the built application against every item in `brief.md`;
4. inspect the condition-specific evidence artifact without accepting its claims
   as proof;
5. record passed, failed, skipped, and unproven checks in a common result schema.

When browser tooling is available, the verifier also exercises the primary flow
at desktop and 390 px mobile widths. A missing browser check is recorded as
skipped, never silently counted as passed.

## Anti-cheating rules

- Do not alter this protocol or the brief after seeing a run.
- Do not weaken tests, acceptance checks, or the verifier to improve a result.
- Do not treat self-authored tests or receipts as independent proof.
- Do not substitute mock screenshots or described behavior for a working build.
- Preserve failures, partial outputs, task transcripts, and operator follow-ups.
- Do not select only the most favorable run for a public claim.

## Pilot completion

The pilot is complete only when all five tasks have stopped, their complete task
records and output paths are preserved, a fresh verifier has produced a common
report, and the public benchmark is either updated with appropriately qualified
measured evidence or deliberately left unchanged with the evidence gap stated.

