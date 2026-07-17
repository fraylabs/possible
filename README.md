# Possible

Possible is shared operational knowledge for agents.

Users describe the outcome. Their agent consults Possible for maintained domain
knowledge, current tools, practical decision rules, compatible providers, and
safe action handoffs—then handles the implementation without requiring the user
to secretly be the engineer.

This MVP proves the idea across two branches:

- Web applications and deployment.
- Parametric custom parts and manufacturing handoff.

Possible is deliberately not another chat interface. Contributor-authored,
versioned knowledge is exposed through both an agent-facing MCP interface and a
human graph explorer.

## What the MVP ships

- One validated graph with 48 sourced Web and manufacturing nodes.
- A constellation-style explorer for humans to search and inspect the graph.
- A read-only MCP server with search, node, expansion, and capability tools.
- An installable Agent Skill that teaches agents when and how to consult it.
- Locked baseline-versus-Possible scenarios with independently adjudicated
  receipts.

## Run it

Requires Node.js 22 or newer.

```bash
npm install
npm run check
npm run dev:web
```

The website starts on the local URL printed by Vite. The stateless Streamable
HTTP MCP endpoint can be started separately with:

```bash
npm run dev:http -w @possible/mcp
```

It defaults to `http://127.0.0.1:3001/mcp`. Set `HOST`, `PORT`, and—when binding
outside loopback—`ALLOWED_HOSTS` explicitly.

Prepare the exact static artifact intended for a preview deployment with:

```bash
npm run preview:prepare
```

Its immutable file manifest and approval boundary live under `deployment/`.
This verifies deployment readiness locally; it does not publish anything.

## Query the real MCP path

The helper below starts the stdio server, calls it with a real MCP client, and
prints structured content:

```bash
npm run build
npm run possible:query -- search_knowledge '{"query":"inventory dashboard"}'
npm run possible:query -- read_node '{"id":"web/outcomes/dashboards"}'
npm run possible:query -- find_capabilities '{"requirements":{"domain":"manufacturing","capabilities":["cnc machining"]}}'
```

Install or link [skills/possible/SKILL.md](skills/possible/SKILL.md) in a
compatible agent host and expose the four MCP tools described in
[apps/mcp/README.md](apps/mcp/README.md). Possible itself remains read-only;
deployment, uploads, quotes, purchases, and fabrication happen through separate
approval-gated integrations.

## Contribute knowledge

Contributor records live under `knowledge/`. Recommendations must include
applicability, counterconditions, alternatives, provenance, contributor, and a
review date. Provider records keep live availability, pricing, delivery, and
commercial terms explicit as unknown when they have not been verified.

After changing records, run:

```bash
npm run knowledge:validate
npm run test -w @possible/knowledge
```

See [GOAL.md](GOAL.md) for the supported scope and completion proof, and
[ARCHITECTURE.md](ARCHITECTURE.md) for the shared integration contract. The
current verified claims, controlled scores, and explicit limits are recorded in
[RESULT.md](RESULT.md).
