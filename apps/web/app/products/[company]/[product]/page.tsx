import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailPage } from "../../../../src/App";
import { getProductFeature, getPublishedProduct, productHref, publishedProducts } from "../../../../src/public-content";
import { pageMetadata, siteUrl } from "../../../_metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedProducts.map(({ id }) => {
    const [company, product] = id.split("/");
    return { company, product };
  });
}

export async function generateMetadata({ params }: { params: Promise<{ company: string; product: string }> }): Promise<Metadata> {
  const { company, product } = await params;
  const record = getPublishedProduct(`${company}/${product}`);
  if (!record) return {};
  const feature = getProductFeature(record.id);
  const image = feature?.showcase?.images?.find(({ cover }) => cover) ?? feature?.showcase?.images?.[0];
  const socialSource = image?.src ?? feature?.showcase?.video?.poster ?? feature?.showcase?.cad?.poster;
  const socialUrl = socialSource?.startsWith("https://") ? socialSource : socialSource ? `${siteUrl}${socialSource}` : undefined;
  return pageMetadata({
    title: record.name,
    description: record.summary,
    path: productHref(record),
    socialImage: socialUrl ? { url: socialUrl, alt: image?.alt ?? `${record.name} outcome preview` } : null,
  });
}

export default async function ProductPage({ params }: { params: Promise<{ company: string; product: string }> }) {
  const { company, product } = await params;
  const id = `${company}/${product}`;
  if (!getPublishedProduct(id)) notFound();
  return <ProductDetailPage id={id} />;
}
