# Possible MVP evaluations

This directory holds the controlled baseline-versus-Possible evaluation
contract. It intentionally contains no hand-authored "ideal" run presented as
agent evidence.

## Layout

- `scenarios/v1/`: two versioned, SHA-256-locked golden scenarios.
- `schemas/`: JSON Schemas for scenarios, transcripts, adjudication receipts,
  and reports.
- `receipts/`: destination for fresh baseline and Possible-assisted runs.
- `reports/`: deterministic scorer output.
- `RUBRIC.md`: metric definitions and anti-gaming rules.

Scenario JSON is immutable after a run exists. A material change requires a new
scenario version and manifest entry. Editing a locked file without updating its
manifest digest fails validation; changing both is visible as a reviewable
version-control change.

## Controlled run protocol

For each scenario, launch two fresh sessions with the same provider, model,
host, outcome prompt, and non-treatment environment. Record the shared setup as
one `controlFingerprint`.

1. Baseline: Possible access is disabled.
2. Treatment: Possible access is enabled through the real skill/MCP path.
3. Capture every user, agent, tool, approval, action, artifact, and verifier
   event in order.
4. Have a human or independent fresh-context agent classify every question and
   action, then adjudicate material claims, constraints, and actual application
   of retrieved contributor knowledge.
5. Hash the transcript bytes and reference the digest from its receipt.
6. Score only after both arms and both golden scenarios are present.

For a real Possible-node retrieval, record the lowercase SHA-256 returned by
`nodeRevision(node)` from `@possible/evals`; this binds the receipt to the exact
contributor payload rather than merely its node name.

Do not retrofit polished prose into a transcript. Do not use package test
fixtures as completion evidence. The production CLI rejects `test-fixture`
receipts by default.
