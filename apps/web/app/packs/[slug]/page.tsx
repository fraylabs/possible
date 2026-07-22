import { getPublishedPack, publishedPacks } from "../../../src/public-content";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PossibleRoute from "../../_components/PossibleRoute";
import { pageMetadata } from "../../_metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedPacks.map((pack) => ({ slug: pack.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pack = getPublishedPack(slug);
  if (!pack) return {};
  return pageMetadata({
    title: pack.name,
    description: pack.summary,
    path: `/packs/${pack.slug}`,
    alternates: {
      "application/json": `/packs/${pack.slug}.json`,
      "text/plain": `/packs/${pack.slug}/run.txt`,
    },
  });
}

export default async function PackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getPublishedPack(slug)) notFound();
  return <PossibleRoute path={`/packs/${slug}`} />;
}
