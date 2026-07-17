import { knowledgeGraphData } from "./generated-data.js";
import type {
  CapabilityMatch,
  CapabilityRequirements,
  ExpandOptions,
  GraphSlice,
  KnowledgeEdge,
  KnowledgeGraph,
  KnowledgeNode,
  ProviderCapability,
  SearchOptions,
  SearchResult,
} from "./types.js";

const normalize = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9+#./-]+/g, " ")
    .trim();

const termsFor = (value: string): string[] =>
  [...new Set(normalize(value).split(/\s+/).filter(Boolean))];

const cloneGraph = (graph: KnowledgeGraph): KnowledgeGraph =>
  JSON.parse(JSON.stringify(graph)) as KnowledgeGraph;

const nodeSearchFields = (node: KnowledgeNode): Array<[string, number]> => {
  const providerText = node.provider
    ? node.provider.capabilities
        .map((capability) =>
          [
            capability.label,
            capability.category,
            capability.description,
            ...(capability.accepts ?? []),
            ...(capability.outputs ?? []),
          ].join(" "),
        )
        .join(" ")
    : "";

  return [
    [node.title, 14],
    [node.id, 10],
    [node.tags.join(" "), 8],
    [node.summary, 5],
    [node.recommendations.map((item) => item.statement).join(" "), 4],
    [providerText, 4],
  ];
};

const phraseMatches = (haystack: string, requirement: string): boolean => {
  const normalizedHaystack = normalize(haystack);
  const normalizedRequirement = normalize(requirement);
  if (!normalizedRequirement) return false;
  if (normalizedHaystack.includes(normalizedRequirement)) return true;
  return termsFor(normalizedRequirement).every((term) => normalizedHaystack.includes(term));
};

export async function loadGraph(): Promise<KnowledgeGraph> {
  return cloneGraph(knowledgeGraphData);
}

export function getNode(graph: KnowledgeGraph, id: string): KnowledgeNode | undefined {
  return graph.nodes.find((node) => node.id === id);
}

export function searchGraph(
  graph: KnowledgeGraph,
  query: string,
  options: SearchOptions = {},
): SearchResult[] {
  const terms = termsFor(query);
  if (terms.length === 0) return [];
  const phrase = normalize(query);
  const domainFilter = options.domains ? new Set(options.domains) : undefined;
  const typeFilter = options.types ? new Set(options.types) : undefined;
  const limit = Math.max(0, Math.min(options.limit ?? 20, 100));

  return graph.nodes
    .filter((node) => !domainFilter || domainFilter.has(node.domain))
    .filter((node) => !typeFilter || typeFilter.has(node.type))
    .map((node): SearchResult => {
      const fields = nodeSearchFields(node).map(([value, weight]) => [normalize(value), weight] as const);
      const matchedTerms = terms.filter((term) => fields.some(([value]) => value.includes(term)));
      let score = 0;
      for (const term of matchedTerms) {
        score += fields.reduce((sum, [value, weight]) => sum + (value.includes(term) ? weight : 0), 0);
      }
      if (fields.some(([value]) => value.includes(phrase))) score += 20;
      return { node, score, matchedTerms };
    })
    .filter((result) => result.matchedTerms.length === terms.length)
    .sort((left, right) =>
      right.score - left.score || left.node.title.localeCompare(right.node.title) || left.node.id.localeCompare(right.node.id),
    )
    .slice(0, limit);
}

const edgesForNode = (
  edges: KnowledgeEdge[],
  nodeId: string,
  direction: NonNullable<ExpandOptions["direction"]>,
): KnowledgeEdge[] =>
  edges.filter((edge) => {
    if (direction === "incoming") return edge.target === nodeId;
    if (direction === "outgoing") return edge.source === nodeId;
    return edge.source === nodeId || edge.target === nodeId;
  });

