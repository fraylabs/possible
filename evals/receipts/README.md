# Controlled run receipts

The dated source-capture files preserve the exact visible messages copied from
fresh baseline and Possible-assisted agent sessions. They also record session
IDs and the Possible node evidence available for each treatment. Revision 2
adds an exact Skill digest and a summary derived from the retained local MCP
command trace. Original event timestamps were not available; scored transcripts
must identify that reconstruction honestly and must not invent them.

Use one directory per pair:

```text
<pair-id>/baseline.transcript.json
<pair-id>/baseline.receipt.json
<pair-id>/possible.transcript.json
<pair-id>/possible.receipt.json
```

The production evaluator accepts only `runKind: "real-agent-run"`. Scorer test
fixtures live under `packages/evals/test/fixtures/` and are explicitly labeled
`test-fixture`.
