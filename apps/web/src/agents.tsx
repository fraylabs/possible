"use client";

import { useEffect, useState } from "react";
import { agentModelLabel, agentProfiles, BUNDLE_PRICE_USD, BUNDLE_SLUG, portfolioSlugLabel, RUNS_IN } from "./agents-data";
import type { AgentProfile } from "./agents-data";
import { OutcomeMedia } from "./catalog";
import { fetchDiscoveryOutcomes } from "./discovery-data";
import type { DiscoveryOutcome } from "./discovery-data";
import { BuyBox } from "./buy";
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
          <span>US${agent.priceUsd} · {agent.portfolio.length} portfolio {agent.portfolio.length === 1 ? "result" : "results"}</span>
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
          <h1 id="agents-heading">Agents you download and run yourself.</h1>
          <p>Each agent is a skill for {RUNS_IN.join(" or ")}. See what it has made so far, download it, fill in a short brief, and your own agent makes the finished work.</p>
          <div className="agents-bundle">
            <strong>All {agentProfiles.length} agents</strong>
            <BuyBox slug={BUNDLE_SLUG} priceUsd={BUNDLE_PRICE_USD} label="Buy all agents" what={`for all ${agentProfiles.length}, instead of US$${agentProfiles.reduce((sum, agent) => sum + agent.priceUsd, 0)} one by one.`} />
          </div>
        </header>
        <div className="agents-grid">
          {agentProfiles.map((agent) => <AgentCard agent={agent} portfolio={portfolio} key={agent.slug} />)}
        </div>
      </section>
    </SiteShell>
  );
}

const howItWorks = [
  { title: "Buy and download", text: "You get a zip with the agent's skill, a blank brief and a short guide." },
  { title: "Install the skill", text: "Unzip it into ~/.claude/skills for Claude Code, or into your project's .agents/skills for Codex." },
  { title: "Fill in the brief and run it", text: "Your own agent does the work on your machine and puts everything it makes in ./out." },
];

type StaticPortfolioEntry = { slug: string; title: string; path: string };

function PortfolioItem({ slug, outcome, status, staticEntry }: { slug: string; outcome: DiscoveryOutcome | undefined; status: PortfolioState["status"]; staticEntry?: StaticPortfolioEntry | undefined }) {
  const title = outcome?.title ?? staticEntry?.title ?? portfolioSlugLabel(slug);
  const body = <>
    <span className="agent-portfolio-media" data-fit={outcome?.media?.fit ?? "cover"}><PortfolioThumbnail outcome={outcome} label={title} /></span>
    <strong>{title}</strong>
    <small>{outcome || staticEntry ? "View Outcome →" : status === "loading" ? "Loading…" : "Not in the public directory yet"}</small>
  </>;
  return <li>{outcome || staticEntry ? <a href={staticEntry?.path ?? outcome?.href}>{body}</a> : <div>{body}</div>}</li>;
}

export function AgentProfilePage({ agent, staticPortfolio = [] }: { agent: AgentProfile; staticPortfolio?: StaticPortfolioEntry[] }) {
  const portfolio = usePortfolioOutcomes();
  return (
    <SiteShell className="agent-profile-page">
      <article className="agent-profile layout-reading">
        <header className="agent-hero">
          <nav aria-label="Breadcrumb"><a href="/agents/">← All agents</a></nav>
          <div className="outcome-meta"><span>Agent</span><span aria-label={`Model: ${agentModelLabel(agent)}`}>{agentModelLabel(agent)}</span></div>
          <h1>{agent.name}</h1>
          <p>{agent.tagline}</p>
          <BuyBox slug={agent.slug} priceUsd={agent.priceUsd} label={`Buy the ${agent.name}`} what="for this agent." />
        </header>

        <section className="agent-section" aria-labelledby="agent-delivers-heading">
          <h2 id="agent-delivers-heading">What it makes</h2>
          <ul className="agent-list">{agent.delivers.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>

        <section className="agent-section" aria-labelledby="agent-how-heading">
          <h2 id="agent-how-heading">How it works</h2>
          <ol className="agent-steps">{howItWorks.map((step, index) => <li key={step.title}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><strong>{step.title}</strong><p>{step.text}</p></div></li>)}</ol>
        </section>

        <section className="agent-section" aria-labelledby="agent-portfolio-heading">
          <h2 id="agent-portfolio-heading">Portfolio</h2>
          {portfolio.status === "error" ? <p className="agent-note" role="alert">The portfolio is unavailable right now. Try again shortly.</p> : null}
          {agent.portfolio.length ? (
            <ul className="agent-portfolio">
              {agent.portfolio.map((slug) => <PortfolioItem slug={slug} outcome={portfolio.outcomes.get(slug)} status={portfolio.status} staticEntry={staticPortfolio.find((entry) => entry.slug === slug)} key={slug} />)}
            </ul>
          ) : <p className="agent-note">No published results yet.</p>}
        </section>

        <section className="agent-section" aria-labelledby="agent-brief-heading">
          <h2 id="agent-brief-heading">What the brief asks</h2>
          <dl className="agent-brief">
            {agent.brief.map((field) => <div key={field.id}><dt>{field.label}</dt><dd><span>For example</span>{field.example}</dd></div>)}
          </dl>
        </section>

        <section className="agent-section" aria-labelledby="agent-limits-heading">
          <h2 id="agent-limits-heading">Limits</h2>
          <p className="agent-note">{agent.limits}</p>
        </section>

        <section className="agent-section" aria-labelledby="agent-runtime-heading">
          <h2 id="agent-runtime-heading">Runs in</h2>
          <dl className="agent-runtime">
            <div><dt>Agents</dt><dd>{RUNS_IN.join(", ")}</dd></div>
            <div><dt>Made with</dt><dd>{agentModelLabel(agent)} <code>{agent.runtime.model}</code></dd></div>
            {agent.tools.length ? <div><dt>Tools</dt><dd>{agent.tools.join(", ")}</dd></div> : null}
          </dl>
        </section>
      </article>
    </SiteShell>
  );
}
