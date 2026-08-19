# Architecture

```text
outcomes/<slug>/outcome.json
             │
             └── generated catalog
                    ├── possible.sh
                    ├── /outcomes/*.json + original-prompt.txt + execution-prompt.txt
                    └── MCP list / search / fetch
```

`outcome.json` is the single source of truth for the title, summary, original prompt, full execution prompt, execution provenance, author, and optional Products, Skills, and preview media. The generator validates folders, resolves local media URLs, and produces one typed catalog.

The website, MCP, and static publications only project that catalog. They do not rewrite published prompts, execute them, rank by trust, or add completion rules.

The optional `$possible` skill uses prior Outcomes as precedent, gathers current information, asks for missing intent, and prepares a new execution prompt for user-approved handoff. The CLI only installs that skill and stores local Outcome bookmarks.
