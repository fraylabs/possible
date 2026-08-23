import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SkillDetailPage } from "../../../src/App";
import { getPublishedSkill, publishedSkills, skillHref } from "../../../src/public-content";
import { pageMetadata } from "../../_metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedSkills.map(({ slug }) => ({ skill: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ skill: string }> }): Promise<Metadata> {
  const { skill: slug } = await params;
  const record = getPublishedSkill(slug);
  if (!record) return {};
  return pageMetadata({
    title: record.name,
    description: `${record.name} from ${record.repository}, shown through the Outcomes that use it.`,
    path: skillHref(record),
    socialImage: null,
  });
}

export default async function SkillPage({ params }: { params: Promise<{ skill: string }> }) {
  const { skill: slug } = await params;
  const record = getPublishedSkill(slug);
  if (!record) notFound();
  return <SkillDetailPage id={record.id} />;
}