export function expandNode(
  graph: KnowledgeGraph,
  id: string,
  options: ExpandOptions = {},
): GraphSlice {
  const center = getNode(graph, id);
  if (!center) return { centerId: id, nodes: [], edges: [] };

  const depth = Math.max(0, Math.min(options.depth ?? 1, 5));
  const limit = Math.max(1, Math.min(options.limit ?? 100, 500));
  const direction = options.direction ?? "both";
  const typeFilter = options.relationshipTypes ? new Set(options.relationshipTypes) : undefined;
  const selected = new Set<string>([id]);
  let frontier = [id];

  for (let level = 0; level < depth && frontier.length > 0 && selected.size < limit; level += 1) {
    const next: string[] = [];
    for (const currentId of frontier.sort()) {
      const adjacent = edgesForNode(graph.edges, currentId, direction)
        .filter((edge) => !typeFilter || typeFilter.has(edge.type))
        .sort((left, right) => left.id.localeCompare(right.id));
      for (const edge of adjacent) {
        const candidate = edge.source === currentId ? edge.target : edge.source;
        if (!selected.has(candidate) && selected.size < limit) {
          selected.add(candidate);
          next.push(candidate);
        }
      }
    }
    frontier = next;
  }

  const nodes = graph.nodes.filter((node) => selected.has(node.id));
  const edges = graph.edges.filter(
    (edge) =>
      selected.has(edge.source) &&
      selected.has(edge.target) &&
      (!typeFilter || typeFilter.has(edge.type)),
  );
  return { centerId: id, nodes, edges };
}

const capabilityText = (capability: ProviderCapability): string =>
  [
    capability.key,
    capability.label,
    capability.category,
    capability.description,
    ...(capability.accepts ?? []),
    ...(capability.outputs ?? []),
  ].join(" ");

const exactListMatch = (available: string[], required: string): boolean =>
  available.some((item) => normalize(item) === normalize(required));

export function findCapabilities(
  graph: KnowledgeGraph,
  requirements: CapabilityRequirements,
): CapabilityMatch[] {
  const requiredCapabilities = requirements.capabilities ?? [];
  const requiredInputs = requirements.accepts ?? [];
  const requiredOutputs = requirements.outputs ?? [];
  const queryTerms = requirements.query ? termsFor(requirements.query) : [];
  const providerFilter = requirements.providerIds ? new Set(requirements.providerIds) : undefined;

  return graph.nodes
    .filter((node) => node.type === "provider" && node.provider)
    .filter((node) => !requirements.domain || node.domain === requirements.domain)
    .filter((node) => !providerFilter || providerFilter.has(node.id))
    .map((provider): CapabilityMatch | undefined => {
      const supported = provider.provider!.capabilities.filter((capability) => capability.status === "supported");
      const combinedText = supported.map(capabilityText).join(" ");
      const capabilityMatches = requiredCapabilities.every((required) => phraseMatches(combinedText, required));
      const accepts = supported.flatMap((capability) => capability.accepts ?? []);
      const outputs = supported.flatMap((capability) => capability.outputs ?? []);
      const inputMatches = requiredInputs.every((required) => exactListMatch(accepts, required));
      const outputMatches = requiredOutputs.every((required) => exactListMatch(outputs, required));
      const queryMatches = queryTerms.filter((term) => normalize(combinedText).includes(term));
      if (!capabilityMatches || !inputMatches || !outputMatches) return undefined;
      if (queryTerms.length > 0 && queryMatches.length === 0) return undefined;

      const matchedRequirements = [
        ...requiredCapabilities,
        ...requiredInputs,
        ...requiredOutputs,
        ...queryMatches,
      ];
      const matchedCapabilities = supported.filter((capability) => {
        const text = capabilityText(capability);
        return matchedRequirements.length === 0 || matchedRequirements.some((required) => phraseMatches(text, required));
      });
      const actions = graph.nodes.filter(
        (node) => node.type === "action" && node.action?.providerId === provider.id,
      );
      const score = requiredCapabilities.length * 8 + requiredInputs.length * 6 + requiredOutputs.length * 6 + queryMatches.length * 2;
      return {
        provider,
        capabilities: matchedCapabilities.length > 0 ? matchedCapabilities : supported,
        actions,
        score,
        matchedRequirements: [...new Set(matchedRequirements)],
        unknowns: provider.provider!.unknowns,
      };
    })
    .filter((match): match is CapabilityMatch => Boolean(match))
    .sort((left, right) =>
      right.score - left.score || left.provider.title.localeCompare(right.provider.title),
    );
}
