import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";

export interface ForceLayoutNode {
  id: string;
  group: string;
  anchor: boolean;
}

export interface ForceLayoutEdge {
  source: string;
  target: string;
}

export interface ForceLayoutPosition {
  x: number;
  y: number;
}

interface SimulationNode extends ForceLayoutNode, SimulationNodeDatum {
  x: number;
  y: number;
  anchorX: number;
  anchorY: number;
}

interface SimulationLink extends SimulationLinkDatum<SimulationNode> {
  source: string | SimulationNode;
  target: string | SimulationNode;
}

const hashString = (value: string): number => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const fractionFromHash = (value: string): number => hashString(value) / 4294967295;

const groupCenters = (groups: string[]): Map<string, ForceLayoutPosition> => {
  const centers = new Map<string, ForceLayoutPosition>();
  groups.forEach((group, index) => {
    if (groups.length === 1) {
      centers.set(group, { x: 50, y: 50 });
      return;
    }

    const angle = Math.PI + (index * Math.PI * 2) / groups.length;
    centers.set(group, {
      x: 50 + Math.cos(angle) * 25,
      y: 50 + Math.sin(angle) * 20,
    });
  });
  return centers;
};

const positionFor = (node: ForceLayoutNode, center: ForceLayoutPosition): ForceLayoutPosition => {
  if (node.anchor) return center;
  const angle = fractionFromHash(`${node.id}:angle`) * Math.PI * 2;
  const radius = 12 + fractionFromHash(`${node.id}:radius`) * 15;
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
  };
};

/**
 * Produces a deterministic Obsidian-style force layout. The simulation is
 * settled off-screen, then the browser only renders the resulting positions.
 * Group forces preserve top-level fields while charge and collision forces
 * keep dense knowledge clusters readable.
 */
export function buildForceLayout(
  nodes: ForceLayoutNode[],
  edges: ForceLayoutEdge[],
): ReadonlyMap<string, ForceLayoutPosition> {
  if (nodes.length === 0) return new Map();

  const groups = [...new Set(nodes.map((node) => node.group))].sort();
  const centers = groupCenters(groups);
  const simulationNodes: SimulationNode[] = nodes.map((node) => {
    const center = centers.get(node.group) ?? { x: 50, y: 50 };
    const position = positionFor(node, center);
    return { ...node, ...position, anchorX: center.x, anchorY: center.y };
  });
  const nodeById = new Map(simulationNodes.map((node) => [node.id, node]));
  const simulationLinks: SimulationLink[] = edges.flatMap((edge) => {
    if (!nodeById.has(edge.source) || !nodeById.has(edge.target)) return [];
    return [{ source: edge.source, target: edge.target }];
  });

  const simulation = forceSimulation<SimulationNode>(simulationNodes)
    .randomSource(() => 0.5)
    .velocityDecay(0.42)
    .force(
      "link",
      forceLink<SimulationNode, SimulationLink>(simulationLinks)
        .id((node) => node.id)
        .distance((link) => {
          const source = typeof link.source === "string" ? nodeById.get(link.source) : link.source;
          const target = typeof link.target === "string" ? nodeById.get(link.target) : link.target;
          return source?.group === target?.group ? 13 : 28;
        })
        .strength(0.36),
    )
    .force("charge", forceManyBody<SimulationNode>().strength(-72).distanceMax(72))
    .force("collide", forceCollide<SimulationNode>().radius(2.7).strength(0.9).iterations(2))
    .force("x", forceX<SimulationNode>((node) => node.anchorX).strength((node) => node.anchor ? 0.34 : 0.035))
    .force("y", forceY<SimulationNode>((node) => node.anchorY).strength((node) => node.anchor ? 0.34 : 0.035))
    .stop();

  simulationNodes.forEach((node) => {
    if (!node.anchor) return;
    node.fx = node.anchorX;
    node.fy = node.anchorY;
  });
  simulation.tick(360);

  return new Map(simulationNodes.map((node) => [
    node.id,
    {
      x: Math.min(94, Math.max(6, node.x)),
      y: Math.min(92, Math.max(8, node.y)),
    },
  ]));
}
