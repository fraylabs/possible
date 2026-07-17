# `@possible/evals`

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

Production evaluation loads the real `@possible/knowledge` graph. Locked
knowledge requirements must reference existing nodes, and every Possible node
retrieval in a real run records the SHA-256 revision of the exact node payload.

Production evaluation accepts only `real-agent-run`. Hand-authored scorer data
must use `test-fixture`, and is accepted only through the explicit
`allowTestFixtures` test option or `--allow-test-fixtures` CLI flag.

## Commands

From the repository root:

```bash
npm run test -w @possible/evals
npm run build -w @possible/evals
npm run eval -w @possible/evals
```

`npm run eval` permits an entirely empty receipt directory so the harness can
land before fresh agent runs. If even one receipt is present, every transcript
must be referenced, every pair must contain exactly one baseline and one
Possible arm, and every locked scenario must have a pair.

To score real runs directly:

```bash
node packages/evals/src/cli.js evaluate \
  --scenario-dir evals/scenarios/v1 \
  --receipt-dir evals/receipts \
  --output evals/reports/latest.json
```

Positive deltas mean the Possible arm improved the metric. Reports preserve raw
counts and evidence IDs beside rubric points so a reviewer need not trust the
aggregate score.
