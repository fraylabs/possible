# Architecture

```text
hardware-launch.ts
       │
       ├── compiler.ts ── install commands + run prompt
       │
       ├── possible.sh ── inspect + copy
       │
       ├── static files ── JSON + install.txt + run.txt
       │
       └── MCP ────────── list_packs + compile_pack
```

The manifest is the single product source. It records skills, reviewed revisions, workstreams, outputs, guardrails, and verification. The compiler is deterministic: it groups install commands by repository and renders the captain workflow.

The website does not maintain a second copy of pack content. The MCP server is read-only and returns the same compiler result. The Codex skill explains how to inspect, install, and run that result without treating it as authorization for external actions.
