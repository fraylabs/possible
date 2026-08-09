# Outcome Pack registry

Possible keeps the public catalog in Git. There is no submission database.

- `entries/<owner>/<repository>/<slug>.json` records the author's public GitHub repository, exact commit, manifest path, and SHA-256 hash.
- `snapshots/<sha256>.json` preserves the exact accepted `pack.json` bytes for deterministic offline builds.
- `trust/<owner>/<repository>/<slug>.json` is optional maintainer-owned status and accepted evidence. Authors must not include it in a submission.
- `bundled-trust.json` is the maintainer-owned trust source for Possible's bundled packs.

A submitted snapshot must pass the minimal Outcome Pack schema and compile. It starts as `listed`. `experimental` and `verified` require a separate maintainer trust record; `verified` also requires accepted run evidence. A pack never grants external authority.

```bash
npm run registry:sync
npm run registry:validate
```

Do not edit generated federated catalog data, generated bundled trust data, or bundled pack references by hand.
