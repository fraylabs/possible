import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  CircleAlert,
  ExternalLink,
  GitFork,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import {
  findAlternativeNodes,
  freshnessLabel,
  getConnectedEdges,
  type DisplayGraph,
  type DisplayNode,
  type SafeAction,
} from "../graph";

interface DetailPanelProps {
  graph: DisplayGraph;
  node: DisplayNode;
  onSelect: (id: string) => void;
  onCloseMobile: () => void;
}

const safeUrl = (value?: string): string | undefined => {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
};

const actionMode = (action: SafeAction) => {
  if (action.mode === "approval-required") {
    return { icon: LockKeyhole, label: "Captain approval required", className: "approval" };
  }
  if (action.mode === "read-only") {
    return { icon: ShieldCheck, label: "Read-only handoff", className: "read-only" };
  }
  return { icon: ExternalLink, label: "Informational handoff", className: "informational" };
};

export function DetailPanel({ graph, node, onSelect, onCloseMobile }: DetailPanelProps) {
  const freshness = freshnessLabel(node.reviewedAt);
  const connections = getConnectedEdges(graph, node.id);
  const byId = new Map(graph.nodes.map((candidate) => [candidate.id, candidate]));
  const alternativeNodes = findAlternativeNodes(graph, node);
  const matchedAlternativeLabels = new Set(alternativeNodes.flatMap((alternative) => [alternative.id, alternative.title]));
  const unmatchedAlternatives = node.alternatives.filter((alternative) => !matchedAlternativeLabels.has(alternative));

  return (
    <aside className="detail-panel" aria-labelledby="detail-title">
      <div className="detail-panel__progress" aria-hidden="true"><span /></div>
      <header className="detail-header">
        <div className="detail-header__meta">
          <span className="node-type" data-kind={node.type}>
            <i /> {node.type}
          </span>
          <span className={`freshness freshness--${freshness.state}`}>{freshness.label}</span>
        </div>
        <button className="detail-close" type="button" onClick={onCloseMobile} aria-label="Return to graph">
          <X size={18} />
        </button>
        <p className="detail-kicker">Operational knowledge</p>
        <h1 id="detail-title">{node.title}</h1>
        <p className="detail-summary">{node.summary}</p>
        {node.status && <span className="confidence"><Sparkles size={13} /> {node.status}</span>}
      </header>

      <div className="detail-sections">
        {node.description && node.description !== node.summary && (
          <section className="detail-section detail-section--guidance" aria-labelledby="guidance-heading">
            <h2 id="guidance-heading"><Sparkles size={15} /> Current guidance</h2>
            <p className="guidance-statement">{node.description}</p>
          </section>
        )}

        {node.applicability.length > 0 && (
          <section className="detail-section" aria-labelledby="applies-heading">
            <h2 id="applies-heading"><Check size={15} /> Use this when</h2>
            <ul className="condition-list condition-list--positive">
              {node.applicability.map((condition, index) => <li key={`${condition}:${index}`}>{condition}</li>)}
            </ul>
          </section>
        )}

        {node.counterconditions.length > 0 && (
          <section className="detail-section" aria-labelledby="counter-heading">
            <h2 id="counter-heading"><ArrowDownRight size={15} /> Reconsider when</h2>
            <ul className="condition-list condition-list--counter">
              {node.counterconditions.map((condition, index) => <li key={`${condition}:${index}`}>{condition}</li>)}
            </ul>
          </section>
        )}

        {(alternativeNodes.length > 0 || unmatchedAlternatives.length > 0) && (
          <section className="detail-section" aria-labelledby="alternatives-heading">
            <h2 id="alternatives-heading"><GitFork size={15} /> Alternatives</h2>
            <div className="alternative-list">
              {alternativeNodes.map((alternative) => (
                <button key={alternative.id} type="button" onClick={() => onSelect(alternative.id)}>
                  <span>{alternative.title}</span>
                  <ArrowUpRight size={14} />
                </button>
              ))}
              {unmatchedAlternatives.map((alternative) => (
                <span className="alternative-label" key={alternative}>{alternative}</span>
              ))}
            </div>
          </section>
        )}

        {node.capabilities.length > 0 && (
          <section className="detail-section" aria-labelledby="capabilities-heading">
            <h2 id="capabilities-heading"><ShieldCheck size={15} /> Supported capabilities</h2>
            <ul className="capability-list">
              {node.capabilities.map((capability, index) => (
                <li key={`${capability}:${index}`}>{capability}</li>
              ))}
            </ul>
          </section>
        )}

        {node.steps && node.steps.length > 0 && (
          <section className="detail-section" aria-labelledby="steps-heading">
            <h2 id="steps-heading"><ArrowDownRight size={15} /> Workflow</h2>
            <ol className="workflow-list">
              {node.steps.map((step, index) => (
                <li key={`${step}:${index}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {((node.outputs?.length ?? 0) > 0 || (node.checks?.length ?? 0) > 0) && (
          <section className="detail-section" aria-labelledby="proof-heading">
            <h2 id="proof-heading"><ShieldCheck size={15} /> Outputs & proof</h2>
            <div className="output-proof">
              {node.outputs && node.outputs.length > 0 && (
                <div>
                  <span>Produces</span>
                  <ul>{node.outputs.map((output, index) => <li key={`${output}:${index}`}>{output}</li>)}</ul>
                </div>
              )}
              {node.checks && node.checks.length > 0 && (
                <div>
                  <span>Verify</span>
                  <ul>{node.checks.map((check, index) => <li key={`${check}:${index}`}>{check}</li>)}</ul>
                </div>
              )}
            </div>
          </section>
        )}

        {node.unknowns && node.unknowns.length > 0 && (
          <section className="detail-section detail-section--unknowns" aria-labelledby="unknowns-heading">
            <h2 id="unknowns-heading"><CircleAlert size={15} /> Check live before using</h2>
            <ul className="condition-list condition-list--counter">
              {node.unknowns.map((unknown, index) => <li key={`${unknown}:${index}`}>{unknown}</li>)}
            </ul>
          </section>
        )}

        {node.actions.length > 0 && (
          <section className="detail-section detail-section--actions" aria-labelledby="actions-heading">
            <h2 id="actions-heading"><ExternalLink size={15} /> Safe handoffs</h2>
            <p className="section-note">Possible supplies the route. Your agent host keeps credentials and asks before privileged actions.</p>
            <div className="action-list">
              {node.actions.map((action) => {
                const mode = actionMode(action);
                const Icon = mode.icon;
                const url = safeUrl(action.url);
                return (
                  <article key={action.id} className="action-row">
                    <div>
                      <strong>{action.title}</strong>
                      {action.description && <p>{action.description}</p>}
                      <span className={`action-mode action-mode--${mode.className}`}>
                        <Icon size={12} /> {mode.label}
                      </span>
                    </div>
                    {url && (
                      <a href={url} target="_blank" rel="noreferrer" aria-label={`Open ${action.title} handoff`}>
                        <ArrowUpRight size={16} />
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {connections.length > 0 && (
          <section className="detail-section" aria-labelledby="connections-heading">
            <h2 id="connections-heading"><GitFork size={15} /> Connected knowledge</h2>
            <div className="connection-list">
              {connections.slice(0, 8).map((edge) => {
                const targetId = edge.source === node.id ? edge.target : edge.source;
                const target = byId.get(targetId);
                if (!target) return null;
                return (
                  <button key={edge.id} type="button" onClick={() => onSelect(target.id)}>
                    <span className="connection-list__relation">{edge.label}</span>
                    <strong>{target.title}</strong>
                    <ArrowUpRight size={13} />
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {(node.sources.length > 0 || node.contributors.length > 0) && (
          <section className="detail-section detail-section--provenance" aria-labelledby="provenance-heading">
            <h2 id="provenance-heading"><UserRound size={15} /> Provenance</h2>
            {node.contributors.length > 0 && (
              <div className="contributors">
                <span>Contributors</span>
                <div>
                  {node.contributors.map((contributor) => {
                    const url = safeUrl(contributor.url);
                    const content = <><i>{contributor.name.slice(0, 2).toUpperCase()}</i>{contributor.name}</>;
                    return url
                      ? <a key={contributor.name} href={url} target="_blank" rel="noreferrer">{content}</a>
                      : <span key={contributor.name}>{content}</span>;
                  })}
                </div>
              </div>
            )}
            {node.sources.length > 0 && (
              <ol className="source-list">
                {node.sources.map((source, index) => {
                  const url = safeUrl(source.url);
                  return (
                    <li key={`${source.title}:${index}`}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      {url ? (
                        <a href={url} target="_blank" rel="noreferrer">
                          {source.title}<ExternalLink size={12} />
                        </a>
                      ) : <strong>{source.title}</strong>}
                      {source.publisher && <small>{source.publisher}</small>}
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        )}
      </div>
    </aside>
  );
}
