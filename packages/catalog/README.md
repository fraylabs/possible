# Outcome catalog

Each folder under `src/outcomes/<slug>/` owns one `outcome.json` and optional `media/`.

Required fields are `schemaVersion`, `title`, `summary`, `originalPrompt`, `executionPrompt`, `execution`, and `author`. Optional fields are `products`, `skills`, and `preview`. The canonical format is [outcome.schema.json](src/outcome.schema.json).

Run `npm run outcomes:generate` after editing Outcomes, Companies, or Products. Do not hand-edit `generated-outcomes.ts` or `generated-products.ts`.
