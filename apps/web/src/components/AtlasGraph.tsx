import type { AtlasBranch } from "../atlas";

interface AtlasGraphProps {
  branches: AtlasBranch[];
  onSelectBranch: (slug: string) => void;
}

export function AtlasGraph({ branches, onSelectBranch }: AtlasGraphProps) {
  return (
    <section className="graph-shell graph-shell--atlas" aria-labelledby="atlas-graph-title">
      <h2 id="atlas-graph-title" className="visually-hidden">Knowledge fields</h2>
      <p className="graph-guide">Choose a field</p>
      <div className="graph-field graph-field--atlas" role="region" aria-label="Possible knowledge atlas">
        {branches.length > 0 ? (
          <>
            <svg className="graph-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {branches.map((branch) => (
                <line
                  key={branch.section}
                  x1="50"
                  y1="50"
                  x2={branch.x}
                  y2={branch.y}
                  className="graph-edge atlas-edge"
                />
              ))}
            </svg>

            <div className="graph-nodes">
              <div
                className="graph-node atlas-core"
                style={{ left: "50%", top: "50%" }}
                role="img"
                aria-label="Possible, atlas root"
              >
                <strong>Possible</strong>
                <span>{branches.length} fields</span>
              </div>

              {branches.map((branch) => (
                <button
                  key={branch.section}
                  type="button"
                  className="graph-node atlas-node"
                  style={{ left: `${branch.x}%`, top: `${branch.y}%` }}
                  onClick={() => onSelectBranch(branch.page.slug)}
                  aria-label={`${branch.page.title}, ${branch.pageCount} pages`}
                >
                  <strong>{branch.page.title}</strong>
                  <span>{branch.pageCount} pages</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="graph-empty">
            <strong>No top-level fields are available.</strong>
            <p>Add a root page matching its knowledge folder to publish a field.</p>
          </div>
        )}
      </div>
    </section>
  );
}
