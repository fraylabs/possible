import { colorForSection, sectionForSlug } from "../atlas";
import type { RelatedGraphModel } from "../wiki";
import { KnowledgeGraph, type KnowledgeGraphNode } from "./KnowledgeGraph";

interface RelatedGraphProps {
  graph: RelatedGraphModel;
  onSelectPage: (slug: string) => void;
}

const relationLabel = (relation: string): string => {
  if (relation === "selected") return "Current page";
  if (relation === "mutual") return "Linked both ways";
  if (relation === "outgoing") return "Linked page";
  return "Backlink";
};

export function RelatedGraph({ graph, onSelectPage }: RelatedGraphProps) {
  const degreeBySlug = new Map<string, number>();
  graph.edges.forEach((edge) => {
    degreeBySlug.set(edge.source, (degreeBySlug.get(edge.source) ?? 0) + 1);
    degreeBySlug.set(edge.target, (degreeBySlug.get(edge.target) ?? 0) + 1);
  });
  const nodes: KnowledgeGraphNode[] = graph.nodes.map((node) => ({
    id: node.page.slug,
    title: node.page.title,
    meta: relationLabel(node.relation),
    x: node.x,
    y: node.y,
    role: node.relation === "selected" ? "selected" : "related",
    color: node.relation === "selected"
      ? "#f1f3ff"
      : colorForSection(sectionForSlug(node.page.slug)),
    degree: degreeBySlug.get(node.page.slug) ?? 0,
    prominent: true,
    interactive: node.relation !== "selected",
    ariaLabel: node.relation === "selected"
      ? `${node.page.title}, current page`
      : `${node.page.title}, related page`,
  }));

  return (
    <section className="graph-shell" aria-labelledby="graph-title">
      <h2 id="graph-title" className="visually-hidden">Related pages</h2>
      {graph.selected ? (
        <KnowledgeGraph
          nodes={nodes}
          edges={graph.edges}
          variant="related"
          ariaLabel="Related page graph"
          guide={graph.hiddenCount > 0 ? `Local graph · ${graph.hiddenCount} more nearby` : "Local knowledge graph"}
          onSelectNode={onSelectPage}
        />
      ) : (
        <div className="graph-empty">
          <strong>This page is not in the current build.</strong>
          <p>Search for a page to restore its map.</p>
        </div>
      )}
    </section>
  );
}
