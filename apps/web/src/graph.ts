import { knowledgeGraphData } from "@possible/knowledge/data";

export type NodeKind = "topic" | "practice" | "tool" | "provider" | "action" | string;

export interface SourceLink {
  title: string;
  url?: string | undefined;
  publisher?: string | undefined;
}

export interface Contributor {
  name: string;
  url?: string | undefined;
}

export interface SafeAction {
  id: string;
  title: string;
  description?: string | undefined;
  url?: string | undefined;
  mode: "informational" | "read-only" | "approval-required";
  provider?: string | undefined;
}

export interface DisplayNode {
  id: string;
  type: NodeKind;
  title: string;
  summary: string;
  description?: string | undefined;
  applicability: string[];
  counterconditions: string[];
  alternatives: string[];
  capabilities: string[];
  steps?: string[] | undefined;
  outputs?: string[] | undefined;
  checks?: string[] | undefined;
  unknowns?: string[] | undefined;
  actions: SafeAction[];
  sources: SourceLink[];
  contributors: Contributor[];
  reviewedAt?: string | undefined;
  tags: string[];
  status?: string | undefined;
}

export interface DisplayEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label: string;
}

export interface DisplayGraph {
  nodes: DisplayNode[];
  edges: DisplayEdge[];
}

export interface SearchHit {
  node: DisplayNode;
  score: number;
  reason: string;
}

export interface PositionedNode {
  node: DisplayNode;
  x: number;
  y: number;
  depth: 0 | 1 | 2;
  relation?: string | undefined;
}

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const firstString = (record: UnknownRecord, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = asString(record[key]);
    if (value) return value;
  }
  return undefined;
};

const asStringList = (value: unknown): string[] => {
  if (typeof value === "string") return value.trim() ? [value.trim()] : [];
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      const record = asRecord(item);
      return firstString(record, ["statement", "title", "name", "id", "label", "description"]) ?? "";
    })
    .filter(Boolean);
};

const normalizeSources = (value: unknown): SourceLink[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    if (typeof item === "string") {
      return [{ title: item, url: /^https?:\/\//.test(item) ? item : undefined }];
    }
    const record = asRecord(item);
    const title = firstString(record, ["title", "name", "label"]) ?? `Source ${index + 1}`;
    const url = firstString(record, ["url", "href"]);
    const publisher = firstString(record, ["publisher", "organization", "author"]);
    return [{ title, url, publisher }];
  });
};

const normalizeContributors = (value: unknown): Contributor[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item === "string") return [{ name: item }];
    const record = asRecord(item);
    const name = firstString(record, ["name", "handle", "id"]);
    if (!name) return [];
    return [{ name, url: firstString(record, ["url", "profile"])}];
  });
};

const normalizeActionMode = (record: UnknownRecord): SafeAction["mode"] => {
  const raw = firstString(record, ["mode", "safety", "access", "permission", "kind"])?.toLowerCase();
  if (raw?.includes("approval") || record.requiresApproval === true || record.approvalRequired === true) {
    return "approval-required";
  }
  if (raw?.includes("read")) return "read-only";
  return "informational";
};

const normalizeActions = (record: UnknownRecord, nodeId: string, nodeTitle: string): SafeAction[] => {
  const provider = asRecord(record.provider);
  const actionDetails = asRecord(record.action);
  const values = [record.actions, record.handoffs, record.invocations, record.invoke_via, provider.handoffs]
    .flatMap((value) => (Array.isArray(value) ? value : value ? [value] : []));

  const handoffs: SafeAction[] = [];
  values.forEach((item, index) => {
    if (typeof item === "string") {
      handoffs.push({
        id: `${nodeId}:action:${index}`,
        title: item,
        mode: "informational",
      });
      return;
    }
    const action = asRecord(item);
    const title = firstString(action, ["title", "name", "label", "purpose", "type", "method", "channel"]);
    if (!title) return;
    handoffs.push({
      id: firstString(action, ["id"]) ?? `${nodeId}:action:${index}`,
      title,
      description: firstString(action, ["description", "summary", "procedure"]),
      url: firstString(action, ["url", "href", "endpoint"])
        ?? firstString(asRecord(action.source), ["url"])
        ?? firstString(provider, ["officialUrl"]),
      provider: firstString(action, ["provider", "service"]),
      mode: normalizeActionMode(action),
    });
  });

  if (Object.keys(actionDetails).length) {
    const steps = asStringList(actionDetails.steps);
    handoffs.unshift({
      id: `${nodeId}:action-details`,
      title: nodeTitle,
      description: steps.length ? steps.join(" → ") : firstString(actionDetails, ["approvalReason"]),
      mode: normalizeActionMode(actionDetails),
      provider: firstString(actionDetails, ["providerId"]),
    });
  }

  return handoffs;
};

