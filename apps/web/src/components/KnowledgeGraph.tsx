import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent,
} from "react";
import { LocateFixed, Minus, Plus } from "lucide-react";
import { ThreeGraphScene, type ThreeGraphEdge, type ThreeGraphNodeRole } from "./ThreeGraphScene";

export interface KnowledgeGraphNode {
  id: string;
  title: string;
  meta: string;
  x: number;
  y: number;
  role: ThreeGraphNodeRole;
  color: string;
  degree: number;
  prominent: boolean;
  interactive: boolean;
  ariaLabel: string;
}

export interface KnowledgeGraphEdge {
  source: string;
  target: string;
}

export interface KnowledgeGraphLegendItem {
  label: string;
  color: string;
}

interface KnowledgeGraphProps {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  variant: "atlas" | "related";
  ariaLabel: string;
  guide: string;
  legend?: KnowledgeGraphLegendItem[];
  onSelectNode: (id: string) => void;
}

interface Viewport {
  x: number;
  y: number;
  scale: number;
}

interface PanGesture {
  pointerId: number;
  startX: number;
  startY: number;
  viewportX: number;
  viewportY: number;
}

const MIN_SCALE = 0.72;
const MAX_SCALE = 2.35;
const clampScale = (scale: number): number => Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));

export function KnowledgeGraph({
  nodes,
  edges,
  variant,
  ariaLabel,
  guide,
  legend = [],
  onSelectNode,
}: KnowledgeGraphProps) {
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, scale: 1 });
  const [hoveredId, setHoveredId] = useState<string | undefined>();
  const [isPanning, setIsPanning] = useState(false);
  const panGesture = useRef<PanGesture | undefined>(undefined);
  const graphKey = `${variant}:${nodes.map((node) => node.id).join("|")}`;

  useEffect(() => {
    setViewport({ x: 0, y: 0, scale: 1 });
    setHoveredId(undefined);
  }, [graphKey]);

  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const activeIds = useMemo(() => {
    if (!hoveredId) return undefined;
    const ids = new Set([hoveredId]);
    edges.forEach((edge) => {
      if (edge.source === hoveredId) ids.add(edge.target);
      if (edge.target === hoveredId) ids.add(edge.source);
    });
    return ids;
  }, [edges, hoveredId]);

  const zoomBy = (factor: number) => {
    setViewport((current) => ({ ...current, scale: clampScale(current.scale * factor) }));
  };
  const resetViewport = () => setViewport({ x: 0, y: 0, scale: 1 });
  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    zoomBy(event.deltaY > 0 ? 0.88 : 1.12);
  };
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || (event.target as Element).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    panGesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      viewportX: viewport.x,
      viewportY: viewport.y,
    };
    setIsPanning(true);
  };
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = panGesture.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    setViewport((current) => ({
      ...current,
      x: gesture.viewportX + event.clientX - gesture.startX,
      y: gesture.viewportY + event.clientY - gesture.startY,
    }));
  };
  const endPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (panGesture.current?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    panGesture.current = undefined;
    setIsPanning(false);
  };

  const worldStyle = {
    transform: `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.scale})`,
  } as CSSProperties;

  return (
    <div
      className={`graph-field graph-field--interactive${isPanning ? " is-panning" : ""}`}
      role="region"
      aria-label={ariaLabel}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPan}
      onPointerCancel={endPan}
    >
      <div className="graph-toolbar" aria-label="Graph controls">
        <button type="button" onClick={() => zoomBy(1.18)} aria-label="Zoom in graph">
          <Plus size={15} aria-hidden="true" />
        </button>
        <button type="button" onClick={() => zoomBy(0.84)} aria-label="Zoom out graph">
          <Minus size={15} aria-hidden="true" />
        </button>
        <button type="button" onClick={resetViewport} aria-label="Reset graph view">
          <LocateFixed size={15} aria-hidden="true" />
        </button>
      </div>

      <p className="graph-guide"><span>{guide}</span><strong>{nodes.length} nodes · {edges.length} links</strong></p>

      <div
        className={`graph-world${activeIds ? " graph-world--focused" : ""}`}
        style={worldStyle}
        data-zoomed-out={viewport.scale < 0.9 ? "true" : "false"}
      >
        <ThreeGraphScene
          nodes={nodes.map((node) => ({
            id: node.id,
            x: node.x,
            y: node.y,
            role: node.role,
            color: node.color,
          }))}
          edges={edges}
          variant={variant}
        />

        <svg className="graph-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {edges.map((edge) => {
            const source = nodeById.get(edge.source);
            const target = nodeById.get(edge.target);
            if (!source || !target) return null;
            const isActive = hoveredId === edge.source || hoveredId === edge.target;
            return (
              <line
                key={`${edge.source}:${edge.target}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                className={`graph-edge${isActive ? " is-active" : ""}`}
                data-muted={activeIds && !isActive ? "true" : "false"}
              />
            );
          })}
        </svg>

        <div className="graph-nodes">
          {nodes.map((node) => {
            const isMuted = Boolean(activeIds && !activeIds.has(node.id));
            const className = [
              "knowledge-node",
              `knowledge-node--${node.role}`,
              node.prominent ? "is-prominent" : "",
              hoveredId === node.id ? "is-hovered" : "",
            ].filter(Boolean).join(" ");
            const style = {
              left: `${node.x}%`,
              top: `${node.y}%`,
              "--node-color": node.color,
            } as CSSProperties;
            const contents = (
              <>
                <span className="knowledge-node__dot" aria-hidden="true" />
                <span className="knowledge-node__label">
                  <strong>{node.title}</strong>
                  {node.meta && <small>{node.meta}</small>}
                </span>
              </>
            );

            return node.interactive ? (
              <button
                key={node.id}
                type="button"
                className={className}
                style={style}
                data-muted={isMuted ? "true" : "false"}
                aria-label={node.ariaLabel}
                onClick={() => onSelectNode(node.id)}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(undefined)}
                onFocus={() => setHoveredId(node.id)}
                onBlur={() => setHoveredId(undefined)}
              >
                {contents}
              </button>
            ) : (
              <div
                key={node.id}
                className={className}
                style={style}
                data-muted={isMuted ? "true" : "false"}
                role="img"
                aria-label={node.ariaLabel}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(undefined)}
              >
                {contents}
              </div>
            );
          })}
        </div>
      </div>

      {legend.length > 0 && (
        <ul className="graph-legend" aria-label="Knowledge fields">
          {legend.map((item) => (
            <li key={item.label}>
              <span style={{ "--legend-color": item.color } as CSSProperties} aria-hidden="true" />
              {item.label}
            </li>
          ))}
        </ul>
      )}
      <p className="graph-hint">Drag to pan · Scroll to zoom · Hover to trace</p>
      <span className="visually-hidden" aria-live="polite">Graph zoom {Math.round(viewport.scale * 100)}%</span>
    </div>
  );
}
