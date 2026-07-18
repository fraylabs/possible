# Possible MCP

This package projects the validated `@possible/knowledge` wiki corpus through
two read-only MCP tools:

- `search`
- `read`

Run the local stdio server with `npm run dev -w @possible/mcp`. Run the
stateless Streamable HTTP entry point with
`npm run dev:http -w @possible/mcp`; it serves MCP POST requests at `/mcp` and
defaults to `127.0.0.1:3001`. Configure `HOST` and `PORT` for deployment.
When binding a non-loopback interface, set comma-separated `ALLOWED_HOSTS` so
the SDK can validate Host headers at the application boundary.

`search` accepts a natural-language query plus an optional limit and returns
page `slug`, `title`, `summary`, authored routing metadata, matched terms, and
an assessment. The assessment is `verified` only for an explicitly verified
outcome route, `partial` for incomplete outcome knowledge, and
`no-maintained-route` when Possible has no maintained outcome route even if
related tools or methods were found. `read` accepts an exact page slug and
returns the full Markdown page plus `links`, `sources`, `backlinks`, and
`relatedPages`.

The server never stores credentials or exposes deployment, DNS, payment,
ordering, fabrication, or other write tools. Possible maintains knowledge; the
host agent plans and executes separately.
