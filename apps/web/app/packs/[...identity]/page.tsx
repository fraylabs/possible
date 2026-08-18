import { getPackShowcase, getRoutablePack, packHref, packRouteId, routablePacks } from "../../../src/public-content";
import { PackDetailPage } from "../../../src/App";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata, siteUrl } from "../../_metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return routablePacks.map((entry) => ({ identity: packRouteId(entry).split("/") }));
}

export async function generateMetadata({ params }: { params: Promise<{ identity: string[] }> }): Promise<Metadata> {
  const { identity } = await params;
  const entry = getRoutablePack(identity.join("/"));
  if (!entry) return {};
  const path = packHref(entry);
  const showcase = getPackShowcase(entry);
  const image = showcase?.images?.find(({ cover }) => cover) ?? showcase?.images?.[0];
  const socialSource = image?.src ?? showcase?.video?.poster ?? showcase?.cad?.poster;
  const socialUrl = socialSource?.startsWith("https://") ? socialSource : socialSource ? `${siteUrl}${socialSource}` : undefined;
  return pageMetadata({
    title: entry.pack.name,
    description: entry.pack.promise,
    path,
    alternates: {
      "application/json": `${path}.json`,
      "text/plain": `${path}/run.txt`,
    },
    socialImage: socialUrl ? { url: socialUrl, alt: image?.alt ?? `${entry.pack.name} outcome preview` } : null,
  });
}

export default async function PackPage({ params }: { params: Promise<{ identity: string[] }> }) {
  const { identity } = await params;
  const idOrSlug = identity.join("/");
  const pack = getRoutablePack(idOrSlug);
  if (!pack) notFound();
  return <PackDetailPage idOrSlug={idOrSlug} />;
}
