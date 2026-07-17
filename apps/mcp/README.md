# Possible MCP

This package projects the validated `@possible/knowledge` graph through four
read-only MCP tools:

- `search_knowledge`
- `read_node`
- `expand_node`
- `find_capabilities`

Run the local stdio server with `npm run dev -w @possible/mcp`. Run the
stateless Streamable HTTP entry point with
`npm run dev:http -w @possible/mcp`; it serves MCP POST requests at `/mcp` and
defaults to `127.0.0.1:3001`. Configure `HOST` and `PORT` for deployment.
When binding a non-loopback interface, set comma-separated `ALLOWED_HOSTS` so
the SDK can validate Host headers at the application boundary.

The server never stores provider credentials or exposes deployment, DNS,
payment, ordering, or fabrication write tools. Provider procedures returned by
the graph must be invoked separately in an approval-gated agent host.
