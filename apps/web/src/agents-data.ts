import browserGameMaker from "../../../agents/browser-game-maker/agent.json" with { type: "json" };
import deckMaker from "../../../agents/deck-maker/agent.json" with { type: "json" };
import prototypeEngineer from "../../../agents/prototype-engineer/agent.json" with { type: "json" };
import launchMarketer from "../../../agents/launch-marketer/agent.json" with { type: "json" };
import competitorAnalyst from "../../../agents/competitor-analyst/agent.json" with { type: "json" };
import proceduralFilmMaker from "../../../agents/procedural-film-maker/agent.json" with { type: "json" };
import motionDesigner from "../../../agents/motion-designer/agent.json" with { type: "json" };
import customerProfiler from "../../../agents/customer-profiler/agent.json" with { type: "json" };

import animatedShortsMaker from "../../../agents/animated-shorts-maker/agent.json" with { type: "json" };

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
  priceUsd: number;
  checks: string[];
  refuses: string[];
  credit?: string;
}

export const agentProfiles: readonly AgentProfile[] = [browserGameMaker, animatedShortsMaker, motionDesigner, proceduralFilmMaker, launchMarketer, deckMaker, prototypeEngineer, competitorAnalyst, customerProfiler];

export const cardTaglines: Readonly<Record<string, string>> = {
  "browser-game-maker": "Makes a playable game in one HTML file.",
  "animated-shorts-maker": "Makes an animated story short from code.",
  "motion-designer": "Makes a short motion film from code.",
  "procedural-film-maker": "Builds and films a world from code.",
  "launch-marketer": "Makes a launch kit for your product.",
  "deck-maker": "Builds an editable PowerPoint from your facts.",
  "prototype-engineer": "Turns a product idea into editable CAD.",
  "competitor-analyst": "Turns public competitor research into a playbook.",
  "customer-profiler": "Builds a customer profile from real evidence.",
};

/** The price of all the agents together. */
export const BUNDLE_PRICE_USD = 49;
export const BUNDLE_SLUG = "all";

/** Where each agent runs: the buyer's own coding agent. */
export const RUNS_IN = ["Claude Code", "Codex"];

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
