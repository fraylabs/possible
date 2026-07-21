# Possible — Build Week provenance

This file records the implementation boundary, official submission window, Codex session, human decisions and preserved evidence.

## Product reset

Commit [`afb5fc1`](https://github.com/fraylabs/possible/commit/afb5fc1c1e01d746753712ddc79f456df0984826) records the clearest product boundary:

```text
2026-07-18T21:35:19+08:00
Reset Possible as a Hardware Launch outcome compiler
```

Before this commit, Possible was a read-only guide library. It explicitly left planning, skill choice, execution and verification to the host agent.

From this commit onward, the repository adds:

- typed Outcome Pack manifests and a deterministic compiler;
- the interview-first, approval-gated `$possible` skill;
- the repo-local npm installer;
- generated pack specifications and documentation;
- the Still, Robot Snake, Fold and Web Presentation demos;
- preserved verification failures, repairs and completion evidence.

Inspect the boundary with:

```bash
git show afb5fc1^:README.md
git show --stat afb5fc1
git diff --stat afb5fc1^..HEAD
```

## Codex evidence

The repository preserves inspectable Codex outputs and verification evidence:

- [Still Codex transcript](apps/web/public/demo/still/CODEX-THREAD.md)
- [Still completion report](apps/web/public/demo/still/OUTCOME-RECEIPT.md)
- [Robot Snake intake transcript](apps/web/public/demo/robot-snake/INTAKE-TRANSCRIPT.md)
- [Robot Snake completion report](apps/web/public/demo/robot-snake/evidence/outcome-receipt.md)
- [Fold verification](apps/web/public/demo/fold/verification.md)
- [Web Presentation](apps/web/public/presentation/possible.html)

These artifacts show implementation, failures, repairs and verification. They do not independently prove the model label or official event eligibility window.

## Human decisions

The human operator chose the product thesis, rejected the universal-skill and marketplace framings, required interview-first intake, selected the featured outcomes and retained approval gates for external actions. Codex implemented, tested and documented those decisions.

## Frozen submission record

The [official submission period](https://openai.devpost.com/details/dates) ran from July 13, 2026 at 9:00am PDT to July 21, 2026 at 5:00pm PDT. The product-reset commit landed July 18 at 6:36am PDT; the frozen submission commit landed July 21 at 2:26pm PDT. This judge-evidence clarification was written afterward and does not expand that implementation range.

```text
Built with: Codex using GPT-5.6
Primary Codex /feedback session ID: 019f7517-658f-7723-8686-2ecda930c00a
Eligible implementation commit range: afb5fc1c1e01d746753712ddc79f456df0984826..d7d77f098da4712ca6194a9446c5498a7a66d01b
Frozen submission commit: d7d77f098da4712ca6194a9446c5498a7a66d01b
Demo video: https://youtu.be/s35aGhVI2Eo
```

The canonical judge package is `@fraylabs/possible@0.1.8`.
