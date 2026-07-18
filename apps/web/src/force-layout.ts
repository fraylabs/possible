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

interface SimulationNode extends ForceLayoutNode, ForceLayoutPosition {
  vx: number;
  vy: number;
  anchorX: number;
  anchorY: number;
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

/**
 * Produces a deterministic, force-settled layout without making the wiki's
 * presentation dependent on a runtime graph library. Group anchors create
 * fields; authored wiki links provide the springs between individual pages.
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
    const angle = fractionFromHash(`${node.id}:angle`) * Math.PI * 2;
    const radius = node.anchor ? 0 : 7 + fractionFromHash(`${node.id}:radius`) * 12;
    return {
      ...node,
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
      vx: 0,
      vy: 0,
      anchorX: center.x,
      anchorY: center.y,
    };
  });
  const nodeById = new Map(simulationNodes.map((node) => [node.id, node]));
  const edgePairs = edges.flatMap((edge) => {
    const source = nodeById.get(edge.source);
    const target = nodeById.get(edge.target);
    return source && target ? [{ source, target }] : [];
  });

  for (let tick = 0; tick < 240; tick += 1) {
    const alpha = 1 - tick / 240;

    for (let leftIndex = 0; leftIndex < simulationNodes.length; leftIndex += 1) {
      const left = simulationNodes[leftIndex];
      if (!left) continue;
      for (let rightIndex = leftIndex + 1; rightIndex < simulationNodes.length; rightIndex += 1) {
        const right = simulationNodes[rightIndex];
        if (!right) continue;
        let dx = right.x - left.x;
        let dy = right.y - left.y;
        if (Math.abs(dx) + Math.abs(dy) < 0.01) {
          dx = 0.1;
          dy = 0.05;
        }
        const distanceSquared = Math.max(0.7, dx * dx + dy * dy);
        const distance = Math.sqrt(distanceSquared);
        const force = (left.group === right.group ? 2.3 : 1.25) * alpha / distanceSquared;
        const forceX = (dx / distance) * force;
        const forceY = (dy / distance) * force;
        left.vx -= forceX;
        left.vy -= forceY;
        right.vx += forceX;
        right.vy += forceY;
      }
    }

    edgePairs.forEach(({ source, target }) => {
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.max(0.1, Math.sqrt(dx * dx + dy * dy));
      const idealDistance = source.group === target.group ? 8.5 : 18;
      const force = (distance - idealDistance) * 0.018 * alpha;
      const forceX = (dx / distance) * force;
      const forceY = (dy / distance) * force;
      source.vx += forceX;
      source.vy += forceY;
      target.vx -= forceX;
      target.vy -= forceY;
    });

    simulationNodes.forEach((node) => {
      const anchorStrength = node.anchor ? 0.12 : 0.006;
      node.vx += (node.anchorX - node.x) * anchorStrength * alpha;
      node.vy += (node.anchorY - node.y) * anchorStrength * alpha;
      node.vx *= 0.82;
      node.vy *= 0.82;
      node.x = Math.min(94, Math.max(6, node.x + node.vx));
      node.y = Math.min(92, Math.max(8, node.y + node.vy));
    });
  }

  return new Map(simulationNodes.map((node) => [node.id, { x: node.x, y: node.y }]));
}
