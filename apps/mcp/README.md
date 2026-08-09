# Possible MCP

Read-only distribution access to the public JSON Outcome Pack catalog:

- `list_packs` returns bundled and federated public catalog entries with namespaced identities, immutable sources, maintainer trust, accepted-evidence summaries, and content hashes.
- `fetch_pack` accepts a namespaced `id` or a unique `slug` and returns the exact catalog snapshot. Existing slug-based calls remain supported when the slug is unambiguous.
- `search_packs` returns the complete active catalog with transparent lexical hints across the outcome, current reality, constraints, catalog metadata, and expectations. Every result carries the full `notFor` boundary. An agent must semantically inspect the candidates; lexical order is never the recommendation.

Pack authors do not control trust: a listed pack is a valid source submission, not a Possible-maintainer endorsement or verification. Search uses deterministic lexical hints only to make complete-catalog inspection easier; the agent supplies semantic judgment. The server never discovers private packs, writes project files, compiles or executes packs, approves work, or authorizes external actions. The Possible skill and local CLI own project-local pack handling.

```bash
npm run dev:mcp
npm run test -w @possible/mcp
```
