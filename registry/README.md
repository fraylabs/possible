# Outcome Pack registry

Possible keeps the public catalog in Git. There is no submission database.

- `entries/<owner>/<repository>/<slug>.json` records the author's public GitHub repository, exact commit, manifest path, and SHA-256 hash.
- `snapshots/<sha256>.json` preserves the exact accepted manifest bytes so catalog builds and MCP remain offline and deterministic.
- `trust/<owner>/<repository>/<slug>.json` is optional maintainer-owned status and accepted evidence. Authors must not include it in a submission.

A submission must point to a public `lifecycle: reviewed` contract so the accepted snapshot is compilable. It starts as `listed`: contract lifecycle is not Possible trust. `experimental` and `verified` require a separate maintainer trust record; `verified` also requires accepted run evidence. A pack contract never grants external authority.

After copying an exported entry and snapshot into their paths, regenerate the browser-safe catalog and bundled skill reference:

```bash
npm run registry:sync
```

Check that every registry file and generated artifact is current:

```bash
npm run registry:validate
```

Do not edit `packages/packs/src/federated-catalog.json` or the bundled pack references by hand.
