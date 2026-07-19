# Architecture

```text
pack manifests ── registry
                      │
                      ├── compiler ── install commands + run prompt
                      ├── possible.sh ── choose + describe + copy
                      ├── static files ── index + per-pack JSON/text
                      └── MCP ────────── list_packs + compile_pack
```

Each manifest records one finished outcome: one browsing lane, external skills, reviewed revisions, workstreams, review skills, outputs, guardrails, and verification. The registry is the catalog. The deterministic compiler groups install commands by repository and renders a pack-specific captain workflow. Lanes organize the catalog only; intake and recommendation remain based on the user's desired finished outcome.

The website, static publications, MCP server, and Codex skill consume the same registry. None of those surfaces maintains a second copy of pack content or treats a pack as authorization for external actions.
