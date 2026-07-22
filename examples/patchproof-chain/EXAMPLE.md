# PatchProof Outcome Chain

This is a preserved three-agent run of:

```text
Software Opportunity Discovery
→ Working Web App
→ Developer Project Launch
```

The only starting instruction was:

> $possible
>
> I want to discover, build, and launch a useful developer tool. I do not already know which problem is worth solving. Keep external actions local-only unless I approve them separately.

No product idea or acceptance checklist was supplied to the discovery agent.

## What happened

| Agent | Approved outcome | Result | Preserved source revision |
| --- | --- | --- | --- |
| `chain_discovery_run` | Software Opportunity Discovery | Selected **PatchProof** from four researched candidates; `pursue`, not market validation | `3cdefb90807a8a7d65a2131b73cf568a490fe43a` |
| `chain_product_run` | Working Web App | Built a local-first claim-to-evidence receipt tool; 34 assertions, 12 fixtures, production build, desktop/mobile flows | `ae88d46686b23b6374899c5f0606e17859b93b99` |
| `chain_launch_run` | Developer Project Launch | Produced three Remix directions, implemented **Continuous Form**, and prepared a verified local launch package | `29b6e94a0c45ba8b996d7f0036f276d2ceda1e25` |

Each stage stopped at its boundary. The next stage began only after a fresh reviewer verified the archived receipt, hashes, evidence classification, entry requirements, and separate approval. No stage inherited authority to deploy or publish.

## Remix

Developer Project Launch produced the same truthful copy at the same `1440×900` viewport in three materially different directions:

1. **Continuous Form** — selected for audience fit, product truth, accessibility, maintainability, distinctiveness, and lower complexity.
2. **Evidence Stamp** — stronger acceptance urgency, but greater risk of implying every receipt is an approval.
3. **Patch Panel** — vivid evidence routing, but more responsive and accessibility complexity.

Inspect [the decision](launch/direction/decision.json) and the three rendered previews:

- [Continuous Form](launch/direction/previews/continuous-form/preview.png)
- [Evidence Stamp](launch/direction/previews/evidence-stamp/preview.png)
- [Patch Panel](launch/direction/previews/patch-panel/preview.png)

## Verification changed the result

Fresh review caught and caused repairs for material failures, including:

- absent evidence initially classified as `unknown` rather than `unsupported`;
- conventional `1 failing` output accepted as passing;
- malformed JSON import crashing rather than preserving the current draft;
- incomplete fixture expectations;
- a chain verifier that could not resume or recognize honest completion;
- mutable launch documentation invalidating a prior handoff hash;
- screenshot evidence that changed across equivalent runs.

See the [product repair log](outcome-room/repair-log.md) and [launch repair log](launch/evidence/repair-log.md).

## Inspect the chain

- [Original request](REQUEST.md)
- [Final chain state](.possible/chain.json)
- [Discovery receipt](outcome-room/decision-receipt.json)
- [Product receipt](outcome-room/product-receipt.json)
- [Launch receipt](launch/launch-receipt.json)
- [Archived stage evidence](.possible/runs/)
- [Verified handoffs](.possible/handoffs/)
- [Local launch site](launch/site/index.html)

Run the snapshot verifier from the Possible repository root:

```bash
npm run chain-example:verify
```

To run PatchProof itself, follow its [project README](README.md). The source-run Git history is not embedded in this example directory; immutable revisions remain recorded as provenance, while `verify-example.mjs` checks the copied evidence and every archived artifact directly. The example package routes its chain check through that portable verifier instead of asking the parent repository for commits that belong to the isolated source run.
