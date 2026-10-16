"use client";

import { useEffect, useState } from "react";
import { agentModelLabel, agentProfiles, portfolioSlugLabel } from "./agents-data";
import type { AgentProfile } from "./agents-data";
import { OutcomeMedia } from "./catalog";
import { fetchDiscoveryOutcomes } from "./discovery-data";
import type { DiscoveryOutcome } from "./discovery-data";
import { SiteShell } from "./shared";

type PortfolioState = { status: "loading" | "ready" | "error"; outcomes: Map<string, DiscoveryOutcome> };

function usePortfolioOutcomes(): PortfolioState {
  const [state, setState] = useState<PortfolioState>({ status: "loading", outcomes: new Map() });
  useEffect(() => {
    let cancelled = false;
    void fetchDiscoveryOutcomes()
      .then((entries) => {
        if (cancelled) return;
        const bySlug = new Map<string, DiscoveryOutcome>();
        for (const outcome of entries) if (outcome.slug && !bySlug.has(outcome.slug)) bySlug.set(outcome.slug, outcome);
        setState({ status: "ready", outcomes: bySlug });
      })
      .catch(() => { if (!cancelled) setState({ status: "error", outcomes: new Map() }); });
    return () => { cancelled = true; };
  }, []);
  return state;
}

function PortfolioThumbnail({ outcome, label }: { outcome: DiscoveryOutcome | undefined; label: string }) {
  if (outcome) return <OutcomeMedia outcome={outcome} />;
  return <span className="agent-thumbnail-empty" aria-hidden="true">{label.slice(0, 1).toUpperCase()}</span>;
}

function AgentCard({ agent, portfolio }: { agent: AgentProfile; portfolio: PortfolioState }) {
  const href = `/agents/${agent.slug}/`;
  const lead = agent.portfolio.map((slug) => portfolio.outcomes.get(slug)).find((outcome) => outcome?.media) ?? portfolio.outcomes.get(agent.portfolio[0] ?? "");
  return (
    <article className="agent-card">
      <a className="agent-card-media" href={href} data-fit={lead?.media?.fit ?? "cover"} tabIndex={-1} aria-hidden="true">
        <PortfolioThumbnail outcome={lead} label={agent.name} />
      </a>
      <div className="agent-card-copy">
        <span className="agent-model">{agentModelLabel(agent)}</span>
        <h2><a href={href}>{agent.name}</a></h2>
        <p>{agent.tagline}</p>
        <footer>
          <span>{agent.portfolio.length} portfolio {agent.portfolio.length === 1 ? "result" : "results"}</span>
          <a className="agent-card-link" href={href} aria-label={`View agent ${agent.name}`}>View agent <span aria-hidden="true">→</span></a>
        </footer>
      </div>
    </article>
  );
}

export function AgentsPage() {
  const portfolio = usePortfolioOutcomes();
  return (
    <SiteShell className="agents-page">
      <section className="agents-directory layout-reading" aria-labelledby="agents-heading">
        <header className="agents-heading">
          <span>AGENTS</span>
          <h1 id="agents-heading">Hire an agent. Get the result.</h1>
          <p>Pick an agent, describe the job, and receive the finished work with a recording of how it was made.</p>
        </header>
        <div className="agents-grid">
          {agentProfiles.map((agent) => <AgentCard agent={agent} portfolio={portfolio} key={agent.slug} />)}
        </div>
      </section>
    </SiteShell>
  );
}

const howItWorks = [
  { title: "A fresh cleanroom", text: "Every job runs on its own new, isolated machine with only the agent's instructions, its tools and your brief." },
  { title: "Wiped afterwards", text: "The machine is destroyed when the job ends. Nothing carries over to the next customer." },
  { title: "Recorded end to end", text: "The whole session is recorded and delivered with the result, so you can see exactly how it was made." },
];

function PortfolioItem({ slug, outcome, status }: { slug: string; outcome: DiscoveryOutcome | undefined; status: PortfolioState["status"] }) {
  const title = outcome?.title ?? portfolioSlugLabel(slug);
  const body = <>
    <span className="agent-portfolio-media" data-fit={outcome?.media?.fit ?? "cover"}><PortfolioThumbnail outcome={outcome} label={title} /></span>
    <strong>{title}</strong>
    <small>{outcome ? "View Outcome →" : status === "loading" ? "Loading…" : "Not in the public directory yet"}</small>
  </>;
  return <li>{outcome ? <a href={outcome.href}>{body}</a> : <div>{body}</div>}</li>;
}

export function AgentProfilePage({ agent }: { agent: AgentProfile }) {
  const portfolio = usePortfolioOutcomes();
  return (
    <SiteShell className="agent-profile-page">
      <article className="agent-profile layout-reading">
        <header className="agent-hero">
          <nav aria-label="Breadcrumb"><a href="/agents/">← All agents</a></nav>
          <div className="outcome-meta"><span>Agent</span><span aria-label={`Model: ${agentModelLabel(agent)}`}>{agentModelLabel(agent)}</span></div>
          <h1>{agent.name}</h1>
          <p>{agent.tagline}</p>
          <div className="agent-hire">
            <button type="button" disabled>Hiring opens soon</button>
          </div>
        </header>

        <section className="agent-section" aria-labelledby="agent-delivers-heading">
          <h2 id="agent-delivers-heading">What you get</h2>
          <ul className="agent-list">{agent.delivers.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>

        <section className="agent-section" aria-labelledby="agent-how-heading">
          <h2 id="agent-how-heading">How it works</h2>
          <ol className="agent-steps">{howItWorks.map((step, index) => <li key={step.title}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><strong>{step.title}</strong><p>{step.text}</p></div></li>)}</ol>
        </section>

        <section className="agent-section" aria-labelledby="agent-portfolio-heading">
          <h2 id="agent-portfolio-heading">Portfolio</h2>
          {portfolio.status === "error" ? <p className="agent-note" role="alert">The portfolio is unavailable right now. Try again shortly.</p> : null}
          <ul className="agent-portfolio">
            {agent.portfolio.map((slug) => <PortfolioItem slug={slug} outcome={portfolio.outcomes.get(slug)} status={portfolio.status} key={slug} />)}
          </ul>
        </section>

        <section className="agent-section" aria-labelledby="agent-brief-heading">
          <h2 id="agent-brief-heading">What you'll be asked</h2>
          <dl className="agent-brief">
            {agent.brief.map((field) => <div key={field.id}><dt>{field.label}</dt><dd><span>For example</span>{field.example}</dd></div>)}
          </dl>
        </section>

        <section className="agent-section" aria-labelledby="agent-limits-heading">
          <h2 id="agent-limits-heading">Limits</h2>
          <p className="agent-note">{agent.limits}</p>
        </section>

        <section className="agent-section" aria-labelledby="agent-runtime-heading">
          <h2 id="agent-runtime-heading">Runtime</h2>
          <dl className="agent-runtime">
            <div><dt>Model</dt><dd>{agentModelLabel(agent)} <code>{agent.runtime.model}</code></dd></div>
            <div><dt>Agent</dt><dd>{agent.runtime.agent}</dd></div>
            {agent.tools.length ? <div><dt>Tools</dt><dd>{agent.tools.join(", ")}</dd></div> : null}
          </dl>
        </section>
      </article>
    </SiteShell>
  );
}
