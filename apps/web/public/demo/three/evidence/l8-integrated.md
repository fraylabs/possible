# L8 — integrated verifier

Status: **Pass**

## Review sequence

1. Clean `npm ci` passed.
2. First post-repair `npm run verify` passed every machine script (2026-07-18T20:53:53.749Z–20:54:46.617Z).
3. Independent current-guideline, keyboard/semantic, contrast-coverage, privacy/copy, screenshot, and film-still review passed; machine green did not override manual evidence.
4. The independent reviewer updated `release/RELEASE-PLAN.md` to the evidence-derived local/public decisions.
5. `npm run release:verify` passed on the signed-off plan.
6. A second `npm run verify` passed on the final source/outcome manifest (2026-07-18T21:00:08.069Z–21:00:55.918Z).

Final exact-tree script results:

| Script | Result |
| --- | --- |
| `release:verify` | Pass |
| `test:unit` | Pass — 15/15 |
| `build` | Pass |
| `test:browser` | Pass |
| `verify:ui` | Pass |
| `verify:privacy` | Pass |
| `film:render` | Pass |
| `film:verify` | Pass |

Gate classification:

- L0 Pass
- L1 Pass
- L2 Pass
- L3 Pass
- L4 Pass
- L5 Pass
- L6 Pass
- L7 Pass
- L8 Pass

- **Failed required checks:** none.
- **Skipped required checks:** none.
- **Unproven:** the propositions retained in `evidence/FINAL-VERIFICATION.md` and the release plan.

## Final normalized source/outcome manifest

- SHA-256: `f5f440bd59bb85aa348f43b0266baf9fdc4512a0a6ab87c215a5d9a747bc6429`
- File count: 213
- Algorithm: recursively enumerate regular files; exclude `.git`, `evidence`, every `node_modules`, `dist`, and `__pycache__` directory, `film/build`, and `*.pyc`; normalize only the `release/RELEASE-PLAN.md` Integrated tree/revision row to `<normalized-self-reference>`; bytewise-sort relative paths; SHA-256 each file; SHA-256 the ordered `<file-sha256><two spaces><path><newline>` manifest.
- Included deliverables: product/site/film/release source, lockfiles, reviewed skills/state, `film/out/three-demo.mp4`, and all 8 film stills.
- Excluded evidence remains tied to this hash by its receipts; evidence was excluded so writing the receipts does not create a self-referential manifest.
- Git state: no HEAD, commits, remotes, or immutable archive.

Local package: **Ready — all L0–L8 passed locally**. Public release: **Not ready — unproven and unauthorized**.
