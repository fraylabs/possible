# Architecture

```text
pack manifests ── registry
                      │
                      ├── compiler ── install commands + run prompt
                      ├── possible.sh ── choose + describe + copy
                      ├── static files ── index + per-pack JSON/text
                      └── MCP ────────── list_packs + compile_pack
```

Each manifest records one finished outcome: reviewed skills, workstreams, outputs, guardrails, and verification, plus optional pack-specific contracts. The registry is the catalog. The deterministic compiler groups install commands by repository and renders a pack-specific lead workflow. Catalog status and the legacy lane field are internal discovery/compiler metadata; they are not user-facing workflow primitives, authorization, or a claim about the result.

The runtime model is deliberately small: an Outcome is applied through one approved Run of an Outcome Pack; the run freezes Expectations, produces Outputs, preserves Evidence, and receives independent Verification. A Checkpoint records the changed reality after completion. Pack-specific modules add detail only when the outcome needs it, and an Outcome Journey is retrospective rather than a planned execution graph.

The website, static publications, and MCP server consume the typed registry directly. The installable Codex skill carries a bundled reviewed pack reference so it can work without the MCP; that snapshot must be synchronized and may lag a newer source checkout or npm release. No surface treats a pack as authorization for external actions.
