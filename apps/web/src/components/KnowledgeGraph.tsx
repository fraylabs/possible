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
import { MarkdownRenderer } from "../markdown";
export type GraphNodeRole = "field" | "page" | "selected" | "related";

export interface KnowledgeGraphNode {
  id: string;
  title: string;
  meta: string;
  x: number;
  y: number;
  role: GraphNodeRole;
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

export interface KnowledgeGraphCluster {
  id: string;
  label: string;
  color: string;
  count: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface KnowledgeGraphConnection {
  id: string;
  title: string;
}

export interface KnowledgeGraphConnections {
  related: KnowledgeGraphConnection[];
}

export interface KnowledgeGraphExpandedPage {
  title: string;
  summary: string;
  body: string;
}

export interface GraphViewport {
  x: number;
  y: number;
  scale: number;
}

export type GraphZoomBand = "universe" | "field" | "detail";

export const DEFAULT_GRAPH_VIEWPORT: Readonly<GraphViewport> = Object.freeze({
  x: 0,
  y: 0,
  scale: 1,
});

interface KnowledgeGraphProps {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  variant: "atlas" | "related";
  ariaLabel: string;
  guide: string;
  legend?: KnowledgeGraphLegendItem[];
  clusters?: KnowledgeGraphCluster[];
  connections?: KnowledgeGraphConnections | undefined;
  expandedPage?: KnowledgeGraphExpandedPage | undefined;
  selectedId?: string | undefined;
  viewport?: GraphViewport | undefined;
  onViewportChange?: ((viewport: GraphViewport) => void) | undefined;
  onSelectNode: (id: string) => void;
}

interface PanGesture {
  pointerId: number;
  startX: number;
  startY: number;
  viewportX: number;
  viewportY: number;
}

const MIN_SCALE = 0.42;
const MAX_SCALE = 2.8;
const FOCUS_SCALE = 1.5;
const clampScale = (scale: number): number => Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));

export function graphZoomBand(scale: number): GraphZoomBand {
  if (scale < 0.72) return "universe";
  if (scale < 1.34) return "field";
  return "detail";
}

const zoomBandLabel = (band: GraphZoomBand): string => {
  if (band === "universe") return "Universe view";
  if (band === "detail") return "Page detail";
  return "Field view";
};

