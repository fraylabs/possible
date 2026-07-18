# Three — local launch-package outcome receipt

Outcome: **ready locally; not ready or authorized for public release**  
Decision basis: acceptance checks only; there was no launch date  
Final manifest: `f5f440bd59bb85aa348f43b0266baf9fdc4512a0a6ab87c215a5d9a747bc6429`

## Delivered artifacts

- `product/` — real Vite/React/TypeScript browser product with versioned `localStorage` and 15 automated tests.
- `site/` — truthful, responsive, non-public local launch site.
- `film/src/` — editable Remotion source.
- `film/out/three-demo.mp4` — 22.059-second, 1920 × 1080, 30 fps H.264 demo; SHA-256 `cfe5453a9adda811d950fadbb3913537f8cfb1a2acdd86e49a9d990a61ee7824`.
- `film/stills/` — 8 reviewed 1920 × 1080 representative frames.
- `release/RELEASE-PLAN.md` — signed-off local plan with public-release gates retained.
- `README.md` — root local install/run/build/verify instructions.
- `evidence/` — L0–L8, final decision, runtime JSON, screenshots, failure history, and this receipt.

## Exact verification commands

```sh
python3 .agents/skills/webapp-testing/scripts/with_server.py --help
node --version && npm --version && test -f package-lock.json && npm ci
npm audit --json
npm run verify

# Independent keyboard/semantic probe with both local surfaces
uv run --with playwright==1.61.0 python .agents/skills/webapp-testing/scripts/with_server.py \
  --server "npm run dev:product -- --host 127.0.0.1 --port 4173" --port 4173 \
  --server "npm run dev:site -- --port 4174" --port 4174 \
  -- python evidence/post-repair-browser-probe.py

npm run release:verify
npm run verify
node evidence/compute-manifest.mjs
```

The second `npm run verify` is the exact-tree run after release-plan sign-off. It passed release structure, 15/15 tests, all 3 source builds, the full Chromium product contract, responsive/keyboard/motion/contrast review, privacy boundary, deterministic film render, and full film decode.

## Classification

- **Passed:** L0, L1, L2, L3, L4, L5, L6, L7, L8.
- **Failed on final manifest:** none.
- **Skipped required checks:** none.
- **Unproven:** user benefit/demand; production security/privacy/legal/accessibility; representative browser/device and assistive-technology coverage; hosted reliability/operations/support/rollback; broader film playback/comprehension.
- **Public release:** not ready, unproven, and unauthorized.

## Failure and repair trail

1. Integration failures for port forwarding, a Playwright focus assertion, mobile site targeting, SVG privacy false positive, and clean-install Remotion browser provisioning were repaired and retained in `evidence/INTEGRATION-REPAIRS.md`.
2. Fresh review 01 overrode a false-green aggregate and failed L5/L8. Its exact failure files remain unchanged in `evidence/failed-review-01/`.
3. Repairs added the named field and first-focus skip link, strengthened contrast, clarified local-only metadata/browser storage, added touch/safe-area and motion treatments, and waited for settled evidence.
4. Focused reruns passed; this independent reviewer then ran clean aggregate + manual review.
5. After local sign-off, `release:verify` and a second full `verify` passed on the final manifest.

## Manifest algorithm

The 213-file normalized source/outcome manifest includes product, site, film, release, lockfiles, repository-local skills/state, the MP4, and 8 film stills. It excludes `.git`, all of `evidence/`, every `node_modules`, `dist`, and `__pycache__` directory, `film/build`, and `*.pyc`. The release plan's own Integrated tree/revision row is normalized to `<normalized-self-reference>`; paths are bytewise-sorted; each file is SHA-256 hashed; the ordered `<file-hash><two spaces><path><newline>` manifest is SHA-256 hashed. Excluding evidence prevents receipt self-reference.

## Known limitations

- Commitment data is origin/browser local and can be cleared; there is no account, backend, sync, history, export, backup, or recovery.
- The tested browser is Chromium 149 through Playwright viewport emulation; other engines and physical devices remain unproven.
- Formal accessibility/security/privacy/legal/production claims are not made.
- 2 low-severity film ESLint-toolchain audit findings remain disclosed.
- There is no Git commit or immutable archive for recovery.

## External actions not taken

All 12 actions X01–X12 in `release/RELEASE-PLAN.md` remain **Not taken**: no deployment/publication, provider/account/project interaction, domain/DNS change, Git remote publication, backend/auth/storage service, analytics/tracking, user data collection, outreach, social/distribution, purchase, or external sharing.
