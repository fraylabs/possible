import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailPage } from "../../../../src/App";
import { getPublishedProduct, productHref, publishedProducts } from "../../../../src/public-content";
import { pageMetadata } from "../../../_metadata";

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
  return pageMetadata({
    title: record.name,
    description: record.summary,
    path: productHref(record),
    socialImage: null,
  });
}

export default async function ProductPage({ params }: { params: Promise<{ company: string; product: string }> }) {
  const { company, product } = await params;
  const id = `${company}/${product}`;
  if (!getPublishedProduct(id)) notFound();
  return <ProductDetailPage id={id} />;
}
