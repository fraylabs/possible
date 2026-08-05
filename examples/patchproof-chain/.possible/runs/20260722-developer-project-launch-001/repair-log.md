# Launch repair log

## R1 — Inherited evidence became unverifiable after an authorized README update

- Detected by: post-integration `.possible/verify-chain-handoff.mjs`
- Failure: `hash mismatch: README.md`
- Cause: the handoff correctly hashed the Working Web App README, while Developer Project Launch is explicitly responsible for improving that same live README.
- Repair: `af44d6aeba5b1c5558d62b014f703a70828256ed` makes changed handoff evidence fall back to the handoff’s recorded immutable source revision. The expected SHA-256 remains unchanged; neither a new hash nor live content is trusted silently.
- Recheck: `node .possible/verify-chain-handoff.mjs` → PASS.

## R2 — Design detector found generic fallback and undocumented literals

- Detected by: required one-time Impeccable detector run.
- Findings: generic Arial body fallback and two colors outside `DESIGN.md`; responsive type-size advisories.
- Repair: adopted the documented Avenir Next / Trebuchet MS body stack and replaced literal colors with the `caution` and `perforation` tokens.
- Recheck: browser flows, responsive screenshots, and full build passed. Per detector instructions, the detector itself was not run twice.

## R3 — Initial Remix contract test compared rendered text case-sensitively

- Detected by: `python tests/remix_previews.py`
- Failure: CSS text transformation made truthful copy render uppercase, causing a false mismatch.
- Repair: normalize whitespace and Unicode case for comparison while retaining exact source copy checks.
- Recheck: all 3 candidates passed the same-copy and viewport contract.

## R4 — Animated evidence screenshots were not byte-stable

- Detected by: clean-tree check after rerunning the integrated browser suite.
- Failure: launch and one Remix screenshot could capture a different animation frame and appear modified even when the implementation was unchanged.
- Repair: both screenshot harnesses now emulate `prefers-reduced-motion: reduce` before navigation. Interactive behavior remains tested separately.
- Recheck: two consecutive captures produced identical SHA-256 values and a clean working tree.

## R5 — Integrated product screenshot retained the same animation-frame drift

- Detected by: clean-tree check after the first full verifier run on the launch evidence revision.
- Failure: the inherited product browser harness still captured an active animation frame and changed `outcome-room/browser-desktop.png`.
- Repair: the product browser harness now applies reduced motion and writes its current-run screenshots to a disposable temporary evidence directory. Preserved stage screenshots remain immutable instead of being regenerated as a side effect of `npm run verify`.
- Recheck: consecutive product browser runs leave the worktree clean; interaction, screenshot capture, and state behavior still run normally.

## R6 — Chain verifier did not recognize an honestly completed chain

- Detected by: completion-state chain recheck.
- Failure: the verifier expected one active-stage inbound handoff even after all stages were complete and `currentStage` was correctly `null`.
- Repair: detect a fully completed chain, resolve the final stage as the handoff destination, and apply the same approved authorization and hash checks.
- Recheck: the completed three-stage chain passes without reopening a stage or inventing a pending transition.
