# Possible MCP

Read-only access to the same outcome pack used by possible.sh:

- `list_packs` returns the published pack summaries.
- `compile_pack` returns one manifest, its install commands, and its complete Codex run prompt.

The server does not install skills, modify projects, or authorize external actions.

```bash
npm run dev:mcp
npm run test -w @possible/mcp
```
