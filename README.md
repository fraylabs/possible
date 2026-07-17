# Possible

Possible is a sourced, linked wiki of what humans and agents can make possible.

Explore the public atlas at [possible.sh](https://possible.sh). Its source and
pages live at
[github.com/fraylabs/possible](https://github.com/fraylabs/possible).

Possible deliberately keeps the product small:

- A **page** explains an outcome, method, project, provider, or concept.
- A page's internal **links** generate the graph and backlinks.
- Its **sources** make the knowledge inspectable and maintainable.

Humans search and follow a visual map in Explore mode, then open one page in a
focused Read mode. Agents search and read the same corpus through a two-tool,
read-only MCP server. Possible supplies useful knowledge; the host agent still
reasons, plans, asks the user for meaningful decisions, and executes through
other tools.

## Run it

Requires Node.js 22 or newer.

```bash
npm install
npm run check
npm run dev:web
```

Start the Streamable HTTP MCP server separately with:

```bash
npm run dev:http -w @possible/mcp
```

It defaults to `http://127.0.0.1:3001/mcp`. Set `HOST`, `PORT`, and—when binding
outside loopback—`ALLOWED_HOSTS` explicitly.

## Agent interface

The MCP server exposes exactly two read-only operations:

- `search` — find pages from a natural-language outcome or subject.
- `read` — retrieve one complete page, its sources, links, and related pages.

The installable guidance in [`skills/possible`](skills/possible/) teaches an
agent to search, read only relevant pages, follow useful links, cite sources,
and then do its own planning and execution.

## Contribute

Canonical pages are ordinary Markdown under [`knowledge/pages`](knowledge/pages/).
Each page has a stable slug, title, summary, optional tags, review date, and at
least one source. Link to another Possible page with `/wiki/<slug>`; those links
are the only source of graph edges.

After editing pages, run:

```bash
npm run knowledge:validate
npm run test -w @possible/knowledge
```

See [`GOAL.md`](GOAL.md) for the active trust claim and
[`ARCHITECTURE.md`](ARCHITECTURE.md) for the small shared contract. The original
typed-graph MVP and its controlled evaluation receipts remain in Git history
and under `evals/` as historical evidence; they are not the new content model.
