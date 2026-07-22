# Clean-room quickstart report

## Result

PASS in 12 seconds from dependency installation through the complete verifier in the fresh independent review.

## Frozen input

- Revision: `d37fc385e328015703ce7bf7daca352f29d988df`
- Source: `git archive` extracted into a new `/tmp/patchproof-clean.*` directory
- Existing project `node_modules`: not copied
- Node.js: `v25.2.1` (project minimum: 20.19)
- npm: `11.6.2`
- Python: `3.11.8`

## Commands

```bash
npm ci
npm run verify
```

## Observed result

- `npm ci`: 14 packages added, 0 vulnerabilities reported.
- Unit suite: 34 passed, 0 failed.
- Fixture contract: all 12 inherited fixtures exercised.
- Remix: 3 candidates, identical truthful copy, `1440 × 900` comparison viewport.
- Production build: root product and `launch/site/` pages built.
- Product browser flow: passed.
- Launch browser flow: passed.
- Total elapsed wall time: 12 seconds.

The five-minute claim is therefore supported in this environment with substantial margin. It is not a performance guarantee for every network or machine.
