# Architecture

```text
publisher repository or domain
  outcomes.json
  outcomes/<slug>/{outcome.json,outcome.md,prompt.md}
                │
                ▼
       registration function
                │
                ▼
       immutable Supabase snapshot
          ├── possible.sh
          └── Possible MCP
```

The publisher source is canonical. Possible independently reads an exact Git commit or same-origin domain publication, validates the public contract, and stores an immutable content-addressed snapshot. The current directory points to one snapshot; older snapshots remain immutable and private.

The website and MCP read the same public Supabase views. Neither keeps a second Outcome catalog or rewrites a published prompt. Products and lightweight Skill links remain static reference data because they provide attribution context, not canonical Outcome content.

The CLI owns authoring, validation, source publishing, live directory search and fetch, direct source installation, prompt use, and local bookmarks. The optional `$possible` Skill is installed through the standard Skills ecosystem; it uses the MCP when available and otherwise uses the public CLI to read published Outcomes as precedent without changing the original record.
