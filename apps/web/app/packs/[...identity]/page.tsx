import { getRoutablePack, packHref, packRouteId, routablePacks } from "../../../src/public-content";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PossibleRoute from "../../_components/PossibleRoute";
import { pageMetadata } from "../../_metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return routablePacks.map((pack) => ({ identity: packRouteId(pack).split("/") }));
}

export async function generateMetadata({ params }: { params: Promise<{ identity: string[] }> }): Promise<Metadata> {
  const { identity } = await params;
  const pack = getRoutablePack(identity.join("/"));
  if (!pack) return {};
  const path = packHref(pack);
  return pageMetadata({
    title: pack.name,
    description: pack.summary,
    path,
    alternates: {
      "application/json": `${path}.json`,
      ...(pack.lifecycle === "draft" ? {} : { "text/plain": `${path}/run.txt` }),
    },
  });
}

export default async function PackPage({ params }: { params: Promise<{ identity: string[] }> }) {
  const { identity } = await params;
  const idOrSlug = identity.join("/");
  if (!getRoutablePack(idOrSlug)) notFound();
  return <PossibleRoute path={`/packs/${idOrSlug}`} />;
}
