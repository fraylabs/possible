import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OutcomeDetailPage } from "../../../src/App";
import { getPublishedOutcome, outcomeHref, publishedOutcomes } from "../../../src/public-content";
import { pageMetadata, siteUrl } from "../../_metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedOutcomes.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = getPublishedOutcome(slug);
  if (!entry) return {};
  const { outcome } = entry;
  const image = outcome.preview?.images?.find(({ cover }) => cover) ?? outcome.preview?.images?.[0];
  const socialSource = image?.src ?? outcome.preview?.video?.poster ?? outcome.preview?.cad?.poster;
  const socialUrl = socialSource?.startsWith("https://") ? socialSource : socialSource ? `${siteUrl}${socialSource}` : undefined;
  return pageMetadata({
    title: outcome.title,
    description: outcome.summary,
    path: outcomeHref(entry),
    alternates: { "application/json": `${outcomeHref(entry)}.json`, "text/plain": `${outcomeHref(entry)}/execution-prompt.txt` },
    socialImage: socialUrl ? { url: socialUrl, alt: image?.alt ?? `${outcome.title} preview` } : null,
  });
}

export default async function OutcomePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getPublishedOutcome(slug)) notFound();
  return <OutcomeDetailPage slug={slug} />;
}