const normalizeNode = (value: unknown, index: number): DisplayNode => {
  const record = asRecord(value);
  const id = firstString(record, ["id", "slug", "key"]) ?? `node-${index}`;
  const recommendation = asRecord(record.recommendation);
  const recommendationList = Array.isArray(record.recommendations)
    ? record.recommendations.map(asRecord)
    : [];
  const primaryRecommendation = recommendationList[0] ?? recommendation;
  const providerDetails = asRecord(record.provider);
  const practiceDetails = asRecord(record.practice);
  const actionDetails = asRecord(record.action);
  const summary = firstString(record, ["summary", "description", "statement", "purpose"])
    ?? firstString(primaryRecommendation, ["statement", "summary", "description"])
    ?? "Contributor-maintained operational knowledge.";

  return {
    id,
    type: firstString(record, ["type", "kind", "nodeType"])?.toLowerCase() ?? "topic",
    title: firstString(record, ["title", "name", "label"]) ?? id,
    summary,
    description: firstString(record, ["details", "body", "longDescription"])
      ?? firstString(primaryRecommendation, ["statement"]),
    applicability: [
      ...asStringList(record.applicability),
      ...asStringList(record.when),
      ...asStringList(primaryRecommendation.applicability),
      ...asStringList(primaryRecommendation.when),
      ...asStringList(record.best_when),
    ],
    counterconditions: [
      ...asStringList(record.counterconditions),
      ...asStringList(record.avoidWhen),
      ...asStringList(record.avoid_when),
      ...asStringList(primaryRecommendation.counterconditions),
      ...asStringList(primaryRecommendation.avoid_when),
      ...asStringList(providerDetails.knownConstraints),
    ],
    alternatives: [
      ...asStringList(record.alternatives),
      ...(Array.isArray(primaryRecommendation.alternatives)
        ? primaryRecommendation.alternatives.flatMap((item) => {
            const alternative = asRecord(item);
            return firstString(alternative, ["nodeId", "id", "target"])
              ?? firstString(alternative, ["title", "name"])
              ?? [];
          })
        : []),
    ],
    capabilities: [
      ...asStringList(record.capabilities),
      ...asStringList(record.supports),
      ...(Array.isArray(providerDetails.capabilities)
        ? (providerDetails.capabilities as unknown[]).map((item) => {
            const capability = asRecord(item);
            const label = firstString(capability, ["label", "name", "key"]);
            const status = firstString(capability, ["status"]);
            return label ? `${label}${status === "unknown" ? " · unverified" : ""}` : "";
          }).filter(Boolean)
        : []),
    ],
    steps: asStringList(actionDetails.steps),
    outputs: [...asStringList(practiceDetails.outputs), ...asStringList(actionDetails.produces)],
    checks: asStringList(practiceDetails.checks),
    unknowns: asStringList(providerDetails.unknowns),
    actions: normalizeActions(record, id, firstString(record, ["title", "name", "label"]) ?? id),
    sources: normalizeSources(record.sources ?? record.provenance ?? primaryRecommendation.sources),
    contributors: normalizeContributors(record.contributors ?? record.maintainers ?? primaryRecommendation.contributors),
    reviewedAt: firstString(record, ["reviewedAt", "reviewed_at", "lastReviewed", "last_reviewed"])
      ?? firstString(primaryRecommendation, ["reviewedAt", "reviewed_at"]),
    tags: asStringList(record.tags),
    status: firstString(record, ["status", "confidence", "verificationStatus"])
      ?? firstString(primaryRecommendation, ["confidence"]),
  };
};

