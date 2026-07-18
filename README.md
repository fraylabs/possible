# Possible

Possible is a library of source-backed practical guides for people and agents.

This repository revision is a local, not-published candidate. The existing
[possible.sh](https://possible.sh) deployment may still serve the prior
authorized release; its source and guides live at
[github.com/fraylabs/possible](https://github.com/fraylabs/possible).

Possible deliberately keeps the boundary small:

- A **guide** explains what a subject helps with, when it applies, important
  decisions, practical approaches, validation evidence to seek, and limits.
- A guide's internal **links** identify useful adjacent reading and generate the
  atlas and backlinks. They are not a project plan.
- Its **sources** and review date make the guidance inspectable and maintainable.

People search, browse, and read the library. Agents use the same corpus through
a two-tool, read-only interface. The host agent interprets the actual project,
chooses and combines relevant guides, selects from its own skills and tools,
asks the user for meaningful decisions and approvals, does the work, and
validates the result.

Possible supplies reviewed context. It does not plan, choose tools, execute,
authorize, certify, or validate a project.

The first locked paired pilot did not establish that adding Possible generally
improves agent performance. That no-go result and all 16 raw runs are retained
under `evals/guide-library-v1/`; the current product claim is the library and
retrieval contract above, not measured agent uplift.

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

- `search` — find relevant guides for one focused subject or question.
- `read` — retrieve one complete guide, its sources, links, and related guides.

The installable guidance in [`skills/possible`](skills/possible/) teaches an
agent to decompose compound work, run focused searches, read only useful guides,
combine their guidance with project evidence, cite material sources, and retain
ownership of planning, skill choice, execution, and validation.

## Contribute

Canonical guides are ordinary Markdown under [`knowledge/pages`](knowledge/pages/).
Each guide has a stable slug, title, summary, optional aliases and tags, review
date, at least one source, and useful prose. Link to another guide with
`/wiki/<slug>`.

Start with [`CONTRIBUTING.md`](CONTRIBUTING.md) and the guide template under
`knowledge/`. After editing guides, run:

```bash
npm run knowledge:validate
npm run test -w @possible/knowledge
```

See [`GOAL.md`](GOAL.md) for the active trust claim and
[`ARCHITECTURE.md`](ARCHITECTURE.md) for the shared boundary. Historical
typed-graph evaluations remain under `evals/` and in repository history; they
are not evidence that Possible plans or validates projects.
