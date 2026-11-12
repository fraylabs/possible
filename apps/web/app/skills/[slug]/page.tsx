import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AgentProfilePage } from "../../../src/agents";
import { agentProfiles, findAgentProfile } from "../../../src/agents-data";
import { portfolioPreviews, publishedOutcomes } from "../../../src/static-outcomes";
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
  const previews = portfolioPreviews(await publishedOutcomes());
  const poster = agent.portfolio.map((slug) => previews.find((entry) => entry.slug === slug && entry.src)).find(Boolean);
  return pageMetadata({ title: agent.name, description: agent.tagline, path: `/skills/${agent.slug}`,
    ...(poster?.src ? { socialImage: { url: poster.src, alt: poster.title } } : {}) });
}

export default async function AgentPage({ params }: AgentPageProps) {
  const agent = findAgentProfile((await params).slug);
  if (!agent) notFound();
  const staticPortfolio = portfolioPreviews(await publishedOutcomes()).filter((entry) => agent.portfolio.includes(entry.slug));
  return <AgentProfilePage agent={agent} staticPortfolio={staticPortfolio} />;
}
