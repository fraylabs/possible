import PossibleRoute from "../../_components/PossibleRoute";
import { pageMetadata } from "../../_metadata";
import { exampleCatalog, getExample } from "../../../src/example-content";
import { notFound } from "next/navigation";

export const dynamicParams = false;

export function generateStaticParams() {
  return exampleCatalog.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const example = getExample(slug);

  if (!example) return {};

  return pageMetadata({
    ...example.metadata,
    path: `/examples/${example.slug}`,
  });
}

export default async function ExamplePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const example = getExample(slug);

  if (!example) notFound();

  return <PossibleRoute path={`/examples/${example.slug}`} />;
}
