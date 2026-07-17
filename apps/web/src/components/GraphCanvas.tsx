import { useMemo } from "react";
import { ArrowUpLeft, CircleDot, LocateFixed } from "lucide-react";
import {
  buildGraphSlice,
  type DisplayGraph,
  type DisplayNode,
  type PositionedNode,
} from "../graph";

interface GraphCanvasProps {
  graph: DisplayGraph;
  selectedId: string;
  isNavigating: boolean;
  onSelect: (id: string) => void;
  onReset: () => void;
  onBack: () => void;
  canGoBack: boolean;
}

const splitLabel = (label: string): [string, string?] => {
  if (label.length <= 22) return [label];
  const words = label.split(/\s+/);
  let first = "";
  let second = "";
  for (const word of words) {
    if (`${first} ${word}`.trim().length <= 22 && !second) first = `${first} ${word}`.trim();
    else second = `${second} ${word}`.trim();
  }
  if (!second) return [first || label.slice(0, 22)];
  return [first || label.slice(0, 22), `${second.slice(0, 23)}${second.length > 23 ? "…" : ""}`];
};

const edgePath = (source: PositionedNode, target: PositionedNode): string => {
  const midpointX = (source.x + target.x) / 2;
  const bend = Math.min(48, Math.abs(source.y - target.y) * 0.12 + 16);
  const controlY = (source.y + target.y) / 2 - (source.x < target.x ? bend : -bend);
  return `M ${source.x} ${source.y} Q ${midpointX} ${controlY} ${target.x} ${target.y}`;
};

const shortKind = (kind: string): string => {
  const normalized = kind.toLowerCase();
  if (normalized === "provider") return "Provider";
  if (normalized === "practice") return "Practice";
  if (normalized === "action") return "Action";
  if (normalized === "tool") return "Tool";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export function GraphCanvas({
  graph,
  selectedId,
  isNavigating,
  onSelect,
  onReset,
  onBack,
  canGoBack,
}: GraphCanvasProps) {
  const slice = useMemo(() => buildGraphSlice(graph, selectedId), [graph, selectedId]);
  const positions = useMemo(
    () => new Map(slice.nodes.map((positioned) => [positioned.node.id, positioned])),
    [slice.nodes],
  );

  const handleNodeKeyDown = (event: React.KeyboardEvent<SVGGElement>, node: DisplayNode) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(node.id);
      return;
    }
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const ordered = [...slice.nodes]
      .sort((a, b) => a.y - b.y || a.x - b.x)
      .map((item) => item.node.id);
    const currentIndex = ordered.indexOf(node.id);
    const delta = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
    const nextId = ordered[(currentIndex + delta + ordered.length) % ordered.length];
    if (nextId) onSelect(nextId);
  };

  return (
    <section
      className={`graph-stage${isNavigating ? " is-navigating" : ""}`}
      aria-label="Operational knowledge graph"
    >
      <div className="graph-stage__topline">
        <div className="graph-stage__context">
          <span className="eyebrow">Knowledge atlas</span>
          <strong>{slice.nodes.length} nearby nodes</strong>
        </div>
        <div className="graph-controls" aria-label="Graph controls">
          <button type="button" className="icon-button" onClick={onBack} disabled={!canGoBack}>
            <ArrowUpLeft aria-hidden="true" size={16} />
            <span>Back</span>
          </button>
          <button type="button" className="icon-button" onClick={onReset}>
            <LocateFixed aria-hidden="true" size={16} />
            <span>Overview</span>
          </button>
        </div>
      </div>

      <div className="constellation" role="application" aria-label="Use arrow keys to move between visible nodes">
        <svg
          className="constellation__svg"
          viewBox="0 0 1000 700"
          preserveAspectRatio="xMidYMid meet"
          aria-labelledby="graph-title graph-description"
        >
          <title id="graph-title">Possible operational knowledge</title>
          <desc id="graph-description">
            A focused graph of contributor-maintained topics, practices, tools, providers, and safe actions.
          </desc>
          <defs>
            <filter id="selected-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker id="edge-arrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
              <path d="M 0 0 L 7 3.5 L 0 7 z" className="edge-arrow" />
            </marker>
            <radialGradient id="focus-wash">
              <stop offset="0%" stopColor="rgba(119, 226, 190, .08)" />
              <stop offset="70%" stopColor="rgba(119, 226, 190, .015)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
            </radialGradient>
          </defs>

          <circle cx="500" cy="350" r="260" fill="url(#focus-wash)" className="focus-wash" />

          <g className="graph-edges" aria-hidden="true">
            {slice.edges.map((edge) => {
              const source = positions.get(edge.source);
              const target = positions.get(edge.target);
              if (!source || !target) return null;
              const isPrimary = edge.source === selectedId || edge.target === selectedId;
              const midX = (source.x + target.x) / 2;
              const midY = (source.y + target.y) / 2;
              return (
                <g key={edge.id} className={isPrimary ? "edge edge--primary" : "edge"} data-relation={edge.type}>
                  <path d={edgePath(source, target)} markerEnd={isPrimary ? "url(#edge-arrow)" : undefined} />
                  {isPrimary && (
                    <text x={midX} y={midY - 7} textAnchor="middle">
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          <g className="graph-nodes">
            {slice.nodes.map((positioned, index) => {
              const { node, x, y, depth } = positioned;
              const selected = node.id === selectedId;
              const [lineOne, lineTwo] = splitLabel(node.title);
              const width = selected ? 200 : depth === 1 ? 172 : 148;
              const height = selected ? 78 : lineTwo ? 64 : 56;
              return (
                <g
                  key={node.id}
                  className={`graph-node graph-node--${depth}${selected ? " is-selected" : ""}`}
                  data-kind={node.type}
                  data-node-id={node.id}
                  role="button"
                  aria-label={`${node.title}, ${shortKind(node.type)}${selected ? ", selected" : ""}`}
                  aria-pressed={selected}
                  tabIndex={depth === 2 ? -1 : 0}
                  onClick={() => onSelect(node.id)}
                  onKeyDown={(event) => handleNodeKeyDown(event, node)}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    animationDelay: `${Math.min(index * 28, 260)}ms`,
                  }}
                >
                  {selected && <circle r="70" className="graph-node__orbit" />}
                  <rect
                    x={-width / 2}
                    y={-height / 2}
                    rx={selected ? 15 : 12}
                    width={width}
                    height={height}
                    className="graph-node__surface"
                    filter={selected ? "url(#selected-glow)" : undefined}
                  />
                  <circle cx={-width / 2 + 15} cy={-height / 2 + 14} r="3.5" className="graph-node__signal" />
                  <text y={lineTwo ? -5 : 3} textAnchor="middle" className="graph-node__label">
                    <tspan x="0">{lineOne}</tspan>
                    {lineTwo && <tspan x="0" dy="17">{lineTwo}</tspan>}
                  </text>
                  <text y={height / 2 - 10} textAnchor="middle" className="graph-node__kind">
                    {shortKind(node.type)}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        <div className="constellation__hint" aria-hidden="true">
          <CircleDot size={13} />
          <span>Select a node to refocus the map</span>
        </div>
      </div>

      <div className="graph-legend" aria-label="Node type legend">
        {["topic", "practice", "tool", "provider", "action"].map((kind) => (
          <span key={kind} data-kind={kind}>
            <i /> {shortKind(kind)}
          </span>
        ))}
      </div>
    </section>
  );
}
