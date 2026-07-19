import { getPack, outcomePacks } from "@possible/packs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PossibleRoute from "../../_components/PossibleRoute";

export const dynamicParams = false;

export function generateStaticParams() {
  return outcomePacks.map((pack) => ({ slug: pack.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pack = getPack(slug);
  if (!pack) return {};
  return {
    title: pack.name,
    description: pack.summary,
    alternates: {
      types: {
        "application/json": `/packs/${pack.slug}.json`,
        "text/plain": `/packs/${pack.slug}/run.txt`,
      },
    },
  };
}

export default async function PackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getPack(slug)) notFound();
  return <PossibleRoute path={`/packs/${slug}`} />;
}
