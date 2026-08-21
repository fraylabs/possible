# Outcome catalog

Each folder under `src/outcomes/<slug>/` owns one `outcome.json` plus optional `media/`, `inputs/`, and `artifacts/` directories.

Required fields are `schemaVersion`, `title`, `summary`, `executionPrompt`, `execution`, and `author`. `originalPrompt`, `source`, `products`, `skills`, `inputs`, `artifacts`, and `preview` are optional. Inputs and artifacts name real files used or produced by the run; instructions and requested deliverables stay in the exact prompt. External records use `source` to point to the original publication and never invent a prior request or missing execution metadata. The canonical format is [outcome.schema.json](src/outcome.schema.json).

Run `npm run outcomes:generate` after editing Outcomes, Companies, or Products. Do not hand-edit `generated-outcomes.ts` or `generated-products.ts`.