const relationLabel = (type: string): string =>
  type
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const normalizeEdges = (values: unknown[], nodes: DisplayNode[], rawNodes: unknown[]): DisplayEdge[] => {
  const explicit = values.flatMap((value, index) => {
    const record = asRecord(value);
    let source = firstString(record, ["source", "from", "parent"]);
    let target = firstString(record, ["target", "to", "child"]);
    if (!source || !target) return [];
    const type = firstString(record, ["type", "relation", "kind"])?.toLowerCase() ?? "related";
    if (type.includes("hierarchy") && source.startsWith(`${target}/`)) {
      [source, target] = [target, source];
    }
    return [{
      id: firstString(record, ["id"]) ?? `${source}:${type}:${target}:${index}`,
      source,
      target,
      type,
      label: firstString(record, ["label"]) ?? relationLabel(type),
    }];
  });

  const inferred = rawNodes.flatMap((rawNode, index) => {
    const record = asRecord(rawNode);
    const target = nodes[index]?.id;
    if (!target) return [];
    const parents = asStringList(record.parents ?? record.parent);
    const related = asStringList(record.related ?? record.relatedTo);
    return [
      ...parents.map((source, parentIndex) => ({
        id: `${source}:hierarchy:${target}:${parentIndex}`,
        source,
        target,
        type: "hierarchy",
        label: "Contains",
      })),
      ...related.map((source, relatedIndex) => ({
        id: `${source}:relevance:${target}:${relatedIndex}`,
        source,
        target,
        type: "relevance",
        label: "Relevant to",
      })),
    ];
  });

  const seen = new Set<string>();
  return [...explicit, ...inferred].filter((edge) => {
    if (!nodes.some((node) => node.id === edge.source) || !nodes.some((node) => node.id === edge.target)) {
      return false;
    }
    const signature = `${edge.source}|${edge.type}|${edge.target}`;
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
};

export const normalizeGraphModule = (moduleValue: unknown): DisplayGraph => {
  const moduleRecord = asRecord(moduleValue);
  const candidates = [
    moduleRecord.graph,
    moduleRecord.knowledgeGraphData,
    moduleRecord.knowledgeGraph,
    moduleRecord.data,
    moduleRecord.default,
    moduleValue,
  ];
  const candidate = candidates.map(asRecord).find((item) => Array.isArray(item.nodes));
  if (!candidate) {
    throw new Error("Possible knowledge data did not expose a graph with a nodes array.");
  }
  const rawNodes = Array.isArray(candidate.nodes) ? candidate.nodes : [];
  const nodes = rawNodes.map(normalizeNode);
  const rawEdges = Array.isArray(candidate.edges) ? candidate.edges : [];
  return { nodes, edges: normalizeEdges(rawEdges, nodes, rawNodes) };
};

export const loadPossibleGraph = async (): Promise<DisplayGraph> => {
  await Promise.resolve();
  return normalizeGraphModule(knowledgeGraphData);
};

const includesText = (value: string, query: string): boolean => value.toLowerCase().includes(query);

export const searchNodes = (graph: DisplayGraph, input: string): SearchHit[] => {
  const query = input.trim().toLowerCase();
  if (!query) return [];

  return graph.nodes
    .map((node): SearchHit | null => {
      const title = node.title.toLowerCase();
      const id = node.id.toLowerCase();
      let score = 0;
      let reason = "Related knowledge";
      if (title === query || id === query) {
        score = 100;
        reason = "Exact match";
      } else if (title.startsWith(query)) {
        score = 82;
        reason = "Title match";
      } else if (title.includes(query) || id.includes(query)) {
        score = 66;
        reason = "Title match";
      } else if (includesText(node.summary, query)) {
        score = 42;
        reason = "Summary match";
      } else if ([...node.tags, ...node.applicability, ...node.capabilities].some((value) => includesText(value, query))) {
        score = 28;
        reason = "Context match";
      }
      return score ? { node, score, reason } : null;
    })
    .filter((hit): hit is SearchHit => Boolean(hit))
    .sort((a, b) => b.score - a.score || a.node.title.localeCompare(b.node.title))
    .slice(0, 12);
};

export const getConnectedEdges = (graph: DisplayGraph, id: string): DisplayEdge[] =>
  graph.edges.filter((edge) => edge.source === id || edge.target === id);

export const getConnectedNodes = (graph: DisplayGraph, id: string): DisplayNode[] => {
  const ids = new Set(
    getConnectedEdges(graph, id).map((edge) => edge.source === id ? edge.target : edge.source),
  );
  return graph.nodes.filter((node) => ids.has(node.id));
};

const isHierarchy = (edge: DisplayEdge): boolean =>
  ["hierarchy", "parent", "contains", "child", "broader", "narrower"].some((word) => edge.type.includes(word));

export const buildPath = (graph: DisplayGraph, selectedId: string): DisplayNode[] => {
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  const path: DisplayNode[] = [];
  const seen = new Set<string>();
  let current = selectedId;

  while (!seen.has(current)) {
    seen.add(current);
    const node = byId.get(current);
    if (!node) break;
    path.unshift(node);
    const parentEdge = graph.edges.find((edge) => edge.target === current && isHierarchy(edge));
    if (!parentEdge) break;
    current = parentEdge.source;
  }
  return path;
};

export const getRootNodes = (graph: DisplayGraph): DisplayNode[] => {
  const children = new Set(
    graph.edges.filter(isHierarchy).map((edge) => edge.target),
  );
  const roots = graph.nodes.filter((node) => !children.has(node.id));
  return roots.length ? roots : graph.nodes.slice(0, 8);
};

const relationRank = (type: string): number => {
  if (type.includes("hierarchy") || type.includes("contain")) return 0;
  if (type.includes("relevance") || type.includes("related")) return 1;
  if (type.includes("compat")) return 2;
  if (type.includes("support") || type.includes("invocation")) return 3;
  if (type.includes("alternative")) return 4;
  return 5;
};

export const buildGraphSlice = (
  graph: DisplayGraph,
  selectedId: string,
  maxNodes = 18,
): { nodes: PositionedNode[]; edges: DisplayEdge[] } => {
  const selected = graph.nodes.find((node) => node.id === selectedId) ?? graph.nodes[0];
  if (!selected) return { nodes: [], edges: [] };
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  const directEdges = getConnectedEdges(graph, selected.id)
    .sort((a, b) => relationRank(a.type) - relationRank(b.type));
  const directIds = [...new Set(
    directEdges.map((edge) => edge.source === selected.id ? edge.target : edge.source),
  )];
  const included = new Set<string>([selected.id, ...directIds.slice(0, 11)]);

  for (const directId of directIds) {
    if (included.size >= maxNodes) break;
    for (const edge of getConnectedEdges(graph, directId)) {
      const id = edge.source === directId ? edge.target : edge.source;
      if (id !== selected.id) included.add(id);
      if (included.size >= maxNodes) break;
    }
  }

  if (included.size < Math.min(maxNodes, 8)) {
    for (const root of getRootNodes(graph)) {
      included.add(root.id);
      if (included.size >= Math.min(maxNodes, 8)) break;
    }
  }

  const directSet = new Set(directIds);
  const depthOne = [...included]
    .filter((id) => directSet.has(id))
    .map((id) => {
      const edge = directEdges.find((item) => item.source === id || item.target === id);
      return { id, relation: edge?.type ?? "related" };
    });
  const depthTwo = [...included].filter((id) => id !== selected.id && !directSet.has(id));

  const positioned: PositionedNode[] = [{ node: selected, x: 500, y: 350, depth: 0 }];
  const oneCount = Math.max(depthOne.length, 1);
  depthOne.forEach(({ id, relation }, index) => {
    const angle = -Math.PI / 2 + (index / oneCount) * Math.PI * 2;
    const xRadius = oneCount <= 5 ? 275 : 315;
    const yRadius = oneCount <= 5 ? 205 : 245;
    const node = byId.get(id);
    if (node) positioned.push({
      node,
      x: 500 + Math.cos(angle) * xRadius,
      y: 350 + Math.sin(angle) * yRadius,
      depth: 1,
      relation,
    });
  });

  const twoCount = Math.max(depthTwo.length, 1);
  depthTwo.forEach((id, index) => {
    const angle = -Math.PI / 2 + ((index + 0.5) / twoCount) * Math.PI * 2;
    const node = byId.get(id);
    if (node) positioned.push({
      node,
      x: 500 + Math.cos(angle) * 440,
      y: 350 + Math.sin(angle) * 305,
      depth: 2,
    });
  });

  const edges = graph.edges.filter((edge) => included.has(edge.source) && included.has(edge.target));
  return { nodes: positioned, edges };
};

export const freshnessLabel = (reviewedAt?: string, now = new Date()): { label: string; state: "fresh" | "aging" | "stale" | "unknown" } => {
  if (!reviewedAt) return { label: "Review date unknown", state: "unknown" };
  const date = new Date(reviewedAt);
  if (Number.isNaN(date.getTime())) return { label: "Review date unknown", state: "unknown" };
  const days = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 86_400_000));
  if (days <= 90) return { label: `Reviewed ${days === 0 ? "today" : `${days}d ago`}`, state: "fresh" };
  if (days <= 180) return { label: `Reviewed ${Math.round(days / 30)}mo ago`, state: "aging" };
  return { label: `Review may be stale · ${Math.round(days / 30)}mo`, state: "stale" };
};

export const findAlternativeNodes = (graph: DisplayGraph, node: DisplayNode): DisplayNode[] => {
  const ids = new Set(node.alternatives);
  for (const edge of graph.edges) {
    if (!edge.type.includes("alternative")) continue;
    if (edge.source === node.id) ids.add(edge.target);
    if (edge.target === node.id) ids.add(edge.source);
  }
  return graph.nodes.filter((candidate) =>
    ids.has(candidate.id) || ids.has(candidate.title),
  );
};
