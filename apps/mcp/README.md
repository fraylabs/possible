# Possible MCP

Read-only access to the Outcome directory:

- `list_outcomes`
- `search_outcomes`
- `fetch_outcome`

The MCP returns results, exact prompts, available provenance, inspectable sources, and public context. It does not write files or execute prompts.

It reads the same Convex Outcome directory as possible.sh. Set `POSSIBLE_DIRECTORY_ENDPOINT` only when overriding the default public endpoint.
