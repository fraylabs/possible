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

The website, static publications, and MCP server consume the typed registry directly. The installable Codex skill carries a bundled reviewed pack reference so it can work without the MCP; that snapshot must be synchronized and may lag a newer source checkout or npm release. No surface treats a pack as authorization for external actions.
