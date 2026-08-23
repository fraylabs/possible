# Possible MCP

Read-only access to the Outcome directory:

- `list_outcomes`
- `search_outcomes`
- `fetch_outcome`

The MCP returns results, exact prompts, available provenance, inspectable sources, and public context. It does not write files or execute prompts.

It reads the same Supabase Outcome directory as possible.sh. Configure `POSSIBLE_SUPABASE_URL` and `POSSIBLE_SUPABASE_PUBLISHABLE_KEY` when running it directly; the equivalent `NEXT_PUBLIC_` names are also accepted.
