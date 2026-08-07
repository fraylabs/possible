# Possible MCP

Read-only distribution access to the public JSON Outcome Pack catalog:

- `list_packs` returns public pack summaries, lifecycle metadata, source/review links, and immutable content hashes.
- `fetch_pack` returns one exact public JSON manifest, review provenance, source/review links, and its immutable content hash.

The server never discovers private packs, writes project files, compiles or executes packs, approves work, or authorizes external actions. The Possible skill and local CLI own project-local pack handling.

```bash
npm run dev:mcp
npm run test -w @possible/mcp
```
