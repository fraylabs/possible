# L0 — toolchain

Status: **Pass**

- Reviewer: `post_repair_verification`, independent post-repair subagent
- Clean-install start: 2026-07-18T20:53:40Z
- Final exact-tree verification: 2026-07-18T21:00:08Z–21:00:55Z
- Environment: macOS 26.5.1 build 25F80, Darwin 25.5.0 arm64; Node v25.2.1; npm 11.6.2; Python 3.11.8; uv 0.9.7; FFmpeg/FFprobe 7.1.1.
- Browser harness: Playwright 1.61.0 with headless Chromium 149.0.7827.55.
- Source/outcome manifest: `f5f440bd59bb85aa348f43b0266baf9fdc4512a0a6ab87c215a5d9a747bc6429` over 213 files using the algorithm in `evidence/L8-integrated.md`.

Commands:

```sh
python3 .agents/skills/webapp-testing/scripts/with_server.py --help
node --version && npm --version && test -f package-lock.json && npm ci
npm audit --json
uv --version
ffmpeg -version
ffprobe -version
```

Results:

- **Pass:** the required helper `--help` was run before use.
- **Pass:** root `package-lock.json` exists and `npm ci` added 466 packages / audited 470 from the clean root lockfile with exit 0.
- **Pass:** Node/npm meet the declared workspace engines (`node >=22.12.0`, `npm >=10`).
- **Pass:** the final exact-tree aggregate used the same installed graph.
- **Failed required checks:** none.
- **Skipped required checks:** none.
- **Unproven:** reproducibility on other operating systems, architectures, supported Node versions, or a clean Git checkout.

Audit disclosure: npm reports 2 low-severity development-tool findings in the film ESLint chain (`eslint` through `@eslint/plugin-kit`, GHSA-xffm-g5w8-qvg7). There are no moderate/high/critical findings in this audit. No force fix or dependency rewrite was performed.

Material limitation: the workspace has no Git HEAD, commit, remote, or immutable archive. The normalized content manifest identifies reviewed bytes but is not a recovery copy.
