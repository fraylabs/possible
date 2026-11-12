import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DynamicOutcomeDetailPage } from "../../../src/dynamic-outcome-detail";
import { outcomeRoutes, publishedOutcomes } from "../../../src/static-outcomes";
import { pageMetadata } from "../../_metadata";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const dynamic = "force-static";

export async function generateStaticParams() {
  return outcomeRoutes(await publishedOutcomes()).map(({ slug }) => ({ slug }));
}

async function findOutcome(params: Props["params"]) {
  const { slug } = await params;
  return outcomeRoutes(await publishedOutcomes()).find((entry) => entry.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entry = await findOutcome(params);
  if (!entry) return {};
  return pageMetadata({ title: entry.outcome.title, description: entry.outcome.summary, path: entry.path.slice(0, -1),
    ...(entry.outcome.poster_url ? { socialImage: { url: entry.outcome.poster_url, alt: entry.outcome.title } } : {}) });
}

export default async function OutcomePage({ params }: Props) {
  const entry = await findOutcome(params);
  if (!entry) notFound();
  return <DynamicOutcomeDetailPage outcomeFixture={entry.outcome} />;
}
