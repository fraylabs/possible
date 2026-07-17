# MVP Integration Contract

Possible has one validated graph and two projections: an agent interface and a
human website. The projections must not carry separate hand-authored knowledge.

## Shared package

`@possible/knowledge` owns the canonical runtime contract:

```ts
type KnowledgeGraph = { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] };

loadGraph(): Promise<KnowledgeGraph>;
searchGraph(graph, query, options?): SearchResult[];
getNode(graph, id): KnowledgeNode | undefined;
expandNode(graph, id, options?): GraphSlice;
findCapabilities(graph, requirements): CapabilityMatch[];
```

It must also export browser-safe graph data through `@possible/knowledge/data`.
The concrete contributor file format is owned by the knowledge lane, but the
compiled graph and exported functions are the integration boundary.

## Minimum node semantics

The graph must represent topics, practices, tools, providers, and actions. A
recommendation is conditional rather than universal. Provider actions declare
whether they are informational, read-only, or require external approval.

Typed relationships include at least hierarchy, relevance, compatibility,
alternatives, support, and invocation.

## Agent projection

The MCP server exposes only read operations:

- `search_knowledge`
- `read_node`
- `expand_node`
- `find_capabilities`

It may return an official provider endpoint or procedure but must not hold user
credentials or execute deployments, DNS changes, purchases, or fabrication.

## Human projection

The website imports the browser-safe graph data. It provides search, path and
graph navigation, and a node detail view containing applicability, alternatives,
provider/action links, provenance, contributors, and freshness.

## Evaluation projection

Evaluation scenarios query the same package and MCP methods. Baseline and
Possible-assisted transcripts are immutable receipts, not source fixtures. The
scorer must not reward named tools unless they fit the scenario constraints.
