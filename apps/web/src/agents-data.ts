import browserGameMaker from "../../../agents/browser-game-maker/agent.json" with { type: "json" };
import deckMaker from "../../../agents/deck-maker/agent.json" with { type: "json" };
import prototypeEngineer from "../../../agents/prototype-engineer/agent.json" with { type: "json" };
import launchMarketer from "../../../agents/launch-marketer/agent.json" with { type: "json" };
import competitorAnalyst from "../../../agents/competitor-analyst/agent.json" with { type: "json" };

export interface AgentBriefField {
  id: string;
  label: string;
  example: string;
}

export interface AgentProfile {
  schemaVersion: number;
  slug: string;
  name: string;
  tagline: string;
  delivers: string[];
  runtime: { agent: string; model: string };
  tools: string[];
  brief: AgentBriefField[];
  portfolio: string[];
  limits: string;
  priceUsd: number | null;
}

export const agentProfiles: readonly AgentProfile[] = [launchMarketer, competitorAnalyst, prototypeEngineer, deckMaker, browserGameMaker];

export function findAgentProfile(slug: string): AgentProfile | undefined {
  return agentProfiles.find((agent) => agent.slug === slug);
}

const modelNames = new Map([
  ["claude-opus-5-5", "Claude Opus 5.5"],
]);

export function agentModelLabel(agent: AgentProfile): string {
  return modelNames.get(agent.runtime.model) ?? agent.runtime.model;
}

export function portfolioSlugLabel(slug: string): string {
  const text = slug.replace(/-/g, " ");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}
