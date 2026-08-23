# Outcome catalog

Each folder under `src/outcomes/<slug>/` contains required `outcome.json`, `outcome.md`, and `prompt.md` files. Optional `media/`, `inputs/`, and `artifacts/` files must be referenced from the manifest.

- `outcome.md` owns the human-facing H1 title, opening summary, and formatted explanation.
- `prompt.md` owns the exact reusable execution prompt.
- `outcome.json` owns machine metadata: author, authored timestamp, models and agents, requirements, Products, Skills with reviewed commits, and file references.

`src/outcomes.json` is the thin publisher index. The canonical machine format is [outcome.schema.json](src/outcome.schema.json).

Run `npm run outcomes:generate` after editing Outcomes, Companies, or Products. Do not hand-edit generated TypeScript files.
