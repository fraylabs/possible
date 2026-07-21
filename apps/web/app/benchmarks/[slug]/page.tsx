import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { benchmarkCards, getBenchmark } from "../../../src/benchmark-data";
import PossibleRoute from "../../_components/PossibleRoute";

export const dynamicParams = false;

export function generateStaticParams() {
  return benchmarkCards.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const benchmark = getBenchmark(slug);
  if (!benchmark) return {};
  return { title: benchmark.title, description: benchmark.question, alternates: { canonical: `/benchmarks/${benchmark.slug}` } };
}

export default async function BenchmarkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getBenchmark(slug)) notFound();
  return <PossibleRoute path={`/benchmarks/${slug}`} />;
}
