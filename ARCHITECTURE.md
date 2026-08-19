# Architecture

```text
outcomes/<slug>/outcome.json
             │
             └── generated catalog
                    ├── possible.sh
                    ├── /outcomes/*.json + prompt.txt
                    └── MCP list / search / fetch
```

`outcome.json` is the single source of truth for the title, summary, exact prompt, author, and optional Products, Skills, and preview media. The generator validates folders, resolves local media URLs, and produces one typed catalog.

The website, MCP, and static publications only project that catalog. They do not compile, rewrite, execute, rank by trust, or add completion rules.

The optional `$possible` skill is a discovery client. The CLI only installs that skill and stores local Outcome bookmarks.
