# Goal

A builder can rely on Possible to turn a concrete launch or release brief into an inspectable Codex execution contract without hiding where its capabilities came from.

## Supported promise

- Three outcome packs: `hardware-launch`, `software-launch`, and `open-source-release`.
- Every skill exposes its repository, reviewed revision, and review link.
- Deterministic grouped install commands and a personalized run prompt.
- Workstream-based delegation, captain integration, and fresh verification.
- Pack-specific gates around external actions and unsupported claims.

## Not promised

- That upstream skill contents remain identical after review.
- Authorization to deploy, publish, purchase, fabricate, contact users, or change external systems.
- Arbitrary outcomes beyond the three published packs.

## Verifiers

```bash
npm run check
test -f apps/web/dist/packs/index.json
test -f apps/web/dist/packs/hardware-launch/run.txt
test -f apps/web/dist/packs/software-launch/run.txt
test -f apps/web/dist/packs/open-source-release/run.txt
```

The trusted artifacts are the typed manifests, compiler tests, skill validation, web tests, MCP tests, and generated static pack files.
