import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PossibleRoute from "../../_components/PossibleRoute";

const benchmarks = [
  { slug: "step-away", title: "Step-Away Benchmark", description: "Measure useful autonomous work after the operator stops prompting." },
  { slug: "company-systems", title: "Company-System Benchmark", description: "Measure independently verified company-system coverage and separate it from market success." },
  { slug: "fulfillment", title: "Fulfillment Benchmark", description: "Measure the path from a rough idea through funding to 95% shipped." },
] as const;

export const dynamicParams = false;

export function generateStaticParams() {
  return benchmarks.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const benchmark = benchmarks.find((entry) => entry.slug === slug);
  if (!benchmark) return {};
  return { title: benchmark.title, description: benchmark.description };
}

export default async function BenchmarkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!benchmarks.some((entry) => entry.slug === slug)) notFound();
  return <PossibleRoute path={`/benchmarks/${slug}`} />;
}
