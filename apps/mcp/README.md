# Possible MCP

This package projects the validated `@possible/knowledge` field-guide library
through two read-only MCP tools:

- `search`
- `read`

Run the local stdio server with `npm run dev -w @possible/mcp`. Run the
stateless Streamable HTTP entry point with
`npm run dev:http -w @possible/mcp`; it serves MCP POST requests at `/mcp` and
defaults to `127.0.0.1:3001`. Configure `HOST` and `PORT` for deployment.
When binding a non-loopback interface, set comma-separated `ALLOWED_HOSTS` so
the SDK can validate Host headers at the application boundary.

`search` accepts one focused natural-language topic, decision, or technique plus
an optional limit. It returns matching guide slugs, titles, summaries, authored
aliases, and matched terms. Compound requests should become several focused
searches rather than one request for a generated plan. `read` accepts an exact
guide slug and returns the full Markdown guide plus its review date, `links`,
`sources`, `backlinks`, and `relatedPages`.

The server never stores credentials or exposes deployment, DNS, payment,
ordering, fabrication, or other write tools. Possible maintains knowledge; the
host agent combines relevant guides with project context, chooses from its
actual skills and tools, plans, obtains authorization, executes, and validates
separately. When no relevant guide exists, the host should say so rather than
stretching adjacent material into an answer.
