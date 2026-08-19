import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailPage } from "../../../src/App";
import { getProductFeature, getPublishedProduct, productHref, publishedProducts } from "../../../src/public-content";
import { pageMetadata, siteUrl } from "../../_metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedProducts.map(({ id }) => ({ product: id.split("/").at(-1) }));
}

export async function generateMetadata({ params }: { params: Promise<{ product: string }> }): Promise<Metadata> {
  const { product } = await params;
  const record = getPublishedProduct(product);
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

export default async function ProductPage({ params }: { params: Promise<{ product: string }> }) {
  const { product } = await params;
  const record = getPublishedProduct(product);
  if (!record) notFound();
  return <ProductDetailPage id={record.id} />;
}
