# Goal

A builder can rely on Possible to turn one hardware-launch brief into an inspectable Codex execution contract without hiding where its capabilities came from.

## Supported promise

- One published pack: `hardware-launch`.
- Five named external skills with repository, reviewed revision, and review link.
- Deterministic install commands and run prompt.
- Workstream-based delegation for web, film, and CAD.
- Captain integration followed by independent browser verification.
- Explicit gates around external actions and unsupported claims.

## Not promised

- That upstream skill contents remain identical after review.
- Deployment, purchases, fabrication, outreach, certification, customer demand, or physical validation.
- Arbitrary outcomes beyond the published Hardware Launch pack.

## Verifiers

```bash
npm run check
test -f apps/web/dist/packs/hardware-launch.json
test -f apps/web/dist/packs/hardware-launch/run.txt
```

The trusted artifacts are the typed manifest, compiler tests, skill validation, web tests, MCP tests, and generated static pack files.