export function KnowledgeGraph({
  nodes,
  edges,
  variant,
  ariaLabel,
  guide,
  legend = [],
  clusters = [],
  connections,
  expandedPage,
  selectedId,
  viewport: controlledViewport,
  onViewportChange,
  onSelectNode,
}: KnowledgeGraphProps) {
  const [internalViewport, setInternalViewport] = useState<GraphViewport>({ ...DEFAULT_GRAPH_VIEWPORT });
  const [hoveredId, setHoveredId] = useState<string | undefined>();
  const [isPanning, setIsPanning] = useState(false);
  const [isConnectionsExpanded, setIsConnectionsExpanded] = useState(false);
  const panGesture = useRef<PanGesture | undefined>(undefined);
  const worldRef = useRef<HTMLDivElement>(null);
  const viewport = controlledViewport ?? internalViewport;
  const zoomBand = graphZoomBand(viewport.scale);
  const graphKey = `${variant}:${nodes.map((node) => node.id).join("|")}`;
  const isControlled = controlledViewport !== undefined;

  useEffect(() => {
    if (!isControlled) setInternalViewport({ ...DEFAULT_GRAPH_VIEWPORT });
    setHoveredId(undefined);
    setIsConnectionsExpanded(false);
  }, [graphKey, isControlled]);

  useEffect(() => {
    setIsConnectionsExpanded(false);
  }, [selectedId]);

  const commitViewport = (nextViewport: GraphViewport) => {
    if (onViewportChange) onViewportChange(nextViewport);
    if (!isControlled) setInternalViewport(nextViewport);
  };
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const focusKind = hoveredId ? "hover" : selectedId ? "selected" : "none";
  const activeIds = useMemo(() => {
    if (!hoveredId && !selectedId) return undefined;
    const focusIds = [selectedId, hoveredId].filter((id): id is string => Boolean(id));
    const ids = new Set(focusIds);
    edges.forEach((edge) => {
      focusIds.forEach((id) => {
        if (edge.source === id) ids.add(edge.target);
        if (edge.target === id) ids.add(edge.source);
      });
    });
    return ids;
  }, [edges, hoveredId, selectedId]);

  const zoomBy = (factor: number, anchorX = 0, anchorY = 0) => {
    const scale = clampScale(viewport.scale * factor);
    const ratio = scale / viewport.scale;
    commitViewport({
      x: anchorX - (anchorX - viewport.x) * ratio,
      y: anchorY - (anchorY - viewport.y) * ratio,
      scale,
    });
  };
  const resetViewport = () => commitViewport({ ...DEFAULT_GRAPH_VIEWPORT });
  const focusNode = (node: KnowledgeGraphNode) => {
    const world = worldRef.current;
    if (!world) {
      onSelectNode(node.id);
      return;
    }

    const scale = clampScale(Math.max(viewport.scale, FOCUS_SCALE));
    const nodeX = (node.x / 100) * world.clientWidth;
    const nodeY = (node.y / 100) * world.clientHeight;
    commitViewport({
      x: -(nodeX - world.clientWidth / 2) * scale,
      y: -(nodeY - world.clientHeight / 2) * scale,
      scale,
    });
    onSelectNode(node.id);
  };
  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    zoomBy(
      event.deltaY > 0 ? 0.86 : 1.16,
      event.clientX - bounds.left - bounds.width / 2,
      event.clientY - bounds.top - bounds.height / 2,
    );
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
    commitViewport({
      ...viewport,
      x: gesture.viewportX + event.clientX - gesture.startX,
      y: gesture.viewportY + event.clientY - gesture.startY,
    });
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
      data-zoom-band={zoomBand}
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
        <button type="button" onClick={() => zoomBy(0.82)} aria-label="Zoom out graph">
          <Minus size={15} aria-hidden="true" />
        </button>
        <button type="button" onClick={resetViewport} aria-label="Fit entire graph">
          <LocateFixed size={15} aria-hidden="true" />
        </button>
      </div>

      <p className="graph-guide">
        <span>{guide}</span>
        <strong>{zoomBandLabel(zoomBand)} · {nodes.length} nodes · {edges.length} links</strong>
      </p>

      <div
        className={`graph-world${activeIds ? " graph-world--focused" : ""}`}
        style={worldStyle}
        ref={worldRef}
        data-zoom-band={zoomBand}
        data-focus-kind={focusKind}
      >
        {clusters.length > 0 && (
          <div className="graph-clouds" aria-hidden="true">
            {clusters.map((cluster) => (
              <div
                key={cluster.id}
                className="graph-cloud"
                style={{
                  left: `${cluster.x}%`,
                  top: `${cluster.y}%`,
                  width: `${cluster.width}%`,
                  height: `${cluster.height}%`,
                  "--cloud-color": cluster.color,
                } as CSSProperties}
              >
                <span>{cluster.label}</span>
                <small>{cluster.count} pages</small>
              </div>
            ))}
          </div>
        )}

        <svg
          className="graph-lines"
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {edges.map((edge) => {
            const source = nodeById.get(edge.source);
            const target = nodeById.get(edge.target);
            if (!source || !target) return null;
            const isActive = selectedId === edge.source || selectedId === edge.target
              || hoveredId === edge.source || hoveredId === edge.target;
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
            const isSelected = selectedId === node.id;
            const className = [
              "knowledge-node",
              `knowledge-node--${node.role}`,
              node.prominent ? "is-prominent" : "",
              isSelected ? "is-selected" : "",
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
                aria-pressed={isSelected}
                aria-current={isSelected ? "page" : undefined}
                onClick={() => focusNode(node)}
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
      {selectedId && connections && (
        <aside className={`graph-connections${isConnectionsExpanded ? " is-expanded" : ""}`} aria-label="Related nodes">
          <div className="graph-connections__header">
            <p className="graph-connections__title">Related nodes</p>
            {expandedPage && (
              <button
                type="button"
                className="graph-connections__toggle"
                onClick={() => setIsConnectionsExpanded((expanded) => !expanded)}
                aria-label={isConnectionsExpanded ? "Collapse page card" : "Expand page card"}
                aria-expanded={isConnectionsExpanded}
              >
                {isConnectionsExpanded ? "<" : ">"}
              </button>
            )}
          </div>
          {isConnectionsExpanded && expandedPage && (
            <div className="graph-connections__page">
              <h3>{expandedPage.title}</h3>
              <p className="graph-connections__summary">{expandedPage.summary}</p>
              <MarkdownRenderer markdown={expandedPage.body} onSelectPage={onSelectNode} />
            </div>
          )}
          {!isConnectionsExpanded && (
            connections.related.length > 0 ? (
              <ul className="graph-connections__related">
                {connections.related.map((connection) => (
                  <li key={connection.id}>
                    <button type="button" onClick={() => onSelectNode(connection.id)}>
                      {connection.title}
                    </button>
                  </li>
                ))}
              </ul>
            ) : <p className="graph-connections__empty">No authored connections yet.</p>
          )}
        </aside>
      )}
      <p className="graph-hint">
        {selectedId ? "Use > to expand the page card · Esc clears focus" : "Click a node to focus it · Scroll to explore"}
      </p>
      <span className="visually-hidden" aria-live="polite">
        Graph zoom {Math.round(viewport.scale * 100)}%, {zoomBandLabel(zoomBand)}
      </span>
    </div>
  );
}
