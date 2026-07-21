# Goal — Build Week submission

A Build Week judge can independently assess, within five minutes, that Possible reached a verified outcome where an ordinary direct prompt did not in the frozen pilot, understand the mechanism that differs, and inspect the evidence and limits without being asked to infer a general causal advantage.

## Supported promise

- Possible turns a concrete intent into a disclosed outcome pack, bounded workstreams, ownership, a captain sequence, safety gates, an outcome-specific definition of done, execution, and fresh verification.
- The public submission gives solo developers and small technical teams a fast, runnable path from installation to inspectable output.
- Every comparative claim is bounded by the frozen benchmark protocol and links to raw evidence.
- The recorded demo shows a real integration failure, refusal to declare completion, repair, and fresh passing verification.
- Build Week work, Codex contributions, human product decisions, and any model-label evidence that still requires owner attestation are clearly distinguished.

## Non-scope

- Do not claim statistical superiority from a one-run-per-condition pilot.
- Do not hide failed treatments, verifier failures, operator intervention, timing limitations, or benchmark caveats.
- Do not weaken checks, change the frozen benchmark after seeing results, substitute mocks, or edit preserved run evidence to improve the story.
- Do not add pack-authoring commands unless the judge path, proof surfaces, video materials, and full verification are already complete.
- Do not deploy, publish the submission, upload a video, or perform other public/external actions without explicit approval.

## Required judge experience

1. The homepage and README state the outcome-compiler thesis in plain language.
2. A Judge Quickstart documents requirements, supported platforms, installation, a sample path, expected output, and troubleshooting.
3. A proof surface compares the frozen conditions honestly and links to the protocol, machine-readable results, transcripts, screenshots, and independent report.
4. The compiler flow is visible: intent → recommended pack → typed pack + captain sequence → approved outcome-specific checks → execution → independent verification → verified outcome.
5. The Still demo makes the preserved failure → repair → passing rerun sequence unmistakable.
6. Submission-ready copy and a sub-three-minute video script/storyboard cover the problem, product, artifacts, verification moment, controlled comparison, architecture, installation, and closing thesis.
7. A Build Week section records the observable commit range, new components, before/after state, Codex contribution, human decisions, and the eligibility/model facts still requiring owner evidence.

## Primary verifier

```bash
npm run check
```

## Supporting verification

```bash
node --test packages/packs/test/compiler.test.mjs
node scripts/validate-demo-bundle.mjs
test -f apps/web/dist/packs/index.json
test -f apps/web/dist/demo/still/verification/browser-results-initial-failure.json
test -f apps/web/dist/demo/still/verification/browser-results.json
test -f benchmarks/outcome-v1/independent/RESULT.md
```

Complete a fresh browser review of the public judge path at desktop and mobile widths, exercise key links and copy/install interactions, and preserve screenshots or an equivalent receipt. A fresh-context reviewer must audit claims against the repository evidence before completion.

## Iteration loop

Inspect the current judge path, make one bounded improvement, run the narrowest relevant check, record evidence in `WORKLOG.md`, and repeat. Run the full verifier and independent claim audit before completion.

## Completion statement

Completion means a judge can quickly run or inspect Possible, understand why it is not a prompt library, see both the honest benchmark boundary and the real verification repair, and trace every material claim to preserved evidence. It does not mean the pilot proves typical causal superiority, or that deployment/submission has been performed.
