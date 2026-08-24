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
        immutable Convex snapshot
          ├── possible.sh
          ├── Possible CLI
          └── Possible MCP
```

The publisher source is canonical. Possible independently reads an exact Git commit or same-origin domain publication, validates the public contract, and stores an immutable content-addressed snapshot. The current directory points to one snapshot; older snapshots remain immutable and private.

The website, CLI, and MCP read the same public Convex HTTP API. Neither keeps a second Outcome catalog or rewrites a published prompt. Product and Skill references remain lightweight Outcome attributions, not catalogs owned by Possible.

Anonymous web and CLI use events are hashed before storage, deduplicated per Outcome and day, ignored in CI, and rate-capped. Reader likes and private bookmarks require GitHub authentication; publishing does not. The CLI owns authoring, validation, source publishing, live directory search and fetch, direct source installation, prompt use, and local bookmarks. The optional `$possible` Skill is installed through the standard Skills ecosystem; it uses the MCP when available and otherwise uses the public CLI to read published Outcomes as precedent without changing the original record.
