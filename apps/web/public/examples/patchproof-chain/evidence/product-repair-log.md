# Integration repair log

## Browser failure caught before completion

The first automated desktop flow reached receipt generation, reload recovery, and deterministic re-generation, then failed when opening JSON import:

```text
page error: Cannot set properties of null (setting 'textContent')
assertion: #import-dialog did not open
```

Cause: the import confirmation button had `data-testid="confirm-import"` but no `id="confirm-import"`; application code addressed it through `document.getElementById`.

Repair: add the missing DOM ID. The complete desktop/mobile flow then passed, including malformed-import atomicity.

## Contract drift caught during integration

The first application draft allowed flat user-selected evidence statuses and had no explicit claim-to-evidence ledger. That contradicted the inherited Discovery recommendation and the product contract.

Repair: replace it with `DraftV1` and `ReceiptV1`, conservative diff/check extraction, explicit claims, derived claim statuses, and a five-state summary. Absent required evidence now becomes `unsupported`; a user cannot force it to pass.

## Interaction defects caught during integration

- The visible receipt summary omitted `skipped`, despite the five-state contract.
- Rebuilding every claim row on each input event caused focus loss while editing a claim.

Repair: render all five counters and refresh derived status outputs in place without replacing focused inputs.

## Passing rerun

`npm run verify` is the repeatable integrated check. It runs 34 unit assertions, the production build, and the complete Playwright browser flow at desktop and mobile viewports.

## Resume verifier defect caught by fresh review

The fresh independent reviewer found that `.possible/verify-chain-handoff.mjs` dereferenced `chain.pendingTransition.handoff` after approval had correctly set `pendingTransition` to `null`. The archived handoff and its hashes were intact, but the verifier was not resumable during an active stage.

Repair: resolve either the explicit pending handoff or exactly one approved inbound handoff targeting the active stage, then apply the same path, authorization, destination, evidence, archive, and hash checks. The repaired verifier passes without changing archived Discovery evidence.

## Contradictory check-log defect caught by fresh review

The fresh reviewer supplied `$ npm test\n1 failing\nexit code: 0`. The parser recognized `failed` but not the conventional `failing` count, so the zero exit incorrectly produced a passing test claim.

Repair: treat every nonzero `failed`, `failing`, `failure(s)`, or `error(s)` count as conflicting output when paired with exit zero. The check and dependent claim become `unknown`. A dedicated regression assertion preserves the behavior.

## Fixture-proof gap caught by fresh review

The 12 fixture files initially declared exact expected claim statuses but not exact extracted evidence, warnings, or limitations. The normative contract required all four surfaces, so warning or limitation regressions could escape the claim-only check.

Repair: each fixture now declares `expectedEvidence`, `expectedWarnings`, and `expectedLimitations`; the existing per-fixture assertion compares the complete receipt contract without inflating the fixture count.
