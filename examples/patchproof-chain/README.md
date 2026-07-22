# PatchProof

PatchProof turns supplied task, diff, check, artifact, claim, and limitation evidence into inspectable Markdown and JSON completion receipts. It runs in the browser and keeps `passed`, `failed`, `skipped`, `unknown`, and `unsupported` distinct instead of polishing every result into “done.”

> [!IMPORTANT]
> PatchProof describes evidence you supply. It does not execute a repository, independently capture an agent session, or prove code correctness, security, readiness, demand, or product-market fit.

## Five-minute quickstart

Requirements: Node.js 20.19 or newer and npm.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. Load any of the 12 built-in fixtures or enter evidence manually. The local launch explanation is at `/launch/site/` on the same server.

## Verify

```bash
npm run verify
```

This runs:

- 34 unit assertions and all 12 fixture contracts;
- the two-page production build;
- the complete desktop/mobile product flow;
- the three-direction Remix contract;
- the launch truth, local-link, immutable-handoff, and external-gate contracts;
- the desktop/mobile launch-site flow using the real receipt derivation module.

The clean-room procedure and expected output are documented in [`launch/docs/quickstart.md`](launch/docs/quickstart.md).

## Primary flow

1. Load a reproducible fixture or supply a task, unified diff, check log, artifacts, claims, and limitations.
2. Inspect the derived claim states and their exact evidence references.
3. Generate a deterministic receipt.
4. Copy or download Markdown or JSON.
5. Reload the browser to recover the saved draft locally.

Malformed imported JSON is rejected before the current draft changes.

## Evidence model

See [`launch/docs/evidence-model.md`](launch/docs/evidence-model.md) for the five states and their limits. Runnable sample input lives under [`launch/examples/`](launch/examples/).

## Local launch package

The Developer Project Launch outcome prepared, but did not publish:

- three preserved creative-direction previews and an agent-selected decision;
- a responsive local launch site and actual-logic demonstration;
- positioning, claims, docs, examples, asset provenance, and clean-room proof;
- independent browser, documentation, and claim review.

Deployment, publication, pushing, tagging, releases, DNS, analytics, outreach, data collection, and spending were not authorized or performed.
