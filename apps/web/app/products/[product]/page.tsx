import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailPage } from "../../../src/App";
import { getPublishedProduct, productHref, publishedProducts } from "../../../src/public-content";
import { pageMetadata } from "../../_metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedProducts.map(({ id }) => ({ product: id.split("/").at(-1) }));
}

export async function generateMetadata({ params }: { params: Promise<{ product: string }> }): Promise<Metadata> {
  const { product } = await params;
  const record = getPublishedProduct(product);
  if (!record) return {};
  return pageMetadata({
    title: record.name,
    description: record.summary,
    path: productHref(record),
    socialImage: { url: record.logoUrl, alt: `${record.name} logo` },
  });
}

export default async function ProductPage({ params }: { params: Promise<{ product: string }> }) {
  const { product } = await params;
  const record = getPublishedProduct(product);
  if (!record) notFound();
  return <ProductDetailPage id={record.id} />;
}
