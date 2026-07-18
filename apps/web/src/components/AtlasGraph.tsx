import { useMemo } from "react";
import type { WikiCorpus } from "@possible/knowledge";
import { buildAtlasGraph, colorForSection, type AtlasBranch } from "../atlas";
import {
  KnowledgeGraph,
  type GraphViewport,
  type KnowledgeGraphCluster,
  type KnowledgeGraphNode,
} from "./KnowledgeGraph";

interface AtlasGraphProps {
  corpus: WikiCorpus;
  branches: AtlasBranch[];
  selectedSlug: string | undefined;
  viewport: GraphViewport;
  onViewportChange: (viewport: GraphViewport) => void;
  onSelectPage: (slug: string) => void;
}

export function AtlasGraph({
  corpus,
  branches,
  selectedSlug,
  viewport,
  onViewportChange,
  onSelectPage,
}: AtlasGraphProps) {
  const graph = useMemo(() => buildAtlasGraph(corpus), [corpus]);
  const pageCountBySection = new Map(branches.map((branch) => [branch.section, branch.pageCount]));
  const sectionTitleBySection = new Map(branches.map((branch) => [branch.section, branch.page.title]));
  const nodes: KnowledgeGraphNode[] = graph.nodes.map((node) => {
    const pageCount = pageCountBySection.get(node.section) ?? 1;
    return {
      id: node.page.slug,
      title: node.page.title,
      meta: node.role === "field" ? `${pageCount} pages` : "",
      x: node.x,
      y: node.y,
      role: node.role,
      color: colorForSection(node.section),
      degree: node.degree,
      prominent: node.role === "field" || node.degree >= 4,
      interactive: true,
      ariaLabel: node.role === "field"
        ? `${node.page.title}, ${pageCount} pages`
        : `${node.page.title}, ${sectionTitleBySection.get(node.section) ?? node.section} page`,
    };
  });
  const clusters: KnowledgeGraphCluster[] = branches.flatMap((branch) => {
    const branchNodes = graph.nodes.filter((node) => node.section === branch.section);
    if (branchNodes.length === 0) return [];
    const xs = branchNodes.map((node) => node.x);
    const ys = branchNodes.map((node) => node.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return [{
      id: branch.section,
      label: branch.page.title,
      color: colorForSection(branch.section),
      count: branch.pageCount,
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
      width: Math.min(58, Math.max(27, maxX - minX + 17)),
      height: Math.min(70, Math.max(36, maxY - minY + 19)),
    }];
  });

  return (
    <section className="graph-shell graph-shell--atlas" aria-labelledby="atlas-graph-title">
      <h2 id="atlas-graph-title" className="visually-hidden">Knowledge fields</h2>
      {nodes.length > 0 ? (
        <KnowledgeGraph
          nodes={nodes}
          edges={graph.edges}
          variant="atlas"
          ariaLabel="Possible knowledge atlas"
          guide="Global knowledge graph"
          clusters={clusters}
          selectedId={selectedSlug}
          viewport={viewport}
          onViewportChange={onViewportChange}
          legend={branches.map((branch) => ({
            label: branch.page.title,
            color: colorForSection(branch.section),
          }))}
          onSelectNode={onSelectPage}
        />
      ) : (
        <div className="graph-empty">
          <strong>No top-level fields are available.</strong>
          <p>Add a root page matching its knowledge folder to publish a field.</p>
        </div>
      )}
    </section>
  );
}
