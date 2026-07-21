import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PossibleRoute from "../../_components/PossibleRoute";

const benchmarks = [
  { slug: "simple-prompt", title: "The Simple Prompt Benchmark", description: "Measure how much useful, verified work an agent completes from one simple prompt." },
  { slug: "billion-dollar-company", title: "The “Make Me a Billion-Dollar Company” Benchmark", description: "Record the company systems an agent builds and the verified revenue the resulting business generates." },
  { slug: "kickstarter-funding", title: "The Kickstarter Funding Benchmark", description: "Measure the path from a rough product idea to net Kickstarter funds received." },
  { slug: "kickstarter-shipped", title: "The Kickstarter-to-Shipped Benchmark", description: "Measure the path from a funded Kickstarter campaign to 95% shipped." },
] as const;
const legacyAliases = { "step-away": "simple-prompt", "company-systems": "billion-dollar-company", fulfillment: "kickstarter-shipped" } as const;

export const dynamicParams = false;

export function generateStaticParams() {
  return [...benchmarks.map(({ slug }) => ({ slug })), ...Object.keys(legacyAliases).map((slug) => ({ slug }))];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const canonicalSlug = legacyAliases[slug as keyof typeof legacyAliases] ?? slug;
  const benchmark = benchmarks.find((entry) => entry.slug === canonicalSlug);
  if (!benchmark) return {};
  return { title: benchmark.title, description: benchmark.description, alternates: { canonical: `/benchmarks/${benchmark.slug}` } };
}

export default async function BenchmarkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!benchmarks.some((entry) => entry.slug === slug) && !(slug in legacyAliases)) notFound();
  return <PossibleRoute path={`/benchmarks/${slug}`} />;
}
