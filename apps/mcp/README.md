# Possible MCP

Read-only distribution access to the public JSON Outcome Pack catalog:

- `list_packs` returns bundled and federated public catalog entries with namespaced identities, immutable sources, maintainer trust, accepted-evidence summaries, and content hashes.
- `fetch_pack` accepts a namespaced `id` or a unique `slug` and returns the exact catalog snapshot. Existing slug-based calls remain supported when the slug is unambiguous.
- `search_packs` returns plausible active packs using transparent text overlap across the outcome, current reality, constraints, catalog metadata, and expectations. It reports matching terms and `notFor` conflicts; an agent must make the final selection.

Pack authors do not control trust: a listed pack is a valid source submission, not a Possible-maintainer endorsement or verification. Search is deterministic lexical discovery, not semantic ranking or an automatic recommendation. The server never discovers private packs, writes project files, compiles or executes packs, approves work, or authorizes external actions. The Possible skill and local CLI own project-local pack handling.

```bash
npm run dev:mcp
npm run test -w @possible/mcp
```
