import type { RelatedGraphModel } from "../wiki";

interface RelatedGraphProps {
  graph: RelatedGraphModel;
  onSelectPage: (slug: string) => void;
}

export function RelatedGraph({
  graph,
  onSelectPage,
}: RelatedGraphProps) {
  const positions = new Map(graph.nodes.map((node) => [node.page.slug, node]));

  return (
    <section className="graph-shell" aria-labelledby="graph-title">
      <h2 id="graph-title" className="visually-hidden">Related pages</h2>
      <p className="graph-guide">Choose a nearby page</p>
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
                    className="graph-edge"
                  />
                );
              })}
            </svg>

            <div className="graph-nodes">
              {graph.nodes.map((node) => node.relation === "selected" ? (
                <div
                  key={node.page.slug}
                  className="graph-node graph-node--selected"
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  role="img"
                  aria-label={`${node.page.title}, current page`}
                >
                  <strong>{node.page.title}</strong>
                </div>
              ) : (
                <button
                  key={node.page.slug}
                  type="button"
                  className="graph-node graph-node--related"
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  onClick={() => onSelectPage(node.page.slug)}
                  aria-label={`${node.page.title}, related page`}
                >
                  <strong>{node.page.title}</strong>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="graph-empty">
            <strong>This page is not in the current build.</strong>
            <p>Search for a page to restore its map.</p>
          </div>
        )}
      </div>
    </section>
  );
}
