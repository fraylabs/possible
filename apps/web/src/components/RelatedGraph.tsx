import { BookOpenText } from "lucide-react";
import type { RelatedGraphModel } from "../wiki";

interface RelatedGraphProps {
  graph: RelatedGraphModel;
  onSelectPage: (slug: string) => void;
}

const relationLabel = (relation: RelatedGraphModel["nodes"][number]["relation"]): string => {
  if (relation === "selected") return "selected page";
  if (relation === "mutual") return "linked both ways";
  if (relation === "outgoing") return "linked from current page";
  return "links to current page";
};

export function RelatedGraph({
  graph,
  onSelectPage,
}: RelatedGraphProps) {
  const positions = new Map(graph.nodes.map((node) => [node.page.slug, node]));

  return (
    <section className="graph-shell">
      <header className="graph-header">
        <div>
          <p className="section-kicker">Related-page graph</p>
          <h2 id="graph-title">{graph.selected ? graph.selected.title : "Current page unavailable"}</h2>
          <p className="graph-subtitle">
            {graph.selected
              ? "Direct links and backlinks derived from the same wiki page corpus."
              : "Select a page to focus its direct wiki neighborhood."}
          </p>
        </div>
        <div className="graph-header__meta">
          <span>{graph.relatedPages.length} related</span>
          {graph.hiddenCount > 0 && <span>showing {graph.relatedPages.length - graph.hiddenCount}</span>}
        </div>
      </header>

      <div className="graph-field" role="region" aria-label="Related page graph">
        {graph.selected ? (
          <>
            <svg className="graph-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {graph.edges.map((edge) => {
                const source = positions.get(edge.source);
                const target = positions.get(edge.target);
                if (!source || !target) return null;

                return (
                  <line
                    key={`${edge.source}:${edge.target}:${edge.relation}`}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    className={`graph-edge graph-edge--${edge.relation}`}
                  />
                );
              })}
            </svg>

            <div className="graph-nodes">
              {graph.nodes.map((node) => (
                <button
                  key={node.page.slug}
                  type="button"
                  className={`graph-node graph-node--${node.relation}`}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  onClick={() => onSelectPage(node.page.slug)}
                  aria-current={node.relation === "selected" ? "page" : undefined}
                  aria-label={`${node.page.title}, ${relationLabel(node.relation)}`}
                >
                  <strong>{node.page.title}</strong>
                  {node.relation !== "selected" && <span>{relationLabel(node.relation)}</span>}
                </button>
              ))}
            </div>

            <p className="graph-legend">
              Solid lines come from the current page. Dashed lines are backlinks from neighboring pages.
            </p>
          </>
        ) : (
          <div className="graph-empty">
            <BookOpenText size={24} />
            <strong>This page is not in the current build.</strong>
            <p>Choose a page from search to restore the article and graph.</p>
          </div>
        )}
      </div>
    </section>
  );
}
