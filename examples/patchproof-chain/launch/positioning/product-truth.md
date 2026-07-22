# PatchProof product truth

## Audience

The working audience hypothesis is developers reviewing AI-assisted changes across mixed coding agents. The immediate job is not to prove that a patch is correct. It is to see what the evidence already supplied supports before accepting a completion summary.

## Pain

Task descriptions, diffs, logs, screenshots, and limitations are often scattered. A polished “done” summary can hide failed, skipped, unknown, or unsupported work. Discovery evidence supports this as a problem hypothesis; it does not prove demand for PatchProof.

## Mechanism

PatchProof accepts a task, unified diff, check log, artifacts, claims, and limitations. It derives five distinct evidence states and freezes the result as deterministic Markdown or JSON. The app runs locally in the browser and does not execute a repository or independently capture an agent session.

## Position

**Completion receipts from evidence you can inspect.** PatchProof sits between raw evidence and the decision to accept “done.” It makes the claim-to-evidence relationship explicit without pretending the receipt proves semantic correctness.

## Primary action

Open the local app, load a reproducible fixture, and inspect the generated receipt.

## Proof available

- Immutable working product revision `ae88d46686b23b6374899c5f0606e17859b93b99`.
- 34 unit assertions and 12 fixture contracts passed fresh review.
- Desktop and mobile product flows passed.
- Malformed import was verified not to replace the current draft.

## Proof not available

Customers, testimonials, adoption, demand, willingness to pay, compatibility across agents, review-speed improvement, comprehensive security, and production readiness are unproven.
