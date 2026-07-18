import { useMemo } from "react";
import type { WikiCorpus } from "@possible/knowledge";
import { buildAtlasGraph, colorForSection, type AtlasBranch } from "../atlas";
import {
  KnowledgeGraph,
  type GraphViewport,
  type KnowledgeGraphCluster,
  type KnowledgeGraphConnections,
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
  const pageBySlug = new Map(corpus.pages.map((page) => [page.slug, page]));
  const selectedPage = selectedSlug ? pageBySlug.get(selectedSlug) : undefined;
  const relatedSlugs = selectedPage ? [
    ...selectedPage.links,
    ...corpus.pages
      .filter((page) => page.slug !== selectedPage.slug && page.links.includes(selectedPage.slug))
      .map((page) => page.slug),
  ] : [];
  const relatedSeen = new Set<string>();
  const connections: KnowledgeGraphConnections | undefined = selectedPage ? {
    related: relatedSlugs
      .map((slug) => pageBySlug.get(slug))
      .filter((page): page is NonNullable<typeof page> => Boolean(page))
      .filter((page) => {
        if (relatedSeen.has(page.slug)) return false;
        relatedSeen.add(page.slug);
        return true;
      })
      .map((page) => ({ id: page.slug, title: page.title }))
      .sort((left, right) => left.title.localeCompare(right.title)),
  } : undefined;
  const pageCountBySection = new Map(branches.map((branch) => [branch.section, branch.pageCount]));
  const sectionTitleBySection = new Map(branches.map((branch) => [branch.section, branch.page.title]));
  const hubSlugs = new Set(
    branches.flatMap((branch) => {
      const sectionNodes = graph.nodes
        .filter((node) => node.section === branch.section && node.role === "page")
        .sort((left, right) => right.degree - left.degree || left.page.title.localeCompare(right.page.title));
      const hubCount = Math.min(5, Math.max(2, Math.ceil(Math.sqrt(sectionNodes.length) / 3)));
      return sectionNodes.slice(0, hubCount).map((node) => node.page.slug);
    }),
  );
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
      prominent: node.role === "field" || hubSlugs.has(node.page.slug),
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
          connections={connections}
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
