# Possible knowledge schema

`knowledge-collection.schema.json` is the canonical contributor-file schema.
It deliberately requires conditional recommendations, traceable provenance,
contributors, and review dates. Provider capabilities are claims only when an
official source is attached; information that still needs a live lookup belongs
in the provider's `unknowns` list.

Cross-file constraints (unique node IDs, valid relationship targets, branch
agreement, provider/action references, and required relationship semantics) are
checked by `@possible/knowledge` in addition to JSON Schema validation.
