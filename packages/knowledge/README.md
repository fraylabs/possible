# @possible/knowledge

This package compiles the contributor-authored files in `knowledge/` into the
single graph consumed by Possible's agent and human projections. Runtime code
contains no LLM, network, filesystem, credential, or provider-write path.

## Commands

```bash
npm run validate -w @possible/knowledge
npm run test -w @possible/knowledge
npm run build -w @possible/knowledge
```

`validate` performs JSON Schema validation, cross-file graph integrity checks,
and a deterministic generated-data comparison. `generate` updates the
browser-safe TypeScript projection after reviewed contributor files change.

## Runtime API

- `loadGraph()` returns an isolated copy of the compiled graph.
- `searchGraph()` performs deterministic weighted text retrieval.
- `getNode()` retrieves one exact node.
- `expandNode()` traverses typed incoming and outgoing graph relationships.
- `findCapabilities()` filters sourced provider capabilities against structured
  requirements and includes approval-gated handoff actions.
- `@possible/knowledge/data` exports the same graph without Node-only imports.
