# Historical `@possible/evals`

This package reproduces the completed 2026-07-17 typed-graph evaluation. Its
node-based contract is intentionally frozen as historical evidence and is not
part of the page-only wiki build, tests, or primary verifier.

Deterministic evaluation for the two Possible MVP prompts. The package never
runs an LLM and never infers quality from prose or tool-name mentions. It
validates locked scenarios, pairs a baseline run with a Possible-assisted run,
checks transcript-linked adjudication receipts, and produces a reproducible
JSON report.

## Receipt workflow

Each arm has two files in one run directory:

```text
baseline.transcript.json
baseline.receipt.json
possible.transcript.json
possible.receipt.json
```

The transcript is the captured run. The receipt is an independent annotation
of questions, actions, claims, constraints, and contributor-knowledge use. It
references the exact SHA-256 digest of its transcript. Both files identify the
same scenario digest, pair ID, arm, run kind, and controlled-environment
fingerprint.

The original production evaluation loaded the then-current `@possible/knowledge` graph. Locked
knowledge requirements must reference existing nodes, and every Possible node
retrieval in a real run records the SHA-256 revision of the exact node payload.

Production evaluation accepts only `real-agent-run`. Hand-authored scorer data
must use `test-fixture`, and is accepted only through the explicit
`allowTestFixtures` test option or `--allow-test-fixtures` CLI flag.

## Reproduction boundary

Use the historical commit recorded in the 2026-07-17 production receipt to
re-run this node-based package. The current page-only runtime intentionally no
longer carries the types that old scorer consumed. The retained report,
transcripts, hashes, and schemas remain inspectable without making this package
part of the new product verifier.
