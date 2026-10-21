import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AgentProfilePage } from "../../../src/agents";
import { agentProfiles, findAgentProfile } from "../../../src/agents-data";
import { outcomeRoutes, publishedOutcomes } from "../../../src/static-outcomes";
import { pageMetadata } from "../../_metadata";

type AgentPageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const dynamic = "force-static";

export function generateStaticParams() {
  return agentProfiles.map((agent) => ({ slug: agent.slug }));
}

export async function generateMetadata({ params }: AgentPageProps): Promise<Metadata> {
  const agent = findAgentProfile((await params).slug);
  if (!agent) return {};
  return pageMetadata({ title: agent.name, description: agent.tagline, path: `/agents/${agent.slug}` });
}

export default async function AgentPage({ params }: AgentPageProps) {
  const agent = findAgentProfile((await params).slug);
  if (!agent) notFound();
  const staticPortfolio = outcomeRoutes(await publishedOutcomes())
    .filter(({ outcome }) => outcome.slug && agent.portfolio.includes(outcome.slug))
    .map(({ path, outcome }) => ({ slug: outcome.slug!, title: outcome.title, path }));
  return <AgentProfilePage agent={agent} staticPortfolio={staticPortfolio} />;
}
