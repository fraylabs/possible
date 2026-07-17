# Possible contributor knowledge

This directory is the source of truth for Possible. Collections are reviewed
human contributions, not generated answers. They compile into
`@possible/knowledge`; the website and agent interface must not maintain a
second knowledge corpus.

## Contribution contract

Every recommendation must say when it applies, when it does not, which
alternatives to compare, who contributed it, which primary sources support it,
its confidence, and when it must be reviewed again. “Popular” or “best” without
conditions is not acceptable.

Provider capabilities are conservative. A supported claim needs official
provenance. Prices, lead times, material or plan availability, shipping promises,
regional access, and account entitlements are live facts and belong in
`unknowns`. Every provider record requires a live check at handoff. Uploading
proprietary files, creating deployments, changing production, requesting quotes,
ordering, paying, or starting fabrication remains approval-gated in the user's
agent host.

Run after editing:

```bash
npm run generate -w @possible/knowledge
npm run validate -w @possible/knowledge
npm run test -w @possible/knowledge
```
