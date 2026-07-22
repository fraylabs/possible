# Robot Snake evaluation

This directory makes the recorded `/goal` versus Possible comparison machine-checkable.

- `protocol.json` preserves the complete human input, environment and limitations.
- `results.json` maps the pre-existing Robot Prototype contract to direct evidence from both runs.
- `verify.mjs` checks every evidence link and re-hashes every artifact in the Possible manifest.

Run:

```bash
npm run evaluation:verify
```

The command reproduces the evidence audit. It does not rerun an agent or claim statistical significance. A new model or environment should be recorded as a separate protocol and immutable result snapshot.
